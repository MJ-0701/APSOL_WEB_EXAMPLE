function FormEmployeePopup(form, name, config) {

	var popup = new FormPopupDataProcessor(form, name, {
		url : {
			records : 'popup/employee/records',
			search : 'popup/employee/search',
			info : 'popup/employee/info',
		},
		grid : {
			xml : 'xml/popup/employee/grid.xml',
			width : 600,
			height : 300,
		},
		fields : config.fields,
		params : config.params,
		onSelected : config.onSelected,
		onEdited :config.onEdited,
	});
	
	this.hide = function(){
		popup.hide();
	};
	
	this.isHide = function(){
		return popup.isHide();
	}

}