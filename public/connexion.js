
//si l'utilisateur est connecté, le déconnecte automatiquement (vide les données utilisateurs)
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
    //quand le bouton se connecter est cliquer fait les vérifs pour savoir s'il a le droit de se co et s'il a le droit, ça le connecte et l'envoie sur la page d'accueil
    document.getElementById('Connexion').addEventListener('click', async function (e) {
        e.preventDefault(); 
        try {
            await testeconnexion();
        } catch (err) {
            console.error("Erreur lors de la connexion:", err);
        }
    });
});

//dans le nom
async function recupResident(mail) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Resident_mail?mail=${mail}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucun résident trouvé.');
            return -1;
        }
        console.log("id du résident: ", data[0].id);
        return data[0];
    } catch (error) {
        console.error('Erreur:', error);
        return -1;
    }
}

async function testeconnexion() {
    const mail = document.getElementById("email").value;
    const mdp = document.getElementById("password").value;

    const Resident = await recupResident(mail);

    if (Resident === -1) {
        alert("Aucun utilisateur trouvé avec cet email");
        return;
    }

    if (Resident.mdp == mdp && Resident.abonnement != "nonVerif") {
        try {
            const response = await fetch('http://localhost:5000/testconnexion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mail, mdp }),
                credentials: 'include'
            });
            
            const data = await response.json();
            console.log("Réponse serveur:", data);

            if (data.success && data.userId) {
                const sessionCheck = await fetch('http://localhost:5000/check-session', {
                    credentials: 'include'
                });
                const sessionData = await sessionCheck.json();
                
                if (sessionData.isLoggedIn) {
                    console.log("ID utilisateur:", data.userId); // Affiche l'ID
                    window.location.href = "pageacceuil.html";
                } else {
                    alert("Erreur de session");
                }
            } else {
                alert(data.error || "Échec de la connexion");
            }
        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
        }
    } else {
        alert("Mot de passe incorrect ou compte non vérifié");
    }
}