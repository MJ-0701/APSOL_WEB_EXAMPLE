function SettingForm(container, config) {
	var form;
	var toolbar;
	var erpId;
	
	this.reset = function(){
		erpId = null;
		form.clear();
	}

	this.load = function(id) {
		container.progressOn();
		erpId = null;
		form.lock();
		$.post('erp/info', {
			erp : id
		}, function(data) {
			erpId = id;
			form.setFormData(data, true);
			form.unlock();
			container.progressOff();
			form.setFocusOnFirstActive();
		});
	};

	this.init = function() {
		
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/service/erp/formToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});
		
		toolbar.attachEvent("onClick", function(id) {	
			if( id == 'btnUpdate' ){
				if( erpId == null ){
					dhtmlx.alert({
							title : "설정을 저장할 수 없습니다.",
							type : "alert-error",
							text : "설정을 저장할 ERP 를 먼저 선택해 주세요."
						});
					return;
				}

				config.callback.onBeforeUpdate();
				$.post('erp/update', form.getFormData(true), function(result) {
					config.callback.onAfterUpdate(result);
					if (result.error) {
						dhtmlx.alert({
							title : "설정을 저장할 수 없습니다.",
							type : "alert-error",
							text : result.error
						});
					}
				});
			}
			
			config.callback.onClick(id, form);
		});
		
		
		form = container.attachForm();
		form.loadStruct('xml/service/erp/settingForm.xml', function() {
			form.lock();
			
		});
	};
}