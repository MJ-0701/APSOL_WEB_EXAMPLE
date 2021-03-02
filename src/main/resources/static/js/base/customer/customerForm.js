function CustomerForm(container, config) {

	var form;
	var toolbar;
	var customerId = 0;
	var updater;
	var me = this;

	this.clear = function() {
		// customerId = 0;
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
	};

	this.load = function(_customerId) {

		customerId = _customerId;
		reload();
	};

	function reload() {
		
		if( !form )
			return;
		
		if( customerId == 0 )
			return;

		me.clear();
		
		container.progressOn();

		$.get('customer/info', {
			code : customerId
		}, function(data) {
			form.setFormData(data);
			container.progressOff();
		});

	}

	function reset() {
		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
		form.setItemValue('code', 0);
	}

	function update() {
		container.progressOn();
		updater.update(customerId);
	}

	function remove() {

		dhtmlx.confirm({
			title : "가맹점 정보를 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 정보는 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.deleteUrl, {
						code : customerId
					}, function(result) {
						
						container.progressOff();
						
						if( result.error ){
							dhtmlx.alert({
								type : "alert-error",
								text : result.error,
								callback : function() {
								}
							});
							return;
						}

						if (config.callback.onDeleted) {
							config.callback.onDeleted(result);
						}

						customerId = 0;
						reset();

						
					});
				}
			}
		});
		
	}

	this.init = function() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/base/customer/formToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {
			
			switch (id) {

			case 'btnAdd':
				customerId = 0;
				reset();
				break;

			case 'btnUpdate':

				update();

				break;

			case 'btnDelete':
				remove();
				break;
			}

		});
		form = container.attachForm();

		form.loadStruct('xml/base/customer/form.xml', function() {
			/*
function(cnt, data) {
				
				console.log(data);

				if (data) {
					form.setItemValue('manager', data.username);
					form.setItemValue('managerName', data.name);
				} else {
					form.setItemValue('manager', '');
				}

			}, function(data) {
				form.setItemValue('manager', '');
			}*/
			
			FormBascodePopup(form, 'categoryName', 'CE', function(cnt, data) {

				if (data) {
					form.setItemValue('category', data.uuid);
					form.setItemValue('categoryName', data.name);
				} else {
					form.setItemValue('category', '');
				}

			}, function(data) {
				form.setItemValue('category', '');
			});
			
			FormEmployeePopup(form, 'managerName', {
				fields : {
					manager : 'username',
					managerName : 'name',
				},
				onSelected : function(data){
					
				},
				
			});
			
			reload();
		});

		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			customerId = result.newId;
			form.setItemValue('code', customerId);
			
			reload();

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		});

	};

}