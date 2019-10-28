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

	$('body').popover({
		selector: '[data-toggle="popover"]',
		html: true
	});
	$('body').tooltip({
		selector: '[data-toggle="tooltip"]'
	});

	$('body').on('click', '.show-sidenav', function (e) {
		e.preventDefault();
		$('.sidenav-wrapper').fadeIn();
	});
	$('body').on('click', '.close-nav', function (e) {
		e.preventDefault();
		$('.sidenav-wrapper').fadeOut();
	});
})();