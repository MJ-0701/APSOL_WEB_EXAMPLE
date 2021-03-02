function WarehouseCell(targetGrid, idx, onSelected, onEdited) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 350,
			height : 300,
			xml : 'xml/popup/factory/grid.xml'
		},
		url : {
			records : 'popup/factory/records',
			search : 'popup/factory/search',
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {
				
				var itemCode = getItemCode ? getItemCode(rowId) : 0;
				
				$.post('popup/factory/info', {
					uuid : dataId,
				}, function(data) {
					onSelected(rowId, 1, data, true);
				});
			},
			onEdited : function(rowId, value){
				if(onEdited)
					onEdited(rowId, value);
			},
			getParams : function(value, rowId) {
				return '?keyword=' + encodeURIComponent(value);
			}
		}
	});
}

