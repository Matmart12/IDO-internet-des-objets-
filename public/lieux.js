console.log('Début');

async function session() {
    const sessionCheck = await fetch('http://localhost:5000/check-session', {
      credentials: 'include'
    });
    const sessionData = await sessionCheck.json();
  
    if (sessionData.isLoggedIn) {
      return sessionData.id;
    } else {
      return -1;
    }
  }

  async function rechercheResident(id) {
    try {
      const response = await fetch(`http://localhost:5000/Recherche_Resident_id?id=${encodeURI(id)}`);
      const data = await response.json();
  
      if (data.length === 0) {
        console.log('Aucun résident trouvé.');
        return -1;
      }
  
      return data[0];
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
  
  async function rechercheVille(id) {
    try {
      const response = await fetch(`http://localhost:5000/Recherche_Ville_id?id=${encodeURI(id)}`);
      const data = await response.json();
  
      if (data.length === 0) {
        console.log('Aucune ville trouvée.');
        return -1;
      }
  
      return data[0];
    } catch (error) {
      console.error('Erreur:', error);
      return -2;
    }
  }

// Fonction pour rechercher les lieux d'intérêt
async function rechercherLieux() {
    console.log('Recherche des lieux');
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Service_Lien_?nomCate=Lieux`); // Remplace `1` par l'ID de la ville que tu veux
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

    // 1. Vérifier la session
    const sess = await session();
    if (sess <= 0) {
      console.error('Session invalide');
      return;
    }

    // 2. Récupérer le résident
    const Resident = await rechercheResident(sess);
    if (!Resident || Resident === -1 || Resident === -2) {
      console.error('Résident non trouvé');
      return;
    }

    // 3. Récupérer la résidence
    const Residence = await rechercheResidence(Resident.idResidence);
    if (!Residence || Residence === -1 || Residence === -2) {
      console.error('Résidence non trouvée');
      return;
    }

    // 4. Récupérer la ville
    const Ville = await rechercheVille(Residence.idVille);
    if (!Ville || Ville === -1 || Ville === -2) {
      console.error('Ville non trouvée');
      return;
    }

    // Parcourir les lieux et les afficher
    if (Array.isArray(data)) {
        data.forEach((lieu) => {
            if(lieu.idVille==Ville.id){
                const li = document.createElement("li");
            li.className = "lieu-item";
            li.innerHTML = `
                <strong>${lieu.nom}</strong> - ${lieu.descrip} <br>
                Adresse: ${lieu.rue} ${lieu.num} <br>
                <img src="${lieu.url_photo}" alt="${lieu.nom}">
            `;
            lieuxList.appendChild(li);
            }
            
        });
    } else {
        console.error('Les données récupérées ne sont pas un tableau valide.');
    }
}
document.addEventListener('DOMContentLoaded', async function () {
    const sess = await session();
    if (sess <= 0) {
      window.location.href = "connexion.html"
    }
    console.log("L'id de la session:", sess)
    afficherLieux();
  });


console.log('Fin');
