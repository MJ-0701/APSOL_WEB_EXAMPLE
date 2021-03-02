/**
 * 반제품과 제품만
 */
function ProductionItemCell(targetGrid, idx, onSelected, onEdited) {

	var gridCell = new GridCell(targetGrid, idx, {
		imageUrl : imageUrl,
		grid : {
			width : 450,
			height : 300,
			xml : 'xml/popup/item/grid.xml'
		},
		url : {
			records : 'popup/item/records',
			search : 'popup/item/search',
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				onSelected(rowId, cnt, data, keyCode != 9);

			},
			onSelected : function(rowId, dataGrid, dataId) {

				$.post('popup/item/info', {
					uuid : dataId
				}, function(data) {
					onSelected(rowId, 1, data, true);
				});

			},
			onEdited : function(rowId, value) {
				if (onEdited)
					onEdited(rowId, value);
			},
			getParams : function(value) {
				// 상품, 부품, 세트 무시
				return '?keyword=' + encodeURIComponent(value) + "&ignore=PT0001,PT0003,PT0005";
			}
		}
	});
}
