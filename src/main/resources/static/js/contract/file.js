function ContractFile(container, config) {

	this.clear = function() {
		dataGrid.clear();
	};

	this.reload = function() {
		dataGrid.reload();
	};
	this.getSelectedRowId = function() {
		return dataGrid.getSelectedRowId();
	}
	var dataGrid;
	var filepopup;
	this.init = function() {

		dataGrid = new DataGrid(container, {
			imageUrl : imageUrl,
			grid : {
				xml : "xml/contract/file/grid.xml",
				onInited : function(grid) {
				},
			},
			toolbar : {
				xml : "xml/contract/file/toolbar.xml",
				iconsPath : "img/18/",
				onInited : function(toolbar) {

					filepopup = new FilePopup(container, {
						name : 'contractFile',
						uploadUrl : 'contractFile/upload',
						toolbar : {
							obj : toolbar,
							btnId : 'btnUpload'
						},
						form : {
							xml : 'xml/contract/file/form.xml',

						},
						getData : function() {
							return config.callback.getFileParams();
						},
						onUploaded : function(result) {
							console.log(result);
							dataGrid.reload();
						}

					});

					filepopup.init();

				},
				onClick : function(id) {
					switch (id) {
					case 'btnUpload':
						break;
					}
				}
			},
			urls : {
				deleted : 'contractFile/delete',
				updated : 'contractFile/update',
				record : 'contractFile/records'
			},
			inserted : {
				url : 'contractFile/insert',
				focusField : 'name',
			},
			callback : {
				onBeforeReload : function() {
				},
				onBeforeParams : config.callback.onBeforeParams,
			}

		});

		dataGrid.init();

	};

}