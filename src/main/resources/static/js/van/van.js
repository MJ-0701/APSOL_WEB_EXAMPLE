function Van(container, config) {

	var dataGrid;
	this.init = function() {

		
		
		dataGrid = new DataGrid(container, {
			imageUrl : imageUrl,
			grid : {
				filterType : 'server',
				xml : "xml/van/record/grid.xml",
				onInited : function(grid) {
										
					// customer cell. 추가 cell은 여기서만 추가가 가능하다.
					dataGrid.addCustomerCell('customerName', {
						fields : {
							customer : 'uuid',
							customerName : 'name',
							customerGroupName : 'categoryName',
							managerName : 'managerName',
							taxMethod : 'taxMethod',
							customerKind : 'kind',
							businessNumber : 'businessNumber'
						},
						nextField : 'count',
						onSelected : function(rowId, data, cnt) {
							// 선택안되었으면 data가 null 이고 cnt 가 1이 아님
							dataGrid.update(rowId);

							return true;
						}
					});
					
					

					dataGrid.reload();
				},
			},
			toolbar : {
				xml : "xml/van/record/toolbar.xml",
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
				deleted : 'van/delete',
				updated : 'van/update',
				record : 'van/records'
			},
			inserted : {
				url : 'van/insert',
				focusField : 'kind',
			},
			numberFormats : [ {
				format : '0,000.0',
				columns : [ 'sales', 'cash' ]
			}, {
				format : '0,000',
				columns : [ 'count', 'ddc', 'desc']
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
		
		dataGrid.reloadSelectFilter([{
			colName : 'kind' , values : ['KOVAN', 'KICC', 'KIS', 'JTNET', 'KSNET', 'KCP']
		}]);

		dataGrid.init();

	};
	
	function buildDate(grid, rowId) {
		return getData(grid, rowId, 'year').zf(4) + getData(grid, rowId, 'month').zf(2) + getData(grid, rowId, 'day').zf(2);
	}
}