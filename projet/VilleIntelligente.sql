use proj;

Create TABLE Ville(
id INT PRIMARY KEY AUTO_INCREMENT,
nom CHAR(40),
Pays CHAR(40),
département CHAR(40));

CREATE TABLE Residence(
id INT PRIMARY KEY AUTO_INCREMENT,
numero INT,
Rue CHAR(40),
idVille INT,
FOREIGN KEY fk_ville(idVille) REFERENCES Ville(id));

CREATE TABLE Resident(
id INT PRIMARY KEY AUTO_INCREMENT,
prenom CHAR(40),
nom CHAR(40),
mail CHAR(50),
mdp CHAR(20),
age INT,
abonnement CHAR(20));


CREATE TABLE Service(
id INT PRIMARY KEY AUTO_INCREMENT,
nom CHAR(40),
descrip CHAR(500),
idVille INT,
FOREIGN KEY fk_Ville(idVille) REFERENCES Ville(id));

CREATE TABLE Catégorie(
nom CHAR(40) PRIMARY KEY);

Create TABLE Lien(
idService INT,
nomCategorie CHAR(40),
FOREIGN KEY fk_service(idService) REFERENCES Service(id),
FOREIGN KEY fk_catégorie(nomCatégorie) REFERENCES Catégorie(nom));

CREATE TABLE Actu(
id INT PRIMARY KEY AUTO_INCREMENT, 
nom CHAR(40) PRIMARY KEY,
descrip CHAR(500),
apparition DATE,
idVille INT,
FOREIGN KEY fk_Ville(idVille) REFERENCES Ville(id)
);
-- Chercher un résident à partir d'un mail (pour vérification de connexion
SELECT rt.* 
FROM Résident rt
WHERE rt.mail = #var d'express js
;
#recherche de services par rapport à une catégorie
SELECT s.id, s.nom
FROM Service s, Lien l, catégorie c
WHERE s.id= l.idService
AND l.nomCatégorie= c.nom
AND c.nom= #var d'express js
;

#recherche de services par rapport au nom
SELECT s.id, s.nom, s.idVille
FROM Service s
WHERE s.nom= #var d'express js
;

#Les 5 actualités les plus récentes (page d'accueuil)
SELECT a.nom
FROM Actu a
ORDER BY a.apparition DESC
LIMIT 5;

#Les 5 actualités les plus récentes d'une ville choisie
SELECT a.nom
FROM Actu a, Ville v
WHERE	a.idVille= v.id #à remplacer par une var d'express js
ORDER BY a.apparition DESC
LIMIT 5;

UPDATE Résident
SET abonnement="Simple"
WHERE id=1; -- à changer par var

UPDATE Résident
SET abonnement="Complexe"
WHERE id=1; -- à changer par var

UPDATE Résident
SET abonnement="Admin"
WHERE id=1; -- à changer par var

UPDATE Résident
SET prénom= "Jack" -- à changer par var
WHERE id=1; -- à changer par var

UPDATE Résident
SET nom= "Jack" -- à changer par var
WHERE id=1; -- à changer par var

UPDATE Résident
SET mail= "jack@gmail.com" -- à changer par var
WHERE id=1; -- à changer par var

UPDATE Résident
SET mdp= "1234" -- à changer par var
WHERE id=1; -- à changer par var

UPDATE Service
SET nom= "RER" -- à changer par var
WHERE id=1; -- à changer par var

UPDATE Service
SET descrip= "voila la description" -- à changer par var
WHERE id=1; -- à changer par var