function BookCell(targetGrid, name) {	
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 420,
		height : 300,
		xml : 'xml/popup/accountBook/grid.xml',
	});
	
	this.setFieldMap( {
		book : {
			name : 'uuid',
			required : true,
		},
		bookName : {
			name : 'name',
		}
	});
	
	this.setUrlPrefix('popup/accountBook');
}

BookCell.prototype = Object.create(CellPopupGrid.prototype);
BookCell.prototype.constructor = BookCell;