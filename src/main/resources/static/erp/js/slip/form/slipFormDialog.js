/**
 * 일반 문서 폼 다이얼로그
 * 
 * @param x
 * @param y
 * @returns
 */
function SlipFormDialog(x, y) {
	SlipDialog.call(this, 10, 10);

	this.form;
};

SlipFormDialog.prototype = Object.create(SlipDialog.prototype);
SlipFormDialog.prototype.constructor = SlipFormDialog;

SlipFormDialog.prototype.buildForm = function() {
}

SlipFormDialog.prototype.getTitle = function() {
	return "전표 편집"
}

SlipFormDialog.prototype.onInitedLayout = function(container) {
	SlipDialog.prototype.onInitedLayout.call(this, container);
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
	
	this.form.setOnReport(function() {
		me.close();
	});

	this.form.setOnInitedFormListener(function(form) {
		me.form.load(me.code);
	});

	this.form.init(container);

}