console.log('début');

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

async function rechercherTransport() {
  console.log('recherche');
  try {
    console.log('try??');
    const response = await fetch(`http://localhost:5000/Recherche_Service_Lien_?nomCate=transport`);
    console.log("fecthed??");
    const data = await response.json();

    if (data.length == 0) {
      console.log('Aucun transport trouvé.');
      return -1;
    }
    console.log("data: ", data);
    console.log("fin recherche??");
    return data;
  } catch (error) {
    console.log('bleurk');
    console.error('Erreur:', error);
    return -1;
  }
}


// Fonction pour afficher tous les transports dans le DOM
async function afficherTransport() {
  console.log('affichage');

  // Appel de la fonction rechercherTransport pour récupérer les données
  const data = await rechercherTransport();

  if (data === -1) {
    console.log('Aucun transport à afficher');
    return;
  }

  try {
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

    console.log('Ville trouvée:', Ville); // Debug

    // 5. Récupérer les transports
    const data = await rechercherTransport();
    if (data === -1 || !Array.isArray(data)) {
      console.log('Aucun transport à afficher');
      return;
    }

    // 6. Afficher les transports
    const transportList = document.getElementById('transportList');
    transportList.innerHTML = "";

    data.forEach((service) => {
      if (service.idVille == Ville.id) {
        const li = document.createElement("li");
        li.className = "transport-item";
        li.innerHTML = `
          <strong>${service.nom} ${service.descrip}</strong> - ${service.idVille}
        `;
        transportList.appendChild(li);
      }
    });
  }
  catch (error) {
    console.error('Erreur dans afficherTransport:', error);
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  const sess = await session();
  if (sess <= 0) {
    window.location.href = "connexion.html"
  }
  console.log("L'id de la session:", sess)
  afficherTransport();
});
console.log('fin');