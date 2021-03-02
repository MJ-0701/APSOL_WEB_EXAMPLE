function BusinessContactForm(container, config) {

	var form;
	var toolbar;
	// var me = this;
	var updated = false;
	var valFocus = false;
	var toolbar;
	this.clear = function() {
		form.clear();
		form.reset();
	};
	this.load = function() {
		reload();
	}

	this.getItemValue = function(data) {
		return form.getItemValue(data);
	}
	
	this.setItemValue = function(key, value){
		return form.setItemValue(key, value);
	}
	
	this.getCustomerId = function(){
		//가맹점 이름 필드에서 가맹점 검색하여 customerId 받아옴
		return form.getUserData("name", "customerId");
	}

	function reload() {
		if (!form)
			return;

		reset();
		form.setFormData({
			name : "name",
			businessNumber : "businessNumber"
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
		/*
		 * toolbar = container.attachToolbar(); toolbar.setIconsPath("img/18/"); toolbar.loadStruct('xml/base/journal/formToolbar.xml', function() {
		 *  // toolbar.disableItem('btnUpdate');
		 * 
		 * setToolbarStyle(toolbar);
		 * 
		 * });
		 * 
		 * toolbar.attachEvent("onClick", function(id) {
		 * 
		 * switch (id) { case 'btnAdd': // me.update();
		 * 
		 * break; case 'btnClose': form.close(); break; }
		 * 
		 * try { config.toolbar.callback.onClick(id, form); } catch (e) {
		 *  }
		 * 
		 * });
		 */
		form = container.attachForm();
		form.loadStruct('xml/base/businessContact/businessContactForm.xml', function() {
			reload();
		});

		form.attachEvent("onValidateError", function(name, value, result) {
			if (valFocus == false) {
				valFocus = true;
				form.setItemFocus(name);
			}
			dhtmlx.message({
				type : "error",
				text : "[" + form.getItemLabel(name) + "] 는(은) 필수항목입니다."
			});
		});

		form.attachEvent("onKeyDown", function(inp, ev, name, value) {
			config.form.callback.onKeyDown(ev.keyCode, ev.ctrlKey, ev.shiftKey);
		});

		form.attachEvent("onFocus", function(name) {

			try {
				var inp = form.getInput(name);
				if (inp)
					inp.select();
			} catch (e) {

			}

		});
		
		
		/*
		 * form.attachEvent("onChange", function(name, value) {
		 * 
		 * console.log(name); console.log(value); updated = true; if (name == 'alias') { // if (!form.getItemValue('name')) form.setItemValue('name', value); } else if (name == 'name') { // if (!form.getItemValue('name')) form.setItemValue('alias', value); } else if (name == 'kind') { updateAccounting(value); } else if (name == 'paymentMethod') { updateBook(value); } });
		 */
	}

}