function FormItemPopup(form, name, ignore, onSelected, onEdited) {

	var popup = new FormPopup(form, name, {
		url : {
			records : 'popup/item/records',
			search : 'popup/item/search'
		},
		grid : {
			xml : 'xml/popup/item/grid.xml',
			width : 600,
			height : 300,
		},
		callback : {
			getParams : function(data) {
				if (ignore)
					return "?keyword=" + encodeURIComponent(data) +"&ignore=" + ignore;
				else
					return "?keyword=" + encodeURIComponent(data);
			},
			onSearched : function(count, data) {
				onSelected(count, data);
			},
			onSelected : function(grid, rowId) {

				$.post('popup/item/info', {
					id : rowId
				}, function(data) {
					onSelected(1, data);
				});

			},
			onEdited : function(data) {
				onEdited(data);
			}
		}
	});

}