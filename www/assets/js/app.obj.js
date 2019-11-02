"use strict";
var ajax_form_submit_result;
var zubizi = {
	loading_icon: function (id) {
		return '<div class="p-3" id="' + id + '"><i class="fas fa-circle-notch fa-spin fa-2x"></i></div>';
	},
	send_sms: function (meta) {
		$.ajax({
			method: "POST",
			url: "api/send_sms",
			data: meta,
			success: function (result) {
				if (result.status == 'success') {
					new PNotify({
						title: 'Success!',
						text: result.message,
						type: 'success'
					});
				} else if (result.status == 'error') {
					new PNotify({
						title: 'Oh No!',
						text: result.message,
						type: 'error'
					});
				} else {
					new PNotify({
						title: result.status,
						text: result.message,
						type: result.status
					});
				}
			}
		});
	},

	getLastNDays: function () {
		var days;
		if (arguments.length > 0) {
			days = arguments[0];
		} else {
			days = 7;
		}
		var result = [];
		for (var i = 0; i < days; i++) {
			var d = new Date();
			d.setDate(d.getDate() - i);
			result.push(moment(d).format('YYYY-MM-DD'));
		}
		return result;
	},

	hideSidebar: function () {
		console.log('hello2');

		return new Promise(function (resolve, reject) {
			$('.sidebar-toggle').click();
			setTimeout(function () {
				resolve();
			}, 400);
		});
	},


	getTimeFromTimestamp: function (timestamp) {
		function pad(num) {
			return ("0" + num).slice(-2);
		}
		var date = new Date(timestamp);
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
		return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds)
	},
	// files: function() {
	//     var promise = new Promise(function(resolve, reject) {
	//         var file = {
	//             img1: {
	//                 url: '/img/logo.png'
	//             }
	//         };
	//         resolve(file);
	//     });
	//     return promise;
	// },
	ajax_submit: function (selector, firstInput = '', callback = function () {}, modal = '') {
		/**
		 * simple ajax submit without validation
		 * simple jquery selector
		 * result data will be a json object
		 * and should have a message obj
		 * var result = {"status": "success", "message": "Success message"}
		 * var result = {"status": "error", "message": "Error message"}
		 */
		$('body').on('submit', selector, function (e) {
			e.preventDefault();
			$('.ajax_form_submit_loading').fadeToggle(256);
			var submit_btn = $(this).find('.btn');
			submit_btn.prop('disabled', true);


			var that = $(this);
			var form_method = that.attr('method');
			var form_action = that.attr('action');
			var form_data = that.serialize();
			var form_data_json = that.serializeArray();
			$.ajax({
				type: form_method,
				url: form_action,
				data: form_data_json,
				success: function (result) {
					//console.log(result.status);
					ajax_form_submit_result = result;
					$('.ajax_form_submit_loading').fadeToggle(256);
					submit_btn.prop('disabled', false);
					if (result.status == 'success') {
						new PNotify({
							title: 'Success!',
							text: result.message,
							type: 'success',
							// styling: {},
							addClass: ' animated fadeInBig ',
							modules: {
								Animate: {
									animate: true,
									inClass: 'fadeInBig',
									outClass: 'zoomOutRight'
								}
							}
						});
						that[0].reset();
						that.find('select').val(null).trigger('change');
						that.find(firstInput).focus();
						that.parents('.modal').modal('toggle');
						that.children('.modal').modal('toggle');
					} else if (result.status == 'error') {
						console.log(result.message);
						new PNotify({
							title: 'Oh No!',
							text: result.message,
							type: 'error',
							modules: {
								Animate: {
									animate: true,
									inClass: 'fadeInBig',
									outClass: 'zoomOutRight'
								}
							}
						});
					}
					callback(result, form_data_json);
					return ajax_form_submit_result;
				},
				error: function (err, err2, err3) {
					console.log(err, err2, err3);
					$('.ajax_form_submit_loading').fadeToggle(256);
					submit_btn.prop('disabled', false);
					new PNotify({
						title: 'Error!',
						text: 'Unexpected Error! Something went wrong',
						type: 'error',
						modules: {
							Animate: {
								animate: true,
								inClass: 'fadeInBig',
								outClass: 'zoomOutRight'
							}
						}
					});
				},
				always: function (data) {
					$('.ajax_form_submit_loading').fadeOut(256);
					submit_btn.prop('disabled', false);
				}
			});
		});
	},
	sum: function (selector) {
		var a = 0;
		$(selector).each(function () {
			a += +this.value;
		});
		return a;
	},
	reducer: function (a, b) {
		return +a + +b;
	},
	next_input: function (selector) {
		$('table tbody').on('keydown', selector, function (e) {
			if (e.which == 40) {
				e.preventDefault();
				$(this).closest('tr').next().find(selector).focus().select();
			}
			if (e.which == 38) {
				e.preventDefault();
				$(this).closest('tr').prev().find(selector).focus().select();
			}
		});
	},
	getSettings: function () {
		var promise = new Promise(function (resolve, reject) {
			$.ajax({
				url: '/api/settings',
				async: false,
				success: function (result) {
					resolve(result);
				},
				error: function (err, e2) {
					resolve(err);
				}
			});
		});
		return promise;
	},
	getFormData: function ($form) {
		var unindexed_array = $form.serializeArray();
		var indexed_array = {};

		$.map(unindexed_array, function (n, i) {
			indexed_array[n['name']] = n['value'];
		});

		return indexed_array;
	},

	openSmsModal: function (sms_data = {}, isAutoSubmit = 'no') {
		$.get('/hb-view/send-sms.html', function (result) {
			var smsTemplate = Handlebars.compile(result);
			var smsHtml = smsTemplate(sms_data);
			$('.send_sms_view').html(smsHtml);
			$('.send_sms_view .modal').modal();
			if (isAutoSubmit == 'yes') {
				$('.send_sms_view').find(':submit').click();
			}
		});
	},

	ajax_delete_row: function (api_url_w_get_req, the_DataTable) {
		footer_loading.fadeIn(256);
		(new PNotify({
			title: 'Confirmation Needed',
			text: 'Are you sure?',
			icon: 'glyphicon glyphicon-question-sign',
			hide: false,
			confirm: {
				confirm: true
			},
			buttons: {
				closer: false,
				sticker: false
			},
			history: {
				history: false
			},
			addclass: 'stack-modal',
			stack: {
				dir1: 'down',
				dir2: 'right',
				modal: true
			}
		})).get().on('pnotify.confirm', function () {
			$.ajax({
				url: api_url_w_get_req,
				success: function (result) {
					footer_loading.fadeOut(256);
					the_DataTable.ajax.reload(null, false);
					if (result.status === 'success') {
						new PNotify({
							title: 'Success!',
							text: result.message,
							type: 'success'
						});
					} else {
						new PNotify({
							title: 'Oh No!',
							text: result.message || 'Ooops! Some thing wrong happened. Please try later',
							type: 'error'
						});
					}
				}
			});
		}).on('pnotify.cancel', function () {
			footer_loading.fadeOut(256);
		});
		$('.ui-pnotify-action-button')[0].focus();
	},
	footer_totals: function (api, cols) {
		var totals = {};
		for (var i = 0; i < cols.length; i++) {
			totals[cols[i].total_name] = api.column(cols[i].column, {
				filter: 'applied',
				page: 'current'
			}).data().reduce(zubizi.reducer, 0);
			$(api.column(cols[i].column).footer()).text(parseFloat(totals[cols[i].total_name]).toFixed(2));
			$(cols[i].selector).text(parseFloat(totals[cols[i].total_name]).toFixed(2));
		}
		return totals;
	},
	get_url_parameter: function (sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	},
	downloadText: function (filename, text, dataType = 'text/plain') {
		/*
		    
		    let csvContent = "data:text/csv;charset=utf-8,";
		    csvContent += data.csv;
		    var encodedUri = encodeURI(csvContent);
		    var link = document.createElement("a");
		    link.setAttribute("href", encodedUri);
		    link.setAttribute("download", data.file_name);
		    document.body.appendChild(link);
		    link.click();

		*/
		var element = document.createElement('a');
		element.setAttribute('href', 'data:' + dataType + ';charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename || 'text');

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	},

	distraction_free_sales: function () {
		var hide_element = `.sales-sales-rate-column,
            .sales-rateXqty-column,
            .sales-taxable-amt-column,
            .sales-cgst-rate-column,
            .sales-cgst-amt-column,
            .sales-sgst-rate-column,
            .sales-sgst-amt-column,
            .sales-igst-rate-column,
            .sales-igst-amt-column,
            .sales-cess-rate-column,
            .sales-cess-amt-column,
            .sales-col-span,
            .subtotal_section,
            .total_discount_section,
            .total_taxable_amt_section,
            .total_cgst_section,
            .total_sgst_section,
            .total_igst_section,
            .total_cess_section,
            .total_box_section,
            .bulk_discount_section`;
		if ($('#distraction_free_sales_style').length <= 0) {
			$('head').append(`<style id="distraction_free_sales_style">
                ${hide_element} {
                    display: none;
                }
            </style>`);
			localStorage.distraction_free_sales = 'yes';
		} else {
			$('#distraction_free_sales_style').remove();
			localStorage.distraction_free_sales = 'no';
		}
	},

	checkGstn: function (gst) {
		var factor = 2,
			sum = 0,
			checkCodePoint = 0,
			i, j, digit, mod, codePoint, cpChars, inputChars;
		cpChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		inputChars = gst.trim().toUpperCase();

		mod = cpChars.length;
		for (i = inputChars.length - 1; i >= 0; i = i - 1) {
			codePoint = -1;
			for (j = 0; j < cpChars.length; j = j + 1) {
				if (cpChars[j] === inputChars[i]) {
					codePoint = j;
				}
			}
			digit = factor * codePoint;
			factor = (factor === 2) ? 1 : 2;
			digit = (digit / mod) + (digit % mod);
			sum += Math.floor(digit);
		}
		checkCodePoint = ((mod - (sum % mod)) % mod);

		return gst + cpChars[checkCodePoint];
	},

	validateGstin: function (field) {
		var input_gst = field.val();
		var this_form = field.parents('form');
		var submit_btn = this_form.find('.btn-primary');
		if (input_gst != '') {
			var substrgst = input_gst.substr(0, 14);
			if (input_gst === this.checkGstn(substrgst)) {
				submit_btn.prop('disabled', false);
				$('.gstin_validation_status').html('');
			} else {
				submit_btn.prop('disabled', true);
				$('.gstin_validation_status').text('Invalid GSTIN');
			}
		} else {
			submit_btn.prop('disabled', false);
			$('.gstin_validation_status').html('');
		}
	},

	getYears: function (start_year = 2015) {
		var years = [];

		var current_year = +moment().format('Y') + 1;
		for (var start_year; start_year < current_year; start_year++) {
			var start_date_last_two_digit = moment(start_year, "YYYY").format("YY");
			var session_start_year = +start_date_last_two_digit + +1;
			years.push({
				id: start_year,
				text: start_year + "-" + session_start_year,
				start_date: start_year + '-04-01'
			});
		}
		return years;
	},

	/**
	 *
	 * Get Current Session
	 *
	 * in date param enter date that to be calculated
	 *
	 */
	getSession: function (date = '') {
		if (!date) {
			date = moment().format('YYYY-MM-DD');
		}
		var sesion = "Invalid Date";
		var start_date = "Invalid Date";
		var end_date = "Invalid Date";
		var months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
		var months_with_yr = [];

		if (!(moment(date, 'YYYY-MM-DD', true).isValid())) {
			sesion = "Invalid Date";
			start_date = "Invalid Date";
		} else {
			var year = moment(date).format('YYYY');
			var nextYear = +year + 1;
			var preYear = +year - 1;

			var current_session = year + '-' + moment(nextYear, 'YYYY').format('YY');
			var current_year_start_date = `${year}-04-01`;
			var current_year_end_date = `${+year +1}-03-31`;



			var pre_session = preYear + '-' + moment(year, 'YYYY').format('YY');
			var pre_year_start_date = `${preYear}-04-01`;
			var pre_year_end_date = `${year}-03-31`;






			var session_start_date = `${year}-04-01`;
			var session_start_month = `${year}-04`;
			var duration = moment(date).diff(moment(session_start_date), 'months', true);

			for (let i = 0; i < months.length; i++) {
				const month = months[i];
				if (i <= 8) {
					months_with_yr.push({
						month_with_yr: `${month}-${year}`,
						month: month,
						start_date: moment(`${year}-${month}`, 'YYYY-MMM').startOf('month').format('YYYY-MM-DD'),
						end_date: moment(`${year}-${month}`, 'YYYY-MMM').endOf('month').format('YYYY-MM-DD'),
					});
				} else {
					months_with_yr.push({
						month_with_yr: `${month}-${+year + 1}`,
						month: month,
						start_date: moment(`${+year + 1}-${month}`, 'YYYY-MMM').endOf('month').format('YYYY-MM-DD'),
						end_date: moment(`${+year + 1}-${month}`, 'YYYY-MMM').endOf('month').format('YYYY-MM-DD'),
					});
				}
			}


			if (duration >= 0) {
				sesion = current_session;
				start_date = current_year_start_date;
				end_date = current_year_end_date;
			} else if (duration < 0) {
				sesion = pre_session;
				start_date = pre_year_start_date;
				end_date = pre_year_end_date;
			} else {
				sesion = "Invalid Date";
				start_date = "Invalid Date";
			}

		}
		return {
			check_date: moment(date).format('DD/MM/YYYY'),
			session: sesion,
			start_date: start_date,
			end_date: end_date,
			months: months_with_yr,
		};
	},
	/*
	 * End get Current Session
	 * 
	 */


	checkPermission: function (the_permission) {
		return new Promise(function (resolve, reject) {
			try {
				var permissions = cordova.plugins.permissions;
				permissions.hasPermission(permissions[the_permission], function (status) {
					if (status.hasPermission) {
						resolve({
							status: true,
							message: "Already Permitted"
						});
					} else {
						permissions.requestPermission(permissions[the_permission], function (status) {
							if (!status.hasPermission) {
								alert('Permission denied');
								resolve({
									status: false,
									message: "Permission Denied 1"
								});
							} else {
								resolve({
									status: true,
									message: "Permitted"
								});
							}
						}, function () {
							alert('Permission denied');
							resolve({
								status: false,
								message: "Permission Denied 2"
							});
						});
					}
				});
			} catch (error) {
				alert(error);
				resolve({
					status: false,
					message: "Unexpected error: <pre>"+ error +"</pre>"
				});
			}
		});
	}

};