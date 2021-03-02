function JournalGroup(config) {
	DataGrid.call(this, config);

	this.setEnableUpdate(false);
	
	this.setRecordUrl('journalGroup/records');

	this.form;
	
	this.customerId;
	this.journalId;
}
JournalGroup.prototype = new DataGrid();
JournalGroup.prototype.constructor = JournalGroup;

JournalGroup.prototype.setParentCode = function(parentCode) {
	this.parentCode = parentCode;
};

JournalGroup.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

JournalGroup.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	/*var cell = this.addCustomerGroupCell('groupName', false).setFieldMap({
		group : {
			name : 'uuid',
			required : true,
		},
		groupName : {
			name : 'name',
		}
	}).setNextFocus('memo');*/
	
	// cell.setForm(this.form);

	this.form;
};

JournalGroup.prototype.setForm = function(form) {
	this.form = form;
	
	var me = this;
	form.setOnClearListener(function() {
		me.clear();
	});
	
	form.setOnCellSelected(function(data){
		
		if( this.name == 'customerName' ){
			me.customerId = data.code; 
			
			me.reload();
		}		
		
	});
	
	form.setOnBeforeUpdatedEvent(function(data){
		
		data.groups = me.toJson(); 
	});
	
	form.setOnBeforeLoaded(function(param){
		me.journalId = param.code;
		me.customerId = undefined;
		me.reload();
	});
	
	form.setOnAfterLoaded(function(result){
		// console.log(result);
	});
};

JournalGroup.prototype.init = function(container, config) {
	
	this.setRecordUrl('journalGroup/records');

	/*this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/groups/toolbar.xml"
	});*/

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/groups/grid.xml",
	});
	
	var me = this;
	this.setOnBeforeParamsListners(function(param){		
		if(me.customerId)
			param.customer = me.customerId;
		
		if(me.journalId)
			param.journal = me.journalId;
		
	});
};

JournalGroup.prototype.init2 = function(container, config) {
	
	this.setRecordUrl('journalGroup/records2');

	/*this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/groups/toolbar.xml"
	});*/

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/groups/grid2.xml",
	});
	
	var me = this;
	this.setOnBeforeParamsListners(function(param){		
		if(me.customerId)
			param.customer = me.customerId;
		
		if(me.journalId)
			param.journal = me.journalId;
		
	});
};