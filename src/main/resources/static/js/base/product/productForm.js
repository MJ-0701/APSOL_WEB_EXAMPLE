function ProductForm(container, config) {

	var form;
	var toolbar;
	var productId = 0;
	var updater;
	var me = this;

	this.clear = function() {
		// productId = 0;
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
	};

	this.load = function(_productId) {

		productId = _productId;
		reload();
	};

	function reload() {
		
		if( !form )
			return;
		
		if( productId == 0 )
			return;

		me.clear();
		
		container.progressOn();

		$.post('product/info', {
			code : productId
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
		updater.update(productId);
	}

	function remove() {

		dhtmlx.confirm({
			title : "품목 정보를 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 정보는 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.deleteUrl, {
						code : productId
					}, function(result) {
						
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

						productId = 0;
						reset();

						container.progressOff();
					});
				}
			}
		});
		
	}

	this.init = function() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/base/product/formToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {

			case 'btnAdd':
				productId = 0;
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

		form.loadStruct('xml/base/product/form.xml', function() {
			
			FormBascodePopup(form, 'vanName', 'VN', function(cnt, data) {

				if (data) {
					form.setItemValue('van', data.uuid);
					form.setItemValue('vanName', data.name);
				} else {
					form.setItemValue('van', '');
				}

			}, function(data) {
				form.setItemValue('van', '');
			});
			
			FormBascodePopup(form, 'categoryName', 'PK', function(cnt, data) {

				if (data) {
					form.setItemValue('category', data.uuid);
					form.setItemValue('categoryName', data.name);
				} else {
					form.setItemValue('category', '');
				}

			}, function(data) {
				form.setItemValue('category', '');
			});
			
			FormBascodePopup(form, 'categoryName1', 'PK', function(cnt, data) {

				if (data) {
					form.setItemValue('category1', data.uuid);
					form.setItemValue('categoryName1', data.name);
				} else {
					form.setItemValue('category1', '');
				}

			}, function(data) {
				form.setItemValue('category1', '');
			});
			
			FormBascodePopup(form, 'categoryName2', 'PK', function(cnt, data) {

				if (data) {
					form.setItemValue('category2', data.uuid);
					form.setItemValue('categoryName2', data.name);
				} else {
					form.setItemValue('category2', '');
				}

			}, function(data) {
				form.setItemValue('category2', '');
			});
			
			reload();
		});

		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			productId = result.newId;
			form.setItemValue('code', productId);
			
			reload();

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		});

	};

}