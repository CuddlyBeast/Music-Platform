document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const genre = params.get('genre');
    document.getElementById('genre-header').textContent = genre; 

    const artistIds = getArtistIds(genre);
    
    fetchRandomSongs(artistIds).then(songs => {
        songs.forEach((song, index) => {
            const item = document.createElement('div');
            item.classList.add('item');

            const info = document.createElement('div');
            info.classList.add('info');

            const trackNumber = document.createElement('p');
            trackNumber.textContent = (index + 1).toString().padStart(2, '0');

            const img = document.createElement('img');
            img.src = song.albumImageUrl;

            const details = document.createElement('div');
            details.classList.add('details');

            const title = document.createElement('h5');
            title.textContent = song.title;

            const artist = document.createElement('p');
            artist.textContent = song.artist;

            details.appendChild(title);
            details.appendChild(artist);

            info.appendChild(trackNumber);
            info.appendChild(img);
            info.appendChild(details);

            const actions = document.createElement('div');
            actions.classList.add('actions');

            const duration = document.createElement('p');
            duration.textContent = song.duration;

            const icon = document.createElement('div');
            icon.classList.add('icon');
            icon.innerHTML = '<i class="bx bxs-heart"></i>';

            const likeButton = icon.querySelector('.bx.bxs-heart')
    
            likeButton.addEventListener('click', async () => {
                const response = await fetch(`http://localhost:3000/chill/save-track/${song.id}`, {
                    method: 'PUT'
                });
                if (!response.ok) {
                    throw new Error('Failed to follow country track on Spotify');
                } 
                likeButton.style.color = 'rgb(230, 3, 199)';     
            })

            const plusIcon = document.createElement('i');
            plusIcon.classList.add('bx', 'bxs-plus-square');

            plusIcon.addEventListener('click', async (event) => {
                const token = localStorage.getItem('token');
                const playlistsResponse = await fetch('http://localhost:3000/chill/playlists', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!playlistsResponse.ok) {
                    throw new Error('Failed to fetch user playlists');
                }

                const playlistsData = await playlistsResponse.json();
                const playlistContainer = populateOverlayMenu(playlistsData);
                displayOverlayMenu(event, song.id, playlistContainer);
            });

            actions.appendChild(duration);
            actions.appendChild(icon);
            actions.appendChild(plusIcon);

            item.appendChild(info);
            item.appendChild(actions);

            document.querySelector('.items').appendChild(item);
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

function getArtistIds(genre) {
    switch (genre) {
        case 'AlternativeCountry':
            return ['2QoU3awHVdcHS8LrZEKvSM', '188gwh9RnRT58ZQPwqwHE3', '2Plkkomsc4DKawkCioLKjc', '2UDplVRprMbazU74Hq8OLl', '2qc41rNTtdLK0tV3mJn2Pm']; 
        case 'CountryRock':
            return ['0ECwFtbIWEVNwjlrfc6xoL', '5q8HGNo0BjLWaTAhRtbwxa', '1PCZpxHJz7WAMF8EEq8bfc', '6yJCxee7QumYr820xdIsjo', '3eskO5m0H4yiF64vRySBjr' ]; 
        case 'HonkyTonk':
            return ['1FClsNYBUoNFtGgzeG74dW', '1FE0rls8gfQT3laAeRYNgl', '7gS1Yv0RynyzKX5ICtKIhS', '4fxdqujwhb2NIQyr7qnnPX', '5sAg1HZePcFfhrs0G8A8OP' ]; 
        case 'AustralianCountry':
            return ['25rD775DJJ1JuBZfYYPxKK', '1hB4sZ49ocIuwxPEBIV35m', '4BoRxUdrcgbbq1rxJvvhg9', '42XeVHEwXlejTSpz3lU0Ia', '0u2FHSq3ln94y5Q57xazwf' ]; 
        case 'CountryFolk':
            return ['1KA3WXYMPLxomNuoE22LYd', '1PCZpxHJz7WAMF8EEq8bfc', '6kACVPfCOnqzgfEF5ryl0x', '2ErsJAz6qJ5cqjoVAvfvaC', '6J7rw7NELJUCThPbAfyLIE' ]; 
        case 'NeotraditionalCountry':
            return ['4mxWe1mtYIYfP040G38yvS', '5vngPClqofybhPERIqQMYd', '6SFUC6ORDCIBqPssCBpeHT', '4Ud7lY9V8pOyydumajSW3O', '1pTuR132U5b4Rizal2Pr7m' ]; 
        case 'WesternSwing':
            return ['2KIjlYyCUDt5JHyDgcCW1S', '3YeRGjR8sa1PHjTUMjqsQg', '3x5n0tpSTNWSkIjJUMK6ir', '5kZSgHUk9OyGo7G6uPNLuN', '42tDjhK9kdS7CCHxs8ysz0' ]; 
        case 'BroCountry':
            return ['3b8QkneNDz4JHKKKlLgYZg', '0BvkDsjIUla7X0k6CSWh1I', '3FfvYsEGaIb52QPXhg4DcH', '4oUHIQIBe0LHzYfvXNW4QM', '6pBNfggcZZDCmb0p92OnGn' ]; 
        case 'OutlawCountry':
            return ['7wCjDgV6nqBsHguQXPAaIM', '5W5bDNCqJ1jbCgTxDD0Cb3', '6kACVPfCOnqzgfEF5ryl0x', '2UBTfUoLI07iRqGeUrwhZh', '2ptmyXoL7poH6Zq62h1QT9' ]; 
        case 'TexasCountry':
            return ['3OftZbLfcqulxWNZMX8zLI', '1jjpkAHC8bd9fRFfgKyYLP', '04DUpHOyQqwbHFyvIhcGi3', '7HNEfHmDlFofG6YnMt8G7N', '0XRBwgqB24RnxXi7BFYNxC' ]; 
        case 'ChristianCountry':
            return ['75JvBeqW4BJ4xgnbMAq6MN', '7DhP3bGT7dzr1dCkkH5mTS', '7vCtweS8UVAXTyau2j0rDT', '0Sk6yoUQnccty5iMhVhz9D', '4xFUf1FHVy696Q1JQZMTRj' ]; 
        case 'CowboyCountry':
            return ['2bA6fzP0lMAQ4kz6CF61w8', '3xYXYzm9H3RzyQgBrYwIcx', '7HjGPPtdNuHcK8crc7iNkn', '4K3DSWzghkGUcQOEZG9gpo', '6roFdX1y5BYSbp60OTJWMd' ]; 
        case 'Bluegrass':
            return ['5J6L7N6B4nI1M5cwa29mQG', '0OTnx2X2FDXeewcm72lavT', '1ReHC2jB2DGoPbMYhzuFuO', '3bLSAQPeix7Xm2e5Gtn48R', '3bcLBxvaI7GsBzGp3WHnwQ']; 
        case 'Americana':
            return ['3AhsxbcW6Bscf7xIPK02YK', '3oyKiCGdvt3HRj3pCOLCfM', '3Q8wgwyVVv0z4UEh1HB0KY', '70kkdajctXSbqSMJbQO424', '1EI0NtLHoh9KBziYCeN1vM' ]; 
        case 'CountryPop':
            return ['4xFUf1FHVy696Q1JQZMTRj', '06HL4z0CvFAxyc27GXpf02', '6WY7D3jk8zTrHtmkqqo5GI', '5e4Dhzv426EvQe3aDb64jL', '32vWCbZh0xZ4o9gkz4PsEU' ]; 
        case 'CountrySoul':
            return ['2gqMBdyddvN82dzZt4ZF14', '4nts0oxMT67lVUoi5Kjxrb', '5HRSYURV6LFFRCjAtiK0py', '0j4pxInmdtF4bYQj0VVpbz', '1eYhYunlNJlDoQhtYBvPsi' ]; 
        case 'CountryRap':
            return ['23OFz99wX0NDBBwrxthLWU', '0OpWIlokQeE7BNQMhuu2Nx', '4GhUchfx0YFPsDaXZRJp8v', '2pSObt5Fk8izuX8ZfI3jRn', '4fZ8AuVP6Y8mLmCoybfKpC' ]; 
        case 'BluesCountry':
            return ['4YLtscXsxbVgi031ovDDdh', '7mPFWoDGjh7ArW1yr79EX8', '7aExFIr0IHWO5aFjMrGwKw', '7lfl96v1nJCpVeAmr6lgJD', '1Zngx1vu4ARlsOn5MwvOVo' ]; 
        default:
            return []; 
    }
}

const fetchRandomSongs = async (artistIds) => {
    try {
        const response = await fetch('http://localhost:3000/chill/genre-songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artistIds })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch random songs');
        }

        const data = await response.json();
        return data.songs;
    } catch (error) {
        console.error('Error fetching random songs:', error);
        return [];
    }
};

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