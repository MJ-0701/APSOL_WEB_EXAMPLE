function ItemCell(targetGrid, name, config) {
	
	this.hide = function(){
		dp.hide();
	};
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 450,
			height : 300,
			xml : 'xml/popup/item/grid.xml'
		},
		url : {
			records : 'popup/item/records',
			search : 'popup/item/search',
			info : 'popup/item/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		fixedFields : config.fixedFields,
		validateId : config.validateId,
		onSelected : config.onSelected,
		onBeforeSelected : config.onBeforeSelected,
		nextField : config.nextField
	});
}
