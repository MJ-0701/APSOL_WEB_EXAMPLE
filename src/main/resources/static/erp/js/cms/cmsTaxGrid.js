function CMSTaxGrid() {
	DataGrid.call(this);
	this.setRecordUrl('cmsTax/records');
	this.setUpdateUrl('cmsTax/updateAccount');
	
	this.setBascodeSelectFilterData('taxTypeName', 'TC');
}

CMSTaxGrid.prototype = Object.create(DataGrid.prototype);
CMSTaxGrid.prototype.constructor = CMSTaxGrid;
CMSTaxGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "cmsTax/grid",
	}, 'server');
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/cms/cmsTaxGridToolbar.xml',
	});
};

CMSTaxGrid.prototype.toExcel = function() {
	//
	this.grid.toExcel('xml2Excel/generate?title=cms세금계산서관리');
}

CMSTaxGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);

		if (!customer)
			return;

		if (colId == 'businessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

	});
	
	this.addBascodeCell('taxTypeName', 'TC').setFieldMap({
		taxType : {
			name : 'uuid',
		},
		taxTypeName : {
			name : 'name',
		},
	});

};

CMSTaxGrid.prototype.addBascodeCell = function(name, prefix, autoUpdate) {
	var cell = new BascodeCell(this.grid, name);
	this.putCell(name, cell, autoUpdate);
	cell.setPrefix(prefix);
	return cell;
};

CMSTaxGrid.prototype.putCell = function(name, cell, autoUpdate) {
	console.log('update url : ' + this.updateUrl);
	if (autoUpdate == undefined || autoUpdate == true) {
		var me = this;
		cell.setOnSuccessed(function() {
			me.update();
		});
	}

	this.cells[name] = cell;
};

CMSTaxGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnTax') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			var selectedIds = me.grid.getSelectedRowId();
			$.get('cmsTax/selectedItemTax', {
				"ids" : selectedIds
			}, function(result) {
				var Ca = /\+/g;
				var response = decodeURIComponent(result.replace(Ca, " "));
				dhtmlx.alert({
					title : "알림",
					type : "alert-error",
					text : response,
					callback : function() {
						me.progressOff();
						me.reload();
					}
				});

			});
		} else {
			dhtmlx.alert({
				title : "세금계산서를 발행할 수 없습니다.",
				type : "alert-error",
				text : "발행할 항목을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	}else if (id == 'btnTaxNotSend') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			var selectedIds = me.grid.getSelectedRowId();
			$.get('cmsTax/selectedItemTaxNotSend', {
				"ids" : selectedIds
			}, function(result) {
				var Ca = /\+/g;
				var response = decodeURIComponent(result.replace(Ca, " "));
				dhtmlx.alert({
					title : "알림",
					type : "alert-error",
					text : response,
					callback : function() {
						me.progressOff();
						me.reload();
					}
				});

			});
		} else {
			dhtmlx.alert({
				title : "세금계산서를 발행할 수 없습니다.",
				type : "alert-error",
				text : "발행할 항목을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	}

};

CMSTaxGrid.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);

	for (i = 0; i < num; ++i) {
		var rowId = this.grid.getRowId(i);
		for (j = 0; j < 12; j++) {
			var payment = this.getData('payment' + j, rowId);
			var hasTaxId = this.getData('hasTax' + j, rowId);
			if (hasTaxId != null && hasTaxId != '0') {
				var colIndex = this.grid.getColIndexById('payment' + j);
				this.grid.setCellTextStyle(rowId, colIndex, "color:red; font-weight:bold;");
			}

		}

	}

};

CMSTaxGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
};