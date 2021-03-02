function ProductionCell(targetGrid, name, config) {
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 750,
			height : 300,
			xml : 'xml/popup/production/grid.xml'
		},
		url : {
			records : 'popup/production/records',
			search : 'popup/production/search',
			info : 'popup/production/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		fixedFields : config.fixedFields,
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}
