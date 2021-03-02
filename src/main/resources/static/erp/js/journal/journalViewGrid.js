function JournalViewGrid() {
	DateRangeGrid.call(this);

	this.setUrlPrefix('journalView');
	this.setKidsXmlFile('journalReply/journal/records');

	this.customerId;
	
	this.combos = new Array();
	
	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}
	
	/**
	 * 업무 구분 필터
	 */
	this.fKind = null;
	/**
	 * 연락 상태 필터
	 */
	this.fState = null;
	/**
	 * 작성자
	 */
	this.writerUrl = 'employee/combo?empty=true';
	this.fWriter = null;

}
JournalViewGrid.prototype = Object.create(DateRangeGrid.prototype);
JournalViewGrid.prototype.constructor = JournalViewGrid;

JournalViewGrid.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);
		
		if( !customer )
			return;

		if (colId == 'customerBusinessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

	});
	
	grid.attachEvent("onKeyPress", function(code, ctrl, shift) {

		if (code == 67 && ctrl) {
			
			var businessNumber = me.getData('businessNumber');
			if( !businessNumber )
				businessNumber = me.getData('customerBusinessNumber');

			$('#clipBoardInp').val(businessNumber); 
			$('#clipBoardInp').select();

			try {
				var successful = document.execCommand('copy'); 
			} catch (err) {
				alert('이 브라우저는 지원하지 않습니다.')
			}
		}
		return true;
	});
	
	if( this.customerId )
		this.loadRecords();
};

JournalViewGrid.prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
	return this;
};

JournalViewGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);
	
	if( this.customerId )
		params.customer = this.customerId;
	
	if( this.fKind )
		params.kind = this.fKind;
	
	if( this.fWriter )
		params.writer = this.fWriter;
	
	if( this.fState )
		params.state = this.fState;
	
	console.log(params);
};

JournalViewGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/view/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/view/grid.xml",
	});

};

JournalViewGrid.prototype.init2 = function(container, config) {
	
	this.setUrlPrefix('journalView2');

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/view2/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/view2/grid.xml",
	});

};

JournalViewGrid.prototype.toExcel = function() {
	//
	this.grid.toExcel('xml2Excel/generate?title=업무이력');
}

JournalViewGrid.prototype.onAfterLoaded = function(params) {
	DateRangeGrid.prototype.onAfterLoaded.call(this, params);
	
	for(i=0; i< this.grid.getRowsNum();++i){
		this.grid.openItem(this.grid.getRowId(i));
	}
	
};

JournalViewGrid.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	var me = this;
	
	toolbar.addText('cb0', 6, '업무구분');
	toolbar.addText('cb1', 7, '<div id="combo" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo", "cmb", 100);
	combo.readonly(true);
	this.combos.push( combo );
	combo.load('bascode/combo/JK?empty=true');
	combo.attachEvent("onChange", function(value, text){
		me.fKind = null;		
		if( value != '' )
			me.fKind = value;
		
		me.loadRecords();
	});
	
	toolbar.addText('cb0', 8, '작성자');
	toolbar.addText('cb1', 9, '<div id="combo1" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 100);
	combo.readonly(true);
	this.combos.push( combo );
	combo.load(this.writerUrl);
	combo.attachEvent("onChange", function(value, text){
		me.fWriter = null;		
		if( value != '' )
			me.fWriter = value;
		
		me.loadRecords();
	});
	
	toolbar.addText('cb0', 10, '상 태');
	toolbar.addText('cb1', 11, '<div id="combo2" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo2", "cmb2", 100);
	combo.readonly(true);
	this.combos.push( combo );
	combo.load('bascode/combo/MP?empty=true');
	combo.attachEvent("onChange", function(value, text){
		me.fState = null;		
		if( value != '' )
			me.fState = value;
		
		me.loadRecords();
	});
	
    /*dhxCombo.setComboValue('');
    dhxCombo.setComboText('');*/

};