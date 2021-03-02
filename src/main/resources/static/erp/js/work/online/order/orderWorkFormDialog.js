/**
 * 일반 문서 폼 다이얼로그
 * @param x
 * @param y
 * @returns
 */
function OrderWorkFormDialog(x, y) {
	WorkFormDialog.call(this, 10, 10);
	
};

OrderWorkFormDialog.prototype = Object.create(WorkFormDialog.prototype);
OrderWorkFormDialog.prototype.constructor = OrderWorkFormDialog;

OrderWorkFormDialog.prototype.buildForm = function() {	
	
	var me = this;	
	var form = new OrderWorkForm();
	form.setOnUpdatedEvent(function(){
		me.item.reload();
	});
	
	return form;
}

OrderWorkFormDialog.prototype.getTitle = function() {
	return "주문서 문서 편집"
}

OrderWorkFormDialog.prototype.onInitedLayout = function(container) {
	WorkFormDialog.prototype.onInitedLayout.call(this, container);
	
	this.addItemTab('itab', '품 목');
	
	var me = this
	this.item.setOnAfterUpdate(function(result){
		me.form.load(me.code);
		
	});
	
	this.item.setOnAfterDeleted(function(result){
		me.form.load(me.code);
	});
	
	this.layout.cells('a').setHeight(280);
	this.size(900, 680);
	
	// this.layout.cells('b').setHeight(300);

}

OrderWorkFormDialog.prototype.initItem = function(container) {

	this.item = new OrderWorkItem();
	this.item.work = this.code;
	this.item.addProgressCell('b', container);
	this.item.init(container, {
		imageUrl : imageUrl,
		iconsPath : "img/18/"
	});

}

OrderWorkFormDialog.prototype.onInited = function(wnd) {

	var me = this;

	this.setModal(true);

	this.move(undefined, 20);

	this.layout = wnd.attachLayout('2E');

	this.layout.cells('a').hideHeader();
	this.layout.cells('b').hideHeader();

	this.layout.cells('b').setHeight(300);

	// 조회부가 아니라 작성부. 결재부에서 편집 키를 이용해서 팝업을 띄운 후 결재를 수정한다.
	// 첨부 파일에서는 fileValut 를 활용한다.
	this.tabbar = this.layout.cells('b').attachTabbar({});
		
	this.onInitedLayout(this.layout.cells('a'));

};