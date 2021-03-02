/**
 * 일반 문서 폼 다이얼로그
 * @param x
 * @param y
 * @returns
 */
function TradingSlipFormDialog(x, y) {
	SlipFormDialog.call(this, 10, 10);
	
	this.item;
};

TradingSlipFormDialog.prototype = Object.create(SlipFormDialog.prototype);
TradingSlipFormDialog.prototype.constructor = TradingSlipFormDialog;

TradingSlipFormDialog.prototype.buildForm = function() {	
	
	return new TradingSlipForm();
}

TradingSlipFormDialog.prototype.getTitle = function() {
	return "매입매출 전표 편집"
}

TradingSlipFormDialog.prototype.onInitedLayout = function(container) {
	SlipFormDialog.prototype.onInitedLayout.call(this, container);
	
	this.size(890, 520);
	
	this.tabbar = this.layout.cells('b').attachTabbar();
	
	this.addItemTab( 'itab', '품 목');
	
	var me = this
	this.item.setOnAfterUpdate(function(result){
		me.form.load(me.code);
	});
	
	this.item.setOnAfterDeleted(function(result){
		me.form.load(me.code);
	});
}

TradingSlipFormDialog.prototype.onInited = function(wnd) {

	var me = this;

	this.setModal(true);

	this.move(undefined, 20);

	this.layout = wnd.attachLayout('2E');
	this.layout.cells('a').hideHeader();
	this.layout.cells('b').hideHeader();
	
	this.layout.cells('a').setHeight(230);
	
	this.onInitedLayout(this.layout.cells('a'));

};

