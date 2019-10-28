(function ($) {
	"use strict"; // Start of use strict

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

	// Toggle the side navigation
	$("#sidebarToggle, #sidebarToggleTop").on('click', function (e) {
		$("body").toggleClass("sidebar-toggled");
		$(".sidebar").toggleClass("toggled");
		if ($(".sidebar").hasClass("toggled")) {
			$('.sidebar .collapse').collapse('hide');
		}
	});

	// Close any open menu accordions when window is resized below 768px
	$(window).resize(function () {
		if ($(window).width() < 768) {
			$('.sidebar .collapse').collapse('hide');
		}
	});

	// Prevent the content wrapper from scrolling when the fixed side navigation hovered over
	$('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function (e) {
		if ($(window).width() > 768) {
			var e0 = e.originalEvent,
				delta = e0.wheelDelta || -e0.detail;
			this.scrollTop += (delta < 0 ? 1 : -1) * 30;
			e.preventDefault();
		}
	});

	// Scroll to top button appear
	$(document).on('scroll', function () {
		var scrollDistance = $(this).scrollTop();
		if (scrollDistance > 100) {
			$('.scroll-to-top').fadeIn();
		} else {
			$('.scroll-to-top').fadeOut();
		}
	});

	// Smooth scrolling using jQuery easing
	$(document).on('click', 'a.scroll-to-top', function (e) {
		var $anchor = $(this);
		$('html, body').stop().animate({
			scrollTop: ($($anchor.attr('href')).offset().top)
		}, 1000, 'easeInOutExpo');
		e.preventDefault();
	});

})(jQuery); // End of use strict