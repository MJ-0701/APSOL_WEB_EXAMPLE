function OrderCell(targetGrid, idx, onSelected, onEdited, all) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 730,
			height : 300,
			xml : 'xml/popup/order/grid.xml'
		},
		url : {
			records : 'popup/order/records',
			search : 'popup/order/search',
		},
		callback : {
			onLoadedGrid : function(grid){				
				grid.setNumberFormat(numberFormat, 4);
				grid.setNumberFormat(numberFormat, 5);				
			},
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {
				
				$.post('popup/order/info', {
					uuid : dataId
				}, function(data) {
					onSelected(rowId, 1, data, true);
				});

			},
			onEdited : function(rowId, value) {
				if (onEdited)
					onEdited(rowId, value);
			},
			getParams : function(value) {
				if( !all )
					all = false;
				
				return '?keyword=' + encodeURIComponent(value) + "&all=" + all;
			}
		}
	});
	
	this.hide = function() {
		gridCell.hide();
	};
}
