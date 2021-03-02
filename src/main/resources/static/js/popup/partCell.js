function PartCell(targetGrid, name, config) {
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 650,
			height : 300,
			xml : 'xml/popup/part/grid.xml'
		},
		url : {
			records : 'popup/part/records',
			search : 'popup/part/search',
			info : 'popup/part/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		fixedFields : config.fixedFields,
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}
