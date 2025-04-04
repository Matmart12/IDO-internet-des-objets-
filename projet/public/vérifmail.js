console.log("Script chargé !");
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM chargé"); // Vérifie si le DOM est bien chargé

    document.getElementById('formInscription').addEventListener('submit', function (event) {
        event.preventDefault();  // Empêche la soumission du formulaire classique
        console.log("Le formulaire est soumis");
        event.preventDefault();
        ajouterElement(event);
    });
});

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

async function ajouterElement(event) {
    const mail = document.getElementById("email").value;
    const mdp = document.getElementById("password").value;
    const abo = document.querySelector('input[name="abonnement"]:checked').value;
    if (!mail || !mdp || !abo) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        // Vérif du mail
        const response = await fetch(`http://localhost:5000/Recherche_Resident_mail?mail=${encodeURIComponent(mail)}`);
        const data = await response.json();

        if (data.length > 0 && data[0].mdp==mdp) {
            try {
                const response = await fetch(`http://localhost:5000/modif_Resident_abonnement/${data[0].id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ abonnement: abo }),
                    credentials: 'include' // PLUS DE COOKIES XD 
                });
                const result = await response.text();
                console.log(result);
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
        else{
            alert("Mail ou mot de passe incorrect");
        }

    } catch (err) {
        console.error("Erreur:", err)
    }
}
function Connect() {
    window.location.href = "connexion.html";
}