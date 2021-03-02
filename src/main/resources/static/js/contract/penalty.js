function ContractPenalty(container, config) {

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
	this.init = function() {

		dataGrid = new DataGrid(container, {
			imageUrl : imageUrl,
			grid : {
				xml : "xml/contract/penalty/grid.xml",
				onInited : function(grid) {
				},
			},
			toolbar : {
				xml : "xml/contract/penalty/toolbar.xml",
				iconsPath : "img/18/",
				onInited : function() {
				},
				onClick : function(id) {
				}
			},
			urls : {
				deleted : 'contractPenalty/delete',
				updated : 'contractPenalty/update',
				record : 'contractPenalty/records'
			},
			inserted : {
				url : 'contractItem/insert',
				focusField : 'name',
			},
			numberFormats : [ {
				format : '0,000.0',
				columns : [ 'per', 'fixed' ],
				beforeAbs : true,
				afterAbs : true,
			}, {
				format : '0,000',
				columns : [ 'min', 'max' ],
				beforeAbs : true,
				afterAbs : true,
			}, ],
			callback : {
				onBeforeReload : function() {
				},
				onBeforeParams : config.callback.onBeforeParams,
				onInserted : function(grid, id, data) {
					config.callback.onInserted(grid, id, data);
				},
			}

		});

		dataGrid.init();

	};

}