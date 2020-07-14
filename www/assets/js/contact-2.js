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



	getContacts: function () {
		return new Promise(function (resolve, reject) {
			navigator.contactsPhoneNumbers.list(function (contacts) {
				var data = contacts.map(function (obj) {
					if (!obj.thumbnail) {
						obj.thumbnail = './assets/img/user.png';
					}
					return obj;
				});
				resolve({
					data: data
				});
				$('.status').html('Error: <pre>' + JSON.stringify(data, null, '\t') + '</pre>');
			}, function (error) {
				// alert(error)
				$('.status').html('Error: <pre>' + error + '</pre>');
				resolve(error);
			});
		});
	},

	// Update DOM on a Received Event
	receivedEvent: function (id) {

		var self = this;
		var data_table = $('.contacts-table').DataTable({
			data: [],
			columns: [{
					data: {
						_: "thumbnail",
						display: function (data) {
							return '<img src="' + data.thumbnail + '" class="img-fluid rounded-circle" width="30" />';
						}
					}
				},
				{
					data: "displayName"
				},
				{
					data: {
						_: "phoneNumbers",
						display: function (data) {
							var numbers = '';
							if (data.phoneNumbers.length > 0) {
								numbers = data.phoneNumbers.map(function(elem){
									return elem.number || '';
								}).join(", ");
							} else {
								numbers = '';
							}
							return numbers;
						}
					},
				}
			]
		});

		$('.footer-loading').fadeIn();

		setTimeout(async function () {
			var contact_data = await self.getContacts();

			if (contact_data.data) {
				data_table.clear().rows.add(contact_data.data).draw();
			}
			$('.footer-loading').fadeOut();

		}, 600);


		$('.contacts-table').on('click', 'tbody tr', function (e) {
			var rowData = data_table.row($(this)).data();
			if (!rowData) {
				rowData = {};
			}
			$.get('assets/hb-view/contacts-details.html', function (tmpl_source) {
				var template = Handlebars.compile(tmpl_source);
				var html = template(rowData);
				$('.contacts-details-placeholder').html(html);
				$('#contacts_details_modal').modal('toggle');
				$('#contacts_details_modal .modal-body').css('height', window.innerHeight - 171);
				$('#contacts_details_modal .modal-body').css('max-height', window.innerHeight - 171);
			});
		});




	}
};

app.initialize();