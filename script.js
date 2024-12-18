const apiKey = "6002cdee5fc55ef40b5203f466b55b58"; 
const weatherInfoDiv = document.getElementById("weather-info");
const weeklyForecastTable = document.querySelector("#forecast-table tbody");
const countrySelect = document.getElementById("country-select");

// Predefined cities
const predefinedCities = ["New York", "London", "Tokyo", "Colombo", "Dubai"];

// Add predefined cities to the dropdown when a button is clicked
document.querySelectorAll(".city-btn").forEach(button => {
    button.addEventListener("click", () => {
        const city = button.dataset.city;
        if (![...countrySelect.options].some(option => option.value === city)) {
            const newOption = document.createElement("option");
            newOption.value = city;
            newOption.textContent = city;
            countrySelect.appendChild(newOption);
        }
        countrySelect.value = city; // Set the selected option to the clicked city
        fetchWeatherData(city);
    });
});

// Fetch list of countries and add to the dropdown
fetch("https://restcountries.com/v3.1/all")
    .then(response => response.json())
    .then(countries => {
        countries.sort((a, b) => a.name.common.localeCompare(b.name.common)); // Sort alphabetically
        countries.forEach(country => {
            const option = document.createElement("option");
            option.value = country.name.common;
            option.textContent = country.name.common;
            countrySelect.appendChild(option);
        });
    })
    .catch(error => console.error("Error fetching countries:", error));

// Fetch weather data when a country/city is selected from the dropdown
countrySelect.addEventListener("change", () => {
    const selectedLocation = countrySelect.value;
    if (selectedLocation) {
        fetchWeatherData(selectedLocation);
    }
});

// Fetch weather data for the selected location
function fetchWeatherData(location) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayWeatherInfo(data);
            displayWeeklyForecast(data);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            weatherInfoDiv.innerHTML = "Failed to retrieve weather data.";
        });
}

// Display the current weather info
function displayWeatherInfo(data) {
    const { name, country } = data.city; // Get the city and country from the 'city' object
    const { main, weather, wind } = data.list[0]; // Get the weather data for the first entry

    const tempCelsius = main.temp;
    const tempFahrenheit = (tempCelsius * 9) / 5 + 32; // Convert Celsius to Fahrenheit
    const windSpeedKmph = (wind.speed * 3.6).toFixed(2); // Convert m/s to km/h

    // Determine the image to display based on temperature
    let weatherImage = "sun.png"; // Default image
    if (tempCelsius <= 30) weatherImage = "cloud1.png";
    if (tempCelsius <= 28) weatherImage = "cloud2.png";
    if (tempCelsius <= 26) weatherImage = "cloud3.png";
    if (tempCelsius <= 24) weatherImage = "rain.png";
    if (tempCelsius <= 22) weatherImage = "storm.png";
    if (tempCelsius <= 20) weatherImage = "wind.png";
    if (tempCelsius <= 13) weatherImage = "snow.png";
    if (tempCelsius <= 5) weatherImage = "snowy.png";

    weatherInfoDiv.style.display = "block";
    weatherInfoDiv.innerHTML = `
        <h2>${tempCelsius.toFixed(1)}°C | ${tempFahrenheit.toFixed(1)}°F</h2> <!-- Temperature -->
        <h3>${name}, ${country}</h3> <!-- City and Country -->
        <img src="images/${weatherImage}" alt="Weather Image" class="weather-image" /> <!-- Weather Image -->
        <p><strong>Weather:</strong> ${weather[0].description}</p>
        <p><strong>Feels Like:</strong> ${main.feels_like.toFixed(1)}°C</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${windSpeedKmph} km/h</p>
    `;
}

// Display the weekly weather forecast in a table
function displayWeeklyForecast(data) {
    weeklyForecastTable.innerHTML = ""; // Clear previous data

    data.list.forEach((entry, index) => {
        if (index % 8 === 0) { // Data every 8th entry (3-hour interval)
            const dayOfWeek = new Date(entry.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
            const weatherDescription = entry.weather[0].description;
            const temp = entry.main.temp;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${dayOfWeek}</td>
                <td>${weatherDescription}</td>
                <td>${temp.toFixed(1)}°C</td>
            `;
            weeklyForecastTable.appendChild(row);
        }
    });
}
