function DocumentApprovalGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('documentApproval'); 
	
	this.document;
	
	this.receiverDlg = new MessageReceiverDialog();
	var  me = this;
	this.ids = "";
	
	this.receiverDlg.setOnCloseEventListener(function() {

		var dataF = me.receiverDlg.getCheckedRowData();
		me.ids = dataF.uuids;
		
		var data = me.receiverDlg.getCheckedRowDatas();
		
		console.log(data);
				
		data.forEach(function(item, idx){
			console.log(item);
		});
		
		//me.receiverDlg.setIds(  me.getData('receivers') );		
		//me.receiverDlg.setCustomer(  me.getData('customer') );
		//me.receiverDlg.open(true);
		//me.receiverDlg.setModal(true);
		
		// me.setData('receivers', data.uuids);
		// me.setData('receiverNames', data.names);
	});
	
	
}

DocumentApprovalGrid.prototype = Object.create(DataGrid.prototype);
DocumentApprovalGrid.prototype.constructor = DocumentApprovalGrid; 

DocumentApprovalGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	this.addEmployeeCell('name').setNextFocus('projectName').setFieldMap({
		username : {
			name : 'uuid',
			required : true,
		},
		uuid : {
			name : 'uuid',
		},
		name : {
			name : 'name',
		},
		departmentName : {
			name : 'departmentName',
		},
	});

	// 즉시 로딩
	if(this.document)
		this.loadRecords();
};

DocumentApprovalGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);		
};

DocumentApprovalGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	console.log(id);
	
	var me = this;
	
	if( id == 'btnAdd' ){
		
		me.receiverDlg.setIds(  me.ids );		
		// me.receiverDlg.setCustomer(  me.getData('customer') );
		
		me.receiverDlg.open(true);
		me.receiverDlg.setModal(true);
		
	}
	
	return true;
};

DocumentApprovalGrid.prototype.updateIds = function() {
	
	this.ids = '';
	
	for (var i = 0; i < this.grid.getRowsNum(); ++i) {

		var rowId = this.grid.getRowId(i);

		if( this.ids.length > 0 )
			this.ids += ",";
		
		this.ids += rowId;
	}
	
	console.log(this.ids);
}

DocumentApprovalGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
	
	console.log(result);
}

DocumentApprovalGrid.prototype.setDocument = function(document) {	
	this.document = document;
	return this;
}

DocumentApprovalGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
 
	params.document = this.document; 
	
}

DocumentApprovalGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/document/form/approvalToolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/document/form/approvalGrid.xml",
	});

};

DocumentApprovalGrid.prototype.initRef = function(container, config) {

    this.initToolbar(container, {
        iconsPath : config.iconsPath,
        xml : "xml/document/form/approvalToolbar.xml"
    });

    this.initGrid(container, {
        imageUrl : config.imageUrl,
        xml : "xml/document/form/refGrid.xml",
    });

};

DocumentApprovalGrid.prototype.onBeforeInsertParams = function(param) {
	param.size = this.grid.getRowsNum();
};

DocumentApprovalGrid.prototype.initProduct = function(container, config) {

    this.initToolbar(container, {
        iconsPath : config.iconsPath,
        xml : "xml/document/form/approvalToolbar.xml"
    });

    this.initGrid(container, {
        imageUrl : config.imageUrl,
        xml : "xml/document/form/productGrid.xml",
    });

};