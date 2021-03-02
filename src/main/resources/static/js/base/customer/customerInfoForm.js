function CustomerInfoForm(container, config) {

	var form;
	var toolbar;
	// var me = this;
	var updated = false;
	var valFocus = false;
	var code;

	this.clear = function() {
		form.clear();
		form.reset();
	};
	this.load = function(_code) {
		code = _code;
		reload();
	}

	function reload() {

		if (!form)
			return;

		reset();

		if (!code || code == 0)
			return;

		container.progressOn();

		$.post('customerInfo', {
			code : code
		}, function(data) {
			console.log("customerInfo Data : " + data.businessNumber);
			console.log("name : " + data.name);
			form.setFormData(data);

			document.title = "사업자번호 : " + data.businessNumber + " / 가맹점 : " + data.name;
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

	this.initToolbar = function() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			// toolbar.disableItem('btnUpdate');

			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnCopy':
				var businessNumber = form.getItemValue("businessNumber");
				$('#clip_target').val(businessNumber);
				// input박스 value를 선택
				$('#clip_target').select(); // Use try & catch for unsupported browser
				try { // The important part (copy selected text)
					var successful = document.execCommand('copy'); // 
					if (successful)
						alert("복사되었습니다."); 
					else
						alert("복사에 실패하였습니다.");
				} catch (err) {
					alert('이 브라우저는 지원하지 않습니다.')
				}

				break;

			}

			try {
				config.toolbar.callback.onClick(id, form);
			} catch (e) {

			}

		});
	}

	this.init = function() {

		form = container.attachForm();
		form.loadStruct(config.form.xml, function() {
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

	};

}