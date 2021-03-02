function DeleteForm(container, config) {
	var form;
	var erpId;
	
	this.setErpId = function(_erpId){
		erpId = _erpId;
		form.clear();
		form.setFocusOnFirstActive();
	};
	
	this.focus = function() {
		form.setFocusOnFirstActive();
	};
	
	this.reset = function() {
		form.clear();		
	};

	this.init = function() {
		form = container.attachForm();
		form.loadStruct(config.form.xml, function() {
			form.setFocusOnFirstActive();
		});

		form.attachEvent("onButtonClick", function(name) {
			
			if (name == 'btnApply') {
				
				if( !erpId ){
					dhtmlx.alert({
						title : "ERP를 삭제할 수 없습니다.",
						type : "alert-error",
						text : "삭제할 ERP를 선택해주세요.",
					});
					return;
				}

				if (!form.validate()) {
					dhtmlx.alert({
						title : "ERP를 삭제할 수 없습니다.",
						type : "alert-error",
						text : "유효하지 않은 값들이 있습니다.",
					});
					return;
				}

				var id = form.getItemValue("confirm");
				if( id != '지금삭제'){
					dhtmlx.alert({
						title : "ERP를 삭제할 수 없습니다.",
						type : "alert-error",
						text : "삭제 키워드가 일치하지 않습니다.",
					});
					return;
				}
				

				config.callback.onBeforeUpdate();
				$.post('erp/delete', {id : erpId }, function(result) {
					
					erpId = null;
					
					config.callback.onAfterUpdate();

					if (result.error) {
						dhtmlx.alert({
							title : "ERP를 삭제할 수 없습니다.",
							type : "alert-error",
							text : result.error,
							callback : config.callback.onAfterError
						});
						
						return;
					} else {
						dhtmlx.alert({
							width : '400px',
							title : "ERP가 삭제되었습니다.",
							text : '',
						});
					}
					
				});

			}
		});
	};
}