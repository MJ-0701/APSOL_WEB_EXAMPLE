function AccountBookCell(targetGrid, idx, onSelected, onEdited, onvalidate) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 420,
			height : 200,
			xml : 'xml/popup/accountBook/grid.xml'
		},
		url : {
			records : 'popup/accountBook/records',
			search : 'popup/accountBook/search',
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {
				$.post("popup/accountBook/info", {
					uuid : dataId
				}, function(data) {
					onSelected(rowId, 1, data, true);
				});
			},
			validate : function(rowId, value) {
				if (onvalidate)
					return onvalidate(rowId, value);
				return true;
			},
			onEdited : function(rowId, value) {
				if (onEdited)
					onEdited(rowId, value);
			}
		}
	});

	this.hide = function() {
		gridCell.hide();
	};
}