/**
 * 일반 문서 폼 다이얼로그
 * @param x
 * @param y
 * @returns
 */
function EstimateWorkFormDialog(name,x, y) {
	WorkFormDialog.call(this, name,10, 10);
	
};

EstimateWorkFormDialog.prototype = Object.create(WorkFormDialog.prototype);
EstimateWorkFormDialog.prototype.constructor = EstimateWorkFormDialog;

EstimateWorkFormDialog.prototype.buildForm = function() {	
	
	var me = this;	
	var form = new EstimateWorkForm();
	form.setOnUpdatedEvent(function(){
		me.item.reload();
	});
	
	return form;
}

EstimateWorkFormDialog.prototype.getTitle = function() {
	return "견적서 문서 편집"
}

EstimateWorkFormDialog.prototype.onInitedLayout = function(container) {
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
	this.size(900, 680);
	
	// this.layout.cells('b').setHeight(300);

}

EstimateWorkFormDialog.prototype.initItem = function(container) {

	this.item = new EstimateWorkItem();
	this.item.work = this.code;
	this.item.addProgressCell('b', container);
	this.item.init(container, {
		imageUrl : imageUrl,
		iconsPath : "img/18/"
	});

}