
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

  document.addEventListener('DOMContentLoaded', async function () {
    const sess = await session();
    if (sess <= 0) {
      window.location.href = "connexion.html"
    }
    console.log("L'id de la session:", sess)
  });

// initialisation informaions profil
const profilData = {
    id: 0,
    prenom: 'vide',
    nom: 'vide',
    email: 'vide@vide.fr',
    mdp: 'vide',
    age: 'vide',
    abo: "gratuit", // Utilisez 'abo' pour correspondre à votre route
    numrue: 1,
    rue: 'vide',
    ville: 'vide',
    adressephoto: 'vide',
    genre: 'vide',
    departement: 'vide',
    idResidence: 1,
    idVille: 1
};
const profilSave = JSON.parse(JSON.stringify(profilData));

// recupérer l'id de l'utilisateur
const idUser = 4;

// initialisatiobn grâce au mail donné en param de intialisationDataResident()
/* /!\ Ajout de 2 fonction dans le fichier sql.js 
(pour intialisationDataResidence et pourintialisationDataVille) */
async function intialisationDataResident(idUser) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Resident_id?id=${encodeURI(idUser)}`);

        if (!response.ok) {
            throw new Error(`Erreur de réseau: ${response.status}`);
        }

        const data = await response.json();
        //id, prenom, nom, mail, mdp, age, abonnement, idResidence, adressephoto

        // Vérification si la réponse contient des données
        if (data.length > 0) {
            profilData.id = data[0].id;
            profilData.adressephoto = data[0].adressephoto;
            profilData.nom = data[0].nom;
            profilData.prenom = data[0].prenom;
            profilData.email = data[0].mail;
            profilData.mdp = data[0].mdp;
            profilData.age = data[0].age;
            profilData.abo = data[0].abonnement;
            profilData.genre = data[0].genre;
            profilData.idResidence = data[0].idResidence;

            profilSave.id = data[0].id;
            profilSave.adressephoto = data[0].adressephoto;
            profilSave.nom = data[0].nom;
            profilSave.prenom = data[0].prenom;
            profilSave.email = data[0].mail;
            profilSave.mdp = data[0].mdp;
            profilSave.age = data[0].age;
            profilSave.abo = data[0].abonnement;
            profilSave.genre = data[0].genre;
            profilSave.idResidence = data[0].idResidence;
            intialisationDataResidence(profilData.idResidence);
        } else {
            console.log("Aucune donnée trouvée pour cet email.");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation des données : ", error);
    }
}
async function intialisationDataResidence(idResidence) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Residence_id?id=${encodeURI(idResidence)}`);

        if (!response.ok) {
            throw new Error(`Erreur de réseau: ${response.status}`);
        }

        const data = await response.json();

        // Vérification si la réponse contient des données
        if (data.length > 0) {
            profilData.numrue = data[0].numero;
            profilData.rue = data[0].rue;
            profilData.idVille = data[0].idVille;

            profilSave.numrue = data[0].numero;
            profilSave.rue = data[0].rue;
            profilSave.idVille = data[0].idVille;
            intialisationDataVille(profilData.idVille);
        } else {
            console.log("Aucune donnée trouvée pour cet email.");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation des données : ", error);
    }
}
async function intialisationDataVille(idVille) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Ville_id?id=${encodeURI(idVille)}`);

        if (!response.ok) {
            throw new Error(`Erreur de réseau: ${response.status}`);
        }

        const data = await response.json();

        // Vérification si la réponse contient des données
        if (data.length > 0) {
            profilData.ville = data[0].nom;
            profilData.departement = data[0].departement;

            profilSave.ville = data[0].nom;
            profilSave.departement = data[0].departement;
            afficherInfo();
        } else {
            console.log("Aucune donnée trouvée pour cet email.");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation des données : ", error);
    }
}

// gestion de la modif des elems
async function modifierElement(type) {
    console.log("modification");

    if (type == 'mail') {
        const new_mail = document.getElementById("email").value;

        // Vérifier si le mail existe déjà

        if (new_mail !== profilData.email) {
            const checkResponse = await fetch(`http://localhost:5000/Recherche_Resident_mail?mail=${encodeURI(new_mail)}`);
            const checkData = await checkResponse.json();
            console.log('fetched');
            if (checkData.length > 0) {
                alert("Un compte avec cet email existe déjà");
            } else {
                profilData.email = new_mail;
            }
        }
    }
    if (type == 'mdp') {
        const new_mdp = document.getElementById("password1").value;
        const new_mdp2 = document.getElementById("password2").value;
        if (new_mdp !== new_mdp2) {
            alert("Les deux mots de passe sont différents.");
        }
        profilData.mdp = new_mdp;
    }
    if (type == 'photo') {
        const new_fileInput = document.getElementById("photo"); // Correction de l'ID
        const new_adressephoto = "./photo/" + mail.replace(/[@.]/g, '_') + ".png";
        // Uploader la photo si elle existe
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0], mail.replace(/[@.]/g, '_') + '.png');
            try {
                await fetch('/photo', {
                    method: 'POST',
                    body: formData
                });
            } catch (error) {
                console.error('Erreur upload photo:', error);
                // On continue même si l'upload de photo échoue
            }
        }
        profilData.adressephoto = new_adressephoto;
    }
    if (type == 'prenom') {
        profilData.prenom = document.getElementById("prenom").value;
    }
    if (type == 'nom') {
        profilData.nom = document.getElementById("nom").value;
    }
    if (type == 'age') {
        profilData.age = document.getElementById("age").value;
    }
    if (type == 'genre') {
        profilData.genre = document.querySelector('input[name="genre"]:checked').value;

    }
    if (type == 'rue') {
        profilData.rue = document.getElementById("rue").value;
    }
    if (type == 'numrue') {
        profilData.numrue = document.getElementById("numrue").value;
    }
    if (type == 'ville') {
        profilData.ville = document.getElementById("ville").value;
    }
    if (type == 'departement') {
        profilData.departement = document.getElementById("departement").value;
    }

    afficherInfo();
}

// recupérer les id
async function recupidVille(nom, departement) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Ville_nom_departement?nom=${encodeURIComponent(nom)}&departement=${encodeURIComponent(departement)}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucune ville trouvée.');
            return -1;
        }

        const villeId = data[0].id; // Récupération du premier ID
        console.log('ID de la ville :', villeId);
        return villeId;

    } catch (error) {
        console.error('Erreur:', error);
        return -1;
    }
}
async function recupidResidence(idVille, rue, numrue) {
    try {
        const response = await fetch(`http://localhost:5000/Recherche_Residence_ville_num_rue?num=${numrue}&idv=${idVille}&rue=${encodeURIComponent(rue)}`);
        const data = await response.json();

        if (data.length === 0) {
            console.log('Aucune résidence trouvée.');
            return -1;
        }

        const residenceId = data[0].id; // Récupération du premier ID
        console.log('ID de la résidence:', residenceId);
        return residenceId;
    } catch (error) {
        console.error('Erreur:', error);
        return -1;
    }
}

//gestion de l'affichage, communication avec le fichier html
const tableInfo = document.getElementById("informations"); // Élément HTML pour afficher les infos
function afficherInfo() {
    tableInfo.innerHTML = "";//reset pour empêcher les doublons
    // affichage des informations : 
    afficherMail();
    afficherMdP();
    afficherNom();
    afficherPrenom();
    afficherGenre();
    afficherAge();
    afficherPhoto();
    afficherNumRue();
    afficherRue();
    afficherVille();
    afficherDepart();
    afficherAbonnement();
}
function afficherAbonnement() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Statut/ Abonnement :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.abo}`;
    tr.appendChild(td2);
    /*
    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="mail"} " placeholder="nouveau email" type="mail" name="mail" >`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('mail')">Modifier</button>`;
    tr.appendChild(td4);
    */
    tableInfo.appendChild(tr);
}
function afficherMail() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Email :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.email}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="email"} " placeholder="nouveau email" type="mail" name="mail" >`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('mail')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherMdP() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Mot de passe :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `<input id="password1" placeholder="nouveau mot de passe" type="password" name="password"></button>`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="password2" placeholder="validation du mot de passe" type="password" name="password"></button>`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('mdp')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherNom() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Nom :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.nom}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="nom"} " placeholder="nouveau nom" type="nom" name="nom" >`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('nom')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherPrenom() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Prénom :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.prenom}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="prenom"} " placeholder="nouveau prénom" type="prenom" name="prenom" >`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('prenom')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherGenre() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Genre :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.genre}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `
                    <input type="radio" id="genre" name="genre" value="Homme" class="pointer" ><span
                        class="pointer" onclick="Checked('Homme')">Homme</span>
                    <input type="radio" id="genre" name="genre" value="Femme" class="pointer" ><span
                        class="pointer" onclick="Checked('Femme')">Femme</span>
                    <input type="radio" id="genre" name="genre" value="Autre" class="pointer" ><span
                        class="pointer" onclick="Checked('Autre')">Autre</span>`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('genre')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherAge() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Âge :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.age}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="age" placeholder="nouvel âge" type="number" min="13" max="110" name="age">`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('age')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherVille() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Ville :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.ville}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="ville" placeholder="nouvelle ville" name="ville" >`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('ville')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherDepart() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Département :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.departement}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="departement" placeholder="nouveau département" name="departement" >`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('departement')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherRue() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Rue :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.rue}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="rue" placeholder="nouvelle rue" name="rue" >`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('rue')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherNumRue() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Numéro de la rue :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.numrue}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="numrue" placeholder="nouveau numéro de rue" type="number" min="1" name="numéro de rue" >`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('numrue')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}
function afficherPhoto() {
    const tr = document.createElement("tr");

    tr.innerHTML = "";
    const td1 = document.createElement("td");
    td1.innerHTML = `Photo de profil :`;
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.innerHTML = `${profilData.adressephoto}`;
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.innerHTML = `<input id="photo" type="file" accept=".png" name="photo">`;
    tr.appendChild(td3);

    const td4 = document.createElement("td");
    td4.innerHTML = `<button id="modification" type="button" onclick="modifierElement('photo')">Modifier</button>`;
    tr.appendChild(td4);

    tableInfo.appendChild(tr);
}

// fonction de suppression (button)
async function Supp() {
    const conf = confirm("Êtes-vous sûr de vouloir supprimer votre compte ?");
    const id = idUser;
    if (conf) {
        try {

            // Envoie de la requête DELETE pour supprimer le compte
            const response = await fetch(`http://localhost:5000/sup_Resident_id/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Vérification de la réponse
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du compte');
            }

            const data = await response.json();

            console.log('Compte supprimé avec succès', data);
            alert('Votre compte a été supprimé avec succès.');

            // Redirection ou autre action après suppression
            window.location.href = "accueuil.html"; // Exemple : rediriger vers la page d'accueil après suppression


        } catch (error) {
            console.error('Erreur de suppression :', error);
            alert('Une erreur est survenue lors de la suppression de votre compte.');
        }
    }
}

//Focntions des sauvegarde
// Se lance lorsque le button sauvegarder les changements est cliqué
async function Sauv() {
    if (profilData.nom != profilSave.nom) {
        await sauverNom(profilData.nom);
        profilSave.nom = profilData.nom;
    }
    if (profilData.prenom != profilSave.prenom) {
        await sauverPrenom(profilData.prenom);
        profilSave.prenom = profilData.prenom;
    }
    if (profilData.email != profilSave.email) {
        await sauverMail(profilData.email);
        profilSave.email = profilData.email;
    }
    if (profilData.mdp != profilSave.mdp) {
        await sauverMdP(profilData.mdp);
        profilSave.mdp = profilData.mdp;
    }
    if (profilData.genre != profilSave.genre) {
        await sauverGenre(profilData.genre);
        profilSave.genre = profilData.genre;
    }
    if (profilData.age != profilSave.age) {
        await sauverAge(profilData.age);
        profilSave.age = profilData.age;
    }
    if (profilData.adressephoto != profilSave.adressephoto) {
        await sauverPhoto(profilData.adressephoto);
        profilSave.adressephoto = profilData.adressephoto;
    }
    if (profilData.abo != profilSave.abo) {
        await sauverAbonnement(profilData.abo);
        profilSave.abo = profilData.abo;
    }
    await sauverAutres();

    alert("Vos modifications ont bien été sauvegardées.");
    afficherInfo();
};

async function sauverAutres() { // Vérifier si différent (si oui modifier)
    //  - dans Ville; ville et département => nouvel idVille
    console.log('debut Ville');
    let newIdVille = await recupidVille(profilData.ville, profilData.departement);

    if (newIdVille !== profilSave.idVille) {
        if (newIdVille == -1) {
            try {
                // Créer la ville et récupérer l'ID
                const response = await fetch('http://localhost:5000/Creer_Ville', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nom: profilData.ville, département: profilData.departement })
                });
                const data = await response.text();
                console.log(data); // Affiche le message de succès ou d'erreur

                // Récupérer à nouveau l'ID de la ville
                newIdVille = await recupidVille(profilData.ville, profilData.departement);
            } catch (error) {
                console.error('Erreur lors de la création de la ville:', error);
                return; // Arrêter la fonction en cas d'erreur
            }
        }
        profilSave.ville = profilData.ville;
        profilSave.departement = profilData.departement;
        profilData.idVille = newIdVille;
    }

    console.log('Fin Ville');
    console.log('Dedut Residence');

    //  - dans Residence, num et rue (+idVille)=> nouvel idResidence
    let newIdResidence = await recupidResidence(newIdVille, profilData.rue, profilData.numrue);

    if (newIdResidence !== profilSave.idResidence) {
        if (newIdResidence == -1) {
            try {
                // Créer la résidence et récupérer l'ID
                const response = await fetch('http://localhost:5000/Creer_Residence', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        numero: profilData.numrue,
                        rue: profilData.rue,
                        idVille: newIdVille
                    })
                });
                const data = await response.text();
                console.log(data); // Affiche le message de succès ou d'erreur

                // Récupérer à nouveau l'ID de la résidence
                newIdResidence = await recupidResidence(newIdVille, profilData.rue, profilData.numrue);
            
            } catch (error) {
                console.error('Erreur lors de la création de la résidence:', error);
                return; // Arrêter la fonction en cas d'erreur
            }
        }
        profilSave.idVille = newIdVille;
        profilSave.numrue = profilData.numrue;
        profilSave.rue = profilData.rue;
        profilData.idResidence = newIdVille;
    }

    console.log('Fin Residence');

    //
    profilSave.idResidence = newIdResidence;
    sauverIdRes(profilSave.idResidence);
};

// modification des donneées direct dans Resident
async function sauverIdRes(idRes) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_idResidence/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idRes })
        });

        if (response.ok) {
            console.log('Le idResidence a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du idResidence:', error);
    }
};
async function sauverNom(nom) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_nom/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nom })
        });

        if (response.ok) {
            console.log('Le nom a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du nom:', error);
    }
};
async function sauverPrenom(prenom) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_prenom/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prenom })
        });

        if (response.ok) {
            console.log('Le prenom a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du prenom:', error);
    }
};
async function sauverMail(email) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_mail/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            console.log('Le mail a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du mail:', error);
    }
};
async function sauverMdP(mdp) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_mdp/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mdp })
        });

        if (response.ok) {
            console.log('Le mdp a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du mdp:', error);
    }
};
async function sauverGenre(genre) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_genre/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ genre })
        });

        if (response.ok) {
            console.log('Le genre a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du genre:', error);
    }
};
async function sauverAge(age) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_age/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ age })
        });

        if (response.ok) {
            console.log('L\'age a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de age:', error);
    }
};
async function sauverPhoto(adressephoto) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_adressephoto/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adressephoto })
        });

        if (response.ok) {
            console.log('Le adressephoto a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du adressephoto:', error);
    }
};
async function sauverAbonnement(abo) {
    try {
        const response = await fetch(`http://localhost:5000/modif_Resident_abonnement/${profilSave.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ abo })
        });

        if (response.ok) {
            console.log('Le abo a été modifié avec succès');
        } else {
            const data = await response.text();
            console.error('Erreur:', data);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du abo:', error);
    }
};

intialisationDataResident(idUser);
console.log('test2', profilData);
console.log('test3', profilSave);

afficherInfo();

console.log("fin");