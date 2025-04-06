console.log("Script chargé !");
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM chargé"); // Vérifie si le DOM est bien chargé

    document.getElementById('formvérif').addEventListener('submit', function (event) {
        event.preventDefault();  // Empêche la soumission du formulaire classique
        console.log("Le formulaire est soumis");
        ajouterElement(event);
    });
});

async function abonnement(id, abo) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_abonnement/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ abonnement: abo }),
            credentials: 'include' // PLUS DE COOKIES XD 
        });
        const result = await response.text();
        console.log(result);
        window.location.href = "connexion.html"
    } catch (error) {
        console.error('Erreur:', error);
    }
}


async function rechercheMaire(idVille) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Maire?idVille=${encodeURI(idVille)}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucune ville trouvée.');
            return -1;
        }

        return data;
    } catch (error) {
        console.error('Erreur:', error);
        return -2;
    }
}

async function rechercheResidence(id) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Residence_id?id=${encodeURI(id)}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucune résidence trouvée.');
            return -1;
        }

        return data[0];
    } catch (error) {
        console.error('Erreur:', error);
        return -2;
    }
}

async function rechercheVille(idVille) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Ville_id?idVille=${encodeURI(idVille)}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucune ville trouvée.');
            return -1;
        }

        return data[0].idVille;
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
        // Vérification du mail/mot de passe
        const response = await fetch(`http://localhost:5000/Recherche_Resident_mail?mail=${encodeURIComponent(mail)}`);
        const data = await response.json();

        if (data.length === 0 || data[0].mdp !== mdp) {
            alert("Mail ou mot de passe incorrect");
            return;
        }

        const resident = data[0];

        // Cas général 
        if (abo !== "Maire") {
            await abonnement(resident.id, abo);
            return;
        }
        const ResidenceVille= await rechercheResidence(resident.idResidence)
        // Cas Maire : vérification de la ville 
        console.log(ResidenceVille);

        const maireData = await rechercheMaire(ResidenceVille.idVille);
        if (!Array.isArray(maireData) || maireData.length === 0) {
            await abonnement(resident.id, abo); // Aucun maire trouvé
            return;
        }

        // Cas Maire : Vérification du maire existant
        const res = await fetch(`http://localhost:5000/Recherche_Resident_id?id=${encodeURIComponent(maireData[0].id)}`);
        const donnee = await res.json();

        if (donnee.length > 0 && donnee[0].abo === "Maire") {
            alert("Il existe déjà un maire pour cette ville");
        }

        // Cas Maire: abonnement Maire s'il n'y en a pas
        else {
            await abonnement(resident.id, abo);
        }

    } catch (err) {
        console.error("Erreur:", err);
        alert("Une erreur est survenue lors du traitement");
    }
}


function Connect() {
    window.location.href = "connexion.html";
}