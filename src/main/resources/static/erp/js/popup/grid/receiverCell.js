function ReceiverCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 650,
		height : 300,
		xml : 'erp/xml/popup/receiver/grid.xml'
	});

	this.setUrlPrefix('popup/receiver');
}

ReceiverCell.prototype = Object.create(CellPopupGrid.prototype);
ReceiverCell.prototype.constructor = ReceiverCell;
