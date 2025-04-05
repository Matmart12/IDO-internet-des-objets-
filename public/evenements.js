// Fonction pour récupérer les événements d'une ville
async function rechercherEvenements() {
    console.log('recherche événements');
    try {
        // Récupération des événements via l'API (GET)
        const response = await fetch(`http://localhost:5000/Recherche_Actu_Ville?idVille=1`);  // Remplacer "1" par l'ID réel de la ville
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucun événement trouvé.');
            return -1;
        }

        console.log("data: ", data);
        return data;
    } catch (error) {
        console.error('Erreur:', error);
        return -1;
    }
}
// Fonction pour formater la date au format jour/mois/année
function formaterDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options); // Utilisation de la locale française pour afficher la date
}


// Fonction pour afficher les événements dans le DOM
// Fonction pour afficher les événements dans le DOM
// Fonction pour afficher les événements dans le DOM
async function afficherEvenements() {
    console.log('affichage événements');

    // Appel de la fonction pour récupérer les événements
    const data = await rechercherEvenements();

    if (data === -1) {
        console.log('Aucun événement à afficher');
        return;
    }

    const evenementList = document.getElementById('evenementList');
    // Vider la liste avant d'ajouter les événements (éviter les doublons)
    evenementList.innerHTML = "";

    // Parcourir le tableau des événements et ajouter chaque événement au DOM
    if (Array.isArray(data)) {
        data.forEach((evenement) => {
            const li = document.createElement("li");
            li.className = "evenement-item";
            li.innerHTML = `
                <strong>${evenement.nom}</strong><br>
                <em>${evenement.descrip}</em><br>
                <strong>Date :</strong> ${formaterDate(evenement.apparition)}<br>
            `;
            evenementList.appendChild(li);
        });
    } else {
        console.error('Les données récupérées ne sont pas un tableau valide.');
    }
}

// Initialisation de l'affichage
afficherEvenements();
