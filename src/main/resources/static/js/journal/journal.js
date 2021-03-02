function Journal(container, config) {

	var dataGrid;
	this.init = function() {

		dataGrid = new DataGrid(container, {
			imageUrl : imageUrl,
			grid : {
				xml : "xml/journal/consulting/grid.xml",
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
							customerGroupName : 'categoryName',
							managerName : 'managerName',
							taxMethod : 'taxMethod',
							customerKind : 'kind',
							businessNumber : 'businessNumber'
						},
						nextField : 'managerName',
						onSelected : function(rowId, data, cnt) {
							// 선택안되었으면 data가 null 이고 cnt 가 1이 아님
							dataGrid.update(rowId);

							return true;
						}
					});

					dataGrid.reload();
				},
				onRowSelect : function(grid, id){
										
					config.onRowSelect(grid, id);
				}
			},
			toolbar : {
				xml : "xml/journal/consulting/toolbar.xml",
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
				}
			},
			urls : {
				deleted : 'journal/delete',
				updated : 'journal/update',
				record : 'consulting/records'
			},
			inserted : {
				url : 'consulting/insert',
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
				}
			}

		});

		dataGrid.init();

	};
	
	function buildDate(grid, rowId) {
		return getData(grid, rowId, 'year').zf(4) + getData(grid, rowId, 'month').zf(2) + getData(grid, rowId, 'day').zf(2);
	}
}