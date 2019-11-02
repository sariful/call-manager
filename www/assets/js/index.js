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

		$('#start_date').val(moment().format('YYYY-MM-DD'));
		$('#end_date').val(moment().add(1, 'days').format('YYYY-MM-DD'));

		var data_table = $('.calls-table').DataTable({
			data: [],
			columns: [{
					className: "user-image",
					data: "thumbPhoto",
					render: function (data) {
						return '<img src="' + data + '" class="img-fluid rounded-circle" width="25"/>';
					}
				},
				{
					data: null,
					className: "user-name",
					render: function (data) {
						if (data.name) {
							return data.name;
						} else {
							return data.number;
						}
					}
				},
				{
					className: "small call-date-time",
					data: {
						_: "date_format",
						sort: "date",
						display: function (data) {
							return '<span class="text-muted small">' + moment(data.date, 'x').format('DD/MM/YY') + '</span>&nbsp;&nbsp;' +
								'<span class="small">' + moment(data.date, 'x').format('hh:mm:ss a') + '</span>';
						}
					}
				},
				{
					className: "small call-duration",
					data: {
						_: "duration_actual",
						sort: "duration_actual",
						display: function (data) {
							return data.duration;
						}
					},
				},
			]
		});

		$('.calls-table').on('click', 'tbody tr', function (e) {
			var rowData = data_table.row($(this)).data();
			if (!rowData) {
				rowData = {};
			}
			$.get('assets/hb-view/call-details.html', function (tmpl_source) {
				var template = Handlebars.compile(tmpl_source);
				var html = template(rowData);
				$('.call-details-placeholder').html(html);
				$('#call_details_modal').modal('toggle');
				$('#call_details_modal .modal-body').css('height', window.innerHeight - 171);
				$('#call_details_modal .modal-body').css('max-height', window.innerHeight - 171);
			});
		});


		function successCallback() {
			$('.footer-loading').fadeIn();
			var sendData;
			if (arguments) {
				sendData = arguments[0];
			} else {
				sendData = {
					start_date: moment().format('YYYY-MM-DD'),
					end_date: moment().add(1, 'days').format('YYYY-MM-DD')
				};
			}
			var filters = [{
					"name": "date",
					"value": moment(sendData.start_date).format('x'),
					"operator": ">="
				},
				{
					"name": "date",
					"value": moment(sendData.end_date).format('x'),
					"operator": "<="
				}
			];
			setTimeout(() => {
				window.plugins.callLog.getCallLog(filters, function (call_data) {
					var data = call_data.map(function (obj) {
						if (!obj.thumbPhoto) {
							obj.thumbPhoto = 'assets/img/user.png';
						} else {
							if (obj.thumbPhoto == '') {
								obj.thumbPhoto = 'assets/img/user.png';
							}
						}

						if (!obj.photo) {
							obj.photo = 'assets/img/user.png';
						} else {
							if (obj.photo == '') {
								obj.photo = 'assets/img/user.png';
							}
						}
						obj.date_format = moment(obj.date, 'x').format('DD/MM/YY hh:mm:ss a');

						obj.duration_actual = obj.duration;
						if (obj.duration >= 60) {
							var duration_min = (obj.duration_actual / 60).toFixed(0);
							obj.duration = duration_min + ' Min ' + (obj.duration_actual % 60) + ' Sec';
						} else {
							obj.duration = obj.duration + ' Sec';
						}

						return obj;
					});
					data_table.clear().rows.add(data).draw();
					// $('.status').html('<pre>' + JSON.stringify(data, null, '\t') + '</pre>');
					$('.footer-loading').fadeOut();
				}, function (error) {
					$('.status').html('Error: <pre>' + error + '</pre>');
					$('.footer-loading').fadeOut();
				});
			}, 500);
		}

		function errorCallback(error) {
			$('.status').html('Error: <pre>' + error + '</pre>');
		}


		if (window.plugins.callLog.hasReadPermission) {
			window.plugins.callLog.hasReadPermission(function () {
				$('.range-form').submit();
			}, errorCallback);
		}

		if (window.plugins.callLog.requestReadPermission) {
			window.plugins.callLog.requestReadPermission(function () {
				$('.range-form').submit();
			}, errorCallback);
		}

		$('.range-form').on('submit', function (e) {
			e.preventDefault();
			successCallback({
				start_date: $('#start_date').val(),
				end_date: $('#end_date').val(),
			});
		});

		$('#start_date, #end_date').on('change', function () {
			$(this).parents('form').submit();
		});
	}
};

app.initialize();