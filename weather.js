const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt'); // Corrected class name
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img'); // Fixed class name
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apiKey = '40ff1e9393b62df9a47210a6563bcf1b'; // Add your OpenWeatherMap API key here

// Event listeners for search functionality
function handleSearch(event) {
    const city = cityInput.value.trim();
    if ((event.type === 'click' || event.key === 'Enter') && city) {
        updateWeatherInfo(city);
        cityInput.value = '';
        cityInput.blur();
    }
}
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', handleSearch);

// Fetch data from OpenWeatherMap API
async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Map weather ID to icon filenames
function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    if (id >= 801 && id <= 804) return 'clouds.svg';
    return 'default.svg'; // Fallback icon
}

// Get formatted current date
function getCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return currentDate.toLocaleDateString('en-GB', options);
}

// Update weather information for the searched city
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (!weatherData || weatherData.cod !== 200) {
        notFoundSection.querySelector('h1').textContent = `City not found`;
        notFoundSection.querySelector('h4').textContent = `City "${city}" could not be located. Please try again.`;
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${speed} M/s`;
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;
    weatherSummaryImg.alt = main;

    await updateForecastsInfo(city);
    showDisplaySection(weatherInfoSection);
}

// Update forecast information
async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);

    if (!forecastsData) return;

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];
    forecastItemsContainer.innerHTML = '';

    forecastsData.list
        .filter(
            (forecastWeather) =>
                forecastWeather.dt_txt.includes(timeTaken) &&
                !forecastWeather.dt_txt.startsWith(todayDate)
        )
        .forEach(updateForecastItems);
}

// Render individual forecast items
function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp },
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = { day: '2-digit', month: 'short' };
    const dateResult = dateTaken.toLocaleDateString('en-GB', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" alt="Weather Icon" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

// Show the appropriate section
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(
        (sec) => sec.classList.add('hidden')
    );
    section.classList.remove('hidden');
}


