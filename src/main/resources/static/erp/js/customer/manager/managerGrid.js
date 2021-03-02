function ManagerGrid() {
	DataGrid.call(this);
	
	var me = this;

	this.setRecordUrl('customerManager/records');
	
	this.setBascodeSelectFilterData('stateName', 'ST');
	this.setBascodeSelectFilterData('kindName', 'CT');
	this.setBascodeSelectFilterData('activatedName', 'AT');

	/*this.setSelectFilterData('managerName', new Array());
	$.get('customer/manager/filter', function(dataArray) {
		me.setSelectFilterData('managerName', dataArray);
	});*/
	
	this.fManager; 

}
ManagerGrid.prototype = Object.create(DataGrid.prototype);
ManagerGrid.prototype.constructor = ManagerGrid;

ManagerGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/manager/managerToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/manager/managerGrid.xml",
	}, 'server');

};

ManagerGrid.prototype.onBeforeParams = function(params) {
	params.manager = this.fManager ;
};

ManagerGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	var me = this;
	
	toolbar.addText('cb0', 8, '담당자');
	toolbar.addText('cb1', 9, '<div id="combo1" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 100);
	// combo.readonly(true);
	combo.enableFilteringMode(true);

	// this.combos.push(combo);
	combo.load('employee/combo?empty=true');
	combo.attachEvent("onChange", function(value, text) {
		me.fSender = null;
		if (value != '')
			me.fManager = value;
		
		me.loadRecords();
	});
	
}

ManagerGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	

	var me = this;
	grid.attachEvent("onKeyPress", function(code, ctrl, shift) {

		if (code == 67 && ctrl) {

			$('#clipBoardInp').val(me.getData('businessNumber')); 
			$('#clipBoardInp').select();

			try {
				var successful = document.execCommand('copy'); 
			} catch (err) {
				alert('이 브라우저는 지원하지 않습니다.')
			}
		}
		return true;
	});
	
	// this.loadRecords();
};