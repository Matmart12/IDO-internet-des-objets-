<?php
// Vérifier si le paramètre query est présent dans l'URL
if (isset($_GET['search']) && !empty($_GET['search'])) {
    // Récupérer le mot recherché
    $mot_recherche = $_GET['search];

    // Rediriger vers la page recherche/mot_recherche
    header("Location: recherche/$mot_recherche");
    exit();
} else {
    // Si aucun mot de recherche n'est fourni, rediriger vers la page principale ou une autre page par défaut
    header("Location: T");
    exit();
}
?>
