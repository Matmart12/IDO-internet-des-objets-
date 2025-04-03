const express = require('express');
const mysql = require("mysql2");
const app = express();
const proj = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cytech0001',
    database: 'connectees'
});


proj.connect(err => {
    if (err) {
        console.log('erreur de connexion : ', err);
        return;
    }
    console.log('connecté à la base de données MySQL');
});

app.use(express.json());
//les noms sont à la premiere ligne avec le / et représente comment la recherche est faite (pour créer, il faut mettre tous les paramètres dispo)
app.post('/Creer_Resident', (req, res) => {
    const { prénom, nom, mail, mdp, age, genre, adressephoto, idResidence } = req.body;
    proj.query('INSERT INTO Resident (prenom, nom, mail, mdp, age, genre, abonnement, adressephoto, idResidence) VALUES(?,?,?,?,?,?,?,?,?)', [prénom, nom, mail, mdp, age, genre, "vérification", adressephoto, idResidence], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Utilisateur ajouté avec succès!')
        }
    })
});

app.post('/Creer_Ville', (req, res) => {
    const { nom, département } = req.body;
    proj.query('INSERT INTO Ville (nom, département) VALUES(?,?)', [nom, département], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.send('Ville ajouté avec succès!')
        }
    })
});

app.post('/Creer_Residence', (req, res) => {
    const { numéro, rue, idVille } = req.body;
    proj.query('INSERT INTO Residence (numéro, rue, idVille) VALUES(?,?)', [numéro, rue, idVille], (err, result) => {
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
    proj.query('INSERT INTO Service (nom, descrip, idVille) VALUES(?,?)', [nom, descrip, idVille], (err, result) => {
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
    proj.query('INSERT INTO Categorie (nom) VALUES(?)', [nom], (err, result) => {
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
    proj.query('INSERT INTO Lien (idService, nomCategorie) VALUES(?,?)', [idService, nomCate], (err, result) => {
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
    proj.query('INSERT INTO Actu (nom, descrip,apparition, idVille) VALUES(?,?)', [nom, description, apparition, idVille], (err, result) => {
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
    proj.query('SELECT * FROM Resident WHERE mail=?', [mail], (err, results) => {
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
    proj.query('SELECT * FROM Resident WHERE id=?', [id], (err, results) => {
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
    proj.query('SELECT * FROM Ville WHERE nom=? AND departement=?', [nom, departement], (err, results) => {
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
    proj.query('SELECT * FROM Service WHERE nom=?', [nom], (err, results) => {
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
    proj.query('SELECT * FROM Service s, Lien l WHERE s.id= l.idService AND l.nomCategorie=?', [nomCate], (err, results) => {
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
    proj.query('SELECT * FROM Service WHERE id=?', [id], (err, results) => {
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
        proj.query('SELECT * FROM Resident WHERE id=?', [id], (err, results) => {
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
    const {} = req.query
    proj.query('SELECT a.* FROM Actu a ORDER BY a.apparition DESC LIMIT 5',(err, results) => {
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
    const {idv} = req.query
    proj.query('SELECT a.nom FROM Actu a, Ville v WHERE	a.idVille=? ORDER BY a.apparition DESC LIMIT 5;',[idv], (err, results) => {
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
    const {num, rue, idv} = req.query
    proj.query('SELECT * FROM Residence  WHERE numero=? AND rue=? AND idVille=? ',[num,rue,idv], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('erreur serveur');
        }
        else {
            res.json(results);
        }
    })
});

app.delete('/sup_Resident_mail', (req, res) => {
    const { mail } = req.params;
    proj.query('DELETE FROM Resident WHERE mail = ?', [mail], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Resident_id', (req, res) => {
    const { id } = req.params;
    proj.query('DELETE FROM Resident WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Service_Ville', (req, res) => {
    const { idVille } = req.params;
    proj.query('DELETE FROM Service WHERE idVille = ?', [idVille], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Ville_id', (req, res) => {
    const { id } = req.params;
    proj.query('DELETE FROM Ville WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Actu_id', (req, res) => {
    const { id } = req.params;
    proj.query('DELETE FROM Actu WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Lien', (req, res) => {
    const { idService, nomCate } = req.params;
    proj.query('DELETE FROM Lien WHERE idService=? AND nomCategorie = ?', [idService,nomCate], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

app.delete('/sup_Actu_nom', (req, res) => {
    const { nom } = req.params;
    proj.query('DELETE FROM Actu WHERE nom = ?', [nom], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Élément supprimé avec succès');
    });
});

 app.put('/modif_Resident_genre', (req, res) => {
    const { id } = req.params;
    const { genre} = req.body; 

    proj.query('UPDATE Resident SET genre = ? WHERE id = ?', 
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

    proj.query('UPDATE Resident SET nom = ? WHERE id = ?', 
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
    const { prenom} = req.body; // Remplacez par vos champs

    proj.query('UPDATE Resident SET prenom = ? WHERE id = ?', 
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

    proj.query('UPDATE Resident SET mail = ? WHERE id = ?', 
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

    proj.query('UPDATE Resident SET mdp = ? WHERE id = ?', 
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

    proj.query('UPDATE Resident SET abonnement = ? WHERE id = ?', 
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
    const { nom} = req.body; // Remplacez par vos champs

    proj.query('UPDATE Ville SET nom=? WHERE id = ?', 
        [nom, idVille ], 
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
    const {nom } = req.body; // Remplacez par vos champs

    proj.query('UPDATE Service SET nom = ? WHERE id = ?', 
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
    const {descrip } = req.body; // Remplacez par vos champs

    proj.query('UPDATE Service SET descrip = ? WHERE id = ?', 
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
    const {nom } = req.body; // Remplacez par vos champs

    proj.query('UPDATE Actu SET nom = ? WHERE id = ?', 
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
    const {descrip } = req.body; // Remplacez par vos champs

    proj.query('UPDATE Actu SET descrip = ? WHERE id = ?', 
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

const PORT = 5000;
app.get('/', (req, res) => {
    res.send('Bienvenue sur la page d\'accueuil!');
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});