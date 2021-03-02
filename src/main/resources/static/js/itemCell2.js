/**
 * 세트를 포함하지 않음.
 */
function ItemCell2(targetGrid, idx, onSelected, onEdited, getKind, getCode) {

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
					id : dataId
				}, function(data) {
					onSelected(rowId, 1, data, true);
				});

			},
			onEdited : function(rowId, value) {
				if (onEdited)
					onEdited(rowId, value);
			},
			getParams : function(value) {
				
				var me = getCode ? getCode() : '';

				if (getKind) {
					if (getKind() == 'PT0005') {

						// 세트의 경우
						return '?keyword=' + encodeURIComponent(value) + "&ignore=PT0005" + "&me=" + me;
					} else if (getKind() == 'PT0002' || getKind() == 'PT0004') {
						// 제품, 반제품 의 경우
						return '?keyword=' + encodeURIComponent(value) + "&ignore=PT0001,PT0002,PT0005" + "&me=" + me;

					}
				}

				return '?keyword=' + encodeURIComponent(value) + "&ignore=PT0005" + "&me=" + me;
			}
		}
	});
}
