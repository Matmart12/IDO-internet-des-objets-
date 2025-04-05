/* function rechercher() {
    const query = document.getElementById('barre_recherche').value.trim();
    if (query) {
        // Enregistrer la recherche dans le sessionStorage pour l'utiliser après redirection
        sessionStorage.setItem('rechercheActu', query);
        // Rediriger vers la page de recherche
        window.location.href = '/pagerecherche.html';
    } else {
        alert('Veuillez entrer un terme de recherche.');
    }
}       
*/





async function loadActualites() {
    try {
        const response = await fetch('http://localhost:5000/Recherche_Actu_temps');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des actualités');
        }
        const actualites = await response.json();
        
        const actualitesList = document.getElementById('actualites-list');
        
        // Limiter à 2 actualités
        const actualitesToShow = actualites.slice(0, 2);
        
        if (actualitesToShow.length === 0) {
            actualitesList.innerHTML = '<p>Aucune actualité disponible pour le moment.</p>';
            return;
        }
        
        actualitesList.innerHTML = actualitesToShow.map(actu => `
            <div class="actualite-card">
                <h3>${actu.nom}</h3>
                <p>${actu.descrip}</p>
                <small>Publié le: ${new Date(actu.apparition).toLocaleDateString()}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('actualites-list').innerHTML = 
            '<p>Impossible de charger les actualités. Veuillez réessayer plus tard.</p>';
    }
}

// Charger les actualités quand la page est prête
document.addEventListener('DOMContentLoaded', loadActualites);