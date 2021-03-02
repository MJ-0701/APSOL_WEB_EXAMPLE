function JournalForm(container, config) {

	var form;
	var toolbar;
	var journalId = 0;
	var updater;
	var receivers;
	var layout;
	var me = this;

	var items;

	this.clear = function() {
		journalId = 0;
		/* if( receivers ) receivers.clear(); */
		/*items.clear();*/
		form.clear();
		form.reset();
		form.setItemValue('kind', config.kind);
		form.setItemValue('code', 0);
		form.setItemValue('state', 'SD0001');
	};

	this.load = function(_journalId) {
		journalId = _journalId;
		reload();
	};

	function reload() {

		if (!form)
			return;

		if (journalId == 0)
			return;

		var code = journalId;

		me.clear();

		container.progressOn();

		$.get('journal/info', {
			code : code
		}, function(data) {
			console.log(data);
			form.setFormData(data.form);
			form.setItemValue('code', data.code);
			journalId = data.code;
			/*
			 * if( ) receivers.setRows(data.receivers);
			 */

			/*if (data.items)
				items.setRows(data.items);*/

			container.progressOff();
		});

	}

	function reset() {
		// receivers.clear();
		/*items.clear();*/

		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
		form.setItemValue('code', 0);
		form.setItemValue('kind', config.kind);
		form.setItemValue('date', new Date());
		form.setItemFocus('date');
	}

	function update() {
		container.progressOn();
		updater.update(journalId);
	}

	function remove() {

		dhtmlx.confirm({
			title : "업무 일지를 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 내용은 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.deleteUrl, {
						code : journalId
					}, function(result) {

						if (result.error) {
							dhtmlx.alert({
								title : "업무 일지를 삭제할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {

							if (config.callback.onDeleted) {
								config.callback.onDeleted(result);
							}

							journalId = 0;
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

		layout.cells("a").hideHeader();/*
		// layout.cells("b").setText("결재자");

		var tabbar = layout.cells("b").attachTabbar();

		tabbar.addTab("a1", "품 목", null, null, true);
		tabbar.addTab("a2", "첨부파일");
		tabbar.addTab("a3", "결재 현황");

		setupItem(tabbar.cells("a1"));

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		// 

		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {

			case 'btnAdd':
				journalId = 0;
				reset();
				break;

			case 'btnUpdate':
				update();
				break;

			case 'btnDelete':
				remove();
				break;
			}

		});*/
		form = layout.cells("a").attachForm();

		form.loadStruct(config.form.xml, function() {

			form.setItemValue('date', new Date());

			FormBascodePopup(form, 'workName', config.workPrefix, function(cnt, data) {

				if (data) {
					form.setItemValue('work', data.uuid);
					form.setItemValue('workName', data.name);
				} else {
					form.setItemValue('work', '');
				}

			}, function(data) {
				form.setItemValue('work', '');
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

		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			console.log(result);
			journalId = result.newId;
			form.setItemValue('code', journalId);

			if (result.error || result.invalids) {
				container.progressOff();
			}

			reload();

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		}, function(id, data) {

			/*data.receivers = receivers.getRows();
			data.items = items.getRows();*/

			return data;
		});

		updater.setupEvents('content');
	};

	function setupItem(cell) {
		items = new ContractItem(cell, {
			grid : {
				xml : config.item.xml,
				callback : {
					onBeforeReload : function() {
						// sendContactForm.clear();
					},
					onRowSelect : function(grid, rowId) {
						// sendContactForm.load(rowId);
					},
					onBeforeAdded : function() {

						return true;
					}
				}
			},
			toolbar : {
				xml : 'xml/contract/item/toolbar.xml'
			},
			iconsPath : "img/48/",
			imageUrl : imageUrl
		});
		items.init();
	}

	function receiverDialog() {
		receivers = new Receiver(tabbar.cells("a1"), {
			title : '업무발신함',
			grid : {
				xml : 'xml/receiver/grid2.xml',
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