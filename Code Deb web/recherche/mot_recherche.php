<?php
// Récupérer le mot recherché à partir de l'URL
$mot_recherche = basename($_SERVER['REQUEST_URI']);

// Vérifier si un mot a été trouvé
if (!empty($mot_recherche)) {
    // Afficher des résultats (ici, juste le mot recherché pour l'exemple)
    echo "<h1>Résultats pour : " . htmlspecialchars($mot_recherche) . "</h1>";

    // Tu peux ici ajouter ta logique de recherche, par exemple interroger une base de données
    // Afficher les résultats correspondants à ce mot
} else {
    echo "<h1>Aucun terme de recherche spécifié</h1>";
}
?>
