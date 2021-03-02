function WarehouseCell(targetGrid, name, config) {
	
	// "&item=" + itemCode+ "&me=" + me;
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 350,
			height : 300,
			xml : 'xml/popup/warehouse/grid.xml'
		},
		url : {
			records : 'popup/warehouse/records',
			search : 'popup/warehouse/search',
			info : 'popup/warehouse/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}

