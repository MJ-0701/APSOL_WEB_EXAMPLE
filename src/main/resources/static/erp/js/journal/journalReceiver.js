function JournalReceiver(config) {
	DataGrid.call(this, config);

	this.setEnableUpdate(false);

	this.parentCode;

}
JournalReceiver.prototype = new DataGrid();
JournalReceiver.prototype.constructor = JournalReceiver;

JournalReceiver.prototype.setParentCode = function(parentCode) {
	this.parentCode = parentCode;
};

JournalReceiver.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

JournalReceiver.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.addEmployeeCell('employeeName', false).setFieldMap({
		employee : {
			name : 'username',
			required : true,
		},
		employeeName : {
			name : 'name',
		}
	}).setNextFocus('kind');

};

JournalReceiver.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/receiver/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/receiver/grid.xml",
	});
};

JournalReceiver.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.focus('employeeName', rId);

};

JournalReceiver.prototype.deleteRow = function(rIds) {

	if (this.parentCode != 0) {
		dhtmlx.alert({
			type : "alert-error",
			text : "이미 저장된 메세지는 수정할 수 없습니다.",
			callback : function() {
			}
		});

		return;
	}

	// TODO 걍 부모의 상태가 저장이 되었다면 삭제 불가! 저장하면 끝!!! 부모의 상태를 알아야한다?!

	DataGrid.prototype.deleteRow.call(this.rIds);
}