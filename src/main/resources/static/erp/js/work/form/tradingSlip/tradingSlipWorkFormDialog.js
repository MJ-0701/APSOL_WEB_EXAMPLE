/**
 * 일반 문서 폼 다이얼로그
 * @param x
 * @param y
 * @returns
 */
function TradingSlipWorkFormDialog(name, x, y) {
	WorkFormDialog.call(this, name, 10, 10);
	
};

TradingSlipWorkFormDialog.prototype = Object.create(WorkFormDialog.prototype);
TradingSlipWorkFormDialog.prototype.constructor = TradingSlipWorkFormDialog;

TradingSlipWorkFormDialog.prototype.buildForm = function() {	
	
	return new TradingSlipWorkForm();
}

TradingSlipWorkFormDialog.prototype.getTitle = function() {
	return "매입매출 문서 편집"
}

TradingSlipWorkFormDialog.prototype.onInitedLayout = function(container) {
	WorkFormDialog.prototype.onInitedLayout.call(this, container);
	
	this.addItemTab('itab', '품 목');
	
	var me = this
	this.item.setOnAfterUpdate(function(result){
		me.form.load(me.code);
	});
	
	this.item.setOnAfterDeleted(function(result){
		me.form.load(me.code);
	});
	
	this.layout.cells('a').setHeight(300);
	this.size(920, 650);
	
	// this.layout.cells('b').setHeight(300);

}