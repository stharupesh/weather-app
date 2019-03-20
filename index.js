$(function() {

	/**
	 * [list of cities used in the app]
	 * @type {Array}
	 */
	
	const CITIES = [
		{
			name: 'Sydney',
			location: {
				lat:'-33.8688',
				lon:'151.2093'
			}
		},
		{
			name: 'Brisbane',
			location: {
				lat:'-27.4698',
				lon:'153.0251'
			}
		},
		{
			name: 'Melbourne',
			location: {
				lat:'-37.8136',
				lon:'144.9631'
			}
		},
		{
			name: 'Snow Mountains',
			location: {
				lat:'-36.5000',lon:'148.3333'
			}
		}
	];

	/**
	 * list of days short names used in the app
	 * @type {Array}
	 */
	const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	/**
	 * after studying the api status codes, weather status and icons, below data were drawn as result
	 * if any status code falls between minimum and maximum of any of the item in the list then
	 * weather icon to denote it is stored in the 'icon' key. Below data are basic classification 
	 * of weather status. Detailed weather status like: light snow shower, mist, heavy rain fall are
	 * not displayed in this version of app.
	 * @type {Array}
	 */
	const WEATHER_STATUS_CODES = [
		{ min: 200, max: 233, icon: 'images/thunderStorm.png' },
		{ min: 300, max: 522, icon: 'images/rain.png' },
		{ min: 600, max: 623, icon: 'images/snow.png' },
		{ min: 700, max: 751, icon: 'images/foggy.png' },
		{ min: 800, max: 801, icon: 'images/sunny.png' },
		{ min: 802, max: 900, icon: 'images/cloudy.png' }
	];

	const API_URL = 'https://weatherbit-v1-mashape.p.mashape.com/forecast/daily';
	const API_KEY = "wSo0LRcHZMmsh4rXshasAImNK7Ulp19zkGQjsnUjeMXsnpyilC";

	/**
	 * Weather app class
	 */
	function WeatherApp() {
		
		let me = this;

		me.currentCityIndex = 0, // to store current city

		me.appElements = null; // to store html elements used in the app which needs manipulation or update

		/**
		 * returns current city show in the app
		 * @return {Object} [description]
		 */
		me.getCurrentCity = function() {
			return CITIES[me.currentCityIndex];
		},

		/**
		 * fetches the weather data of current city and return promise
		 * @return {Promise} [description]
		 */
		me.getCurrentCityWeatherData = function() {
			let currentCity = me.getCurrentCity();

			return $.ajax({
				url: API_URL + '/?lat=' + currentCity.location.lat + '&lon=' + currentCity.location.lon,
				headers: { "X-Mashape-Key": API_KEY },
				error: function(err) {
					console.log(err);
				}
			});
		},

		/**
		 * checks if the current city shown is the last one in the city list
		 * @return {Boolean} [description]
		 */
		me.isLastCity = function() {
			return (me.currentCityIndex == (CITIES.length - 1));
		},

		/**
		 * checks if the current city is the first one in the list
		 * @return {Boolean} [description]
		 */
		me.isFirstCity = function() {
			return (me.currentCityIndex == 0);
		},

		/**
		 * sets the next city in the list as current city
		 * @return {[type]} [description]
		 */
		me.paginateToNextCity = function() {
			if(!me.isLastCity())
				me.currentCityIndex++;
		},

		/**
		 * sets the previous city in teh lsit as current city
		 * @return {[type]} [description]
		 */
		me.paginateToPreviousCity = function() {
			if(!me.isFirstCity())
				me.currentCityIndex--;
		},

		/**
		 * sets the first city in the list as current city
		 * @return {[type]} [description]
		 */
		me.paginateToFirstCity = function() {
			me.currentCityIndex = 0;
		},

		/**
		 * sets the last city in the list as current city
		 * @return {[type]} [description]
		 */
		me.paginateToLastCity = function() {
			me.currentCityIndex = CITIES.length - 1;
		},

		/**
		 * shows loading animation on the screen
		 * @return {[type]} [description]
		 */
		me.showLoading = function() {
			me.appElements.loading.show();
		},

		/**
		 * hides the loading animation in the screen
		 * @return {[type]} [description]
		 */
		me.hideLoading = function() {
			me.appElements.loading.hide();
		},

		/**
		 * reloads the weather data of the current city
		 * @return {[type]} [description]
		 */
		me.reloadWeatherData = function() {
			// show loading animation
			me.showLoading();

			// fetch the weather data of current city from the server through api
			me.getCurrentCityWeatherData()

			.done(function(response, status) {
				if(status == 'success') { // if successfully fetched then show the data
					let data = me.getFilteredData(response.data);
					
					me.showData(data);

					me.hideLoading(); // hide the loading animation after the data is shown
				}
			});
		},

		/**
		 * show the data - appends the data in their respective dom position.
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		me.showData = function(data) {

			me.appElements.currentCityName.html(me.getCurrentCity().name);
			me.appElements.currentTemperature.html(data.currentTemperature);
			me.appElements.minTemperature.html(data.minTemperature);
			me.appElements.maxTemperature.html(data.maxTemperature);
			me.appElements.currentWeatherStatus.html(data.weatherStatus);
			me.appElements.currentWeatherStatusIcon.attr('src', data.weatherStatusIcon);

			for(let i = 0; i < me.appElements.futureDaysStatus.length; i++) {
				me.appElements.futureDaysStatus[i].day.html(data.futureDays[i].dayName);
				me.appElements.futureDaysStatus[i].statusIcon.attr('src', data.futureDays[i].statusIcon);
				me.appElements.futureDaysStatus[i].temperature.html(data.futureDays[i].temperature);
			}
		},

		/**
		 * returns only the data which are needed to be shown in the app
		 * @param  {[type]} rawData [description]
		 * @return {[type]}         [description]
		 */
		me.getFilteredData = function(rawData) {
			let filteredData = {
				currentTemperature: me.getFormattedTemperature(rawData[0].temp),
				minTemperature: me.getFormattedTemperature(rawData[0].min_temp),
				maxTemperature: me.getFormattedTemperature(rawData[0].max_temp),
				weatherStatusIcon: me.getWeatherStatusIcon(rawData[0].weather.code),
				weatherStatus: rawData[0].weather.description,
				futureDays: []
			};

			for(let i = 1; i < 6; i++) {
				filteredData.futureDays.push({
					dayName: me.getDayNameFromDate(rawData[i].datetime),
					statusIcon: me.getWeatherStatusIcon(rawData[i].weather.code),
					temperature: me.getFormattedTemperature(rawData[i].max_temp) + '/' + me.getFormattedTemperature(rawData[i].min_temp)
				});
			}

			return filteredData;
		},

		/**
		 * formats the temperature and returns it
		 * @param  {[type]} temperature [description]
		 * @return {[type]}             [description]
		 */
		me.getFormattedTemperature = function(temperature) {
			return parseInt(Math.round(temperature));
		},

		/**
		 * checks where the weather status code falls and retuns the suitable weather status icon
		 * @param  {[type]} statusCode [description]
		 * @return {[type]}            [description]
		 */
		me.getWeatherStatusIcon = function(statusCode) {
			for(let i = 0; i < WEATHER_STATUS_CODES.length; i++) {
				if(statusCode >= WEATHER_STATUS_CODES[i].min && statusCode <= WEATHER_STATUS_CODES[i].max)
					return WEATHER_STATUS_CODES[i].icon;
			}
		},

		/**
		 * return short name of the day of a date
		 * @param  {[type]} dateString [description]
		 * @return {[type]}            [description]
		 */
		me.getDayNameFromDate = function(dateString) {
			return DAYS[(new Date(dateString)).getDay()];
		},

		/**
		 * initialize listeners for dom elements like clicking the pagination buttons
		 * @return {[type]} [description]
		 */
		me.initializeListeners = function() {
			me.appElements.navigationArrowLeft.click(function() { // if left arrow clicked
				if(!me.isFirstCity())
					me.paginateToPreviousCity();
				else
					me.paginateToLastCity();

				me.reloadWeatherData();
			});

			me.appElements.navigationArrowRight.click(function() { // if right arrow clicked
				if(!me.isLastCity())
					me.paginateToNextCity();
				else
					me.paginateToFirstCity();

				me.reloadWeatherData();
			});
		},

		/**
		 * returns the list of dom elements where are needed to be manipulated or updated in the app
		 * @return {[type]} [description]
		 */
		me.getElements = function() {
			let elements = {
				mainContainer: $('.main-container'),
				loading: $('#loading'),
				currentCityName: $('.city-name'),
				navigationArrowLeft: $('.navigation-arrow.left'),
				navigationArrowRight: $('.navigation-arrow.right'),
				currentTemperature: $('.current-temperature span'),
				minTemperature: $('.min-temperature span'),
				maxTemperature: $('.max-temperature span'),
				currentWeatherStatus: $('.current-weather-status'),
				currentWeatherStatusIcon: $('.weather-status-icon'),
				futureDaysStatus: []
			};

			let weekNamesDom = $('.week-name');
			let weekStatusIconDoms = $('.week-weather-status-icon img');
			let futureDaysOverallTemperatureDoms = $('.overall-temperature');

			for(let i = 0; i < weekNamesDom.length; i++) {
				elements.futureDaysStatus.push({
					day: $(weekNamesDom[i]),
					statusIcon: $(weekStatusIconDoms[i]),
					temperature: $(futureDaysOverallTemperatureDoms[i])
				});
			}

			return elements;
		},

		/**
		 * start the app
		 * @return {[type]} [description]
		 */
		me.initialize = function() {
			me.appElements = me.getElements();
			me.initializeListeners();
			me.reloadWeatherData();
		}
	};

	let app = new WeatherApp();

	app.initialize();

});