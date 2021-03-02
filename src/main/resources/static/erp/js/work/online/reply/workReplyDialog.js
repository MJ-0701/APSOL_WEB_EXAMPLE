function WorkReplyDialog(x, y) {
	Dialog.call(this, "onlineWorkReplyDialog", "댓글 편집", 350, 300, x, y);

	this.work;
	this.code;
	this.editor;

};

WorkReplyDialog.prototype = Object.create(Dialog.prototype);
WorkReplyDialog.prototype.constructor = WorkReplyDialog;

WorkReplyDialog.prototype.onInited = function(container) {

	this.setModal(true);

	this.editor = container.attachEditor();

};

WorkReplyDialog.prototype.setContent = function(content) {
	this.editor.setContent(content);
}

WorkReplyDialog.prototype.onClosed = function() {

	var json = {
		id : this.code,
		data : {
			content : this.editor.getContent()
		},
	};

	json.data.work = this.work;

	var me = this;
	sendJson('onlineWorkReply/update', json, function(result) {
		Dialog.prototype.onClosed.call(me);
	});

};