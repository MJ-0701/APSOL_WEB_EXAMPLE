function BascodeCell(targetGrid, name, config) {
	
	this.hide = function(){
		dp.hide();
	};
		
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 250,
			height : 300,
			xml : 'xml/popup/bascode/grid.xml'
		},
		url : {
			records : 'popup/bascode/records',
			search : 'popup/bascode/search',
			info : 'popup/bascode/info',
		},
		getParams : config.getParams, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}

