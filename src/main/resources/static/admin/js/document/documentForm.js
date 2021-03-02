function DocumentForm() {
	DataForm.call(this);
	this.setUrlPrefix('document');
	var me = this;
	this.id = 0;

	this.approvalGrid;
	this.refGrid;
	this.productGrid;

	this.editorContent;
	
	this.file;
}

DocumentForm.prototype = Object.create(DataForm.prototype);
DocumentForm.prototype.constructor = DocumentForm;

DocumentForm.prototype.onInitedForm = function(form) {
	
	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnSearchAddress') { 
			 new daum.Postcode({
			        oncomplete: function(data) {			        	
			        	form.setItemValue('zipcode', data.zonecode);
			        	form.setItemValue('address', data.address);
			        	form.setItemValue('addressDetail', data.addressDetail);					        	
			        }
			}).open();
		}
	});
	
	/*this.addCompanyCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
			required : true
		},
		customerName : {
			name : 'name',
		},
		customerInfo : {
			name : 'customerInfo',
		}
	}).setOnSelected(function(data) {
	});*/

	this.loadData(this.id);
};

DocumentForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

DocumentForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
	
	this.approvalGrid.clear();
	this.refGrid.clear();	
	this.productGrid.clear();
	
	if(this.editorContent && this.editorContent.setContent)
		this.editorContent.setContent("");
};

DocumentForm.prototype.onBeforeUpdate = function(json) {

	DataForm.prototype.onBeforeUpdate.call(this, json);

	if (this.editorContent)
		json.data.content = this.editorContent.getContent();

	json['approvalers'] = this.approvalGrid.toJson();
	json['refs'] = this.refGrid.toJson();
	json['products'] = this.productGrid.toJson();

	return true;
}

DocumentForm.prototype.onClickToolbarButton = function(id, toolbar) { 
	DataForm.prototype.onClickToolbarButton.call(this, id, toolbar);
	
	var me = this;
	
	if( id == 'btnSend'){
		
		if (this.id == undefined) {
			dhtmlx.alert({
				title : "문서를 수정할 수 없습니다.",
				type : "alert-error",
				text : "수정할 수 있는 문서가 아닙니다."
			});

			return;
		}
		
		dhtmlx.confirm({
			title : "결재를 진행하시겠습니까?",
			type : "confirm-warning",
			text : "결재가 진행되기 전까지는 수정이 가능합니다.<br>결재가 진행 중인 문서는 수정이 불가능합니다.",
			callback : function(r) {
				if (r) {
					
					me.update(function(){
						
						$.post('document/send', {
							
							code : me.id
							
						}, function(result){
							
							dhtmlx.alert({
								text : "결재를 진행합니다.",
							});
							
						});
						
					});
					
				}
			}
		});
		
		
		
	}
};


DocumentForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);

	if (this.editorContent && this.editorContent.setContent)
		this.editorContent.setContent(result.data.content);

	// 읽어왔을때 표현하기
	for (var i = 0; i < result.approvalers.length; ++i) {
		this.approvalGrid.addRow(result.approvalers[i].id, result.approvalers[i].data, null, true);
	} 
	
	this.approvalGrid.updateIds();
		
	this.refGrid.clear();
	for (var i = 0; i < result.refs.length; ++i) {		
		this.refGrid.addRow(result.refs[i].id, result.refs[i].data, null, true);
	}
	
	this.refGrid.updateIds();

	for (var i = 0; i < result.products.length; ++i) {
		this.productGrid.addRow(result.products[i].id, result.products[i].data, null, true);
	}

};

DocumentForm.prototype.onBeforeLoaded = function(json) {
	DataForm.prototype.onBeforeLoaded.call(this, json);
}

DocumentForm.prototype.onClickAdded = function() {
	console.log("onClickAdded");
	this.form.setItemFocus('name');
	this.loadData(0);
}
