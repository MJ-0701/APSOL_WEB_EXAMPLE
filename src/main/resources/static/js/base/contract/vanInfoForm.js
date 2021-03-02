function VanInfoForm(container, config) {

	var form;
	var toolbar;
	var customerId;
	var vanId;
	var updater;

	this.clear = function() {
		customerId = 0;
		form.clear();
		form.reset();
		//form.setItemValue('name', 0);
	};

	this.load = function(_customerId, _vanId) {

		customerId = _customerId;
		vanId = _vanId;
		reload();
	};

	function reload() {
		
		if( !form )
			return;

		reset();
		
		if(!customerId || !vanId){
			return;
		}
			
		
		container.progressOn();
		$.post('vanInfo', {
			customerId : customerId,
			vanId : vanId
		}, function(data) {
			
			form.setFormData(data);
			container.progressOff();
		});

	}

	function reset() {
		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
		form.setItemValue('name', 0);
	}


	this.init = function() {
		
		form = container.attachForm();

		form.loadStruct('xml/base/contract/vanInfoForm.xml', function() {

			
			reload();
		});
/*
		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			customerId = result.newId;
			form.setItemValue('name', vanId);
			
			reload();

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		});
		*/

	};

}