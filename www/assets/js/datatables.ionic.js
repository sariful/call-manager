/*! DataTables Bootstrap 3 integration
 * ©2011-2015 SpryMedia Ltd - datatables.net/license
 */

/**
 * DataTables integration for Bootstrap 3. This requires Bootstrap 3 and
 * DataTables 1.10 or newer.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
 * for further information.
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net'], function ($) {
			return factory($, window, document);
		});
	} else if (typeof exports === 'object') {
		// CommonJS
		module.exports = function (root, $) {
			if (!root) {
				root = window;
			}

			if (!$ || !$.fn.dataTable) {
				$ = require('datatables.net')(root, $).$;
			}

			return factory($, root, root.document);
		};
	} else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document, undefined) {
	'use strict';
	var DataTable = $.fn.dataTable;


	/* Set the defaults for DataTables initialisation */
	$.extend(true, DataTable.defaults, {
		renderer: 'bootstrap'
	});


	/* Default class modification */
	// $.extend(DataTable.ext.classes, {
	// 	sWrapper: "dataTables_wrapper dt-bootstrap4",
	// 	sFilterInput: "form-control form-control-sm",
	// 	sLengthSelect: "custom-select custom-select-sm form-control form-control-sm",
	// 	sProcessing: "dataTables_processing card",
	// 	sPageButton: "paginate_button page-item"
	// });


	/* Bootstrap paging button renderer */
	DataTable.ext.renderer.pageButton.bootstrap = function (settings, host, idx, buttons, page, pages) {
		var api = new DataTable.Api(settings);
		var classes = settings.oClasses;
		var lang = settings.oLanguage.oPaginate;
		var aria = settings.oLanguage.oAria.paginate || {};
		var btnDisplay, btnProp, btnColor, counter = 0;

		var attach = function (container, buttons) {
			var i, ien, node, button;
			var clickHandler = function (e) {
				e.preventDefault();
				if (!$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action) {
					api.page(e.data.action).draw('page');
				}
			};

			for (i = 0, ien = buttons.length; i < ien; i++) {
				button = buttons[i];
				// console.log();


				if ($.isArray(button)) {
					attach(container, button);
				} else {
					btnDisplay = '';
					btnProp = '';
					btnColor = '';

					switch (button) {
						case 'ellipsis':
							btnDisplay = '&#x2026;';
							btnColor = 'light';
							btnProp = '';
							break;

						case 'first':
							btnDisplay = lang.sFirst;
							btnColor = (page > 0 ? '' : 'light');
							btnProp = (page > 0 ? '' : ' disabled');
							break;

						case 'previous':
							btnDisplay = lang.sPrevious;
							btnColor = (page > 0 ? '' : 'light');
							btnProp = (page > 0 ? '' : ' disabled');
							break;

						case 'next':
							btnDisplay = lang.sNext;
							btnColor = (page < pages - 1 ? '' : 'light');
							btnProp = (page < pages - 1 ? '' : ' disabled');
							break;

						case 'last':
							btnDisplay = lang.sLast;
							btnColor = (page < pages - 1 ? '' : 'light');
							btnProp = (page < pages - 1 ? '' : ' disabled');
							break;

						default:
							btnDisplay = button + 1;
							btnColor = page === button ? 'primary' : '';
							btnProp = page === button ? 'disabled' : '';
							break;
					}

					if (btnDisplay) {
						// console.log(btnColor, button);
						
						node = $(`<ion-button size="small" color="${btnColor || 'light'}" ${btnProp}>`)
							.html(btnDisplay)
							.appendTo(container);

						settings.oApi._fnBindAction(
							node, {
								action: button
							}, clickHandler
						);

						counter++;
					}
				}
			}
		};

		// IE9 throws an 'unknown error' if document.activeElement is used
		// inside an iframe or frame. 
		var activeEl;

		try {
			// Because this approach is destroying and recreating the paging
			// elements, focus is lost on the select button which is bad for
			// accessibility. So we want to restore focus once the draw has
			// completed
			activeEl = $(host).find(document.activeElement).data('dt-idx');
		} catch (e) {}

		attach(
			$(host).empty().html('<div class="pagination"/>').children('div'),
			buttons
		);

		if (activeEl !== undefined) {
			$(host).find('[data-dt-idx=' + activeEl + ']').focus();
		}
	};


	return DataTable;
}));