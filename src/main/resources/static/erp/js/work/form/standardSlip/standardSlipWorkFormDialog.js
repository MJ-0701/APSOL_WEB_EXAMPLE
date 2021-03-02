/**
 * 일반 문서 폼 다이얼로그
 * @param x
 * @param y
 * @returns
 */
function StandardSlipWorkFormDialog(name,x, y) {
	WorkFormDialog.call(this, name,10, 10);
	
};

StandardSlipWorkFormDialog.prototype = Object.create(WorkFormDialog.prototype);
StandardSlipWorkFormDialog.prototype.constructor = StandardSlipWorkFormDialog;

StandardSlipWorkFormDialog.prototype.buildForm = function() {	
	
	return new StandardSlipWorkForm();
}

StandardSlipWorkFormDialog.prototype.getTitle = function() {
	return "입출금 문서 편집"
}

StandardSlipWorkFormDialog.prototype.onInitedLayout = function(container) {
	WorkFormDialog.prototype.onInitedLayout.call(this, container);
	
	this.layout.cells('a').setHeight(300);
	this.size(890, 700);
	
	// this.layout.cells('b').setHeight(300);

}