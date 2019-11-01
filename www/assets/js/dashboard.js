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
							call_times: [],
							total_call_deration: [],
							all_datas: []
						};

						var days = zubizi.getLastNDays().reverse();

						for (i = 0; i < days.length; i++) {
							var day = days[i];
							var day_data = await getCallByDay(day);
							data.labels.push(moment(day).format('dddd'));
							data.data.push(day_data.length);
							// data.all_datas.push(day_data);

							var call_times = 0;
							var total_duration = 0;
							if (day_data.length > 0) {
								for (j = 0; j < day_data.length; j++) {
									var duration = day_data[j].duration;
									total_duration += +duration;
								}
								if (total_duration > 60) {
									var call_minute = (total_duration / 60).toFixed(0);
									call_times = call_minute + '.' + total_duration % 60;
								}
							}
							data.total_call_deration.push(total_duration);
							data.call_times.push(call_times);
						}

						setChart(data);
						$('.status').html('<pre>' + JSON.stringify(data, null, '\t') + '</pre>');

						$('.footer-loading').fadeOut();
					}, 500);
				})();
			} catch (error) {

			}
		}

		function setChart(sendData) {
			var days_chart = new Chart($('#last_7_days_calls'), {
				type: 'bar',
				data: {
					labels: sendData.labels,
					datasets: [{
						label: 'No of Calls',
						data: sendData.data,
						backgroundColor: 'rgba(78, 115, 223, 0)',
						borderColor: 'rgba(78, 115, 223, 1)',
						borderWidth: 2,
						type: 'line'
					}, {
						label: 'Call Duration',
						data: sendData.call_times,
						backgroundColor: 'rgba(227, 227, 227)',
						borderColor: 'rgba(227, 227, 227)',
						borderWidth: 2,
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
							tension: 0.25,
						}
					},
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero: true,
								display: false,
							},
							gridLines: {
								drawBorder: false,
								display: false
							}
						}],
						xAxes: [{
							ticks: {
								fontSize: 8
							},
							gridLines: {
								display: false
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