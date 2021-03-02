function EmployeeCell(targetGrid, name, config) {
	
	this.hide = function(){
		dp.hide();
	};
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 500,
			height : 300,
			xml : 'xml/popup/employee/grid.xml'
		},
		url : {
			records : 'popup/employee/records',
			search : 'popup/employee/search',
			info : 'popup/employee/info',
		},
		params : config.params, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		validateId : config.validateId,
		onSelected : config.onSelected,
		onBeforeSelected : config.onBeforeSelected,
		nextField : config.nextField
	});
}
