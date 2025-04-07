# IDO - internet des objets - Villes Intelligentes

Pour pouvoir lancer notre site, vous devez, dans un premier temps, télécharger node js puis faire les commandes: npm init , npm install express --save , npm install nodemailer , npm install sql2 , npm install express-session, npm istall dotenv.
Vous devez ensuite créer une base de donnée mysql. Pour ceci, saissiez la commande : mysql -u root -p et entrez votre mot de passe mysql, puis saisissez la commande CREATE DATABASE proj (dans notre cas, proj est le nom de la base de donnée).

Vous pouvez maintenant ouvrir le serveur pour le site avec la commande node sql.js.

Pour se connecter au site, veuillez utilisez l'addresse http://localhost:5000/pageacceuil.html
A partir de là, vous pouvez utiliser la barre de recherche au centre de la page d'accueil et lorsque vous cliquez sur les onglets du haut, vous serez directement redirigé sur la page de connexion où vous pourrez vous connecter si vous avez un compte ET que vous avez vérifié votre adresse mail.
Les pages de connexion et d'inscription sont liées l'une à l'autre pour pouvoir se connecter et s'inscrire plus facilement.

Lorsque vous vous inscrivez, un mail vous sera automatiquement envoyé pour vous rediriger vers la page de vérification de mail où vous pourrez choisir (pour le test) entre 3 abonnements: Simple, Maire et Admin.

Simple: Résident lambda d'une ville qui n'a aucun droit d'accès à la page de gestion des évènements.

Maire: Peut ajouter et supprimer des services et actualités de sa ville.

Admin: Peut ajouter et supprimer des services de n'importe quelle ville.

Chaque utilisateur peut aller sur son profil à partir de l'onglet "Mon espace" pour voir et modifier ses informations personnelles.

Les utilisateurs peuvent aussi aller voir les transports, les lieux d'intérêts et l'actualité de leur ville dans les onglets "transport", "lieux d'intérêts" et "évènements".

On vous remercie d'utiliser Tarsonis et prévoit d'ajouter de nouvelles fonctionnalités prochainement.

L'équipe de Tarsonis vous souhaite une bonne journée et à très bientôt.
