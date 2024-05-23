document.addEventListener('DOMContentLoaded', () => {
    const loadingElement = document.getElementById('loading');
    const trendingContainer = document.getElementById('stations-trending');
    const allContainer = document.getElementById('stations-all');
    const navTrending = document.getElementById('nav-trending');
    const navAll = document.getElementById('nav-all');

    async function get_radiobrowser_base_urls() {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open('GET', 'http://all.api.radio-browser.info/json/servers', true);
            request.onload = function() {
                if (request.status >= 200 && request.status < 300) {
                    var items = JSON.parse(request.responseText).map(x => "https://" + x.name);
                    resolve(items);
                } else {
                    reject(request.statusText);
                }
            };
            request.onerror = function() {
                reject("Network Error");
            };
            request.send();
        });
    }

    async function get_radiobrowser_base_url_random() {
        try {
            const hosts = await get_radiobrowser_base_urls();
            return hosts[Math.floor(Math.random() * hosts.length)];
        } catch (error) {
            console.error('Error fetching server list:', error);
            return 'https://de1.api.radio-browser.info'; 
        }
    }

    async function fetchStations() {
        try {
            const baseUrl = await get_radiobrowser_base_url_random();
            const response = await fetch(`${baseUrl}/json/stations/search?countrycode=US`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const stations = await response.json();
            categorizeAndDisplayStations(stations);
        } catch (error) {
            displayError(error.message);
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    function categorizeAndDisplayStations(stations) {
        const trendingStations = stations
            .filter(station => station.votes > 100)
            .slice(1, 15); 
        const allStations = stations;

        displayStations(trendingContainer, trendingStations);
        displayStations(allContainer, allStations);
    }

    function displayStations(container, stations) {
        container.innerHTML = '';

        stations.forEach(station => {
            const stationElement = document.createElement('div');
            stationElement.className = 'station';
            stationElement.innerHTML = `
                <h2>${station.name}</h2>
                <p>${station.country}</p>
                <audio controls>
                    <source src="${station.url_resolved}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            `;
            container.appendChild(stationElement);
        });
    }

    function displayError(message) {
        trendingContainer.innerHTML = `<p>Error: ${message}</p>`;
        allContainer.innerHTML = `<p>Error: ${message}</p>`;
    }

    function showCategory(category) {
        trendingContainer.style.display = 'none';
        allContainer.style.display = 'none';

        if (category === 'trending') {
            trendingContainer.style.display = 'block';
        } else if (category === 'all') {
            allContainer.style.display = 'block';
        }
    }

    navTrending.addEventListener('click', (event) => {
        event.preventDefault();
        showCategory('trending');
    });

    navAll.addEventListener('click', (event) => {
        event.preventDefault();
        showCategory('all');
    });

    fetchStations();
    showCategory('trending'); //default view 
});
