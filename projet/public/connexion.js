document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/check-session', {  //vérifie si l'utilisateur est co
            credentials: 'include' // Inclure les cookies 
        });
        const data = await response.json();

        if (data.isLoggedIn) {
            // Déconnecte l'utilisateur s'il est déjà co
            await fetch('http://localhost:5000/api/auth/deconnexion', {
                method: 'GET',
                credentials: 'include'
            });
            console.log('Utilisateur déconnecté automatiquement.');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
    }
});
        
        
        
        document.getElementById('formConnexion').addEventListener('submit', function (event) {
            event.preventDefault();  // Empêche la soumission du formulaire classique
            console.log("Le formulaire est soumis");
            testeconnexion(event);
        });

        async function recupMDPResident(mail) {
            try {
                const response = await fetch(`http://localhost:5000/Recherche_Resident_mail?mail=${mail}`);
                const data = await response.json();

                if (data.length === 0) {
                    console.log('Aucun résident trouvée.');
                    return -1;
                }
                console.log("id du résident: ", data[0].id);
                return data[0];
            } catch (error) {
                console.error('Erreur:', error);
                return -1;
            }
        }

        async function testeconnexion(event) {
            event.preventDefault();
            const mail = document.getElementById("email").value;
            const mdp = document.getElementById("password").value;

            const Resident = await recupMDPResident(mail);
            if (Resident.mdp == mdp) {
                req.session.user.id=Resident.id;
                req.session.user.mail=Resident.mail
                window.location.href = "accueuil.html"
            }
        }
        function Connect() {
            window.location.href = "inscription.html";
        }
