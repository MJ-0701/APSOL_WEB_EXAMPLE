function SelectWorkDialog(x, y) {
	Dialog.call(this, "selectWorkDialog", "문서 종류 선택", 260, 250, x, y);

	this.onButtonClickEvents = new Array();
};

SelectWorkDialog.prototype = Object.create(Dialog.prototype);
SelectWorkDialog.prototype.constructor = SelectWorkDialog;

SelectWorkDialog.prototype.setOnButtonClick = function(fn) {
	this.onButtonClickEvents.push(fn);
};

SelectWorkDialog.prototype.onButtonClick = function(id) {
	for (idx in this.onButtonClickEvents) {
		this.onButtonClickEvents[idx].call(this, id);
	}
};

SelectWorkDialog.prototype.onInited = function(container) {

	this.setModal(true);

	container.button("minmax").hide();
	container.button("park").hide();
	container.denyResize();
	container.denyMove();

	this.form = container.attachForm();

	this.form.loadStruct('erp/xml/work/selectForm.xml', function() {
	});

	var me = this;
	this.form.attachEvent("onButtonClick", function(name) {

		me.onButtonClick(name);

	});

};