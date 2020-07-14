(function () {
	"use strict"; // Start of use strict

	// $(':root').css('--windowHeight', window.innerHeight);
	$(':root').css("--windowHeight", window.innerHeight);

	if ($.isFunction($.fn.dataTable)) {
		$.extend(true, $.fn.dataTable.defaults, {
			columnDefs: [{
				targets: 'actions',
				className: 'actions',
				searchable: false,
				sortable: false
			}],
			deferRender: true,
			lengthMenu: [5, 10, 25, 50, 100, 250, 500],
			pageLength: 10,
			/* dom: 'Bfrtip',
			buttons: [
				'pageLength',
				'colvis'
			],*/
			language: {
				search: '',
				searchPlaceholder: 'Search . . .'
			},
			// deferLoading: 57,
			processing: true,
			stateSave: true,
			stateDuration: 0,
			responsive: true,
			stateSaveParams: function (settings, data) {
				data.search.search = '';
				data.start = 0;
				data.columns.map(function (column) {
					column.search.search = '';
				});
			},
			stateSaveCallback: function (settings, data) {
				localStorage.setItem($(this).attr('id'), JSON.stringify(data));
			},
			stateLoadCallback: function () {
				return JSON.parse(localStorage.getItem($(this).attr('id')));
			}
		});
	}
	// PNotify.prototype.options.styling = "bootstrap4";
	// PNotify.prototype.options.styling = "fontawesome";

	$('body').on('click', '[data-toggle="make_call"]', function (e) {
		e.preventDefault();
		$('.status').prepend('clicked call </br>');
		var number = $(this).data('number');
		if (number != '') {

			zubizi.checkPermission('CALL_PHONE').then(function (data) {
				$('.status').prepend('calling: ' + number + ' </br>');
				window.plugins.CallNumber.callNumber(function (result) {
					$('.status').prepend('Call Made To ' + number + ': <pre>' + JSON.stringify(result, null, '\t') + '</pre>');
				}, function (error) {
					alert('Cannot Make Call');
					$('.status').prepend('Error calling To ' + number + ': <pre>' + JSON.stringify(error, null, '\t') + '</pre>');
				}, number);
			});


		} else {
			console.log('no number');
			$('.status').prepend('No Number: ' + number + ' </br>');
		}
	});

	$('body').on('click', '.menu-link', function (e) {
		e.preventDefault();
		var location_href = $(this).data('href');
		if (location_href != '') {
			location.href = location_href;
		}
	});

})();
document.addEventListener('deviceready', function () {
	console.log('cordova.plugins.CordovaCall is now available');
	var cordovaCall = cordova.plugins.CordovaCall; //not necessary, but might be more convenient
	// cordova.plugins.CordovaCall.receiveCall('Sk Saif');
});