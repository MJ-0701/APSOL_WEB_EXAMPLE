/**
 * 장부 팝업
 * @param targetGrid
 * @param idx
 * @param onSelected
 * @param onEdited
 * @param onvalidate
 * @returns
 */
function BookCell(targetGrid, name, config) {
	
	var urlPrefix = 'popup/accountBook';
	
	if( config.urlPrefix ){
		urlPrefix = config.urlPrefix;
	}
	
	var dp = new GridCellDataProcessor(targetGrid, name, {
		imageUrl : imageUrl,
		grid : {
			width : 420,
			height : 300,
			xml : 'xml/popup/accountBook/grid.xml'
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