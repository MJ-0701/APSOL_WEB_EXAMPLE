/**
 * 계정 팝업
 */
function AccountingCell(targetGrid, name, config) {
	
var urlPrefix = 'popup/accounting';
	
	if( config.urlPrefix ){
		urlPrefix = config.urlPrefix;
	}
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 400,
			height : 300,
			xml : 'xml/popup/accounting/grid.xml'
		},
		url : {
			records : urlPrefix + '/records',
			search : urlPrefix + '/search',
			info : urlPrefix + '/info',
		},
		params : config.params, // 값을 받아오거나 할때 추가 인자값
		fields : config.fields, 
		validateId : config.validateId,
		onSelected : config.onSelected,
		nextField : config.nextField
	});
	
}
