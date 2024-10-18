document.addEventListener('DOMContentLoaded', function () {
    
    // Event listener for the Get Weather button
    if (document.getElementById("getWeather")) {
        document.getElementById("getWeather").addEventListener("click", function () {
            const city = document.getElementById("cityInput").value;
            const apiKey = 'f26f02f97763d3afa77d426f8899dab4';

            if (city) {
                document.getElementById("cityInput").value = '';
                fetchCurrentWeather(city, apiKey);
                fetchWeatherForecast(city, apiKey); 
            } else {
                alert('Please enter a city name.');
            }
        });
    }

    // Function to fetch current weather data
    function fetchCurrentWeather(city, apiKey) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(weatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok -> ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data);
            })
            .catch(error => {
                alert('Error fetching current weather data: ' + error.message);
            });
    }


    // Function to display current weather data on the page
    function displayWeather(data) {
        const weatherDiv = document.getElementById("currentWeather");

        const { name, main: { temp, humidity }, wind: { speed }, weather: [details] } = data;

        let currentTemp = temp; 
        const iconUrl = `https://openweathermap.org/img/wn/${details.icon}@2x.png`;

        weatherDiv.innerHTML = `
        <h2>Weather in ${name}</h2>
            <p>Temperature: <span id="temperatureDisplay">${temp} °C</span></p>
            <p>Condition: ${details.description}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${speed} m/s</p>
            <img src="${iconUrl}" alt="${details.description}" style="width: 100px; height: auto;">
        `;

        // Prepare the temperature toggle display
        const temperatureToggle = document.getElementById("temperatureToggle");
        temperatureToggle.style.display = "flex"; 
    
        const tempToggle = document.getElementById("tempToggle");
        tempToggle.addEventListener("change", function () {
            const temperatureDisplay = document.getElementById("temperatureDisplay");
            if (tempToggle.checked) {
                // If checked, convert to Fahrenheit
                const tempF = (currentTemp * 9 / 5) + 32; 
                temperatureDisplay.textContent = `${tempF.toFixed(1)} °F`;
            } else {
                // If unchecked, display Celsius
                temperatureDisplay.textContent = `${currentTemp} °C`;
            }
        });

        // Show the charts section
        document.getElementById("charts").style.display = "block";
        updateWeatherBackground(details.main);
    }

    // Function to fetch 5-day weather forecast data and display charts
    function fetchWeatherForecast(city, apiKey) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        fetch(forecastUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                
                    displayCharts(data); // Call the function from charts.js
            })
            .catch(error => {
                alert('Error fetching forecast data: ' + error.message);
            });
    }


    // Function to update the weather widget background based on the weather condition
    function updateWeatherBackground(condition) {
        const widget = document.getElementById("weather-widget");
        widget.className = ""; 

        switch (condition.toLowerCase()) {
            case 'clear':
                widget.classList.add('clear');
                break;
            case 'clouds':
                widget.classList.add('clouds');
                break;
            case 'drizzle':
                widget.classList.add('drizzle');
                break;
            case 'rain':
                widget.classList.add('rain');
                break;
            case 'snow':
                widget.classList.add('snow');
                break;
            case 'thunderstorm':
                widget.classList.add('thunderstorm');
                break;
            case 'mist':
                widget.classList.add('mist');
                break;
            case 'fog':
                widget.classList.add('fog');
                break;
            case 'haze':
                widget.classList.add('haze');
                break;
            case 'smoke':
            widget.classList.add('smoke');
            break;
            default:
                widget.className = ""; 
        }
    }
});
