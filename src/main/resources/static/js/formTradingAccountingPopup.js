//TODO 인자를 객체로 받도록 수정.
// 입력값은 map 방식으로 받도록 할 것.
// ex) 
// 입력은 아래와 같이
// {
//	account : 'code',
//	accountName : 'name'
//	}
// 필요하면 이벤트도 얻을 수 있어야함.

function FormTradingAccountingPopup(form, name, fields, onSelected) {
	
	var popup = FormPopupDataProcessor(form, name, {
		url : {
			records : 'popup/accounting/trading/records',
			search : 'popup/accounting/trading/search'
		},
		grid : {
			xml : 'xml/popup/accounting/grid.xml',
			width : 420,
			height : 300,
		},
		fields : fields,
		onSelected : onSelected
	});

}