function CustomerCell(targetGrid, idx, onSelected, onEdited, onvalidate, onClosed) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 650,
			height : 300,
			xml : 'xml/popup/customer/grid.xml'
		},
		url : {
			records : 'popup/customer/records',
			search : 'popup/customer/search',
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {

				$.post("popup/customer/info", {
					uuid : dataId
				}, function(data) {
					onSelected(rowId, 1, data, true);
				});

			},
			onEdited : function(rowId, value) {
				if (onEdited)
					onEdited(rowId, value);
			},validate : function(rowId, value){
				if( onvalidate )
					return onvalidate(rowId, value);
				return true;
			}, onClosed : function(rowId, value){
				if(onClosed)
					onClosed(rowId, value);
			}
		}
	});

	this.hide = function() {
		gridCell.hide();
	};
}
