function ProductionPartCell(targetGrid, idx, onSelected, onEdited) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 850,
			height : 400,
			xml : 'xml/popup/productionPart/grid.xml'
		},
		url : {
			records : 'popup/productionPart/records',
			search : 'popup/productionPart/search',
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {

				$.post('popup/productionPart/info', {
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
