function MessageSendForm(container, config) {

	var form;
	var toolbar;
	var messageId = 0;
	var updater;
	var receivers;
	var layout = container.attachLayout("2E");
	var me = this;
	var recversWnd;

	this.clear = function() {
		messageId = 0;
		receivers.clear();
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
		form.setItemValue('state', 'SD0001');
	};

	this.load = function(_messageId) {

		messageId = _messageId;
		reload();
	};

	function reload() {

		if (!form)
			return;

		if (messageId == 0)
			return;

		var code = messageId;

		me.clear();

		container.progressOn();

		$.get('message/info', {
			code : code
		}, function(data) {
			console.log(data);
			form.setFormData(data.form);
			form.setItemValue('code', data.code);
			messageId = data.code;
			receivers.setRows(data.receivers);
			container.progressOff();
		});

	}

	function reset() {
		receivers.clear();
		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
		form.setItemValue('code', 0);
		form.setItemValue('state', 'SD0001');
	}

	function send() {
		dhtmlx.confirm({
			title : "업무 연락을 [발신]하시겠습니까?",
			type : "confirm-warning",
			text : "발신된 연락은 수정할 수 없습니다.",
			callback : function(r) {
				if (r) {
					form.setItemValue('state', 'SD0002');
					update();
				}
			}
		});
	}

	function update() {
		container.progressOn();
		updater.update(messageId);
	}

	function remove() {

		dhtmlx.confirm({
			title : "업무 연락을 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 내용은 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.deleteUrl, {
						code : messageId
					}, function(result) {

						if (result.error) {
							dhtmlx.alert({
								title : "업무연락을 삭제할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {

							if (config.callback.onDeleted) {
								config.callback.onDeleted(result);
							}

							messageId = 0;
							reset();
						}

						container.progressOff();
					});
				}
			}
		});

	}

	this.init = function() {

		layout = container.attachLayout("1C");

		layout.cells("a").hideHeader();

		toolbar = layout.cells("a").attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/message/send/formToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {

			case 'btnAdd':
				messageId = 0;
				reset();
				recversWnd.show();
				break;

			case 'btnUpdate':
				update();
				break;

			case 'btnSend':
				send();
				break;

			case 'btnDelete':
				remove();
				break;
			}

		});
		form = layout.cells("a").attachForm();

		form.loadStruct('xml/message/send/form.xml', function() {

			FormBascodePopup(form, 'kindName', 'WK', function(cnt, data) {

				if (data) {
					form.setItemValue('kind', data.uuid);
					form.setItemValue('kindName', data.name);
				} else {
					form.setItemValue('kind', '');
				}

			}, function(data) {
				form.setItemValue('kind', '');
			});

			FormCustomerPopup(form, 'customerName', function(cnt, data) {
				console.log(data);
				if (data) {
					form.setItemValue('customer', data.code);
					form.setItemValue('customerName', data.name);
				} else {
					form.setItemValue('customer', '');
				}
			}, function() {
				form.setItemValue('customer', '');
			});

		});

		form.attachEvent("onButtonClick", function(name) {
			if (name === 'receiverBtn') {
				recversWnd.show();
			}
		});
		
		form.attachEvent("onFocus", function(name){
			if (name === 'receivers') {
				recversWnd.show();
			}
		});

		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			console.log(result);
			messageId = result.newId;
			form.setItemValue('code', messageId);

			if (result.error || result.invalids) {
				container.progressOff();
			} else {
				reload();
			}

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		}, function(id, data) {

			data.receivers = receivers.getRows();

			return data;
		});

		recversWnd = new Dialog({
			width : 600,
			height : 350,
			title : "수신자",
			name : "receivers",
			layout : '1C',
			callback : {
				onClosed : function(name, title) {
					form.setItemValue('receivers', receivers.getNames());
					form.setItemFocus('type');
				},
				onCreated : function(layout, wnd) {
					layout.cells("a").hideHeader();
					receivers = new Receiver(layout.cells("a"), {
						title : '업무발신함',
						grid : {
							xml : 'xml/receiver/grid.xml',
							callback : {
								onBeforeReload : function() {
									// sendContactForm.clear();
								},
								onRowSelect : function(grid, rowId) {
									// sendContactForm.load(rowId);
								}
							}
						},
						toolbar : {
							xml : 'xml/receiver/toolbar.xml'
						},
						iconsPath : "img/48/",
						imageUrl : imageUrl
					});
					receivers.init();
				}
			}
		});

		recversWnd.init();

	};

}