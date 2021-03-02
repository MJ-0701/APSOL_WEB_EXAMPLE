function AuthCell(targetGrid, name, config) {
		
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 350,
			height : 300,
			xml : 'xml/popup/auth/grid.xml'
		},
		url : {
			records : 'popup/auth/records',
			search : 'popup/auth/search',
			info : 'popup/auth/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}

