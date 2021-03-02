function CustomerCell(targetGrid, name, config) {
	
	this.hide = function(){
		dp.hide();
	};
	
	// 검색 추가 조건.
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 650,
			height : 300,
			xml : 'xml/popup/customer/grid.xml'
		},
		url : {
			records : 'popup/customer/records',
			search : 'popup/customer/search',
			info : 'popup/customer/info',
		},
		params : config.params, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
}

/*
customerCell = new CustomerCell(grid, 'customerName', {
	fields : {
		customer : 'uuid',
		customerName : 'name',
		customerGroupName : 'categoryName',
		taxMethod : 'taxMethod',
		customerKind : 'kind',
		book : 'book',
		bookName : 'bookName'
	},
	validateId : 'customer',

	nextField : 'amount',

	onSelected : function(rowId, data, cnt) {
		console.log(data);
		// 선택안되었으면 data가 null 이고 cnt 가 1이 아님
		if (data)
			setAccounting(rowId);
	}
});*/