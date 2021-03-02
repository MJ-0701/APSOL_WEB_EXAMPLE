function MemberCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 350,
		height : 300,
		xml : 'xml/popup/member/grid.xml'
	});

	this.setFieldMap({
		member : {
			name : 'uuid',
			required : true,
		},
		memberName : {
			name : 'name',
		},
	});

	this.setUrlPrefix('popup/member');
}

MemberCell.prototype = Object.create(CellPopupGrid.prototype);
MemberCell.prototype.constructor = MemberCell;
