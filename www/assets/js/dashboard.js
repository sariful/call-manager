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
					alert(error);
					resolve(error);
				});
			});
		}

		function successCallback() {
			$('.footer-loading').fadeIn();
			try {
				(function () {
					setTimeout(async function () {
						await weeklyChart();
						await callTypeChart();
						$('.footer-loading').fadeOut();
					}, 500);
				})();
			} catch (error) {
				alert(error);
			}
		}

		function callTypeChart() {
			return new Promise(function (resolve, reject) {
				var day = moment().format('YYYY-MM-DD');
				getCallByDay(day).then(function (call_data) {
					var missed_call = 0;
					var incoming_call = 0;
					var outgoing_call = 0;
					var unknown = 0;
					// resolve(call_data);

					call_data.map(function (obj) {
						if (obj.type == '1000') {
							incoming_call++;
						} else if (obj.type == '1001') {
							outgoing_call++;
						} else if (obj.type == '1002') {
							missed_call++;
						} else {
							unknown++;
						}
					});

					var chart_data = [missed_call, incoming_call, outgoing_call, unknown];

					var myDoughnutChart = new Chart($('#call_type_chart'), {
						type: 'doughnut',
						data: {
							labels: ["Missed", "Incoming", "Outgoing", '?'],
							datasets: [{
								label: "Call type",
								data: chart_data,
								backgroundColor: [
									"#e65c53",
									"#8cd977",
									"#7bb5db",
								]
							}]
						},
						options: {
							legend: {
								labels: {
									fontSize: 8
								}
							}
						}
					});
					resolve();
				});
			});
		}

		function weeklyChart() {
			return new Promise(async function (resolve, reject) {
				var data = {
					labels: [],
					data: [],
					actual_call_count: [],
					call_duration: [],
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

					var call_duration = 0;
					var total_duration = 0;
					var daily_actual_call_count_total = 0;
					if (day_data.length > 0) {
						for (j = 0; j < day_data.length; j++) {
							var duration = day_data[j].duration;
							total_duration += +duration;
							if (day_data[j].duration > 0) {
								daily_actual_call_count_total += 1;
							}
						}
						if (total_duration > 60) {
							var call_minute = (total_duration / 60).toFixed(0);
							call_duration = call_minute + '.' + total_duration % 60;
						}
					}
					data.actual_call_count.push(daily_actual_call_count_total);
					data.total_call_deration.push(total_duration);
					data.call_duration.push(call_duration);
				}

				setChart(data);
				resolve();
				$('.status').prepend('<pre>' + JSON.stringify(data, null, '\t') + '</pre>');
			});
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
						borderColor: 'rgba(166, 166, 166, 1)',
						borderWidth: 1,
						type: 'line'
					}, {
						label: 'No of Actual Calls',
						data: sendData.actual_call_count,
						backgroundColor: 'rgba(78, 115, 223, 0)',
						borderColor: 'rgba(78, 115, 223, 1)',
						borderWidth: 2,
						type: 'line'
					}, {
						label: 'Call Duration',
						data: sendData.call_duration,
						backgroundColor: 'rgba(227, 227, 227)',
						borderColor: 'rgba(227, 227, 227)',
						borderWidth: 2,
					}]
				},
				options: {
					legend: {
						labels: {
							fontSize: 8
						}
					},
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



		if (window.plugins.callLog.hasReadPermission) {
			window.plugins.callLog.hasReadPermission(function () {
				successCallback();
			}, function () {
				window.plugins.callLog.requestReadPermission(function () {
					successCallback();
				}, function () {
					alert('Permission Denied');
				});
			});
		}

		/* if (window.plugins.callLog.requestReadPermission) {
			window.plugins.callLog.requestReadPermission(successCallback, errorCallback);
		} */



	}
};

app.initialize();