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
		
		let thisRef = this;

		this.currentCityIndex = 0, // to store current city

		this.appElements = null; // to store html elements used in the app which needs manipulation or update

		/**
		 * returns current city show in the app
		 * @return {Object} [description]
		 */
		this.getCurrentCity = function() {
			return CITIES[this.currentCityIndex];
		},

		/**
		 * fetches the weather data of current city and return promise
		 * @return {Promise} [description]
		 */
		this.getCurrentCityWeatherData = function() {
			let currentCity = this.getCurrentCity();

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
		this.isLastCity = function() {
			return (this.currentCityIndex == (CITIES.length - 1));
		},

		/**
		 * checks if the current city is the first one in the list
		 * @return {Boolean} [description]
		 */
		this.isFirstCity = function() {
			return (this.currentCityIndex == 0);
		},

		/**
		 * sets the next city in the list as current city
		 * @return {[type]} [description]
		 */
		this.paginateToNextCity = function() {
			if(!this.isLastCity())
				this.currentCityIndex++;
		},

		/**
		 * sets the previous city in teh lsit as current city
		 * @return {[type]} [description]
		 */
		this.paginateToPreviousCity = function() {
			if(!this.isFirstCity())
				this.currentCityIndex--;
		},

		/**
		 * sets the first city in the list as current city
		 * @return {[type]} [description]
		 */
		this.paginateToFirstCity = function() {
			this.currentCityIndex = 0;
		},

		/**
		 * sets the last city in the list as current city
		 * @return {[type]} [description]
		 */
		this.paginateToLastCity = function() {
			this.currentCityIndex = CITIES.length - 1;
		},

		/**
		 * shows loading animation on the screen
		 * @return {[type]} [description]
		 */
		this.showLoading = function() {
			this.appElements.loading.show();
		},

		/**
		 * hides the loading animation in the screen
		 * @return {[type]} [description]
		 */
		this.hideLoading = function() {
			this.appElements.loading.hide();
		},

		/**
		 * reloads the weather data of the current city
		 * @return {[type]} [description]
		 */
		this.reloadWeatherData = function() {
			// show loading animation
			this.showLoading();

			// fetch the weather data of current city from the server through api
			this.getCurrentCityWeatherData()

			.done(function(response, status) {
				if(status == 'success') { // if successfully fetched then show the data
					let data = thisRef.getFilteredData(response.data);
					
					thisRef.showData(data);

					thisRef.hideLoading(); // hide the loading animation after the data is shown
				}
			});
		},

		/**
		 * show the data - appends the data in their respective dom position.
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		this.showData = function(data) {

			this.appElements.currentCityName.html(this.getCurrentCity().name);
			this.appElements.currentTemperature.html(data.currentTemperature);
			this.appElements.minTemperature.html(data.minTemperature);
			this.appElements.maxTemperature.html(data.maxTemperature);
			this.appElements.currentWeatherStatus.html(data.weatherStatus);
			this.appElements.currentWeatherStatusIcon.attr('src', data.weatherStatusIcon);

			for(let i = 0; i < this.appElements.futureDaysStatus.length; i++) {
				this.appElements.futureDaysStatus[i].day.html(data.futureDays[i].dayName);
				this.appElements.futureDaysStatus[i].statusIcon.attr('src', data.futureDays[i].statusIcon);
				this.appElements.futureDaysStatus[i].temperature.html(data.futureDays[i].temperature);
			}
		},

		/**
		 * returns only the data which are needed to be shown in the app
		 * @param  {[type]} rawData [description]
		 * @return {[type]}         [description]
		 */
		this.getFilteredData = function(rawData) {
			let filteredData = {
				currentTemperature: thisRef.getFormattedTemperature(rawData[0].temp),
				minTemperature: thisRef.getFormattedTemperature(rawData[0].min_temp),
				maxTemperature: thisRef.getFormattedTemperature(rawData[0].max_temp),
				weatherStatusIcon: thisRef.getWeatherStatusIcon(rawData[0].weather.code),
				weatherStatus: rawData[0].weather.description,
				futureDays: []
			};

			for(let i = 1; i < 6; i++) {
				filteredData.futureDays.push({
					dayName: thisRef.getDayNameFromDate(rawData[i].datetime),
					statusIcon: thisRef.getWeatherStatusIcon(rawData[i].weather.code),
					temperature: thisRef.getFormattedTemperature(rawData[i].max_temp) + '/' + thisRef.getFormattedTemperature(rawData[i].min_temp)
				});
			}

			return filteredData;
		},

		/**
		 * formats the temperature and returns it
		 * @param  {[type]} temperature [description]
		 * @return {[type]}             [description]
		 */
		this.getFormattedTemperature = function(temperature) {
			return parseInt(Math.round(temperature));
		},

		/**
		 * checks where the weather status code falls and retuns the suitable weather status icon
		 * @param  {[type]} statusCode [description]
		 * @return {[type]}            [description]
		 */
		this.getWeatherStatusIcon = function(statusCode) {
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
		this.getDayNameFromDate = function(dateString) {
			return DAYS[(new Date(dateString)).getDay()];
		},

		/**
		 * initialize listeners for dom elements like clicking the pagination buttons
		 * @return {[type]} [description]
		 */
		this.initializeListeners = function() {
			this.appElements.navigationArrowLeft.click(function() { // if left arrow clicked
				if(!thisRef.isFirstCity())
					thisRef.paginateToPreviousCity();
				else
					thisRef.paginateToLastCity();

				thisRef.reloadWeatherData();
			});

			this.appElements.navigationArrowRight.click(function() { // if right arrow clicked
				if(!thisRef.isLastCity())
					thisRef.paginateToNextCity();
				else
					thisRef.paginateToFirstCity();

				thisRef.reloadWeatherData();
			});
		},

		/**
		 * returns the list of dom elements where are needed to be manipulated or updated in the app
		 * @return {[type]} [description]
		 */
		this.getElements = function() {
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
		this.initialize = function() {
			this.appElements = this.getElements();
			this.initializeListeners();
			this.reloadWeatherData();
		}
	};

	let app = new WeatherApp();

	app.initialize();

});