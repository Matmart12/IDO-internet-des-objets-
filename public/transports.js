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

  const transportList = document.getElementById('transportList');
  // Vider la liste avant d'ajouter les transports (éviter les doublons)
  transportList.innerHTML = "";

  // Parcourir le tableau des services et ajouter chaque service au DOM
  if (Array.isArray(data)) {
    data.forEach((service) => {
      const li = document.createElement("li"); // Crée un nouvel élément <li> pour chaque service
      li.className = "transport-item"; // Ajoute une classe pour appliquer les styles CSS
      li.innerHTML = `
            <strong>${service.nom} ${service.descrip}</strong> - ${service.idVille}
        `; // Ajoute le nom, la description et la ville du transport
      transportList.appendChild(li); // Ajoute l'élément <li> à la liste des transports
    });
  } else {
    console.error('Les données récupérées ne sont pas un tableau valide.');
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  sess=await session();
  if(sess<=0){
    window.location.href="connexion.html"
  }
afficherTransport();
});
console.log('fin');