//si l'utilisateur est connecté, alors le déconnecte
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('http://localhost:5000/check-session', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.isLoggedIn) {
            await fetch('http://localhost:5000/deconnexion', {
                method: 'GET',
                credentials: 'include'
            });
            console.log('Utilisateur déconnecté automatiquement.');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
    }
    //quand le bouton s'incrire est appuyé, test si la ville et la résidence est créée et si oui, envoie un mail de vérification et crée le compte de l'utilisateur
    document.getElementById('formInscription').addEventListener('submit', function (event) {
        event.preventDefault();  // Empêche la soumission du formulaire classique
        console.log("Le formulaire est soumis");
        event.preventDefault();
        ajouterElement(event);
    });
});

//envoie le mail
async function sendEmail(to, subject, html) {
    try {
        const response = await fetch('http://localhost:5000/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Échec de l'envoi");
        }
        alert("Inscription réussie ! Un email de vérification a été envoyé.");
        const result = await response.text();
        window.location.href = "connexion.html";
    } catch (error) {
        console.error('Erreur:', error);
    }
}


//dans le nom mais c'est l'id qui est récupéré
async function recupidVille(nom, departement) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Ville_nom_departement?nom=${encodeURIComponent(nom)}&departement=${encodeURIComponent(departement)}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucune ville trouvée.');
            return -1;
        }

        const villeId = data[0].id; // Récupération du premier ID
        console.log('ID de la ville :', villeId);
        return villeId;
    } catch (error) {
        console.error('Erreur:', error);
        return -1;
    }
}
//recherche s'il existe déjà un résident avec ce mail
async function rechercheResident(mail) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Resident_mail?mail=${encodeURI(mail)}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucune ville trouvée.');
            return -1;
        }

        return 1;
    } catch (error) {
        console.error('Erreur:', error);
        return -2;
    }
}
//recherche si la résidence existe et si oui, alors renvoie l'id de la résidence
async function recupidResidence(idVille, rue, numrue) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Residence_ville_num_rue?num=${numrue}&idv=${idVille}&rue=${encodeURIComponent(rue)}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucune résidence trouvée.');
            return -1;
        }

        const residenceId = data[0].id; // Récupération du premier ID
        console.log('ID de la résidence:', residenceId);
        return residenceId;
    } catch (error) {
        console.error('Erreur:', error);
        return -1;
    }
}

//vérifie les données du formulaire pour ensuite inscrire et envoyer un mail de vérification au résident (l'abonnement=nonVérif tant que le mail n'est pas vérifié)
async function ajouterElement(event) {
    event.preventDefault();
    const prenom = document.getElementById("prenom").value;
    const nom = document.getElementById("nom").value;
    const mail = document.getElementById("email").value;
    const mdp = document.getElementById("password").value;
    const genre = document.querySelector('input[name="genre"]:checked').value;
    const age = document.getElementById("age").value;
    const ville = document.getElementById("ville").value;
    const departement = document.getElementById("departement").value;
    const rue = document.getElementById("rue").value;
    const numrue = document.getElementById("numrue").value;
    const fileInput = document.getElementById("id1"); // Correction de l'ID
    const adressephoto = "./photo/" + mail.replace(/[@.]/g, '_') + ".png";
    console.log("Valeurs du formulaire:", {
        prenom, nom, mail, mdp, age, ville, departement, rue, numrue
    });
    if (!mail || !prenom || !nom || !mdp || !age || !ville || !departement || !rue || !numrue) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        //  Vérifier de mail
        const checkResponse = await fetch(`http://localhost:5000/Recherche_Resident_mail?mail=${encodeURIComponent(mail)}`);
        const checkData = await checkResponse.json();

        if (checkData.length > 0) {
            alert("Un compte avec cet email existe déjà");
            return;
        }

        // 2. verif de ville
        let idVille = await recupidVille(ville, departement);
        if (idVille < 0) {
            const villeResponse = await fetch('http://localhost:5000/Creer_Ville', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom: ville, département: departement })
            });
            idVille = await recupidVille(ville, departement);
            if (idVille < 0) {
                alert("Erreur lors de la création de la ville");
                return;
            }
        }

        // 3. verif de résidence
        let idResidence = await recupidResidence(idVille, rue, numrue);
        if (idResidence < 0) {
            const residenceResponse = await fetch('http://localhost:5000/Creer_Residence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numéro: numrue, rue: rue, idVille: idVille })
            });
            idResidence = await recupidResidence(idVille, rue, numrue);
            if (idResidence < 0) {
                alert("Erreur lors de la création de la résidence");
                return;
            }
        }

        // 4. si photo, téléchargement de celle-ci dans fichier photo
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0], mail.replace(/[@.]/g, '_') + '.png');

            try {
                await fetch('/photo', {
                    method: 'POST',
                    body: formData
                });
            } catch (error) {
                console.error('Erreur upload photo:', error);
                // On continue même si l'upload de photo échoue
            }
        }

        // 5. Créer résident
        const residentData = {
            prenom: prenom,
            nom: nom,
            mail: mail,
            mdp: mdp,
            age: age,
            abo: "nonVerif", // Utilisation d'abo pour la route au lieu d'abonné (plus court à écrire)
            idResidence: idResidence,
            adressephoto: adressephoto,
            genre: genre
        };

        const response = await fetch('http://localhost:5000/Creer_Resident', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(residentData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        console.log("Réponse du serveur:", result);
        alert("Inscription réussie !");
        //envoie du mail
        sendEmail(
            mail,
            'vérification du mail',
            `<h1>Bonjour ${nom} ${prenom},</h1> <p>Veuillez vérifier votre email en cliquant <a href="http://localhost:5000/verifmail.html">ici</a>.</p>`
        );

    } catch (error) {
        console.error('Erreur:', error);
        alert("Erreur lors de l'inscription: " + error.message);
    }
}

function Connect() {
    window.location.href = "connexion.html";
}