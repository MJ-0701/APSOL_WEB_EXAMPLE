function WarehouseCell(targetGrid, idx, onSelected, onEdited, getItemCode, getCode) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 350,
			height : 300,
			xml : 'xml/popup/warehouse/grid.xml'
		},
		url : {
			records : 'popup/warehouse/records',
			search : 'popup/warehouse/search',
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {
				
				var itemCode = getItemCode ? getItemCode(rowId) : 0;
				
				$.post('popup/warehouse/info', {
					uuid : dataId,
					item : itemCode,
				}, function(data) {
					onSelected(rowId, 1, data, true);
				});
			},
			onEdited : function(rowId, value){
				if(onEdited)
					onEdited(rowId, value);
			},
			getParams : function(value, rowId) {
				var itemCode = getItemCode ? getItemCode(rowId) : '';
				var me = getCode ? getCode(rowId) : '';
				return '?keyword=' + encodeURIComponent(value) + "&item=" + itemCode+ "&me=" + me;
			}
		}
	});
}

