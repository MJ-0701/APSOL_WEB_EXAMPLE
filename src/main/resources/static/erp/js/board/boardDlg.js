function BoardDialog(readOnly, x, y) {
	Dialog.call(this, "boardDialog", "게시판 편집", 600, 800, x, y);
	
	this.form;
	this.id;
	this.urlPrefix = 'board';
};

BoardDialog.prototype = Object.create(Dialog.prototype);
BoardDialog.prototype.constructor = BoardDialog;

BoardDialog.prototype.onInited = function(wnd) {

	this.form = new BoardForm();
	this.form.setUrlPrefix(this.urlPrefix);
	this.form.id = this.id;
	this.form.init(wnd);
	
};