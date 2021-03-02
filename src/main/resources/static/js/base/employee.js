function Employee(container, config) {

	var toolbar;
	var grid;

	var updater;
	var insertDialog;
	var insertForm;

	var insertCMSDialog;
	var insertCMSForm;

//	var insertCIDDialog;
//	var insertCIDForm;

	this.init = function() {
		setupToolbar();
		setupGrid();
		setupInsertDialog();
		setupInsertCMSDialog();
//		setupInsertCIDDialog();
	};

	function popupInsertDialog() {

		insertDialog.show();
		insertForm.clear();
		insertForm.setFocus();
	}

	function popupInsertCMSDialog(username) {

		insertCMSDialog.show();
		insertCMSForm.clear();
		insertCMSForm.setFocus();
		insertCMSForm.setItemValue('employee', username);
	}

//	function popupInsertCIDDialog(username) {
//
//		insertCIDDialog.show();
//		insertCIDForm.clear();
//		insertCIDForm.setFocus();
//		insertCIDForm.setItemValue('employee', username);
//	}

	function setupInsertCMSDialog() {
		insertCMSDialog = new Dialog({
			width : 400,
			height : 200,
			name : "insertCMS",
			title : "새 CMS 계정 추가",
			layout : "1C",
			callback : {
				onCreated : function(layout) {
					layout.cells("a").hideHeader();
				}
			}
		});

		insertCMSDialog.init();
		var Ca = /\+/g;
		insertCMSForm = new InsertForm(insertCMSDialog.cells('a'), {

			url : 'cmsKoreaAccount/update',
			form : {
				xml : 'xml/base/employee/insertCMSForm.xml'
			},
			callback : {
				onBeforeUpdate : function() {
					insertCMSDialog.close();
					container.progressOn();
				},
				onAfterUpdate : function(result) {
					container.progressOff();
					dhtmlx.alert({
						text : decodeURIComponent(result.replace(Ca, " ")),
						callback : function() {
							reload();
						}
					});

				}
			}
		});
		insertCMSForm.init();

	}
//
//	function setupInsertCIDDialog() {
//		insertCIDDialog = new Dialog({
//			width : 400,
//			height : 250,
//			name : "insertCID",
//			title : "CID 계정 등록",
//			layout : "1C",
//			callback : {
//				onCreated : function(layout) {
//					layout.cells("a").hideHeader();
//				}
//			}
//		});
//
//		insertCIDDialog.init();
//		var Ca = /\+/g;
//		insertCIDForm = new InsertForm(insertCIDDialog.cells('a'), {
//
//			url : 'cidAccount/update',
//			form : {
//				xml : 'xml/base/employee/insertCIDForm.xml'
//			},
//			callback : {
//				onBeforeUpdate : function() {
//
//					insertCIDDialog.close();
//					container.progressOn();
//				},
//				onAfterUpdate : function(result) {
//					container.progressOff();
//					dhtmlx.alert({
//						text : decodeURIComponent(result.replace(Ca, " ")),
//						callback : function() {
//							reload();
//						}
//					});
//
//				}
//			}
//		});
//		insertCIDForm.init();
//
//	}

	function setupInsertDialog() {
		insertDialog = new Dialog({
			width : 400,
			height : 200,
			name : "insertWnd",
			title : "새 계정 추가",
			layout : "1C",
			callback : {
				onCreated : function(layout) {
					layout.cells("a").hideHeader();
				}
			}
		});

		insertDialog.init();

		insertForm = new InsertForm(insertDialog.cells('a'), {
			url : 'employee/insert',
			form : {
				xml : 'xml/base/employee/insertForm.xml'
			},
			callback : {
				onBeforeUpdate : function() {
					insertDialog.close();
					container.progressOn();
				},
				onAfterUpdate : function(result) {
					container.progressOff();
					dhtmlx.alert({
						title : "새 계정이 생성되었습니다.",
						text : "새 계정의 기본 패스워드는 [0000]입니다.",
						callback : function() {
							insertData(grid, result, 'name', 0);

							if (config.onRowSelect)
								config.onRowSelect(grid, result.id);

						}
					});

				}
			}
		});
		insertForm.init();

	}

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			customerCell();
			departmentCell();
			authCell();
		});

		updater = new Updater(grid, 'employee/update', function(grid, result) {
			console.log(result);
			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 2) {
				grid.validateCell(rId, colInd, function() {
					return true;
				});
			}

			if (stage == 2) {

				if (isIn(colId, [ 'departmentName' ])) {
					return true;
				}

				if (nValue != oValue) {

					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}

					update(rId);
				}
			}

			return true;
		});
	}

	function customerCell() {
		customerCell = new CustomerCell(grid, 'officeName', {
			fields : {
				office : 'uuid',
				officeName : 'name',
			},
			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function departmentCell() {
		departmentCell = new BascodeCell(grid, 'departmentName', {
			fields : {
				department : 'uuid',
				departmentName : 'name',
			},
			getParams : function(rowId) {
				return {
					prefix : 'DE'
				}
			},
			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function authCell() {
		authCell = new AuthCell(grid, 'authName', {
			fields : {
				auth : 'code',
				authName : 'name',
			},
			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function update(rId) {
		updater.update(rId);
	}

	function reload() {

		if (grid == null)
			return;

		if (config.onBeforeReload)
			config.onBeforeReload();

		container.progressOn();
		var url = config.grid.record;

		grid.clearAndLoad(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

			reload();

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnRefresh':
				reload();
				break;

			case 'btnAdd':

				popupInsertDialog();

				break;

			case 'btnCMSAdd':

				if (grid.getSelectedRowId()) {
					popupInsertCMSDialog(grid.getSelectedRowId());
				} else {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});
				}

				break;

//			case 'btnCIDAdd':
//
//				if (grid.getSelectedRowId()) {
//					dhtmlx.alert({
//						type : "alert-error",
//						text : "비밀번호는 최소8자리, 영문자, 특수문자, 숫자 각각 1개이상 포함되어야 합니다.",
//						callback : function() {
//							popupInsertCIDDialog(grid.getSelectedRowId());
//						}
//					});
//
//				} else {
//					dhtmlx.alert({
//						type : "alert-error",
//						text : "선택된 항목이 없습니다.",
//						callback : function() {
//						}
//					});
//				}
//
//				break;
//			case 'btnCIDLogin' :
//				$.post('cidAccount/login', function(result) {
//					console.log(result);
//					if (result == 'success') {
//						dhtmlx.alert({
//							title : "CID 로그인",
//							text : "로그인에 성공하였습니다.",
//							callback : function() {
//							}
//						});
//					}else{
//						dhtmlx.alert({
//							type : "alert-error",
//							text : "로그인에 실패하였습니다.",
//							callback : function() {
//							}
//						});
//					}
//				});
//				break;
//				
//			case 'btnCIDtrans' :
//				$.post('cidAccount/trans', function(result) {
//					console.log(result);
//					if (result == 'success') {
//						dhtmlx.alert({
//							title : "CID 돌려주기",
//							text : "돌려주기에 성공하였습니다.",
//							callback : function() {
//							}
//						});
//					}else{
//						dhtmlx.alert({
//							type : "alert-error",
//							text : "돌려주기에 실패하였습니다.",
//							callback : function() {
//							}
//						});
//					}
//				});
//				break;
//			case 'btnCIDpickup' :
//				$.post('cidAccount/pickup', function(result) {
//					console.log(result);
//					if (result == 'success') {
//						dhtmlx.alert({
//							title : "CID 당겨받기",
//							text : "당겨받기에 성공하였습니다.",
//							callback : function() {
//							}
//						});
//					}else{
//						dhtmlx.alert({
//							type : "alert-error",
//							text : "당겨받기에 실패하였습니다.",
//							callback : function() {
//							}
//						});
//					}
//				});
//				break;
			case 'btnDelete':

				if (!grid.getSelectedRowId()) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				dhtmlx.confirm({
					title : "선택한 항목들을 삭제하시겠습니까?",
					type : "confirm-warning",
					text : "삭제된 항목은 복구할 수 없습니다.",
					callback : function(r) {
						if (r) {

							container.progressOn();
							$.post('employee/delete', {
								ids : grid.getSelectedRowId(),
							}, function(result) {

								container.progressOff();

								if (result.error) {
									dhtmlx.alert({
										title : "삭제된 항목을 삭제할 수 없습니다.",
										type : "alert-error",
										text : result.error
									});

									return;
								}

								// TODO 에러처리
								console.log(result);

								grid.deleteSelectedRows();

								if (config.onDeleted)
									config.onDeleted();

							});
						}
					}
				});

				break;
			}
		});
	}

	function InsertForm(container, config) {
		var form;

		this.clear = function(data) {
			form.reset();
			form.clear();
		};

		this.setFocus = function() {
			form.setFocusOnFirstActive();
		};

		this.init = function() {
			form = container.attachForm();
			form.loadStruct(config.form.xml, function() {
			});

			form.attachEvent("onButtonClick", function(name) {
				if (name == 'btnApply') {

					config.callback.onBeforeUpdate();
					$.post(config.url, form.getFormData(true), function(result) {
						if (result.error) {
							dhtmlx.alert({
								title : "계정을 생성할 수 없습니다.",
								type : "alert-error",
								text : result.error,
								callback : function() {
									config.callback.onAfterUpdate(result);
								}
							});
						} else {
							config.callback.onAfterUpdate(result);
						}
					});

				} 
//				else if (name == 'btnAuth') {
//					$.post('cidAccount/authSms', form.getFormData(true), function(result) {
//						if (result == 'success') {
//							dhtmlx.alert({
//								title : "인증번호 전송에 성공하였습니다.",
//								text : "인증번호를 입력한 후 계정 등록을 눌러주세요.",
//								callback : function() {
//								}
//							});
//						}
//					});
//				}
			});
		};

		this.setItemValue = function(name, value) {
			form.setItemValue(name, value);
		};
	}
}