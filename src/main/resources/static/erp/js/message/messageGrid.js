function MessageGrid() {
	DataGrid.call(this);

	this.setUrlPrefix('message');

	this.range;
	this.title;
	this.kind;

	this.state;
	this.key;

	this.combos = new Array();
	this.enableFilter = false;

	/**
	 * 업무 구분 필터
	 */
	this.fKind = null;
	/**
	 * 연락 상태 필터
	 */
	this.fState = 'MP0001,MP0002';
	/**
	 * 발신자
	 */
	this.fSender = null;

	/**
	 * 수신자
	 */
	this.fReceiver = null;

}
MessageGrid.prototype = Object.create(DataGrid.prototype);
MessageGrid.prototype.constructor = MessageGrid;

MessageGrid.prototype.setRange = function(range) {
	this.range = range;

	return this;
};

MessageGrid.prototype.setKey = function(key) {
	this.key = key;
	return this;
};

MessageGrid.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);

	// stateName
	// state
	// this.grid.getCol

	var colIndex0 = this.grid.getColIndexById("state");
	var colIndex1 = this.grid.getColIndexById("stateName");

	for (i = 0; i < num; ++i) {
		var rowId = this.grid.getRowId(i);
		var stateUuid = this.getData('state', rowId);
		if (stateUuid == 'MP0001') {
			this.grid.setCellTextStyle(rowId, colIndex0, "color:red;");
		} else if (stateUuid == 'MP0002') {
			this.grid.setCellTextStyle(rowId, colIndex0, "color:green;");
		}

		var stateName = this.getData('stateName', rowId);
		if (stateName == '신규') {
			this.grid.setCellTextStyle(rowId, colIndex1, "color:red;");
		} else if (stateName == '진행중') {
			this.grid.setCellTextStyle(rowId, colIndex1, "color:green;");
		}

	}

};

MessageGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);
		
		if( !customer )
			return;

		if (colId == 'customerBusinessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

	});

	this.setOnRowSelect(function(rowId, colId, dg, colName) {
		if (colName == 'state') {
			grid.selectCell(grid.getRowIndex(rowId), colId);
			grid.editCell();
		}
	});

};

MessageGrid.prototype.setTitle = function(title) {
	this.title = title;
	return this;
};

MessageGrid.prototype.setKind = function(kind) {
	this.kind = kind;
	return this;
};

MessageGrid.prototype.getTitle = function() {
	return this.title;
};

MessageGrid.prototype.setState = function(state) {
	this.state = state;
	return this;
};

MessageGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.from = this.range.from;
	params.to = this.range.to;
	if (this.kind)
		params.kind = this.kind;

	if (this.fReceiver)
		params.receiver = this.fReceiver;

	if (this.fSender)
		params.sender = this.fSender;

	if (this.state)
		params.state = this.state;

	if (this.fState)
		params.state = this.fState;

};

MessageGrid.prototype.onAfterUpdate = function(result) {
	DataGrid.prototype.onAfterUpdate.call(this, result);

	// this.loadRecords();
}

MessageGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;
	
	
/*
	try {
		
		
		var obj = toolbar.objPull[toolbar.idPrefix + 'btnState0'].obj;
		$(obj).attr('id', 'MP0001');

		var obj = toolbar.objPull[toolbar.idPrefix + 'btnState1'].obj;
		$(obj).attr('id', 'MP0002');

		var obj = toolbar.objPull[toolbar.idPrefix + 'btnState2'].obj;
		$(obj).attr('id', 'MP0003');

		var obj = toolbar.objPull[toolbar.idPrefix + 'btnState3'].obj;
		$(obj).attr('id', 'MP0004');
		
		toolbar.setItemState('btnState0', true); 
		toolbar.setItemState('btnState1', true);
		
		toolbar.setItemImage('btnState0',  'check.png');
		toolbar.setItemImage('btnState1','check.png' );
		
	} catch (e) {

	}
	


	toolbar.attachEvent("onStateChange", function(id, state) {
		
		toolbar.setItemImage(id, state ? 'check.png': 'empty.jpg'  );
		me.fState = '';

		// your code here
		if (toolbar.getItemState('btnState0'))
			me.fState += ',MP0001';

		if (toolbar.getItemState('btnState1'))
			me.fState += ',MP0002';

		if (toolbar.getItemState('btnState2'))
			me.fState += ',MP0003';

		if (toolbar.getItemState('btnState3'))
			me.fState += ',MP0004';

		me.fState = me.fState.substring(1)

		me.loadRecords();
	});
		*/
	

	if (this.enableFilter) {
		console.log(this.enableFilter);
		toolbar.addText('cb0', 8, '발신자');
		toolbar.addText('cb1', 9, '<div id="combo1" style="width:100px; height:30px; margin-top:-3px;">');
		var combo = new dhtmlXCombo("combo1", "cmb1", 100);
		combo.readonly(true);
		this.combos.push(combo);
		combo.load('employee/combo?empty=true');
		combo.attachEvent("onChange", function(value, text) {
			me.fSender = null;
			if (value != '')
				me.fSender = value;

			me.loadRecords();
		});

		toolbar.addText('cb0', 8, '수신자');
		toolbar.addText('cb1', 9, '<div id="combo3" style="width:100px; height:30px; margin-top:-3px;">');
		var combo = new dhtmlXCombo("combo3", "cmb3", 100);
		combo.readonly(true);
		this.combos.push(combo);
		combo.load('employee/combo?empty=true');
		combo.attachEvent("onChange", function(value, text) {
			me.fReceiver = null;
			if (value != '')
				me.fReceiver = value;

			me.loadRecords();
		});

		toolbar.addText('cb0', 10, '상 태');
		toolbar.addText('cb1', 11, '<div id="combo2" style="width:100px; height:30px; margin-top:-3px;">');
		var combo = new dhtmlXCombo("combo2", "cmb2", 100);
		combo.readonly(true);
		this.combos.push(combo);
		combo.load('bascode/combo/MP?empty=true');
		combo.attachEvent("onChange", function(value, text) {
			me.fState = null;
			if (value != '')
				me.fState = value;

			me.loadRecords();
		});
	}

	/*
	 * dhxCombo.setComboValue(''); dhxCombo.setComboText('');
	 */

};