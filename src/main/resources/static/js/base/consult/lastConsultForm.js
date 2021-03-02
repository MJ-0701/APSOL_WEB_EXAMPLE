function LastConsultForm(container, config) {

	var form;
	var updated = false;
	var valFocus = false;

	var customerId = 0;

	this.load = function(_customerId) {
		customerId = _customerId;
		reload();
	}

	function reload() {
		if (!form)
			return;

		reset();

		if (customerId == 0)
			return;

		container.progressOn();
		$.post('consultInfo', {
			code : customerId
		}, function(data) {
			console.log(data+"last");
			form.setFormData(data);
			container.progressOff();
		});

	}

	function reset() {
		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
	}

	this.setFocus = function() {
		form.setFocusOnFirstActive();
	};

	this.init = function() {

		form = container.attachForm();
		form.loadStruct('xml/base/consult/lastConsultForm.xml', function() {
			reload();
		});

	};

}