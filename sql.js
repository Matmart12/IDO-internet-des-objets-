const express = require('express');
const mysql = require('mysql2');
const app = express();
const session = require('express-session');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Middlewares de base
// j ai rajoute recherche lieux 
//recherche actu ville
app.use(express.json());

// Configuration CORS (une seule fois, placée tôt)
app.use(cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:3000', 'http://127.0.0.1:3000','null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Configuration de la session (une seule fois)
app.use(session({
    secret: 'maclesecrete',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware pour les fichiers statiques (une seule fois)
app.use(express.static(path.join(__dirname, 'public')));

// Route favicon (après static mais avant les autres routes)
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Routes API
app.use('/api/auth', routes);



// ... le reste de votre configuration existante
app.use(session({
    secret: 'maclesecrete', // Changez ceci par une chaîne complexe
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettez `true` si vous utilisez HTTPS
}));

// Créer le pool de connexions
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'cytech0001',
    database: 'villeintelligente',
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

app.get('/check-session', (req, res) => { //savoir si l'utilisateur est connecté
    if (req.session.userId) {
        res.json({ isLoggedIn: true });
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
        from: 'projectcy395@gmail.com',
        to,
        subject,
        html: html,
    };

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


app.post('/api/auth/connexion', async (req, res) => {
    try {
        const { mail, mdp } = req.body;
        const [user] = await pool.query('SELECT id FROM Resident WHERE mail = ? AND mdp = ?', [mail, mdp]);

        if (user) {
            req.session.userId = user.id;
            res.json({ success: true, userId: user.id });
        } else {
            res.status(401).json({ success: false, error: "Identifiants incorrects" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
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
    const { numéro, rue, idVille } = req.body;
    pool.query('INSERT INTO Residence (numéro, rue, idVille) VALUES(?,?,?)', [numéro, rue, idVille], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Ville ajouté avec succès!')
        }
    })
});

app.post('/Creer_Service', (req, res) => {
    const { nom, descrip, idVille } = req.body;
    pool.query('INSERT INTO Service (nom, descrip, idVille) VALUES(?,?)', [nom, descrip, idVille], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Ville ajouté avec succès!')
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
            res.send('Ville ajouté avec succès!')
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
            res.send('Ville ajouté avec succès!')
        }
    })
});

app.post('/Creer_Actu', (req, res) => {
    const { nom, description, apparition, idVille } = req.body;
    pool.query('INSERT INTO Actu (nom, descrip,apparition, idVille) VALUES(?,?)', [nom, description, apparition, idVille], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Ville ajouté avec succès!')
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

app.delete('/sup_Resident_mail/:mail', (req, res) => {
    const { mail } = req.params;
    pool.query('DELETE FROM Resident WHERE mail = ?', [mail], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Resident_id/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM Resident WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Service_Ville/:idVille', (req, res) => {
    const { idVille } = req.params;
    pool.query('DELETE FROM Service WHERE idVille = ?', [idVille], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Ville_id/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM Ville WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Actu_id/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM Actu WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Lien/:idService:nomCate', (req, res) => {
    const { idService, nomCate } = req.params;
    pool.query('DELETE FROM Lien WHERE idService=? AND nomCategorie = ?', [idService, nomCate], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Actu_nom/:nom', (req, res) => {
    const { nom } = req.params;
    pool.query('DELETE FROM Actu WHERE nom = ?', [nom], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
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

app.put('/modif_Resident_nom', (req, res) => {
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

app.put('/modif_Resident_prenom', (req, res) => {
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

app.put('/modif_Resident_mail', (req, res) => {
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

app.put('/modif_Resident_mdp', (req, res) => {
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

app.put('/modif_Resident_abonnement', (req, res) => {
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

app.put('/modif_Ville_nom', (req, res) => {
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

app.put('/modif_Service_nom', (req, res) => {
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

app.put('/modif_Service_Description', (req, res) => {
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

app.put('/modif_Actu_nom', (req, res) => {
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

app.put('/modif_Actu_Descrip', (req, res) => {
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
// Route pour récupérer les services (lieux d'intérêt) associés à une ville
app.get('/Recherche_Lieux', (req, res) => {
    const { idVille } = req.query;
    pool.query(`
        SELECT
            s.id,
            s.nom,
            s.descrip,
            s.url_photo,
            r.rue,
            r.num
        FROM Service s
        JOIN Residence r ON s.idAdresse = r.id
        WHERE s.idVille = ?;
    `, [idVille], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur serveur');
        } else {
            res.json(results); // Retourne les résultats sous forme de JSON
        }
    });
});
app.get('/Recherche_Actu_Ville_temps', (req, res) => {
    const { idv } = req.query;  // Récupère l'ID de la ville dans la requête

    pool.query(`
        SELECT 
            a.id,
            a.nom,
            a.descrip,
            a.apparition,       -- Date de début
            a.dateFin,          -- Date de fin (ajoute si c'est nécessaire)
            a.horaires,
            a.tarif,
            a.emplacement,
            a.reservation
        FROM Actu a
        WHERE a.idVille = ? 
        ORDER BY a.apparition DESC;  -- Assure-toi que la colonne 'apparition' existe dans Actu
    `, [idv], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur serveur');
        } else {
            res.json(results); // Retourne les événements sous forme de JSON
        }
    });
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
