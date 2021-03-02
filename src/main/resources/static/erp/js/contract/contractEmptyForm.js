function ContractEmptyForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('contract');

	this.file;
	this.customerId;
	this.autoClear = false;
	
	this.formCell;
}

ContractEmptyForm.prototype = Object.create(DataForm.prototype);
ContractEmptyForm.prototype.constructor = ContractEmptyForm;

ContractEmptyForm.prototype.load = function(id, delayTime) {

	if (id != undefined)
		this.id = id;

	var me = this;

	if (me.id == undefined)
		return;

	me.progressOn();
	me.clear();
	me.hideCells();

	if (me.reloadTimer != null) {
		clearTimeout(me.reloadTimer);
		me.reloadTimer = null;
	}

	if (delayTime == undefined)
		delayTime = this.delayTime;

	me.reloadTimer = setTimeout(function() {
		me.loadData(id);
	}, delayTime);

};

ContractEmptyForm.prototype.loadData = function(id) {
	
	console.log("id " + id);

	var me = this;

	me.progressOn();
	me.clear();

	if (id != undefined)
		this.id = id;

	var param = me.getParams();
	me.onBeforeLoaded(param);

	$.get(me.infoUrl, param, function(result) {
		
		console.log(result);

		me.progressOff();

		if (result) {
			me.id = result.id;
			me.formCell.attachHTMLString(result.data.contractContents);
			
		}

		me.onAfterLoaded(result);

	});
};

ContractEmptyForm.prototype.init = function(container, enableToolbar) {

	/*if (enableToolbar == undefined || enableToolbar == true) {
		this.initToolbar(container, {
			iconsPath : "img/18/",
			xml : 'erp/xml/contract/formToolbar2.xml',
		});
	}*/
	
	var tabbar = container.attachTabbar({
		tabs : [ {
			id : "a1",
			text : "계약 정보",
			active : true
		}, {
			id : "a2",
			text : "계약서 첨부 파일"
		},{
			id : "a3",
			text : "손익 확정 품목"
		}, ]
	}); 
	
	this.formCell = tabbar.cells("a1");
	this.formCell.showInnerScroll();

	this.file = new FileGrid();
	this.file.setForm(this);
	this.file.enableUpdateTitle = true;
	// this.file.setEnableUpdate(false);
	this.file.kind = 'DK0003';
	this.file.init(tabbar.cells("a2"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	this.item = new ContractItem();
	this.item.setForm(this);
	this.item.enableUpdateTitle = true;
	
	this.item.init(tabbar.cells("a3"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
}

ContractEmptyForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);
};

ContractEmptyForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};
