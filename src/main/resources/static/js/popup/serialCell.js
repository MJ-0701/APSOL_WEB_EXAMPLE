function SerialCell(targetGrid, name, config) {
	
	this.hide = function(){
		dp.hide();
	};
		
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 250,
			height : 300,
			xml : 'xml/popup/serial/grid.xml'
		},
		url : {
			records : 'popup/serial/records',
			search : 'popup/serial/search',
			info : 'popup/serial/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		fixedFields : config.fixedFields,
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}

