function FormAccountingPopup(form, name, onSelected, onReload) {

	var popup = new FormPopup(form, name, {
		url : {
			records : 'popup/accounting/records',
			search : 'popup/accounting/search'
		},
		grid : {
			xml : 'xml/popup/accounting/grid.xml',
			width : 420,
			height : 300,
		},
		callback : {
			onSearched : function(count, data) {
				onSelected(count, data);
			},
			onSelected : function(grid, rowId) {
				var data = {
					uuid : grid.cells(rowId, 0).getValue(),
					name : grid.cells(rowId, 1).getValue()
				};

				onSelected(1, data);
			},
			onEdited : function(data) {
				onReload(data);
			}
		}
	});

}