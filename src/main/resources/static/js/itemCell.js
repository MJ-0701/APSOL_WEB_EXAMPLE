function ItemCell(targetGrid, idx, onSelected, onEdited) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 450,
			height : 300,
			xml : 'xml/popup/item/grid.xml'
		},
		url : {
			records : 'popup/item/records',
			search : 'popup/item/search',
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {

				$.post('popup/item/info', {
					uuid : dataId
				}, function(data) {
					onSelected(rowId, 1, data, true);
				});

			},
			onEdited : function(rowId, value) {
				if (onEdited)
					onEdited(rowId, value);
			}
		}
	});
}
