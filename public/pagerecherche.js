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


document.addEventListener('DOMContentLoaded', function() {
    // Récupérer le terme de recherche depuis sessionStorage
    const searchTerm = sessionStorage.getItem('rechercheActu');
    
    if (searchTerm) {
        // Mettre à jour le titre de la page
        document.getElementById('search-title').textContent = 
            `Résultats pour "${searchTerm}"`;
        
        // Effectuer la recherche
        fetch(`http://localhost:5000/recherche-actu?terme=${encodeURIComponent(searchTerm)}`)
            .then(response => {
                if (!response.ok) throw new Error('Erreur réseau');
                return response.json();
            })
            .then(actualites => {
                const container = document.getElementById('results-container');
                
                if (actualites.length === 0) {
                    container.innerHTML = `
                        <div class="no-results">
                            Aucune actualité trouvée pour "${searchTerm}"
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = actualites.map(actu => `
                    <div class="result-item">
                        <h3>${actu.nom}</h3>
                        <p>${actu.descrip}</p>
                        <small>Date: ${new Date(actu.apparition).toLocaleDateString()}</small>
                    </div>
                `).join('');
            })
            .catch(error => {
                console.error('Erreur:', error);
                document.getElementById('results-container').innerHTML = `
                    <div class="no-results">
                        Une erreur est survenue lors de la recherche.
                    </div>
                `;
            });
    } else {
        document.getElementById('results-container').innerHTML = `
            <div class="no-results">
                Aucun terme de recherche spécifié.
            </div>
        `;
    }
});

// Fonction pour la recherche (à utiliser depuis pageacceuil.html)
function searchAndRedirect() {
    const query = document.getElementById('barre_recherche').value.trim();
    if (query) {
        sessionStorage.setItem('rechercheActu', query);
        window.location.href = 'pagerecherche.html';
    } else {
        alert('Veuillez entrer un terme de recherche.');
    }
}