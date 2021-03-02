function SmsSendFormAddressDialog(readOnly, x, y) {
	Dialog.call(this, "smsSendFormAddressDialog", "주소록", 950, 400, x, y);

	this.fromCustomer;
	this.toCustomer;
	
	this.fromCustomerName;
	this.toCustomerName;
	
	this.fromCustomerBusinessNumber;
	this.toCustomerBusinessNumber;
	
	this.fromGrid;
	this.toGrid;
};

SmsSendFormAddressDialog.prototype = Object.create(Dialog.prototype);
SmsSendFormAddressDialog.prototype.constructor = SmsSendFormAddressDialog;

SmsSendFormAddressDialog.prototype.reload = function(){
	this.fromGrid.reload();
	this.toGrid.reload();
};

SmsSendFormAddressDialog.prototype.onInited = function(wnd) {
	
	var me = this;

	this.layout = wnd.attachLayout("2U");
	
	this.layout.cells('a').hideHeader();
	this.layout.cells('b').hideHeader();

	this.fromGrid = new SmsSendFormAddressGrid();
	this.fromGrid.type = "FROM";
	this.fromGrid.customer = this.fromCustomer;
	this.fromGrid.customerName = this.fromCustomerName;
	this.fromGrid.businessNumber = this.fromCustomerBusinessNumber;
	this.fromGrid.init(this.layout.cells("a"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	this.fromGrid.setOnClickToolbarButton(function(id, toolbar) {

		if (id == 'btnMoveAll') {
			dhtmlx.confirm({
				title : "검색된 항목들을 모두 이동하시겠습니까?",
				type : "confirm-warning",
				text : "이동된 항목은 복구할 수 없습니다.",
				callback : function(r) {
					if (r) {
						
						var params = {};
						
						for (key in  me.fromGrid.filterParams) {
							params[key] =  me.fromGrid.filterParams[key];
						}

						params.customer = me.toCustomer;

						$.post('customerItem/moveAll', params, function() {
							me.fromGrid.reload();
							me.toGrid.reload();
						});
					}
				}
			});
		}

	});
	
	this.toGrid = new SmsSendFormAddressGrid();
	this.toGrid.type = "TO";
	this.toGrid.customer = this.toCustomer;
	this.toGrid.customerName = this.toCustomerName;
	this.toGrid.businessNumber = this.toCustomerBusinessNumber;
	this.toGrid.init(this.layout.cells("b"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
};


function onAddrRowClick_from(dlg, rowId) {
	var fromGrid = dlg.fromGrid;
	var toGrid = dlg.toGrid;
	
	var data = fromGrid.getRowData(rowId);
	data.btn = data.btn.replace("_from", "_to");
	console.log(data);
	fromGrid.grid.deleteRow(rowId);
	toGrid.addRow(data.code, data);
	
	
/*
	$.post('customerItem/move', {
		item : rowId,
		customer : itemDlg.toCustomer
	}, function() {
		itemDlg.reload();
	});
*/
}

function onAddrRowClick_to(dlg, rowId) {
	var fromGrid = dlg.fromGrid;
	var toGrid = dlg.toGrid;
	
	var data = toGrid.getRowData(rowId);
	data.btn = data.btn.replace("_to", "_from");
	toGrid.grid.deleteRow(rowId);
	fromGrid.addRow(data.code, data);
/*
	$.post('customerItem/move', {
		item : rowId,
		customer : itemDlg.fromCustomer
	}, function() {
		itemDlg.reload();
	});
*/
}