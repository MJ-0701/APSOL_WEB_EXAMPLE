/**
 * 일반 문서 폼 다이얼로그
 * 
 * @param x
 * @param y
 * @returns
 */
function WorkFormDialog(x, y) {
	WorkDialog.call(this, 10, 10);

	this.form;
};

WorkFormDialog.prototype = Object.create(WorkDialog.prototype);
WorkFormDialog.prototype.constructor = WorkFormDialog;

WorkFormDialog.prototype.buildForm = function() {
}

WorkFormDialog.prototype.getTitle = function() {
	return "문서 편집"
}

WorkFormDialog.prototype.onInitedLayout = function(container) {
	WorkDialog.prototype.onInitedLayout.call(this, container);
	var me = this;
	this.setTitle(this.getTitle());
	
	this.form = this.buildForm();
	this.form.addProgressCell('a', container);

	this.form.setOnAfterLoaded(function(data) {
		me.onAfterLoaded(data);
	});

	this.form.setOnSend(function() {
		me.close();
	});

	this.form.setOnInitedFormListener(function(form) {
		me.form.load(me.code);
	});

	this.form.init(container);
	
	

}

WorkFormDialog.prototype.onInited = function(wnd) {

	var me = this;

	this.setModal(true);

	this.move(undefined, 20);

	this.layout = wnd.attachLayout('1C');

	this.layout.cells('a').hideHeader();
		
	this.onInitedLayout(this.layout.cells('a'));

};