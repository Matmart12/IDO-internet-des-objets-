<?php
if (isset($_GET['search']) && !empty($_GET['search'])) {
    $mot_recherche = $_GET['search];

    // Rediriger vers la page recherche/mot_recherche
    header("Location: recherche/$mot_recherche");
    exit();
} else {
    header("Location: TEST.html");
    exit();
}
?>
