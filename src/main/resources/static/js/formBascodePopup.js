function FormBascodePopup(form, name, prefix, onSelected, onReload) {

	this.hide = function(){
		popup.hide();
	};
	
	var popup = new FormPopup(form, name, {
		url : {
			records : 'popup/bascode/records',
			search : 'popup/bascode/search'
		},
		grid : {
			xml : 'xml/popup/bascode/grid.xml',
			width : 200,
			height : 300,
		},
		callback : {
			getParams : function(data){
				return "?prefix=" + prefix + "&keyword=" + encodeURIComponent(data);
			},
			onSearched : function(count, data) {
				onSelected(count, data);
			},
			onSelected : function(grid, rowId) {
				var data = {
					uuid : grid.cells(rowId, 0).getValue(),
					name : grid.cells(rowId, 1).getValue()
				};

				onSelected(1, data);
			},
			onEdited : function(data) {
				onReload(data);
			}
		}
	});

}