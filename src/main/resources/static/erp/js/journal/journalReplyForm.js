function JournalReplyForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('journalReply');

}

JournalReplyForm.prototype = Object.create(DataForm.prototype);
JournalReplyForm.prototype.constructor = JournalReplyForm;

JournalReplyForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/journal/reply/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'erp/xml/journal/reply/form.xml',
	});

	// dhxform_obj_dhx_web 이 클래스를 부모의 가로 만큼 절대값으로 지정
	// this.editor = layout.cells('b').attachEditor();
}
