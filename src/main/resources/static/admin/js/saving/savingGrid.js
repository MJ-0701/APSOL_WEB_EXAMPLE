function SavingGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('saving');

	this.member = 0;
}
SavingGrid.prototype = Object.create(DataGrid.prototype);
SavingGrid.prototype.constructor = SavingGrid;

SavingGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/saving/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/saving/grid.xml",
	}, 'server');

};

SavingGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	// this.loadRecords();
};

SavingGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	switch (id) {
	case 'btnGenerate':
		if (me.member != 0 && me.member != undefined) {
			savingFormDialog = new SavingFormDialog();
			savingFormDialog.setMemberId(me.member);
			savingFormDialog.open(true);
			savingFormDialog.setOnUpdatedListner(function(result) {
				me.reload();
			});
		}else{
			dhtmlx.alert({
				title : "오류",
				type : "alert-error",
				text : "회원을 선택하여 주시기 바랍니다."
			});
			return;
		}
		break;
	}

};

SavingGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

SavingGrid.prototype.onBeforeParams = function(param) {
	param.member = this.member;
};