        document.getElementById('formConnexion').addEventListener('submit', function (event) {
            event.preventDefault();  // Empêche la soumission du formulaire classique
            console.log("Le formulaire est soumis");
            testeconnexion(event);
        });

        app.get('/ma-route', (req, res) => {
            if (!req.session.user) { //verif si connecté
                return res.status(401).send('Non connecté');
            }

            console.log("Utilisateur connecté:", req.session.user.id);
            req.session.user=null; //se déconnecte
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
