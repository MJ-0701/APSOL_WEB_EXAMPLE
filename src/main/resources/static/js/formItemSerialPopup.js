function FormItemPopup(form, name, onSelected, onEdited) {

	var popup = new FormPopup(form, name, {
		url : {
			records : 'popup/itemSerial/records',
			search : 'popup/itemSerial/search'
		},
		grid : {
			xml : 'xml/popup/itemSerial/grid.xml',
			width : 600,
			height : 300,
		},
		callback : {
			onSearched : function(count, data) {
				onSelected(count, data);
			},
			onSelected : function(grid, rowId) {

				$.post('popup/itemSerial/info', {
					uuid : rowId
				}, function(data) {
					onSelected(1, data);
				});

			},
			onEdited : function(data) {
				onEdited(data);
			}
		}
	});

}