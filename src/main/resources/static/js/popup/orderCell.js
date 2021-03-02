function OrderCell(targetGrid, name, config) {

	var urlPrefix = 'popup/order';

	if (config.urlPrefix) {
		urlPrefix = config.urlPrefix;
	}

	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 730,
			height : 300,
			xml : 'xml/popup/order/grid.xml',
			loaded : function(grid) {
				grid.setNumberFormat(numberFormat, 4);
				grid.setNumberFormat(numberFormat, 5);
			}
		},
		url : {
			records : urlPrefix + '/records',
			search : urlPrefix + '/search',
			info : urlPrefix + '/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields,
		fixedFields : config.fixedFields,
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}
