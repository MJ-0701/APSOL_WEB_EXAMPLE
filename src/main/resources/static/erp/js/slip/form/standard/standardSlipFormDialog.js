/**
 * 일반 문서 폼 다이얼로그
 * @param x
 * @param y
 * @returns
 */
function StandardSlipFormDialog(x, y) {
	SlipFormDialog.call(this, 10, 10);
	
};

StandardSlipFormDialog.prototype = Object.create(SlipFormDialog.prototype);
StandardSlipFormDialog.prototype.constructor = StandardSlipFormDialog;

StandardSlipFormDialog.prototype.buildForm = function() {	
	
	return new StandardSlipForm();
}

StandardSlipFormDialog.prototype.getTitle = function() {
	return "입출금 전표 편집"
}

StandardSlipFormDialog.prototype.onInitedLayout = function(container) {
	SlipFormDialog.prototype.onInitedLayout.call(this, container);
	
	// this.layout.cells('a').setHeight(260);
	this.size(890, 280);
	
	// this.layout.cells('b').setHeight(300);

}

StandardSlipFormDialog.prototype.onInited = function(wnd) {

	var me = this;

	this.setModal(true);

	this.move(undefined, 20);

	this.layout = wnd.attachLayout('1C');
	this.layout.cells('a').hideHeader();
	
	this.onInitedLayout(this.layout.cells('a'));

};

