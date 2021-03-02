function WorkReplyGrid() {
	DataGrid.call(this);

	this.setUrlPrefix('workReply');

	this.work;

	this.replyDlg = new WorkReplyDialog();
	
	var me = this;
	this.replyDlg.setOnCloseEventListener(function(){
		me.reload();
	});
	

}
WorkReplyGrid.prototype = Object.create(DataGrid.prototype);
WorkReplyGrid.prototype.constructor = WorkReplyGrid;

WorkReplyGrid.prototype.setWork = function(work) {
	this.work = work;
	this.replyDlg.work = work;
};

WorkReplyGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/reply/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/reply/grid.xml",
	});

};

WorkReplyGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var r = DataGrid.prototype.onClickToolbarButton.call(this, id, toolbar);
	var me = this;

	if (id == 'btnNew') {

		if (!this.work) {
			dhtmlx.alert({
				type : "alert-error",
				text : "선택된 업무가 없습니다.",
			});
			return;
		}

		this.replyDlg.code = 0;
		this.replyDlg.open(true);
		return;
	}

	if (id == 'btnEdit') {

		if (!this.getSelectedRowId()) {
			dhtmlx.alert({
				type : "alert-error",
				text : "항목이 선택되지 않았습니다.",
			});
			return;
		}

		$.post('workReply/modify', {
			reply : this.getSelectedRowId()
		}, function(result) {

			if (result.error) {
				dhtmlx.alert({
					title : '항목을 수정할 수 없습니다.',
					type : "alert-error",
					text : result.error,
				});
				return;
			}

			me.replyDlg.code = result.id;
			me.replyDlg.open(true);
			me.replyDlg.setContent(result.data.content);

		});

	}

	return r;
};

WorkReplyGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
};

WorkReplyGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.work)
		param.work = this.work;
};