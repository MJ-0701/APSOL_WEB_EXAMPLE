function UploaderForm(container, config) {

	var form;

	var updated = false;
	var valFocus = false;

	this.clear = function() {
		form.clear();
		form.reset();
	};
	this.load = function() {
		reload();
	}

	function reload() {
		if (!form)
			return;

		reset();

	}

	function reset() {
		form.clear();
		form.reset();
	}

	this.setFocus = function() {
	};

	this.init = function() {

		form = container.attachForm();
		form.loadStruct('xml/common/uploader.xml', function() {
			reload();
		});


		

	}

}