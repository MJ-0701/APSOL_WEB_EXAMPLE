function WithdrawMemberGrid(config) {
	DateRangeGrid.call(this);

	this.setBascodeSelectFilterData('withdrawReasonName', 'WD');
	this.setUrlPrefix('withdrawMember');

	this.fOption = 'TK01';

}
WithdrawMemberGrid.prototype = Object.create(DateRangeGrid.prototype);
WithdrawMemberGrid.prototype.constructor = WithdrawMemberGrid;

WithdrawMemberGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/member/withdrawMemberToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/member/withdrawMemberGrid.xml",
	}, 'server');

};

WithdrawMemberGrid.prototype.onInitedGrid = function(grid) {

	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

WithdrawMemberGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	

};

WithdrawMemberGrid.prototype.onAfterLoadRow = function(result) {
	DateRangeGrid.prototype.onAfterLoadRow.call(this, result);

}

WithdrawMemberGrid.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
	toolbar.addText('cb0', 3, '<div id="combo1" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 70);
	combo.readonly(true);
	
	combo.addOption("TK01", "탈퇴신청일");
	combo.addOption("TK02", "탈퇴철회일");
	combo.addOption("TK03", "탈퇴완료일");
	
	var me = this;
	combo.attachEvent("onChange", function(value, text) {
		me.fOption = "TK01";
		if (value != '')
			me.fOption = value;
	});
	
	combo.selectOption(0);
	
}

WithdrawMemberGrid.prototype.onBeforeParams = function(param) {
	DateRangeGrid.prototype.onBeforeParams.call(this, param);

	param.option = this.fOption;
}