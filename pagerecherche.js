document.addEventListener('DOMContentLoaded', function() {
    const searchTerm = sessionStorage.getItem('rechercheActu');
    const resultsContainer = document.getElementById('results-container');
    const searchButton = document.getElementById('search-button');
    const contentTypeSelect = document.getElementById('content-type');
    
    if (searchTerm) {
        document.getElementById('search-title').textContent = `Résultats pour "${searchTerm}"`;
        performSearch(searchTerm, 'all');
        
        // Configurer le bouton de recherche
        searchButton.addEventListener('click', () => {
            const selectedType = contentTypeSelect.value;
            performSearch(searchTerm, selectedType);
        });
    } else {
        resultsContainer.innerHTML = '<div class="no-results">Aucun terme de recherche spécifié.</div>';
    }
});

function performSearch(term, type) {
    const container = document.getElementById('results-container');
    container.innerHTML = '<div class="loading">Recherche en cours...</div>';

    // D'abord récupérer tous les résultats
    fetch(`http://localhost:5000/recherche-global?nom=${encodeURIComponent(term)}`)
        .then(response => {
            if (!response.ok) throw new Error('Erreur réseau');
            return response.json();
        })
        .then(results => {
            if (!results || results.length === 0) {
                container.innerHTML = `<div class="no-results">Aucun résultat trouvé pour "${term}"</div>`;
                return;
            }

            // Filtrer selon le type sélectionné
            const filteredResults = results.filter(item => {
                if (type === 'all') return true;
                
                const itemType = item.type || (item.apparition ? 'actu' : 'service');
                return itemType === type;
            });

            if (filteredResults.length === 0) {
                container.innerHTML = `<div class="no-results">Aucun ${type} trouvé pour "${term}"</div>`;
                return;
            }

            // Afficher les résultats filtrés
            container.innerHTML = filteredResults.map(item => {
                const itemType = item.type || (item.apparition ? 'actu' : 'service');
                
                return `
                    <div class="result-item ${itemType}">
                        <h3>${item.nom}</h3>
                        <p>${item.descrip || 'Pas de description disponible'}</p>
                        ${itemType === 'actu' 
                            ? `<small>Date: ${new Date(item.apparition).toLocaleDateString()}</small>`
                            : `<small>Service</small>`}
                    </div>
                `;
            }).join('');
        })
        .catch(error => {
            console.error('Erreur:', error);
            container.innerHTML = '<div class="no-results">Une erreur est survenue lors de la recherche.</div>';
        });
}