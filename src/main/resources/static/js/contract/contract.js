function Contract(container, config) {

	this.reload = function() {
		dataGrid.reload();
	};

	this.getSelectedRowId = function() {
		return dataGrid.getSelectedRowId();
	}

	var dataGrid;
	this.init = function() {

		dataGrid = new DataGrid(container, {
			imageUrl : imageUrl,
			grid : {
				xml : "xml/contract/grid.xml",
				onRowSelect : function(grid, id) {

					config.callback.onRowSelect(id);

				},
				onInited : function(grid) {

					function DateSort(a, b, ord, a_id, b_id) {
						var dateA = buildDate(grid, a_id);
						var dateB = buildDate(grid, b_id);

						return ord == "asc" ? (dateA > dateB ? 1 : -1) : (dateA > dateB ? -1 : 1);
					}

					grid.setCustomSorting(DateSort, grid.getColIndexById('year'));

					// customer cell. 추가 cell은 여기서만 추가가 가능하다.
					dataGrid.addCustomerCell('name', {
						fields : {
							customer : 'uuid',
							name : 'name',
							customerCategoryName : 'categoryName',
							customerManagerName : 'managerName',
							businessNumber : 'businessNumber'
						},
						validateId : 'customer',
						nextField : 'period',
						onSelected : function(rowId, data, cnt) {
							dataGrid.update(rowId);
							return true;
						}
					});

					dataGrid.addEmployeeCell('managerName', {
						fields : {
							manager : 'username',
							managerName : 'name',
						},
						nextField : 'memo',
						onSelected : function(rowId, data, cnt) {
							dataGrid.update(rowId);
						}
					});

					// 초기화 후 바로 로딩
					dataGrid.reload();
				},
			},
			toolbar : {
				xml : "xml/contract/toolbar.xml",
				iconsPath : "img/18/",
				dateRange : {
					onInitRange : function() {
						return getRange(2);
					},
					onInited : function(cal) {
					},
					onChangedDate : function(from, to) {
					}
				},
				onInited : function() {
				},
				onClick : function(id) {
					
					console.log(id)
					
					switch(id){
					case 'btnUpdate':
						
						updateModal.show();
						
						break;
					}
					
					return false;
				}
			},
			urls : {
				deleted : 'contract/delete',
				updated : 'contract/update',
				record : 'contract/records'
			},
			inserted : {
				url : 'contract/insert',
				focusField : 'name',
			},
			numberFormats : [ {
				format : '000.0',
				columns : [ 'debit', 'credit', 'amount', 'total', 'tax', 'commission', 'deposit', 'withdraw' ]
			}, {
				format : '000',
				columns : [ '' ]
			}, ],
			callback : {
				onBeforeReload : function() {
				},
				onBeforeParams : function() {
				},
				onInserted : function(grid, id, data) {
				},
				onDeleted : function(){
					config.callback.onDeleted();
				},
				onEditCell : function(grid, stage, rId, colInd, nValue, oValue) {

					if (grid.getParentId(rId))
						return false;

					return true;
				}
			}

		});

		dataGrid.init();

		updateModal = new Modal({
			window : {
				width : 400,
				height : 200,
				name : 'updateMd',
				title : '계약 변경'
			},
			form : {
				xml : 'xml/contract/updateForm.xml'
			},
			onShow : function(form) {
				
				form.setItemValue('date', new Date());
				form.setItemValue('uuid', dataGrid.getData('projectUuid'));
				return true;
			},
			onApply : function(form) {
				
				container.progressOn();
				
				$.post('contract/update2', form.getFormData(true), function(result){
					// 현재 항목 삭제 후 새로 추가 
					dataGrid.deleteRow(result.id );					
					dataGrid.addRow(result.newId, result.data, 'fromYear', true);
										
					container.progressOff();
					
				});

			},
		});
		
		updateModal.init();

	};

	// 계약 변경 다이얼로그
	var updateModal;

	function buildDate(grid, rowId) {
		return getData(grid, rowId, 'year').zf(4) + getData(grid, rowId, 'month').zf(2) + getData(grid, rowId, 'day').zf(2);
	}
}