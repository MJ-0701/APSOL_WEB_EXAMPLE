function FormCustomerPopup(form, name, onSelected, onEdited) {
	
	this.hide = function(){
		popup.hide();
	};

	var popup = new FormPopup(form, name, {
		url : {
			records : 'popup/customer/records',
			search : 'popup/customer/search'
		},
		grid : {
			xml : 'xml/popup/customer/grid.xml',
			width : 600,
			height : 300,
		},
		callback : {
			getParams : function(data){
				return "?keyword=" + encodeURIComponent(data);
			},
			onSearched : function(count, data) {
				onSelected(count, data);
			},
			onSelected : function(grid, rowId) {
				
				$.post('popup/customer/info', {
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