function OrderDetailCell(targetGrid, idx, onSelected, onEdited, fnGetOrder, all) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 450,
			height : 300,
			xml : 'xml/popup/order/detail/grid.xml'
		},
		url : {
			records : 'popup/order/detail/records',
			search : 'popup/order/detail/search',
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {

				$.post('popup/order/detail/info', {
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
				
				return '?keyword=' + encodeURIComponent(value) + "&order=" + fnGetOrder() + "&all=" + all;
			}
		}
	});
}
