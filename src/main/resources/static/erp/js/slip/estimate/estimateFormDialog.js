/**
 * 일반 문서 폼 다이얼로그
 * 
 * @param x
 * @param y
 * @returns
 */
function EstimateFormDialog(x, y) {
	SlipDialog.call(this, 10, 10);

	this.form;
};

EstimateFormDialog.prototype = Object.create(SlipDialog.prototype);
EstimateFormDialog.prototype.constructor = EstimateFormDialog;

EstimateFormDialog.prototype.buildForm = function() {
	var form = new EstimateForm();
	return form;
}

EstimateFormDialog.prototype.initItem = function(container) {

	var me = this;
	this.item = new EstimateFormItem();
	this.item.slip = this.code;
	this.item.addProgressCell('b', container);
	this.item.setOnAfterUpdate(function(result){
		me.form.load(me.code);
		
	});
	
	this.item.setOnAfterDeleted(function(result){
		me.form.load(me.code);
	});
	
	this.item.init(container, {
		imageUrl : imageUrl,
		iconsPath : "img/18/"
	});

}

EstimateFormDialog.prototype.getTitle = function() {
	return "견적 전표 편집"
}

EstimateFormDialog.prototype.onInitedLayout = function(container) {
	SlipDialog.prototype.onInitedLayout.call(this, container);
	
	container.setHeight(280);
	this.size(890, 700);
	
	var me = this;
	this.setTitle(this.getTitle());
	
	this.form = this.buildForm();
	this.form.addProgressCell('a', container);
	this.form.setOnUpdatedEvent(function(){
		me.item.reload();
	});
	
	this.form.setOnAfterLoaded(function(data) {
		me.onAfterLoaded(data);
	});

	this.form.setOnSend(function() {
		me.close();
	});
	
	this.form.setOnReport(function() {
		me.close();
	});

	this.form.setOnInitedFormListener(function(form) {
		me.form.load(me.code);
	});

	this.form.init(container);
	
	this.tabbar = this.layout.cells('b').attachTabbar();
	
	this.addItemTab( 'itab', '품 목');

}