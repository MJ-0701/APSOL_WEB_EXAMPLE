function ProductionPartCell(targetGrid, name, config) {
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 750,
			height : 300,
			xml : 'xml/popup/productionPart/grid.xml'
		},
		url : {
			records : 'popup/productionPart/records',
			search : 'popup/productionPart/search',
			info : 'popup/productionPart/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		fixedFields : config.fixedFields,
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}
