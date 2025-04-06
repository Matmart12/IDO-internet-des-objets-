console.log('début');

// Sélection des éléments du DOM
// Services
const nomInputS = document.getElementById("nomS");
const descripInputS = document.getElementById("descripS");
const catInputS = document.getElementById("catS");
const idvilleInputS = document.getElementById("villeS");
// Actus
const nomInputA = document.getElementById("nomA");
const descripInputA = document.getElementById("descripA");
const dateInputA = document.getElementById("DateA");
const catInputA = document.getElementById("catA");
const idvilleInputA = document.getElementById("villeA");

/////////////////////////////////////// Gestions des Services /////////////////////////////////////////// 
// Récupération de tous les services
async function rechercherServices() {
    console.log('recherche');
    try {

        const response = await fetch(`http://localhost:5000/Recherche_Service`);
        const data = await response.json();

        if (data.length == 0) {
            console.log('Aucun service trouvé.');
            return -1;
        }
        return data;
        
    } catch (error) {
        console.error('Erreur:', error);
        return -1;
    }
}
// Ajouter un service
async function ajouterService() {
    const nom = nomInputS.value.trim(); 
    const descrip = descripInputS.value.trim(); 
    const cat = catInputS.value.trim(); 
    const idville = idvilleInputS.value.trim(); 

    // Vérifier si tous les champs sont remplis
    if (!descrip || !nom || !cat || !idville ) {
        alert("Veuillez remplir tous les champs !"); // Message d'erreur si un champ est vide
        return; // Stoppe l'exécution de la fonction
    }
    // Ajouter le service à la bdd
    const idservice = await creerService(nom, descrip, idville);
    console.log('idservice =',idservice);
    console.log('cat = ', cat);
    await liaisonServiceCat(idservice, cat);

    // Réinitialiser les champs de saisie après ajout
    descripInputS.value = "";
    nomInputS.value = ""; 
    catInputS.value = ""; 
    idvilleInputS.value = "";

    // Afficher la liste des services mise à jour
    afficherServices();
}
async function creerService(nom, descrip, idville){
    // Creer_Service
    try {
        // Créer la ville et récupérer l'ID
        const response = await fetch('http://localhost:5000/Creer_Service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom : nom, descrip : descrip, idVille : idville} )
        });
        const data = await response.text();
        console.log(data); // Affiche le message de succès ou d'erreur
    } catch (error) {
        console.error('Erreur lors de la création de la ville:', error);
        return; // Arrêter la fonction en cas d'erreur
    }
    // Recupération de son id
    try {
      const url = `http://localhost:5000/Recherche_Service_nom_descrip_idVille?nom=${encodeURIComponent(nom)}&descrip=${encodeURIComponent(descrip)}&idVille=${idville}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json(); 

      return data[0].id;
    } catch (error) {
      console.error('Erreur lors de la recherche du service:', error);
      return; // Arrêter la fonction en cas d'erreur
    }

};
async function liaisonServiceCat(idservice, cat){
  const objCat = cat.split(',').map(item => ({nomCategorie: item.trim()}));

  for (let categorie of objCat) {
      // verifier si catégorie existe Recherche_Categorie
      const existe = await existeCat(categorie.nomCategorie);
      console.log("existe = ", existe);

      if (existe == -1){ // Si la catégorie n'existe pas, la créer 
          try {
              const response = await fetch('http://localhost:5000/Creer_Categorie', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ nom : categorie.nomCategorie} )
              });
              const data = await response.text();
              console.log('caté',data); // Affiche le message de succès ou d'erreur
          } catch (error) {
              console.error('Erreur lors de la création de la catégorie:', error);
              return; // Arrêter la fonction en cas d'erreur
          }
      }

      const existe2 = await existeCat(categorie.nomCategorie);
      console.log("existe2 = ", existe2);


      // Créer le lien entre catégorie et service
      try {
        const response = await fetch('http://localhost:5000/Creer_Lien', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomCate : categorie.nomCategorie, idService : idservice} )
        });
        const data = await response.text();
        console.log(data); // Affiche le message de succès ou d'erreur
      } catch (error) {
        console.error('Erreur lors de la création du lien :', error);
        return; // Arrêter la fonction en cas d'erreur
      }
  }
};

// Même focntion pour les actus
async function existeCat(nom) {
  try {
    const response = await fetch(`http://localhost:5000/Recherche_Categorie?nom=${encodeURIComponent(nom)}`);
    
     // Vérifie si la réponse est OK (code 200)
     if (!response.ok) {
      throw new Error('Réponse de l\'API invalide');
    }
    const data = await response.json();
    if (data.length === 0) {
        console.log('Aucune catégorie trouvée.');
        return -1 ;
    }

    console.log('Catégorie trouvée.');
    return 1;
  } catch (error) {
    console.error('Erreur:', error);
    return -1;
  }
}

// Fonction pour afficher tous les services dans le DOM
async function afficherServices() {
  console.log('affichage');

  // Appel de la fonction rechercherServices pour récupérer les données
  const data = await rechercherServices();
  console.log(data);
  if (data === -1) {
    console.log('Aucun services à afficher');
    return;
  }
  
  const servicestList = document.getElementById('services');
  // Vider la liste avant d'ajouter les transports (éviter les doublons)
  servicestList.innerHTML = "";

  // Parcourir le tableau des services et ajouter chaque service au DOM
  if (Array.isArray(data)) {
    data.forEach(async (service) => {
        const cat = await recupCatService (service.id);
        const li = document.createElement("li"); // Crée un nouvel élément <li> pour chaque service
        li.className = "services-item"; // Ajoute une classe pour appliquer les styles CSS
        li.innerHTML = `
            <strong>${service.nom} ${service.descrip}</strong> ${service.idVille}
            <p>Catégories : ${cat}<p>
            <button onclick="supprimerService(${service.id})">Supprimer</button>
        `; // Ajoute le nom, la description et la ville du service
        servicestList.appendChild(li); // Ajoute l'élément <li> à la liste des services
    });
  } else {
    console.error('Les données récupérées ne sont pas un tableau valide.');
  }
}
async function recupCatService (id){
  //recupère toutes les catégories d'un service
  try {
    const response = await fetch(`http://localhost:5000/Recherche_Lien_service?id=${id}`);
    
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des catégories');
    }

    const data = await response.json();
    console.log('Catégories récupérées:', data);

    const resultat = data.map(item => item.nomCategorie).join(', ');
    return resultat;
    } catch (error) {
        console.error('Erreur:', error);
}
}

// Suppression des services 
async function supprimerService(id) {
  const conf = confirm("Êtes-vous sûr de vouloir supprimer ce service ?");
  if (conf) {
      try {
          // Supprimer les liens associés à le service
          await supprimerLiens(id);

          // Envoie de la requête DELETE pour supprimer le Service
          const response = await fetch(`http://localhost:5000/sup_Service_id/${encodeURIComponent(id)}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          
          // Vérification de la réponse
          if (!response.ok) {
              throw new Error('Erreur lors de la suppression du service');
          }

          // Si la réponse est OK, récupérer la réponse en JSON
          const data = await response.json();
          console.log('Service supprimé avec succès', data);
          alert('Ce service a été supprimé avec succès.');

          // Rafraîchir les affichages des services
          afficherServices();
      } catch (error) {
          console.error('Erreur de suppression :', error);
          alert('Une erreur est survenue lors de la suppression du service.');
      }
  }
}
async function supprimerLiens(id) {
  try {
      // Envoie de la requête DELETE pour supprimer les liens associés au Service
      const response = await fetch(`http://localhost:5000/sup_Lien_service/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          }
      });

      // Vérification de la réponse
      if (!response.ok) {
          throw new Error('Erreur lors de la suppression des liens du service');
      }

      // Récupération de la réponse en JSON
      const data = await response.json();
      console.log('Liens associés au service supprimés avec succès', data);

    } catch (error) {
      console.error('Erreur de suppression des liens :', error);
      alert('Une erreur est survenue lors de la suppression des liens associés au service.');
  }
}

afficherServices();


//////////////////////////////////////// Gestions des Actus //////////////////////////////////////////
// Récupération de toutes les actus
async function rechercherActus() {
  console.log('recherche');
  try {

      const response = await fetch(`http://localhost:5000/Recherche_Actu`);
      const data = await response.json();

      if (data.length == 0) {
          console.log('Aucun actu trouvé.');
          return -1;
      }

      return data;
  } catch (error) {
      console.error('Erreur:', error);
      return -1;
  }
}

// Ajouter une actu
async function ajouterActu() {
  const nom = nomInputA.value.trim(); 
  const descrip = descripInputA.value.trim(); 
  const date = dateInputA.value.trim();
  const idville = idvilleInputA.value.trim(); 
  const cat = catInputA.value.trim(); 

  // Vérifier si tous les champs sont remplis
  if (!descrip || !nom || !cat || !idville || !date ) {
      alert("Veuillez remplir tous les champs !"); // Message d'erreur si un champ est vide
      return; // Stoppe l'exécution de la fonction
  }

  // Ajouter le service à la bdd
  const idactu = await creerActu(nom, descrip, date, idville);
  console.log('idActu =',idactu);
  console.log('cat = ', cat);
  await liaisonActuCat(idactu, cat);

  // Réinitialiser les champs de saisie après ajout
  descripInputA.value = "";
  nomInputA.value = ""; 
  catInputA.value = ""; 
  idvilleInputA.value = "";
  dateInputA.value = "";

  // Afficher la liste des services mise à jour
  afficherActus();
}

async function creerActu(nom, descrip, date, idville){
  // Creer_Actu
  try {
      // Créer la ville et récupérer l'ID
      const response = await fetch('http://localhost:5000/Creer_Actu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nom : nom, description : descrip, idVille : idville, apparition : date} )
      }); 
      const data = await response.text();
      console.log(data); // Affiche le message de succès ou d'erreur
  } catch (error) {
      console.error('Erreur lors de la création de l\'actu:', error);
      return; // Arrêter la fonction en cas d'erreur
  }
  // Recupération de son id
  try {
    const url = `http://localhost:5000/Recherche_Actu_nom_temps_descrip_idville?apparition=${encodeURIComponent(date)}&nom=${encodeURIComponent(nom)}&descrip=${encodeURIComponent(descrip)}&idVille=${idville}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json(); 

    return data[0].id;
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'actu:', error);
    return; // Arrêter la fonction en cas d'erreur
  }

};
async function liaisonActuCat(idservice, cat){
const objCat = cat.split(',').map(item => ({nomCategorie: item.trim()}));

for (let categorie of objCat) {
    // verifier si catégorie existe Recherche_Categorie
    const existe = await existeCat(categorie.nomCategorie);
    console.log("existe = ", existe);

    if (existe == -1){ // Si la catégorie n'existe pas, la créer 
        try {
            const response = await fetch('http://localhost:5000/Creer_Categorie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom : categorie.nomCategorie} )
            });
            const data = await response.text();
            console.log('caté',data); // Affiche le message de succès ou d'erreur
        } catch (error) {
            console.error('Erreur lors de la création de la catégorie:', error);
            return; // Arrêter la fonction en cas d'erreur
        }
    }

    // Créer le lien entre catégorie et actu
    try {
      const response = await fetch('http://localhost:5000/Creer_LienActu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nomCate : categorie.nomCategorie, idActu : idservice} )
      });
      const data = await response.text();
      console.log(data); // Affiche le message de succès ou d'erreur
    } catch (error) {
      console.error('Erreur lors de la création du lien :', error);
      return; // Arrêter la fonction en cas d'erreur
    }
}
}

// Fonction pour afficher toutes les actus dans le DOM
async function afficherActus() {
    console.log('affichage');

    // Appel de la fonction rechercherActus pour récupérer les données
    const data = await rechercherActus();

    if (data === -1) {
      console.log('Aucun actus à afficher');
      return;
    }

    const actustList = document.getElementById('actus');
    // Vider la liste avant d'ajouter les transports (éviter les doublons)
    actustList.innerHTML = "";
  console.log(data);
    // Parcourir le tableau des actus et ajouter chaque actu au DOM
    if (Array.isArray(data)) {
        data.forEach(async(actu) => {
            const cat = await recupCatActu(actu.id);
            const li = document.createElement("li"); // Crée un nouvel élément <li> pour chaque actu
            li.className = "actus-item"; // Ajoute une classe pour appliquer les styles CSS
            li.innerHTML = `
                <strong>${actu.nom} ${actu.descrip}</strong> ${actu.idVille}
                <p>Catégories : ${cat}<p>
                <button onclick="supprimerActu(${actu.id})">Supprimer</button>
            `; // Ajoute le nom, la description et la ville du actu
            console.log("id actu",actu.id);
            actustList.appendChild(li); // Ajoute l'élément <li> à la liste des actus
        });
    } else {
      console.error('Les données récupérées ne sont pas un tableau valide.');
    }
}
async function recupCatActu (id){
  //recupère toutes les catégories d'un service
  try {
    const response = await fetch(`http://localhost:5000/Recherche_LienActu_actu?id=${id}`);
    
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des catégories');
    }

    const data = await response.json();
    console.log('Catégories récupérées:', data);

    const resultat = data.map(item => item.nomCategorie).join(', ');
    return resultat;
    } catch (error) {
        console.error('Erreur:', error);
}
}

// Suppression d'une actu
async function supprimerActu(id) {
  const conf = confirm("Êtes-vous sûr de vouloir supprimer cette Actu ?");
  if (conf) {
      try {
          // Supprimer les liens associés à l'actu
          console.log('avant');
          await supprimerLiensActu(id);
          console.log('ap');

          // Envoie de la requête DELETE pour supprimer l'Actu
          const response = await fetch(`http://localhost:5000/sup_Actu_id/${encodeURIComponent(id)}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          console.log('fuckit');
          // Vérification de la réponse
          if (!response.ok) {
              throw new Error('Erreur lors de la suppression de l\'actu');
          }

          // Si la réponse est OK, récupérer la réponse en JSON
          const data = await response.json();
          console.log('Actu supprimée avec succès', data);
          alert('Cette actu a été supprimée avec succès.');

          // Rafraîchir les affichages des actus
          afficherActus();
      } catch (error) {
          console.error('Erreur de suppression :', error);
          alert('Une erreur est survenue lors de la suppression de l\'actu.');
      }
  }
}
async function supprimerLiensActu (id) {
  try {
      // Envoie de la requête DELETE pour supprimer les liens associés à l\'Actu
      const response = await fetch(`http://localhost:5000/sup_LienActu_actu/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          }
      });

      // Vérification de la réponse
      if (!response.ok) {
          throw new Error('Erreur lors de la suppression des liens de l\'actu');
      }

      // Récupération de la réponse en JSON
      const data = await response.json();
      console.log('Liens associés à l\'actu supprimés avec succès', data);

    } catch (error) {
      console.error('Erreur de suppression des liens :', error);
      alert('Une erreur est survenue lors de la suppression des liens associés à l\'actu.');
  }
}

afficherActus();

console.log('fin');