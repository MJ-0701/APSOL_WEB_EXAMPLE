function JournalPlanDialog(x, y) {
	Dialog.call(this, "journalPlanDialog", "업무 배정", 550, 400, x, y);

	this.editor;
	this.journalId = 0;
	this.approvalId = 0;
	this.id = new Date().getTime() * -1;
	this.toolbar;
	this.content = '';
	this.formData = {};

	this.onUpdatedListner = new Array();
	this.onDeletedListner = new Array();
	this.form ;
};

JournalPlanDialog.prototype = Object.create(Dialog.prototype);
JournalPlanDialog.prototype.constructor = JournalPlanDialog;

JournalPlanDialog.prototype.setOnUpdatedListner = function(fn) {
	this.onUpdatedListner.push(fn);
}

JournalPlanDialog.prototype.onUpdated = function(result) {

	for (idx in this.onUpdatedListner) {
		this.onUpdatedListner[idx].call(this, result);
	}

}

JournalPlanDialog.prototype.setOnDeletedListner = function(fn) {
	this.onDeletedListner.push(fn);
}

JournalPlanDialog.prototype.onDeleted = function(result) {

	for (idx in this.onDeletedListner) {
		this.onDeletedListner[idx].call(this, result);
	}

}

JournalPlanDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var me = this;
	this.toolbar = wnd.attachToolbar();
	this.toolbar.setIconsPath("img/18/");
	this.toolbar.loadStruct("erp/xml/journal/plan/formToolbar.xml", function() {
		setToolbarStyle(me.toolbar);

	});
	
	var layout = wnd.attachLayout('2E');
	layout.cells('a').setHeight(80);
	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	
	this.form = layout.cells('a').attachForm();
	var me = this;
	this.form.loadStruct('erp/xml/journal/plan/form.xml', function() {
		me.form.setFormData(me.formData);
	});
	
	this.form.attachEvent("onButtonClick", function(name) {
		
	});
	
	this.editor =layout.cells('b').attachEditor();
	this.editor.setContent(this.content);

	this.toolbar.attachEvent("onClick", function(id) {
		switch (id) {

		/*case 'btnAdd':
			me.reset();
			break;*/

		case 'btnUpdate':
			me.update();
			break;

/*		case 'btnDelete':
			me.remove();
			break;*/

		}
	});

};

JournalPlanDialog.prototype.setFormData = function(formData) {
	this.formData = formData;
};

JournalPlanDialog.prototype.setContent = function(content) {
	this.content = content;
};

JournalPlanDialog.prototype.reset = function() {
	
	this.content = '';
};

JournalPlanDialog.prototype.update = function() {
	this.getWindow().progressOn();
	
	var data = this.form.getFormData(true);
	
	data.content = this.editor.getContent();
	
	var json = {
		id : this.journalId,
		data : data, 
	};
	console.log(json);
	
	var me = this;
	sendJson('journalPick/pick', json, function(result) {

		me.onUpdated(result);

		me.getWindow().progressOff();

		if (result.error) {
			dhtmlx.alert({
				title : "자료를 수정할 수 없습니다!",
				type : "alert-error",
				text : result.error
			});
			return;
		}
		
		me.close();

	});
};

JournalPlanDialog.prototype.remove = function() {
	this.getWindow().progressOn();
	
	var me = this;
	
	$.post('journalPlan/remove', {code : this.id}, function(result){
		
		me.getWindow().progressOff();
		me.onDeleted(result);
		me.close();
		
	});
	
};