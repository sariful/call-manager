var app = {
	// Application Constructor
	initialize: function () {
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},

	// deviceready Event Handler
	//
	// Bind any cordova events here. Common events are:
	// 'pause', 'resume', etc.
	onDeviceReady: function () {
		this.receivedEvent('deviceready');
	},

	// Update DOM on a Received Event
	receivedEvent: function (id) {


		function getCallByDay(day) {
			return new Promise(function (resolve, reject) {
				/* var filters = [{
					"name": "date",
					"value": moment(day).format('x'),
					"operator": "like"
				}]; */

				var filters = [{
						"name": "date",
						"value": moment(day).format('x'),
						"operator": ">="
					},
					{
						"name": "date",
						"value": moment(day).add(1, 'days').format('x'),
						"operator": "<="
					}
				];
				window.plugins.callLog.getCallLog(filters, function (call_data) {
					resolve(call_data);
				}, function (error) {
					resolve(error);
				});
			});
		}

		function successCallback() {
			$('.footer-loading').fadeIn();
			try {
				(function () {



					setTimeout(async function () {

						var data = {
							labels: [],
							data: [],
							all_datas: []
						};

						var days = zubizi.getLastNDays();

						for (i = 0; i < days.length; i++) {
							var day = days[i];
							var day_data = await getCallByDay(day);
							data.labels.push(moment(day).format('dddd'));
							data.data.push(day_data.length);
							data.all_datas.push(day_data);
						}

						setChart(data);
						// $('.status').html('<pre>' + JSON.stringify(data, null, '\t') + '</pre>');

						$('.footer-loading').fadeOut();
					}, 500);
				})();
			} catch (error) {

			}
		}

		function setChart(sendData) {
			var days_chart = new Chart($('#last_7_days_calls'), {
				type: 'line',
				data: {
					labels: sendData.labels,
					datasets: [{
						label: 'No of Calls',
						data: sendData.data,
						backgroundColor: [
							'rgba(78, 115, 223, 0.2)'
						],
						borderColor: [
							'rgba(78, 115, 223, 1)',
						],
						borderWidth: 1
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					layout: {
						padding: {
							left: 0,
							right: 0,
							top: 0,
							bottom: 0
						}
					},
					tooltips: {
						mode: 'index',
						intersect: false
					},
					elements: {
						line: {
							tension: 0.1,
						}
					},
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero: true
							}
						}]
					}
				}
			});
		}

		successCallback();

		function errorCallback(error) {
			$('.status').html('Error: <pre>' + error + '</pre>');
		}


		if (window.plugins.callLog.hasReadPermission) {
			window.plugins.callLog.hasReadPermission(successCallback, errorCallback);
		}

		if (window.plugins.callLog.requestReadPermission) {
			window.plugins.callLog.requestReadPermission(successCallback, errorCallback);
		}



	}
};

app.initialize();