document.addEventListener("DOMContentLoaded", function () {
    // Select DOM elements
    const cityInput = document.querySelector(".city-input");
    const searchButton = document.querySelector(".search-btn");
    const locationButton = document.querySelector(".location-btn");
    const currentWeatherDiv = document.querySelector(".current-weather");
    const weatherCardsDiv = document.querySelector(".weather-cards");

    // API key (Replace with your actual OpenWeatherMap API key)
    const API_KEY = "a1192e4fc736d31e639ace235f7fb0e2";

    // Mapping OpenWeatherMap weather icons to Bootstrap Icons
    const bootstrapIcons = {
        "01d": "bi-brightness-high",       // Clear sky (day)
        "01n": "bi-moon",                  // Clear sky (night)
        "02d": "bi-cloud-sun",             // Few clouds (day)
        "02n": "bi-cloud-moon",            // Few clouds (night)
        "03d": "bi-cloud",                 // Scattered clouds
        "03n": "bi-cloud",                 // Scattered clouds
        "04d": "bi-clouds",                // Broken clouds
        "04n": "bi-clouds",                // Broken clouds
        "09d": "bi-cloud-rain-heavy",      // Shower rain
        "09n": "bi-cloud-rain-heavy",      // Shower rain
        "10d": "bi-umbrella",              // Rain (day)
        "10n": "bi-umbrella",              // Rain (night)
        "11d": "bi-lightning",             // Thunderstorm
        "11n": "bi-lightning",             // Thunderstorm
        "13d": "bi-snow3",                 // Snow
        "13n": "bi-snow3",                 // Snow
        "50d": "bi-wind",                  // Mist
        "50n": "bi-wind",                  // Mist
    };

    // Helper function for API requests
    const fetchData = async (url, errorMessage) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${errorMessage}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            displayError(error.message);
            return null;
        }
    };

    // Display loading message
    const displayLoading = (isLoading) => {
        const loadingMessage = document.querySelector(".loading");
        if (isLoading) {
            if (!loadingMessage) {
                const loadingDiv = document.createElement("div");
                loadingDiv.className = "loading";
                loadingDiv.textContent = "Loading...";
                document.body.appendChild(loadingDiv);
            }
        } else if (loadingMessage) {
            loadingMessage.remove();
        }
    };

    // Display error message
    const displayError = (message) => {
        console.error(message);
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    };

    // Create weather card
    const createWeatherCard = (cityName, weatherItem, index) => {
        const date = weatherItem.dt_txt.split(" ")[0];
        const temp = (weatherItem.main.temp - 273.15).toFixed(2);
        const wind = weatherItem.wind.speed;
        const humidity = weatherItem.main.humidity;
        const icon = weatherItem.weather[0].icon;
        const description = weatherItem.weather[0].description;

        // Get Bootstrap icon class or fallback
        const iconClass = bootstrapIcons[icon] || "bi-question-circle-fill";

        if (index === 0) {
            // Current weather card
            return `
                        <div class="details">
                            <h2>${cityName} (${date})</h2>
                            <h6>Temperature: ${temp}°C</h6>
                            <h6>Wind: ${wind} M/S</h6>
                            <h6>Humidity: ${humidity}%</h6>
                        </div>
                        <div class="icon">
                            <i class="bi ${iconClass}" style="font-size: 4rem;"></i>
                            <h6>${description}</h6>
                        </div>`;
        } else {
            // Forecast card
            return `
                        <li class="card">
                            <h3>${date}</h3>
                            <i class="bi ${iconClass}" style="font-size: 3rem;"></i>
                            <h6>Temp: ${temp}°C</h6>
                            <h6>Wind: ${wind} M/S</h6>
                            <h6>Humidity: ${humidity}%</h6>
                        </li>`;
        }
    };

    // Fetch weather details
    const getWeatherDetails = async (cityName, latitude, longitude) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        displayLoading(true);

        const data = await fetchData(
            WEATHER_API_URL,
            "Failed to fetch weather details"
        );
        if (!data) return;

        // Filter for unique forecast days
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter((forecast) => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        // Clear previous content
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Generate cards
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });

        displayLoading(false);
    };

    // Fetch city coordinates
    const getCityCoordinates = async () => {
        const cityName = cityInput.value.trim();
        if (!cityName) return displayError("Please enter a city name.");

        const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
        displayLoading(true);

        const data = await fetchData(API_URL, "Failed to fetch city coordinates");
        if (!data || !data.length)
            return displayError(`No coordinates found for "${cityName}".`);

        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);

        displayLoading(false);
    };

    // Fetch user coordinates
    const getUserCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                displayLoading(true);

                const data = await fetchData(API_URL, "Failed to fetch location details");
                if (!data || !data.length) return displayError("Failed to get city name.");

                const cityName = data[0].name;
                getWeatherDetails(cityName, latitude, longitude);
            },
            (error) => {
                displayError("Geolocation error: " + error.message);
                displayLoading(false);
            }
        );
    };

    // Event listeners
    searchButton.addEventListener("click", getCityCoordinates);
    locationButton.addEventListener("click", getUserCoordinates);
}); document.addEventListener("DOMContentLoaded", function () {
    // Select DOM elements
    const cityInput = document.querySelector(".city-input");
    const searchButton = document.querySelector(".search-btn");
    const locationButton = document.querySelector(".location-btn");
    const currentWeatherDiv = document.querySelector(".current-weather");
    const weatherCardsDiv = document.querySelector(".weather-cards");

    // API key (Replace with your actual OpenWeatherMap API key)
    const API_KEY = "a1192e4fc736d31e639ace235f7fb0e2";

    // Mapping OpenWeatherMap weather icons to Bootstrap Icons
    const bootstrapIcons = {
        "01d": "bi-brightness-high",       // Clear sky (day)
        "01n": "bi-moon",                  // Clear sky (night)
        "02d": "bi-cloud-sun",             // Few clouds (day)
        "02n": "bi-cloud-moon",            // Few clouds (night)
        "03d": "bi-cloud",                 // Scattered clouds
        "03n": "bi-cloud",                 // Scattered clouds
        "04d": "bi-clouds",                // Broken clouds
        "04n": "bi-clouds",                // Broken clouds
        "09d": "bi-cloud-rain-heavy",      // Shower rain
        "09n": "bi-cloud-rain-heavy",      // Shower rain
        "10d": "bi-umbrella",              // Rain (day)
        "10n": "bi-umbrella",              // Rain (night)
        "11d": "bi-lightning",             // Thunderstorm
        "11n": "bi-lightning",             // Thunderstorm
        "13d": "bi-snow3",                 // Snow
        "13n": "bi-snow3",                 // Snow
        "50d": "bi-wind",                  // Mist
        "50n": "bi-wind",                  // Mist
    };

    // Helper function for API requests
    const fetchData = async (url, errorMessage) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${errorMessage}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            displayError(error.message);
            return null;
        }
    };

    // Display loading message
    const displayLoading = (isLoading) => {
        const loadingMessage = document.querySelector(".loading");
        if (isLoading) {
            if (!loadingMessage) {
                const loadingDiv = document.createElement("div");
                loadingDiv.className = "loading";
                loadingDiv.textContent = "Loading...";
                document.body.appendChild(loadingDiv);
            }
        } else if (loadingMessage) {
            loadingMessage.remove();
        }
    };

    // Display error message
    const displayError = (message) => {
        console.error(message);
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    };

    // Create weather card
    const createWeatherCard = (cityName, weatherItem, index) => {
        const date = weatherItem.dt_txt.split(" ")[0];
        const temp = (weatherItem.main.temp - 273.15).toFixed(2);
        const wind = weatherItem.wind.speed;
        const humidity = weatherItem.main.humidity;
        const icon = weatherItem.weather[0].icon;
        const description = weatherItem.weather[0].description;

        // Get Bootstrap icon class or fallback
        const iconClass = bootstrapIcons[icon] || "bi-question-circle-fill";

        if (index === 0) {
            // Current weather card
            return `
                        <div class="details">
                            <h2>${cityName} (${date})</h2>
                            <h6>Temperature: ${temp}°C</h6>
                            <h6>Wind: ${wind} M/S</h6>
                            <h6>Humidity: ${humidity}%</h6>
                        </div>
                        <div class="icon">
                            <i class="bi ${iconClass}" style="font-size: 4rem;"></i>
                            <h6>${description}</h6>
                        </div>`;
        } else {
            // Forecast card
            return `
                        <li class="card">
                            <h3>${date}</h3>
                            <i class="bi ${iconClass}" style="font-size: 3rem;"></i>
                            <h6>Temp: ${temp}°C</h6>
                            <h6>Wind: ${wind} M/S</h6>
                            <h6>Humidity: ${humidity}%</h6>
                        </li>`;
        }
    };

    // Fetch weather details
    const getWeatherDetails = async (cityName, latitude, longitude) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        displayLoading(true);

        const data = await fetchData(
            WEATHER_API_URL,
            "Failed to fetch weather details"
        );
        if (!data) return;

        // Filter for unique forecast days
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter((forecast) => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        // Clear previous content
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Generate cards
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });

        displayLoading(false);
    };

    // Fetch city coordinates
    const getCityCoordinates = async () => {
        const cityName = cityInput.value.trim();
        if (!cityName) return displayError("Please enter a city name.");

        const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
        displayLoading(true);

        const data = await fetchData(API_URL, "Failed to fetch city coordinates");
        if (!data || !data.length)
            return displayError(`No coordinates found for "${cityName}".`);

        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);

        displayLoading(false);
    };

    // Fetch user coordinates
    const getUserCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                displayLoading(true);

                const data = await fetchData(API_URL, "Failed to fetch location details");
                if (!data || !data.length) return displayError("Failed to get city name.");

                const cityName = data[0].name;
                getWeatherDetails(cityName, latitude, longitude);
            },
            (error) => {
                displayError("Geolocation error: " + error.message);
                displayLoading(false);
            }
        );
    };

    // Event listeners
    searchButton.addEventListener("click", getCityCoordinates);
    locationButton.addEventListener("click", getUserCoordinates);
}); document.addEventListener("DOMContentLoaded", function () {
    // Select DOM elements
    const cityInput = document.querySelector(".city-input");
    const searchButton = document.querySelector(".search-btn");
    const locationButton = document.querySelector(".location-btn");
    const currentWeatherDiv = document.querySelector(".current-weather");
    const weatherCardsDiv = document.querySelector(".weather-cards");

    // API key (Replace with your actual OpenWeatherMap API key)
    const API_KEY = "a1192e4fc736d31e639ace235f7fb0e2";

    // Mapping OpenWeatherMap weather icons to Bootstrap Icons
    const bootstrapIcons = {
        "01d": "bi-brightness-high",       // Clear sky (day)
        "01n": "bi-moon",                  // Clear sky (night)
        "02d": "bi-cloud-sun",             // Few clouds (day)
        "02n": "bi-cloud-moon",            // Few clouds (night)
        "03d": "bi-cloud",                 // Scattered clouds
        "03n": "bi-cloud",                 // Scattered clouds
        "04d": "bi-clouds",                // Broken clouds
        "04n": "bi-clouds",                // Broken clouds
        "09d": "bi-cloud-rain-heavy",      // Shower rain
        "09n": "bi-cloud-rain-heavy",      // Shower rain
        "10d": "bi-umbrella",              // Rain (day)
        "10n": "bi-umbrella",              // Rain (night)
        "11d": "bi-lightning",             // Thunderstorm
        "11n": "bi-lightning",             // Thunderstorm
        "13d": "bi-snow3",                 // Snow
        "13n": "bi-snow3",                 // Snow
        "50d": "bi-wind",                  // Mist
        "50n": "bi-wind",                  // Mist
    };

    // Helper function for API requests
    const fetchData = async (url, errorMessage) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${errorMessage}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            displayError(error.message);
            return null;
        }
    };

    // Display loading message
    const displayLoading = (isLoading) => {
        const loadingMessage = document.querySelector(".loading");
        if (isLoading) {
            if (!loadingMessage) {
                const loadingDiv = document.createElement("div");
                loadingDiv.className = "loading";
                loadingDiv.textContent = "Loading...";
                document.body.appendChild(loadingDiv);
            }
        } else if (loadingMessage) {
            loadingMessage.remove();
        }
    };

    // Display error message
    const displayError = (message) => {
        console.error(message);
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    };

    // Create weather card
    const createWeatherCard = (cityName, weatherItem, index) => {
        const date = weatherItem.dt_txt.split(" ")[0];
        const temp = (weatherItem.main.temp - 273.15).toFixed(2);
        const wind = weatherItem.wind.speed;
        const humidity = weatherItem.main.humidity;
        const icon = weatherItem.weather[0].icon;
        const description = weatherItem.weather[0].description;

        // Get Bootstrap icon class or fallback
        const iconClass = bootstrapIcons[icon] || "bi-question-circle-fill";

        if (index === 0) {
            // Current weather card
            return `
                        <div class="details">
                            <h2>${cityName} (${date})</h2>
                            <h6>Temperature: ${temp}°C</h6>
                            <h6>Wind: ${wind} M/S</h6>
                            <h6>Humidity: ${humidity}%</h6>
                        </div>
                        <div class="icon">
                            <i class="bi ${iconClass}" style="font-size: 4rem;"></i>
                            <h6>${description}</h6>
                        </div>`;
        } else {
            // Forecast card
            return `
                        <li class="card">
                            <h3>${date}</h3>
                            <i class="bi ${iconClass}" style="font-size: 3rem;"></i>
                            <h6>Temp: ${temp}°C</h6>
                            <h6>Wind: ${wind} M/S</h6>
                            <h6>Humidity: ${humidity}%</h6>
                        </li>`;
        }
    };

    // Fetch weather details
    const getWeatherDetails = async (cityName, latitude, longitude) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        displayLoading(true);

        const data = await fetchData(
            WEATHER_API_URL,
            "Failed to fetch weather details"
        );
        if (!data) return;

        // Filter for unique forecast days
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter((forecast) => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        // Clear previous content
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Generate cards
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });

        displayLoading(false);
    };

    // Fetch city coordinates
    const getCityCoordinates = async () => {
        const cityName = cityInput.value.trim();
        if (!cityName) return displayError("Please enter a city name.");

        const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
        displayLoading(true);

        const data = await fetchData(API_URL, "Failed to fetch city coordinates");
        if (!data || !data.length)
            return displayError(`No coordinates found for "${cityName}".`);

        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);

        displayLoading(false);
    };

    // Fetch user coordinates
    const getUserCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                displayLoading(true);

                const data = await fetchData(API_URL, "Failed to fetch location details");
                if (!data || !data.length) return displayError("Failed to get city name.");

                const cityName = data[0].name;
                getWeatherDetails(cityName, latitude, longitude);
            },
            (error) => {
                displayError("Geolocation error: " + error.message);
                displayLoading(false);
            }
        );
    };

    // Event listeners
    searchButton.addEventListener("click", getCityCoordinates);
    locationButton.addEventListener("click", getUserCoordinates);
}); document.addEventListener("DOMContentLoaded", function () {
    // Select DOM elements
    const cityInput = document.querySelector(".city-input");
    const searchButton = document.querySelector(".search-btn");
    const locationButton = document.querySelector(".location-btn");
    const currentWeatherDiv = document.querySelector(".current-weather");
    const weatherCardsDiv = document.querySelector(".weather-cards");

    // API key (Replace with your actual OpenWeatherMap API key)
    const API_KEY = "a1192e4fc736d31e639ace235f7fb0e2";

    // Mapping OpenWeatherMap weather icons to Bootstrap Icons
    const bootstrapIcons = {
        "01d": "bi-brightness-high",       // Clear sky (day)
        "01n": "bi-moon",                  // Clear sky (night)
        "02d": "bi-cloud-sun",             // Few clouds (day)
        "02n": "bi-cloud-moon",            // Few clouds (night)
        "03d": "bi-cloud",                 // Scattered clouds
        "03n": "bi-cloud",                 // Scattered clouds
        "04d": "bi-clouds",                // Broken clouds
        "04n": "bi-clouds",                // Broken clouds
        "09d": "bi-cloud-rain-heavy",      // Shower rain
        "09n": "bi-cloud-rain-heavy",      // Shower rain
        "10d": "bi-umbrella",              // Rain (day)
        "10n": "bi-umbrella",              // Rain (night)
        "11d": "bi-lightning",             // Thunderstorm
        "11n": "bi-lightning",             // Thunderstorm
        "13d": "bi-snow3",                 // Snow
        "13n": "bi-snow3",                 // Snow
        "50d": "bi-wind",                  // Mist
        "50n": "bi-wind",                  // Mist
    };

    // Helper function for API requests
    const fetchData = async (url, errorMessage) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${errorMessage}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            displayError(error.message);
            return null;
        }
    };

    // Display loading message
    const displayLoading = (isLoading) => {
        const loadingMessage = document.querySelector(".loading");
        if (isLoading) {
            if (!loadingMessage) {
                const loadingDiv = document.createElement("div");
                loadingDiv.className = "loading";
                loadingDiv.textContent = "Loading...";
                document.body.appendChild(loadingDiv);
            }
        } else if (loadingMessage) {
            loadingMessage.remove();
        }
    };

    // Display error message
    const displayError = (message) => {
        console.error(message);
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    };

    // Create weather card
    const createWeatherCard = (cityName, weatherItem, index) => {
        const date = weatherItem.dt_txt.split(" ")[0];
        const temp = (weatherItem.main.temp - 273.15).toFixed(2);
        const wind = weatherItem.wind.speed;
        const humidity = weatherItem.main.humidity;
        const icon = weatherItem.weather[0].icon;
        const description = weatherItem.weather[0].description;

        // Get Bootstrap icon class or fallback
        const iconClass = bootstrapIcons[icon] || "bi-question-circle-fill";

        if (index === 0) {
            // Current weather card
            return `
                        <div class="details">
                            <h2>${cityName} (${date})</h2>
                            <h6>Temperature: ${temp}°C</h6>
                            <h6>Wind: ${wind} M/S</h6>
                            <h6>Humidity: ${humidity}%</h6>
                        </div>
                        <div class="icon">
                            <i class="bi ${iconClass}" style="font-size: 4rem;"></i>
                            <h6>${description}</h6>
                        </div>`;
        } else {
            // Forecast card
            return `
                        <li class="card">
                            <h3>${date}</h3>
                            <i class="bi ${iconClass}" style="font-size: 3rem;"></i>
                            <h6>Temp: ${temp}°C</h6>
                            <h6>Wind: ${wind} M/S</h6>
                            <h6>Humidity: ${humidity}%</h6>
                        </li>`;
        }
    };

    // Fetch weather details
    const getWeatherDetails = async (cityName, latitude, longitude) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        displayLoading(true);

        const data = await fetchData(
            WEATHER_API_URL,
            "Failed to fetch weather details"
        );
        if (!data) return;

        // Filter for unique forecast days
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter((forecast) => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        // Clear previous content
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Generate cards
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });

        displayLoading(false);
    };

    // Fetch city coordinates
    const getCityCoordinates = async () => {
        const cityName = cityInput.value.trim();
        if (!cityName) return displayError("Please enter a city name.");

        const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
        displayLoading(true);

        const data = await fetchData(API_URL, "Failed to fetch city coordinates");
        if (!data || !data.length)
            return displayError(`No coordinates found for "${cityName}".`);

        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);

        displayLoading(false);
    };

    // Fetch user coordinates
    const getUserCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                displayLoading(true);

                const data = await fetchData(API_URL, "Failed to fetch location details");
                if (!data || !data.length) return displayError("Failed to get city name.");

                const cityName = data[0].name;
                getWeatherDetails(cityName, latitude, longitude);
            },
            (error) => {
                displayError("Geolocation error: " + error.message);
                displayLoading(false);
            }
        );
    };

    // Event listeners
    searchButton.addEventListener("click", getCityCoordinates);
    locationButton.addEventListener("click", getUserCoordinates);
});