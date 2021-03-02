/**
 * 일반 문서 폼 다이얼로그
 * 
 * @param x
 * @param y
 * @returns
 */
function WorkFormDialog(name, x, y) {
	WorkDialog.call(this, name, 10, 10);

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
	this.form.setKind(this.name);
	this.form.addProgressCell('a', this.getWnd());

	this.form.setOnAfterLoaded(function(data) {
		me.onAfterLoaded(data);
	});

	this.form.setOnSend(function(result, isClosed) {
		console.log(isClosed);
		if( isClosed )
			me.close();
	});

	this.form.setOnInitedFormListener(function(form) {
		me.form.load(me.code);
	});

	this.form.init(container);

}