function SlipAccount() {
	DateRangeGrid.call(this);

	this.setUrlPrefix('slipAccount2');

	this.slipId;
	this.journalId;
	this.form;
	
	this.enableUpdateTitle = true;
}

SlipAccount.prototype = Object.create(DateRangeGrid.prototype);
SlipAccount.prototype.constructor = SlipAccount;

SlipAccount.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	this.addItemCell('itemName').setNextFocus('serialNumber');

	var me = this;
	this.addSerialCell('serialNumber', function(param) {
		param.customer = me.form.getData('customer');
		param.kind = me.form.getData('kind');
		param.item = me.getData('item');
		return param;
	}).setNextFocus('memo');
	
	
	this.addBascodeCell('warehouseName').setPrefix("WH").setFieldMap( {
		warehouse : {
			name : 'uuid',
			required : true,
		},
		warehouseName : {
			name : 'name',
		}
	});
};

SlipAccount.prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
};

SlipAccount.prototype.onBeforeParams = function(param) {
	DateRangeGrid.prototype.onBeforeParams.call(this, param);

	if (this.slipId != undefined)
		param.slip = this.slipId;

	if (this.journalId != undefined)
		param.journal = this.journalId;
	
};

SlipAccount.prototype.onAfterLoaded = function(num) {
	DateRangeGrid.prototype.onAfterLoaded.call(this, num);
	
};



SlipAccount.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/item/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/item/grid.xml"
	});

};

SlipAccount.prototype.init2 = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/item/grid2.xml"
	});

};

SlipAccount.prototype.setForm = function(form) {
	this.form = form;

	var me = this;
	
	// 거래처가 바뀌는 이벤트.

	form.setOnBeforeUpdatedEvent(function(data) {

		data.items = me.toJson();

	});

	form.setOnBeforeLoaded(function(param) {
		me.journalId = param.code;
		me.reload();
	});

	form.setOnAfterLoaded(function(result) {
		/*me.journalId = result.id;
		me.reload();*/
	});
	
	form.setOnSuccessedUpdateEvent(function(){
		me.clear();
	});
};

SlipAccount.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "slipAccount2/insert", 'itemName', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};

SlipAccount.prototype.onInitedToolbar = function(toolbar) {
	var searchInp = toolbar.getInput("searchInput");
	var me = this;
	if(searchInp){
		$(searchInp).focus(function(){
			$(searchInp).select();
		});
		
		toolbar.attachEvent("onEnter", function(id, value){
		    if( id == 'searchInput'){
		    	// 검색하여 추가한다.
		    	var value = toolbar.getValue(id);
		    	$.get('popup/serial/search2', {
		    		keyword : value
		    	}, function(result){
		    		
		    		$(searchInp).select();
		    		
		    		if( result.count == 1 ){
		    			
		    			insertRow(me.grid, "slipAccount2/insert?serial=" + value, '', 0, function(grid, id, data) {
		    				
		    				setEditbaleCellClass(grid, id);
		    				// 재정의한거니 호출해준다.		    				
		    				setRowData(grid, id, result.data);
		    				setData(grid, id, 'item', result.data.uuid);
		    				setData(grid, id, 'itemName', result.data.name);
		    				console.log( getRowData(grid, id) );
		    				me.onRowAdded(id, data);
		    			});
		    		}
		    		else {
		    			dhtmlx.alert({
							type : "alert-error",
							text : "없거나 모호한 시리얼번호 입니다. : " + value ,
							callback : function() {
							}
						});
		    		}
		    	} );
		    }
		});
	}
};
