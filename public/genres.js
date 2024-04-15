document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        item.addEventListener('click', function() {
            const genre = this.querySelector('p').textContent.replace(/\s+/g, ''); 
            window.location.href = `/genreSongs?genre=${genre}`; 
        });
    });

    const searchInput = document.querySelector('.search input');
    const filterSelect = document.getElementById('filter');
    const searchIcon = document.querySelector('.search i.bx-search');

    const handleSearch = () => {
    const searchText = searchInput.value.trim().toLowerCase();
    const filterValue = filterSelect.value;

    search(filterValue, searchText);
    };

    searchIcon.addEventListener('click', handleSearch);

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
});

const search = async (filter, searchText) => {
    switch (filter) {
        case 'tracks':
            window.location.href = `/searchTracks?filter=${filter}&searchText=${searchText}`;
            break;
        case 'playlists':
            window.location.href = `/searchPlaylists?filter=${filter}&searchText=${searchText}`;
            break;
        case 'artists':
            window.location.href = `/searchArtists?filter=${filter}&searchText=${searchText}`;
            break;
        case 'albums':
            window.location.href = `/searchAlbums?filter=${filter}&searchText=${searchText}`;
            break;
        default:
            window.location.href = `/searchTracks?filter=${filter}&searchText=${searchText}`;
    }
};