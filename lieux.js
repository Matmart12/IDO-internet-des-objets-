console.log('Début');

// Fonction pour rechercher les lieux d'intérêt
async function rechercherLieux() {
    console.log('Recherche des lieux');
    try {
        const response = await fetch('http://localhost:5000/Recherche_Lieux?idVille=1'); // Remplace `1` par l'ID de la ville que tu veux
        const data = await response.json();

        if (data.length == 0) {
            console.log('Aucun lieu trouvé.');
            return -1;
        }
        console.log('Données récupérées: ', data);
        return data;
    } catch (error) {
        console.error('Erreur:', error);
        return -1;
    }
}

// Fonction pour afficher les lieux d'intérêt
async function afficherLieux() {
    console.log('Affichage des lieux');

    // Appel de la fonction pour rechercher les lieux
    const data = await rechercherLieux();

    if (data === -1) {
        console.log('Aucun lieu à afficher');
        return;
    }
    
    const lieuxList = document.getElementById('lieuxList');
    lieuxList.innerHTML = "";  // Vide la liste avant d'ajouter de nouveaux éléments

    // Parcourir les lieux et les afficher
    if (Array.isArray(data)) {
        data.forEach((lieu) => {
            const li = document.createElement("li");
            li.className = "lieu-item";
            li.innerHTML = `
                <strong>${lieu.nom}</strong> - ${lieu.descrip} <br>
                Adresse: ${lieu.rue} ${lieu.num} <br>
                <img src="${lieu.url_photo}" alt="${lieu.nom}">
            `;
            lieuxList.appendChild(li);
        });
    } else {
        console.error('Les données récupérées ne sont pas un tableau valide.');
    }
}

afficherLieux();

console.log('Fin');
