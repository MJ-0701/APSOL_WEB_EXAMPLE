function FormAccountBookPopup(form, name, onSelected, onReload) {

	var popup = new FormPopup(form, name, {
		url : {
			records : 'popup/accountBook/form/records',
			search : 'popup/accountBook/form/search'
		},
		grid : {
			xml : 'xml/popup/accountBook/grid.xml',
			width : 250,
			height : 200,
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