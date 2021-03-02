function ContractForm(container, config) {
	var form;
	var toolbar;
	var contractId = 0;
	var updater;
	var items;
	var penalties;
	var layout;
	var me = this;
	var vanWnd;
	var fileUploader;

	this.modify = function() {

		//TODO 종결된 계약은 변경할 수 없습니다.
		//TODO 변경시 색상변경
		//TODO 종결도 색상변경
		if (contractId == 0) {

			dhtmlx.alert({
				title : "계약 내용을 변경할 수 없습니다.",
				type : "alert-error",
				text : "저장되지 않은 계 약은 변경할 수 없습니다."
			});

		} else {
			contractId = 0;
			form.setFocusOnFirstActive();
			form.setItemValue('code', 0);
			form.setItemValue('kind', 'RK0002');
			form.setItemValue('kindName', '변경');
			form.setItemValue('date', new Date());
			// dhxform_obj_dhx_web
			$("#contForm").parents('.dhxform_obj_dhx_web').css("background-color", "#f9dada");
		}

	};

	this.clear = function() {
		contractId = 0;
		fileUploader.clear();
		penalties.clear();
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
		form.setItemValue('kind', 'RK0001');
		form.setItemValue('kindName', '신규');
		form.setItemValue('date', new Date());
		form.setItemValue('period', 0);
				
		// form.setItemValue('state', 'SD0001');
	};

	this.load = function(_contractId) {

		contractId = _contractId;

		reload();
	};

	function reload() {

		if (!form)
			return;

		if (contractId == 0)
			return;

		var code = contractId;

		me.clear();

		fileUploader.setParentId(code);
		container.progressOn();

		$.get('contract/info', {
			code : code
		}, function(data) {
			
			console.log(data);
			
			container.progressOff();
			
			if( !data.code )
				return;

			
			form.setFormData(data.form);
			form.setItemValue('code', data.code);
			contractId = data.code;

			if (data.penalties)
				penalties.setRows(data.penalties);

			if (data.items)
				items.setRows(data.items);			
		});

	}

	function reset() {
		items.clear();
		penalties.clear();
		fileUploader.clear();
		form.clear();
		form.reset();
		// form.setFocusOnFirstActive();
		form.setItemValue('code', 0);
		form.setItemValue('kind', 'RK0001');
		form.setItemValue('kindName', '신규');
		form.setItemValue('date', new Date());
	}

	function update() {
		container.progressOn();
		updater.update(contractId);
	}

	function remove() {

		dhtmlx.confirm({
			title : "계약 내용을 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 내용은 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.deleteUrl, {
						code : contractId
					}, function(result) {

						if (result.error) {
							dhtmlx.alert({
								title : "계약 내용을 삭제할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {

							if (config.callback.onDeleted) {
								config.callback.onDeleted(result);
							}

							contractId = 0;
							reset();
						}

						container.progressOff();
					});
				}
			}
		});

	}

	function setupPenalty(cell) {
		penalties = new ContractPenalty(cell, {
			grid : {
				xml : 'xml/contract/penalty/grid.xml',
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
				xml : 'xml/contract/penalty/toolbar.xml'
			},
			iconsPath : "img/48/",
			imageUrl : imageUrl,
			callback : {
				onBeforeParams : function(){
					return "";
				},
				onInserted : function(grid, id, data){
					
				}
			}
		});
		penalties.init();
	}

	function setupItem(cell) {
		items = new ContractItem(cell, {
			grid : {
				xml : 'xml/contract/item/grid.xml',
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
			imageUrl : imageUrl,
			callback : {
				onBeforeParams : function(){
					return "";
				},
				onInserted : function(grid, id, data){
					
				}
			}
		});
		items.init();
	}

	function setupVault(cell) {
		fileUploader = new Files(cell, {
			iconsPath : "img/48/",
			imageUrl : imageUrl,
			name : "contractFile",
			parentName : "계약서",
			uploadUrl : 'contractFile/upload',
			recordUrl : 'contractFile/records',
			deleteUrl : 'contractFile/delete',

			grid : {
				xml : "xml/contract/file/grid.xml"
			},
			toolbar : {
				xml : "xml/contract/file/toolbar.xml"
			},
			form : {
				xml : "xml/contract/file/form.xml"
			},

			callback : {}
		})

		fileUploader.init();
	}
	
	function updateToDate(){
		
		var period = Number( form.getItemValue('period') );
		var fromDate = new Date( form.getItemValue("fromYear"), Number( form.getItemValue("fromMonth") )-1, 1);
		
		console.log(period);
		fromDate.setMonth(fromDate.getMonth() + period);
		
		form.setItemValue("toYear", fromDate.getFullYear());
		form.setItemValue("toMonth", fromDate.getMonth()+1);
	}

	this.init = function() {

		// container

		layout = container.attachLayout("2E");

		layout.cells("a").hideHeader();
		layout.cells("b").hideHeader();

		layout.cells("a").setWidth(800);

		var tabbar = layout.cells("b").attachTabbar();
		tabbar.addTab("a1", "항 목", null, null, true);
		tabbar.addTab("a2", "패널티");
		tabbar.addTab("a3", "첨부파일");

		setupItem(tabbar.cells("a1"));
		setupPenalty(tabbar.cells("a2"));
		setupVault(tabbar.cells("a3"));

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/contract/formToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {

			case 'btnAdd':
				contractId = 0;
				reset();

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

		form.loadStruct('xml/contract/form.xml', function() {

			FormBascodePopup(form, 'kindName', 'RK', function(cnt, data) {

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
			if (name === 'vanBtn') {
				vanWnd.show();
			}

			else if (name === 'btnFile') {
				var fileInp = form.getInput('file');
				$(fileInp).trigger('click');
			}
		});

		form.attachEvent("onFocus", function(name) {
		});

		form.attachEvent("onChange", function(name) {
			if (name === 'file') {
				console.log(name);
			}
			
			if( name == "period"){
				var period = Number( form.getItemValue("period") );
				console.log(period);
				if( !period )
					form.setItemValue("period", 0);
			}
			
			if( name == "fromYear" || name == "fromMonth" || name == "period"){
				updateToDate();
			}
			
		});

		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			console.log(result);
			contractId = result.newId;
			form.setItemValue('code', contractId);

			if (result.error || result.invalids) {
				container.progressOff();
			} else {
				reload();
			}

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		}, function(id, data) {
			
			console.log(data);
			/*data.penalties = penalties.getRows();
			data.items = items.getRows();
			data.files = fileUploader.getRows();*/

			return data;
		});		
	};

}