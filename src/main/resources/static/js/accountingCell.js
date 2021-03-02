function AccountingCell(targetGrid, idx, onSelected, onEdited, onvalidate) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 400,
			height : 300,
			xml : 'xml/popup/accounting/grid.xml'
		},
		url : {
			records : 'popup/accounting/records',
			search : 'popup/accounting/search',
		},
		callback : {

			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {

				$.post("popup/accounting/info", {
					id : dataId
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
			}
		}
	});

	this.hide = function() {
		gridCell.hide();
	};
}
