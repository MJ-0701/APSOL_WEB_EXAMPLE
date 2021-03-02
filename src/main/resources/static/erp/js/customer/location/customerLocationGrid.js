function CustomerLocationGrid() {
	DataGrid.call(this);
	this.setUrlPrefix('customerLocation');

	this.lat;
	this.lng;
	
	this.fRadius = '3';
	
	this.combos = new Array();

}
CustomerLocationGrid.prototype = Object.create(DataGrid.prototype);
CustomerLocationGrid.prototype.constructor = CustomerLocationGrid;

CustomerLocationGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/location/grid.xml",
	});
	
	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/location/toolbar.xml",
	});

};

CustomerLocationGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();
};

CustomerLocationGrid.prototype.onInitedToolbar = function(toolbar) {
	toolbar.addText('cb0', 0, '<div id="combo1" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 70);
	combo.readonly(true);
	this.combos.push(combo);
	
	combo.addOption("1", "1Km");
	combo.addOption( "3",   "3Km");
	combo.addOption("5", "5Km");
	combo.addOption("10",  "10Km");
	combo.addOption("15",  "15Km");
	combo.addOption("20",  "20Km");
	combo.addOption("30",  "30Km");
	
	combo.selectOption(combo.getIndexByValue(this.fRadius));
	
	var me = this;
	combo.attachEvent("onChange", function(value, text) {
		me.fRadius = null;
		if (value != '')
			me.fRadius = value;

		me.loadRecords();
	});
	
	var date = new Date();	
	
	for(i=1;i<=3;++i){
		
		var firstDayOfMonth = new Date( date.getFullYear(), date.getMonth() , 1 );
		var lastMonth = new Date ( firstDayOfMonth.setDate( firstDayOfMonth.getDate() - 1 ) );
		date = lastMonth;
				
		var yyyy = date.getFullYear();
		var mm = date.getMonth()+1;
		
		var colIndex=this.grid.getColIndexById("vanCnt"+i);
		this.grid.setColLabel(colIndex, yyyy + "-" + mm);
		
	}
		
};

CustomerLocationGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	if (this.lat)
		params.lat = this.lat;
	if (this.lng)
		params.lng = this.lng;
	if(this.fRadius)
		params.radius = this.fRadius;

};