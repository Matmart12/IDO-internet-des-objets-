const express = require('express');
const mysql = require('mysql2');
const app = express();
const session = require('express-session');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Middlewares de base
app.use(express.json());

// configuration de la session
app.use(session({
    secret: 'maclesecrete',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax' // Protection contre les attaques CSRF
    }
}));

app.use((req, res, next) => {
    console.log('Session:', req.session); // Debug
    next();
});

// Configuration CORS (une seule fois, placée tôt)
app.use(cors({
    origin: ['null','http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware pour les fichiers statiques (une seule fois)
app.use(express.static(path.join(__dirname, 'public')));

// Route favicon (après static mais avant les autres routes)
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Routes API
app.use('/api/auth', routes);

// Créer le pool de connexions
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'cytech0001',
    database: 'proj',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Fonction pour exécuter les requêtes
const executeQuery = (query, tableName) => {
    return new Promise((resolve, reject) => {
        pool.query(query, (err, result) => {
            if (err) {
                console.error(`❌ Erreur lors de la création de la table ${tableName} :`, err);
                reject(err);
            } else {
                console.log(`✅ Table ${tableName} créée avec succès.`);
                resolve(result);
            }
        });
    });
};

// Fonction pour créer les tables
const createTables = async () => {
    try {
        console.log('✅ Connexion au pool de base de données MySQL');

        // Créer les tables
        await executeQuery(`
            CREATE TABLE IF NOT EXISTS Ville (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nom CHAR(40),
                Pays CHAR(40),
                departement CHAR(40)
            );`, "Ville");

        await executeQuery(`
            CREATE TABLE IF NOT EXISTS Residence (
                id INT PRIMARY KEY AUTO_INCREMENT,
                numero INT,
                rue CHAR(40),
                idVille INT,
                FOREIGN KEY (idVille) REFERENCES Ville(id)
            );`, "Residence");

        await executeQuery(`
            CREATE TABLE IF NOT EXISTS Resident (
                id INT PRIMARY KEY AUTO_INCREMENT,
                prenom CHAR(40),
                nom CHAR(40),
                mail CHAR(50),
                mdp CHAR(20),
                age INT,
                genre CHAR(40),
                abonnement CHAR(20),
                idResidence INT,
                adressephoto CHAR(50),
                FOREIGN KEY (idResidence) REFERENCES Residence(id)
            );`, "Resident");

        await executeQuery(`
            CREATE TABLE IF NOT EXISTS Service (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nom CHAR(40),
                descrip CHAR(254),
                idVille INT,
                FOREIGN KEY (idVille) REFERENCES Ville(id)
            );`, "Service");

        await executeQuery(`
            CREATE TABLE IF NOT EXISTS Categorie (
                nom CHAR(40) PRIMARY KEY
            );`, "Categorie");

        await executeQuery(`
            CREATE TABLE IF NOT EXISTS Lien (
                idService INT,
                nomCategorie CHAR(40),
                FOREIGN KEY (idService) REFERENCES Service(id),
                FOREIGN KEY (nomCategorie) REFERENCES Categorie(nom)
            );`, "Lien");

        await executeQuery(`
            CREATE TABLE IF NOT EXISTS Actu (
                id INT PRIMARY KEY AUTO_INCREMENT, 
                nom CHAR(40),
                descrip CHAR(254),
                apparition DATE,
                idVille INT,
                FOREIGN KEY (idVille) REFERENCES Ville(id)
            );`, "Actu");

            await executeQuery(`
                CREATE TABLE IF NOT EXISTS LienActu (
                    nomCategorie CHAR(40),
                    idActu INT,
                    FOREIGN KEY (idActu) REFERENCES Actu(id),
                    FOREIGN KEY (nomCategorie) REFERENCES Categorie(nom)
                );`, "LienActu");

        console.log("🎉 Toutes les tables ont été créées avec succès !");
    } catch (error) {
        console.error("❌ Une erreur est survenue lors de la création des tables :", error);
    }
};

const uploadsDir = './photo';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.post('/photo', (req, res) => {
    if (!req.headers['content-type'].startsWith('multipart/form-data')) {
        return res.status(400).send('Format non supporté');
    }

    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
        const data = Buffer.concat(body);

        // Extraction basique de l'image (pour une vraie app, utilisez multer)
        const match = data.toString('binary').match(/\r\n\r\n(.*)\r\n--/s);
        if (!match) return res.status(400).send('Image non valide');

        const imageData = Buffer.from(match[1], 'binary');
        const filename = `image_${Date.now()}.jpg`;
        const filepath = path.join(uploadsDir, filename);

        fs.writeFile(filepath, imageData, (err) => {
            if (err) return res.status(500).send('Erreur de sauvegarde');
            res.send(`Fichier ${filename} sauvegardé`);
        });
    });
});


// Exemple: route pour récupérer le profil utilisateur
app.get('/session', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Non connecté" });
    }

    // Récupère les données de la session
    const userData = {
        id: req.session.userId,
        // Ajoutez d'autres champs si nécessaire (ex: abonnement)
    };

    res.json(userData);
});

app.get('/check-session', (req, res) => { //savoir si l'utilisateur est connecté
    if (req.session.userId) {
        res.json({ isLoggedIn: true, id: req.session.userId });
    } else {
        res.json({ isLoggedIn: false });
    }
});

app.get('/deconnexion', (req, res) => {    //se déconnecter
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Erreur lors de la déconnexion');
        }
        res.send('Déconnecté avec succès');
    });
});


const nodemailer = require('nodemailer');
// Configuration du mail automatique
require('dotenv').config();//récup le mdp d'application de .env
const transporter = nodemailer.createTransport({
    service: 'gmail', // possible d'utiliser un autre service SMTP
    auth: {
        user: 'projetcy395@gmail.com', // l'email à utiliser

        pass: process.env.MDP_APP_GMAIL, // "Mot de passe d'application qui se trouve dans .env"
    },
});

// Route pour envoyer un email
app.post('/send-email', (req, res) => {
    const { to, subject, html } = req.body;

    const mailOptions = {
        from: 'projetcy395@gmail.com',
        to,
        subject,
        html: html,
    };
    if (!to || !subject || !html) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erreur:', error);
            res.status(500).send('Erreur lors de l\'envoi de l\'email');
        } else {
            console.log('Email envoyé:', info.response);
            res.send('Email envoyé avec succès');
        }
    });
});



app.post('/testconnexion', (req, res) => {
    const { mail, mdp } = req.body;

    pool.query('SELECT id, abonnement FROM Resident WHERE mail = ? AND mdp = ?', [mail, mdp], (err, results) => {
        if (err) {
            console.error('Erreur SQL :', err);
            return res.status(500).json({ success: false, error: "Erreur serveur" });
        }

        if (results.length > 0 && results[0].abonnement !== "nonVerif") {
            const user = results[0];
            req.session.userId = user.id; // Stockage de l'ID en session
            req.session.save(err => { // Force la sauvegarde
                if (err) console.error("Erreur session:", err);
                res.json({
                    success: true,
                    userId: user.id // Ajout de l'ID utilisateur
                });
            });
        } else {
            res.status(401).json({ 
                success: false, 
                error: results.length > 0 ? "Compte non vérifié" : "Identifiants incorrects" 
            });
        }
    });
});

app.post('/Creer_Ville', (req, res) => {
    const { nom, département } = req.body;
    pool.query('INSERT INTO Ville (nom, pays, département) VALUES(?,?,?)', [nom, "France", département], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Ville ajouté avec succès!')
        }
    })
});

app.post('/Creer_Resident', (req, res) => {
    const { prenom, nom, mail, mdp, age, idResidence, abo, adressephoto, genre } = req.body;
    pool.query('INSERT INTO Resident (prenom, nom, mail,genre, mdp, adressephoto, age, abonnement, idResidence) VALUES(?,?,?,?,?,?,?,?,?)', [prenom, nom, mail, genre, mdp, adressephoto, age, abo || 'visiteur', idResidence], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Résident ajouté avec succès!')
        }
    })
});

app.post('/Creer_Residence', (req, res) => {
    const { numero, rue, idVille } = req.body;
    pool.query('INSERT INTO Residence (numero, rue, idVille) VALUES(?,?,?)', [numero, rue, idVille], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Residence ajouté avec succès!')
        }
    })
});

app.post('/Creer_Service', (req, res) => {
    const { nom, descrip, idVille } = req.body;
    pool.query('INSERT INTO Service (nom, descrip, idVille) VALUES(?,?,?)', [nom, descrip, idVille], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Service ajouté avec succès!')
        }
    })
});

app.post('/Creer_Categorie', (req, res) => {
    const { nom } = req.body;
    pool.query('INSERT INTO Categorie (nom) VALUES(?)', [nom], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Categorie ajouté avec succès!')
        }
    })
});

app.post('/Creer_Lien', (req, res) => {
    const { idService, nomCate } = req.body;
    pool.query('INSERT INTO Lien (idService, nomCategorie) VALUES(?,?)', [idService, nomCate], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Lien ajouté avec succès!')
        }
    })
});

app.post('/Creer_LienActu', (req, res) => {
    const { idActu, nomCate } = req.body;
    pool.query('INSERT INTO LienActu (idActu, nomCategorie) VALUES(?,?,?)', [idActu, nomCate], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('LienActu ajouté avec succès!')
        }
    })
});

app.post('/Creer_Actu', (req, res) => {
    const { nom, description, apparition, idVille } = req.body;
    pool.query('INSERT INTO Actu (nom, descrip,apparition, idVille) VALUES(?,?,?,?)', [nom, description, apparition, idVille], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Actu ajouté avec succès!')
        }
    })
});

app.post('/Creer_LienActu', (req, res) => {
    const { idActu, nomCate } = req.body;
    pool.query('INSERT INTO LienActu (idActu, nomCategorie) VALUES(?,?)', [idActu, nomCate], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Lien ajouté avec succès!')
        }
    })
});

app.get('/Recherche_Categorie', (req, res) => {
    const { nom } = req.query
    pool.query('SELECT * FROM Categorie WHERE nom=?', [nom], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Resident_mail', (req, res) => {
    const { mail } = req.query
    pool.query('SELECT * FROM Resident WHERE mail=?', [mail], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});


app.get('/Recherche_Resident_id', (req, res) => {
    const { id } = req.query
    pool.query('SELECT * FROM Resident WHERE id=?', [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Ville_nom_departement', (req, res) => {
    const { nom, departement } = req.query
    pool.query('SELECT * FROM Ville WHERE nom=? AND departement=?', [nom, departement], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Ville_id', (req, res) => {
    const { id } = req.query
    pool.query('SELECT * FROM Ville WHERE id=?', [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Lien_service', (req, res) => {
    const { id } = req.query
    pool.query('SELECT nomCategorie FROM Lien WHERE idService = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_LienActu_actu', (req, res) => {
    const { id } = req.query
    pool.query('SELECT nomCategorie FROM LienActu WHERE idActu = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Service_nom', (req, res) => {
    const { nom } = req.query
    pool.query('SELECT * FROM Service WHERE nom=?', [nom], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Maire', (req, res) => {
    const { idVille } = req.query
    pool.query('SELECT * FROM Resident r, Residence re WHERE r.abonnement= "Maire" AND idResidence=re.id AND re.idVille=?', [idVille], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Service_Lien_', (req, res) => {
    const { nomCate } = req.query
    pool.query('SELECT * FROM Service s, Lien l WHERE s.id= l.idService AND l.nomCategorie=?', [nomCate], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Service_nom_descrip_idVille', (req, res) => {
    const { nom, descrip, idVille} = req.query
    pool.query('SELECT id FROM Service WHERE nom=? AND descrip=? AND idVille=?', [nom,descrip, idVille], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Actu_LienActu_', (req, res) => {
    const { nomCate } = req.query
    pool.query('SELECT * FROM Actu a, LienActu l WHERE a.id= l.idActu AND l.nomCategorie=?', [nomCate], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Service_id', (req, res) => {
    const { id } = req.query
    pool.query('SELECT * FROM Service WHERE id=?', [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Service', (req, res) => {
    pool.query('SELECT * FROM Service', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Actu', (req, res) => {
    const {} = req.query
    pool.query('SELECT a.* FROM Actu a ORDER BY a.apparition',(err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Actu_nom_temps_descrip_idville', (req, res) => {
    const {apparition, nom,descrip, idVille} = req.query
    pool.query('SELECT id FROM Actu WHERE apparition=? AND nom=? AND descrip=? AND idVille=?', 
        [apparition, nom,descrip, idVille], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Actu_temps', (req, res) => {
    const { } = req.query
    pool.query('SELECT a.* FROM Actu a ORDER BY a.apparition DESC LIMIT 5', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Actu_Ville', (req, res) => {
    const { idVille } = req.query; // Récupère l'ID de la ville passé dans la requête

    pool.query(
        `SELECT a.id, a.nom, a.descrip, a.apparition
            FROM Actu a WHERE a.idVille = ? 
            ORDER BY a.apparition DESC;`, [idVille], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur serveur');
        } else {
            res.json(results); // Retourne les événements sous forme de JSON
        }
    });
});

app.get('/Recherche_Actu_Ville_temps', (req, res) => {
    const { idv } = req.query
    pool.query('SELECT nom FROM Actu  WHERE	idVille=? ORDER BY a.apparition DESC LIMIT 5;', [idv], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Residence_ville_num_rue', (req, res) => {
    const { num, rue, idv } = req.query
    pool.query('SELECT * FROM Residence  WHERE numero=? AND rue=? AND idVille=? ', [num, rue, idv], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Recherche_Residence_id', (req, res) => {
    const {id} = req.query
    pool.query('SELECT * FROM Residence WHERE id=? ',[id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.delete('/sup_Resident_mail/:mail', (req, res) => {
    const { mail } = req.params;
    pool.query('DELETE FROM Resident WHERE mail = ?', [mail], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_Resident_id/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM Resident WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_Service_Ville/:idVille', (req, res) => {
    const { idVille } = req.params;
    pool.query('DELETE FROM Service WHERE idVille = ?', [idVille], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_Ville_id/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM Ville WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_Service_id/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM Service WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_Actu_id/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM Actu WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_Lien_service_cat/:idService:nomCate', (req, res) => {
    const { idService, nomCate } = req.params;
    pool.query('DELETE FROM Lien WHERE idService=? AND nomCategorie = ?', [idService,nomCate], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_Lien_service/:idService', (req, res) => {
    const { idService, nomCate } = req.params;
    pool.query('DELETE FROM Lien WHERE idService=?', [idService], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_LienActu_actu/:idActu', (req, res) => {
    const { idActu } = req.params;
    pool.query('DELETE FROM LienActu WHERE idActu=?', [idActu], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_LienActu_actu_cat/:idActu:nomCate', (req, res) => {
    const { idActu, nomCate } = req.params;
    pool.query('DELETE FROM LienActu WHERE idActu=? AND nomCategorie = ?', [idActu, nomCate], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.delete('/sup_Actu_nom/:nom', (req, res) => {
    const { nom } = req.params;
    pool.query('DELETE FROM Actu WHERE nom = ?', [nom], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json({ message: 'Élément supprimé avec succès' });
    });
});

app.put('/modif_Resident_genre', (req, res) => {
    const { id } = req.params;
    const { genre } = req.body;

    pool.query('UPDATE Resident SET genre = ? WHERE id = ?',
        [genre, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Resident_nom/:id', (req, res) => {
    const { id } = req.params;
    const { nom } = req.body;

    pool.query('UPDATE Resident SET nom = ? WHERE id = ?',
        [nom, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Resident_prenom/:id', (req, res) => {
    const { id } = req.params;
    const { prenom } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Resident SET prenom = ? WHERE id = ?',
        [prenom, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Resident_mail/:id', (req, res) => {
    const { id } = req.params;
    const { mail } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Resident SET mail = ? WHERE id = ?',
        [mail, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Resident_mdp/:id', (req, res) => {
    const { id } = req.params;
    const { mdp } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Resident SET mdp = ? WHERE id = ?',
        [mdp, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Resident_abonnement/:id', (req, res) => {
    const { id } = req.params;
    const { abonnement } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Resident SET abonnement = ? WHERE id = ?',
        [abonnement, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Resident_adressephoto/:id', (req, res) => {
    const { id } = req.params;
    const { idRes } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Resident SET adressephoto = ? WHERE id = ?', [idRes, id], 
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Resident_age/:id', (req, res) => {
    const { id } = req.params;
    const { age } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Resident SET age = ? WHERE id = ?',
        [abonnement, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Resident_idResidence/:id', (req, res) => {
    const { id } = req.params;
    const { idRes } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Resident SET idResidence = ? WHERE id = ?', [idRes, id], 
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Ville_nom/:id', (req, res) => {
    const { idVille } = req.params;
    const { nom } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Ville SET nom=? WHERE id = ?',
        [nom, idVille],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Service_nom/:id', (req, res) => {
    const { id } = req.params;
    const { nom } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Service SET nom = ? WHERE id = ?',
        [nom, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Service_Description/:id', (req, res) => {
    const { id } = req.params;
    const { descrip } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Service SET descrip = ? WHERE id = ?',
        [descrip, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Actu_nom/:id', (req, res) => {
    const { id } = req.params;
    const { nom } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Actu SET nom = ? WHERE id = ?',
        [nom, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

app.put('/modif_Actu_Descrip/:id', (req, res) => {
    const { id } = req.params;
    const { descrip } = req.body; // Remplacez par vos champs

    pool.query('UPDATE Actu SET descrip = ? WHERE id = ?',
        [descrip, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur serveur');
            }
            res.send('Élément modifié avec succès');
        }
    );
});

// Ne marche pas pour l'instant, c'est pour la recherche de la page d'acceuil vers la page recherche
app.get('/recherche-actu', (req, res) => {
    const terme = req.query.terme;
    if (!terme) {
        return res.status(400).json({ error: "Terme de recherche manquant" });
    }

    const query = 'SELECT * FROM Actu WHERE nom LIKE ? OR descrip LIKE ?';
    const searchTerm = `%${terme}%`;
    
    pool.query(query, [searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
    });
});

app.use(cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Gestion des pré-vols OPTIONS
app.options('*', cors());

const PORT = 5000;
app.get('/', (req, res) => {
    res.send('Bienvenue sur la page d\'accueuil!');
});

app.listen(PORT, async () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    await createTables();
});
process.on('SIGINT', () => {
    pool.end(() => {
        console.log('Le pool de connexions MySQL a été fermé.');
        process.exit(0);
    });
});
