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

	modalElement: null,
	dismissModal: function () {
		if (app.modalElement) {
			app.modalElement.dismiss().then(function () {
				app.modalElement = null;
			});
		}
	},

	// Update DOM on a Received Event
	receivedEvent: function (id) {

		var self = this;
		var data_table = $('.contacts-table').DataTable({
			data: [],
			"order": [
				[1, "asc"]
			],
			fnDrawCallback: function (oSettings) {
				$(oSettings.nTHead).hide();
			},
			"dom": '<"top">rt<"bottom"ip><"clear">',
			// "dom": '<"top"i>rt<"bottom"><"clear">',
			columns: [{
					data: {
						_: "thumbnail",
						display: function (data) {
							return '<img src="' + data.thumbnail + '" class="img-fluid rounded-circle" width="30" />';
						}
					}
				},
				{
					className: "display-name-column",
					data: "displayName"
				},
				{
					className: "call-button-column",
					data: {
						_: "phoneNumbers",
						display: function (data) {
							return `<ion-icon name="call"></ion-icon>`;
						}
					},
				}
			]
		});

		$('.footer-loading').fadeIn();



		var hammertime = new Hammer(document.getElementById('contact-modal-placeholder'));
		hammertime.on('pandown', function (ev) {
			// console.log(ev);
			app.dismissModal();
		});

		setTimeout(async function () {

			var contact_data = await self.getContacts();

			if (contact_data.data) {
				if (contact_data.data.length > 0) {
					// console.log(contact_data.data[0]);
					data_table.clear().rows.add(contact_data.data).draw();
				} else {
					data_table.clear().rows.add([{
						thumbnail: "",
						displayName: "Hello",
						phoneNumbers: [{
							number: "9836973363"
						}]
					}]).draw();
				}
			}
			$('.footer-loading').fadeOut();

		}, 600);

		const refresher = document.getElementById('refresher');
		refresher.addEventListener('ionRefresh', () => {
			setTimeout(async function () {

				var contact_data = await self.getContacts();

				if (contact_data.data) {
					if (contact_data.data.length > 0) {
						// console.log(contact_data.data[0]);
						data_table.clear().rows.add(contact_data.data).draw();
					} else {
						data_table.clear().rows.add([{
							thumbnail: "",
							displayName: "Hello",
							phoneNumbers: ["9836973363"]
						}]).draw();
					}
				}
				$('.footer-loading').fadeOut();
				refresher.complete();
			}, 1500);
		});

		$.get('assets/hb-view/contacts-details.html', function (tmpl_source) {
			customElements.define('modal-content', class extends HTMLElement {
				connectedCallback() {
					var template = Handlebars.compile(tmpl_source);
					var html = template(app.modalElement.componentProps);

					this.innerHTML = html;
				}
			});
		});

		$('.contacts-table').on('click', 'tbody tr', function (e) {
			var rowData = data_table.row($(this)).data();
			if (!rowData) {
				rowData = {};
			}
			if (rowData.phoneNumbers) {
				console.log(rowData);
				
				rowData.phoneNumbers = rowData.phoneNumbers.map(function (obj) {
					var n = obj.normalizedNumber;
					obj.number2 = obj.number;
					obj.number = n.trim(n).substr((n.length - 10), n.length).replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
					console.log(obj.number);
					
					
					return obj;
				});
				// console.log(rowData.number);
				
			}


			app.modalElement = document.createElement('ion-modal');
			app.modalElement.componentProps = rowData;
			app.modalElement.component = 'modal-content';
			app.modalElement.cssClass = 'contact-modal';


			// present the modal
			$('.modal-placeholder').html(app.modalElement);
			return app.modalElement.present();
		});


		/* $('#contact-search').on('keyup change', function () {
			data_table.search($('#contact-search').val()).draw();
		}); */

		const searchbar = document.querySelector('ion-searchbar');
		searchbar.addEventListener('ionInput', function (e) {
			var query = e.target.value.toLowerCase();
			data_table.search(query).draw();
		});



		const infiniteScroll = document.getElementById('infinite-scroll');
		infiniteScroll.addEventListener('ionInfinite', async function () {

			setTimeout(() => {
				var info = data_table.page.info();
				// console.log(info);

				info.page++;
				if (info.pages >= info.page) {
					data_table.page.len((info.length) + 10).draw();
					infiniteScroll.complete();
					console.log('Done');
				} else {
					console.log('No More Data');
					infiniteScroll.disabled = true;
				}
			}, 100);
		});
	}
};

app.initialize();