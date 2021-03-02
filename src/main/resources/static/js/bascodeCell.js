function BascodeCell(targetGrid, idx, onSelected, onEdited, onvalidate, getPrefix, onClosed) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 400,
			height : 300,
			xml : 'xml/popup/bascode/grid.xml'
		},
		url : {
			records : 'popup/bascode/records',
			search : 'popup/bascode/search',
		},
		callback : {
			
			onClosed : function(rowId, data){
				if( onClosed )
					onClosed(rowId, data);
			},
			
			getParams : function(data, rowId){
				var prefix = '';
				if( getPrefix )
					prefix = getPrefix(data, rowId);
				
				return "?prefix=" + prefix + "&keyword=" + encodeURIComponent(data);
			},

			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {

				$.post("popup/bascode/info", {
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
			}
		}
	});

	this.hide = function() {
		gridCell.hide();
	};
}
