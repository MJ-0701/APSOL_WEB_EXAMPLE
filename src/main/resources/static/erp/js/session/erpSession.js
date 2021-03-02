/**
 * 회기 관리
 * 
 * @returns
 */
function ErpSession(config) {
	DataGrid.call(this);

	this.setUrlPrefix('session');
	
	this.addActionDialog('sesCloseDlg', '회기 마감', 'session/close', 'erp/xml/common/sessionCloseForm.xml', '회기를 마감할 수 없습니다.', 'btnClose');
	this.addActionDialog('sesOpenDlg', '회기 마감 취소', 'session/open', 'erp/xml/common/sessionOpenForm.xml', '회기 마감을 취소할 수 없습니다.', 'btnOpen');

}

ErpSession.prototype = Object.create(DataGrid.prototype);
ErpSession.prototype.constructor = ErpSession;

ErpSession.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/session/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/session/grid.xml",
	}, 'server');

};

ErpSession.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();
};