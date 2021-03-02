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

	this.groupGrid;
	this.groupItemGrid;
	
	this.myForm;
	this.parentForm;
};

SmsSendFormAddressDialog.prototype = Object.create(Dialog.prototype);
SmsSendFormAddressDialog.prototype.constructor = SmsSendFormAddressDialog;

SmsSendFormAddressDialog.prototype.reload = function(){
	this.fromGrid.reload();
	this.toGrid.reload();
};

SmsSendFormAddressDialog.prototype.onInited = function(wnd) {
	
	var me = this;
	
	this.parent = wnd.attachLayout("2E");
	
	this.parent.cells('a').hideHeader();
	this.parent.cells('b').hideHeader();
	
	this.parent.cells('b').setHeight(42);

	this.layout = this.parent.cells("a").attachLayout("2U");
	
	this.layout.cells('a').hideHeader();
	this.layout.cells('b').hideHeader();

	me.groupGrid = new SmsAddressGroupGrid();
	me.groupGrid.setEditable(false);
	me.groupGrid.init(this.layout.cells("a"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	me.groupGrid.toolbar.attachEvent("onClick", function(name){
		switch(name) {
			case "btnShowAll":
				me.groupItemGrid.setGroupCode(null);
				me.groupItemGrid.reload();
				me.groupGrid.grid.clearSelection();
				console.log("모두 보여주기");
				break;
		}
	});
	
	me.groupGrid.setOnRowSelect(function(rowId, ind) {
		var selectedRows = me.groupGrid.grid.selectedRows[0];
		var selectedRowsCode = selectedRows.cells[0].innerText;
		var selectedRowsName = selectedRows.cells[1].innerText;

		me.groupItemGrid.setGroupCode(selectedRowsCode);
		me.groupItemGrid.reload();
		
	});
	
	me.groupItemGrid = new SmsAddressGroupItemGrid();
	me.groupItemGrid.setEditable(false);
	me.groupItemGrid.setMultiSelectable(true);
	me.groupItemGrid.init(this.layout.cells("b"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	

//	this.buttonLayout = parent.cells("b").attachLayout("1C");
	
	var formData = [
	    {type: "block", className:"buttonContainer", width: 900, list:[
	        {type: "button", name: "btnSaveAddr", value: "저장", position: "absolute", inputLeft:820, inputTop:0}
	    ]}
	];
	
	this.myForm = this.parent.cells("b").attachForm(formData);
	
	this.myForm.attachEvent("onButtonClick", function(name) {
		switch(name) {
			case "btnSaveAddr":
				var selectedGroupGrid = me.groupGrid.grid.getSelectedBlock();
				var selectedGroupItemGrid = me.groupItemGrid.grid.getSelectedBlock();
				console.log(selectedGroupGrid);
				console.log(selectedGroupItemGrid);
				
				if (null == selectedGroupGrid && null == selectedGroupItemGrid) {
					me.groupItemGrid.grid.selectAll();
					selectedGroupItemGrid = me.groupItemGrid.grid.getSelectedBlock();
				}
				else {
					if (null != selectedGroupGrid && null == selectedGroupItemGrid) {
						me.groupItemGrid.grid.selectAll();
						selectedGroupItemGrid = me.groupItemGrid.grid.getSelectedBlock();
					}
				}
				var arr = selectedGroupItemGrid.LeftTopRow.split(",");
				console.log(arr);
				for (var i=0; i<arr.length; i++) {
					var data = me.groupItemGrid.grid.getRowData(arr[i]);
					console.log(data);
					
					inputPhoneNumberGridByDlg(me.parentForm, data.name, data.phone);
				}
				wnd.close();
				
				break;
		}
	});	
};

SmsSendFormAddressDialog.prototype.setParentForm = function(parent) {
	this.parentForm = parent;
}