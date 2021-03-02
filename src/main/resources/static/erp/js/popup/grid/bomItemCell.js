function BomItemCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 470,
		height : 300,
		xml : 'xml/popup/item/grid.xml'
	});

	this.setFieldMap({
		bomItem : {
			name : 'uuid',
			required : true,
		},
		bomItemName : {
			name : 'name',
		},
		unitPrice : {
			name : 'unitPrice',
		},
	});

	this.setUrlPrefix('popup/item');
}

BomItemCell.prototype = Object.create(CellPopupGrid.prototype);
BomItemCell.prototype.constructor = BomItemCell;

BomItemCell.prototype.getParams = function(keyword) {

	var params = CellPopupGrid.prototype.getParams.call(this, keyword);

	// 품목 구분
	var kind = getData(this.targetGrid, this.rowId, 'kind');
	params.me = getData(this.targetGrid, 'item');
		
	if (kind == 'PT0005') {
		params.ignore = 'PT0005';

	} else if (kind == 'PT0002' || kind == 'PT0004') {
		// 제품, 반제품 의 경우
		params.ignore = 'PT0001,PT0002,PT0005';
	} else {
		params.ignore = 'PT0001,PT0002,PT0003,PT0004,PT0005';
		dhtmlx.message({
			type : "error",
			text : 'BOM/SET 를 설정할 수 없는 항목입니다.'
		});
	}

	return params;

};
