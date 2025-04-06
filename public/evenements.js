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

    // Parcourir le tableau des événements et ajouter chaque événement au DOM
    if (Array.isArray(data)) {
        data.forEach((evenement) => {
            if(evenement.idVille==Ville.id){
            const li = document.createElement("li");
            li.className = "evenement-item";
            li.innerHTML = `
                <strong>${evenement.nom}</strong><br>
                <em>${evenement.descrip}</em><br>
                <strong>Date :</strong> ${formaterDate(evenement.apparition)}<br>
            `;
            evenementList.appendChild(li);
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
    // Initialisation de l'affichage
    afficherEvenements();
  });


