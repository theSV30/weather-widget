const apiKey = '5600a7ba4815b61923ce0dd8238f3ef0'; 
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

document.addEventListener('DOMContentLoaded', () => {
    
    fetchWeather('Mumbai');

    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const city = document.getElementById('search-input').value;
        if (city) {
            fetchWeather(city);
        }
    });
});

function fetchWeather(city) {
    fetch(`${baseUrl}?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            updateCurrentWeather(data);
            updateWeatherDetails(data);
            fetchForecast(city);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function fetchForecast(city) {
    fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            updateWeeklyForecast(data);
        })
        .catch(error => console.error('Error fetching forecast data:', error));
}

function updateCurrentWeather(data) {
    const cityTimezoneOffset = data.timezone;
    const utcTime = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000));
    const cityTime = new Date(utcTime.getTime() + cityTimezoneOffset * 1000);

    document.getElementById('displayed-city').textContent = data.name;
    document.querySelector('.current-time').textContent = cityTime.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('current-temperature').textContent = `${Math.round(data.main.temp)}°`;
    document.querySelector('.weather-status').textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    document.querySelector('.weather-info img').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

function updateWeatherDetails(data) {
    const humidity = data.main.humidity;
    const windSpeed = (data.wind.speed * 3.6).toFixed(1);
    const visibility = (data.visibility / 1000).toFixed(1);

    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('wind').textContent = `${windSpeed} kph`;
    document.getElementById('visibility').textContent = `${visibility} km`;
}

function updateWeeklyForecast(data) {
    const forecastContainer = document.querySelector('.week-forecast');
    forecastContainer.innerHTML = '';

    const cityTimezoneOffset = data.city.timezone * 1000;
    const localTime = new Date(Date.now() + cityTimezoneOffset);
    const todayIndex = localTime.getDay();

    const dailyForecasts = data.list.filter(item => {
        const forecastDate = new Date(item.dt_txt);
        return forecastDate.getHours() === 12;
    });

    const forecastDays = 5;
    let adjustedForecasts = [];
    let index = 0;

    while (adjustedForecasts.length < forecastDays && index < dailyForecasts.length) {
        const forecastDate = new Date(dailyForecasts[index].dt_txt);
        const forecastDayIndex = forecastDate.getDay();

        if (forecastDayIndex > todayIndex || (adjustedForecasts.length === 0 && forecastDayIndex === (todayIndex + 1) % 7)) {
            adjustedForecasts.push(dailyForecasts[index]);
        }

        index++;
    }

    while (adjustedForecasts.length < forecastDays) {
        const lastDay = adjustedForecasts[adjustedForecasts.length - 1];
        const lastDayDate = new Date(lastDay.dt_txt);
        const nextDay = new Date(lastDayDate.getTime() + 24 * 60 * 60 * 1000);
        nextDay.setHours(12);

        adjustedForecasts.push({
            dt_txt: nextDay.toISOString(),
            main: { temp: lastDay.main.temp },
            weather: lastDay.weather
        });
    }

    adjustedForecasts.forEach(dayData => {
        const forecastDate = new Date(dayData.dt_txt);
        const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });

        const iconUrl = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`;
        const description = dayData.weather[0].description.charAt(0).toUpperCase() + dayData.weather[0].description.slice(1);
        const temperature = Math.round(dayData.main.temp) + '°';

        forecastContainer.insertAdjacentHTML('beforeend', 
            `<div class="col-md-2 text-center">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" alt="${description}" />
                <p class="weather">${description}</p>
                <span>${temperature}</span>
            </div>`
        );
    });
}
