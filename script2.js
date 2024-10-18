document.addEventListener('DOMContentLoaded', function () {
    let forecastData = [];
    const entriesPerPage = 10;
    let currentPage = 1;
    let filteredData = []; 

    // Event listener for the Get Weather button 
    if (document.getElementById("getWeather")) {
        document.getElementById("getWeather").addEventListener("click", function () {
            const city = document.getElementById("cityInput").value;
            const apiKey = 'f26f02f97763d3afa77d426f8899dab4'; 
           
            if (city) {
                document.getElementById('city').innerText = `City: ${city}`;
                document.getElementById('city').style.display = 'block';

                // Clear the input fields
                document.getElementById("cityInput").value = '';
                fetchWeatherForecast(city, apiKey);
            } else {
                alert('Please enter a city for the forecast.');
            }
        });
    }

    // Function to fetch 5-day weather forecast data
    function fetchWeatherForecast(city, apiKey) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        fetch(weatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                forecastData = data.list;
                filteredData = forecastData; 
                displayForecastTable(); 
                setupPagination(); 
            })
            .catch(error => {
                alert('Error fetching forecast data: ' + error.message);
            });
    }

    // Event listener for filter dropdown
    document.getElementById('filterDropdown').addEventListener('change', function () {
        const filterValue = this.value;
        applyFilter(filterValue);
        displayForecastTable(); 
        setupPagination(); 
    });

    // Function to apply filter based on dropdown selection
    function applyFilter(filterValue) {
        switch (filterValue) {
            case 'asc':
                filteredData = [...forecastData].sort((a, b) => a.main.temp - b.main.temp);
                break;
            case 'desc':
                filteredData = [...forecastData].sort((a, b) => b.main.temp - a.main.temp);
                break;
                case 'rain':    
                filteredData = forecastData.filter(forecast => forecast.weather.some(w => w.description.includes('rain')));
                break;
                case 'noRain':
                filteredData = forecastData.filter(forecast => !forecast.weather.some(w => w.description.includes('rain')));
                break;
            case 'highest':
                filteredData = [forecastData.reduce((max, forecast) => forecast.main.temp > max.main.temp ? forecast : max)];
                break;
            default:
                filteredData = forecastData; 
                break;
        }
    }

    // Function to display the 5-day forecast in a table format
    function displayForecastTable() {
        const tableDiv = document.getElementById("forecastTable");
        tableDiv.innerHTML = ""; 

        // Create table and header
        const table = document.createElement('table');
        table.classList.add('forecast-table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Temperature (°C)</th>
                <th>Condition</th>
                <th>Humidity (%)</th>
                <th>Wind Speed (km/h)</th>
                <th>Precipitation (mm)</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const start = (currentPage - 1) * entriesPerPage;
        const end = Math.min(start + entriesPerPage, filteredData.length);

        // Populate table rows with forecast data
        for (let i = start; i < end; i++) {
            const forecast = filteredData[i];
            const dateObj = new Date(forecast.dt * 1000);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const temp = forecast.main.temp;
            const condition = forecast.weather[0].description;
            const humidity = forecast.main.humidity;
            const windSpeedKmh = (forecast.wind.speed * 3.6).toFixed(1);
            const precipitation = forecast.rain ? forecast.rain['3h'] || 0 : forecast.snow ? forecast.snow['3h'] || 0 : 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date}</td>
                <td>${time}</td>
                <td>${temp}</td>
                <td>${condition}</td>
                <td>${humidity}</td>
                <td>${windSpeedKmh}</td>
                <td>${precipitation}</td>
            `;
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        tableDiv.appendChild(table);
        document.getElementById("forecastTableSection").style.display = "block"; 
    }

    // Function to set up pagination
    function setupPagination() {
        const paginationDiv = document.getElementById("pagination");
        paginationDiv.innerHTML = "";

        const pageCount = Math.ceil(filteredData.length / entriesPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.setAttribute('data-page', i);
            button.classList.toggle('active', i === currentPage); 

            button.addEventListener('click', function () {
                currentPage = parseInt(this.getAttribute('data-page'));
                displayForecastTable();
                updateActivePage();
            });

            paginationDiv.appendChild(button);
        }
    }

    function updateActivePage() {
        const buttons = document.querySelectorAll('#pagination button');
        buttons.forEach(button => button.classList.remove('active'));

        const currentPageButton = document.querySelector(`#pagination button[data-page="${currentPage}"]`);
        if (currentPageButton) {
            currentPageButton.classList.add('active');
        }
    }


    // chatbot and weather queries 

    let geminiApiKey; 

    document.getElementById('askBot').addEventListener('click', function () {
        const userQuery = document.getElementById('userQuery').value;
        document.getElementById('query').innerText = userQuery;
        document.getElementById('query').style.display = 'block';
    
        // Check if the query is related to weather
        if (!isWeatherRelated(userQuery)) {
            if (geminiApiKey) {
                const apiPrompt = userQuery; 
                fetchGeminiResponse(geminiApiKey, apiPrompt);
            } 
            else {
                displayBotResponse('Please provide a Gemini API key for non-weather-related queries.');
            }
        } else {
            const city = extractCity(userQuery);
            fetchWeather(city);
        }
    });
    
    function fetchGeminiResponse(apiKey, apiPrompt) {
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: apiPrompt
                            }
                        ]
                    }
                ]
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.candidates && data.candidates.length > 0) {
                const geminiResponse = data.candidates[0].content.parts[0].text;
                displayBotResponse(geminiResponse); 
            } 
            else {
                displayBotResponse('No valid response from Gemini. Please try again.');
            }
        })
        .catch(error => {
            displayBotResponse('Error fetching from Gemini: ' + error.message);
        });
    }
    
    // if a query is weather-related
    function isWeatherRelated(query) {
        const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy', 'storm', 'snow'];
        return weatherKeywords.some(keyword => query.toLowerCase().includes(keyword));
    }
    
    // Extracts the city name from a weather-related query
    function extractCity(query) {
        const words = query.trim().split(' ');
        const city = words[words.length - 1].trim();
        return city || null;
    }
    
    
    // Fetches weather data from OpenWeather API
    function fetchWeather(city) {
        const apiKey = 'f26f02f97763d3afa77d426f8899dab4'; 
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    // Extract weather details
                    const temperature = data.main.temp;
                    const condition = data.weather[0].description;
                    const humidity = data.main.humidity;
                    const windSpeed = data.wind.speed;
                    const precipitation = data.rain ? data.rain['3h'] || 0 : data.snow ? data.snow['3h'] || 0 : 0;
    
                    // Create the weather description string
                    const weatherDescription = `
                        Weather in ${data.name}:
                        Condition: ${condition},
                        Temperature: ${temperature}°C,
                        Humidity: ${humidity}%,
                        Precipitation: ${precipitation} mm,
                        Wind Speed: ${windSpeed} m/s
                    `;

                    displayBotResponse(weatherDescription);
                } else {
                    displayBotResponse(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                displayBotResponse('Error fetching weather data: ' + error);
            });
    }
    
    
    // Displays the bot's response
    function displayBotResponse(response) {
        document.getElementById('botResponse').innerText = response;
        document.getElementById('botResponseContainer').style.display = 'block';
    }
    
    // Handles the form submission for the Gemini API key
    document.getElementById('apiKeyForm').addEventListener('submit', function(event) {
        event.preventDefault();
        geminiApiKey = document.getElementById('apiKey').value;
        displayBotResponse('Gemini API key updated successfully.');
    });
});   

