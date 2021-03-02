function PopbillJoinForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('popbill');

	this.autoClear = false;
	this.form;
	
	
	this.setOnClickedToolbar(function(id, toolbar){
		var Ca = /\+/g;
		if(id=='btnJoin'){
			var data = this.form.getFormData(true);
			console.log(data);
			$.post("popbill/join", data, function(result) {
				var response = decodeURIComponent(result.replace(Ca, " "));
				dhtmlx.alert({
					type : "alert-warning",
					text : response,
				});
			});
		}
		return false;
	});
}

PopbillJoinForm.prototype = Object.create(DataForm.prototype);
PopbillJoinForm.prototype.constructor = PopbillJoinForm;

PopbillJoinForm.prototype.init = function(container) {

	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/setting/popbillJoinFormToolbar.xml',
	});

	this.initForm(container, {
		xml : 'erp/xml/setting/popbillJoinForm.xml',
	});
	
	

	this.toolbar.attachEvent("onClick", function(id) {
		var Ca = /\+/g;
		switch (id) {
		case 'btnAuth':
			$.get("tax/form/auth", {
				"type" : "CERT"
			}, function(result) {
				if (result.state == "success") {

					window.open(result.message, '_blank');
				}else{
					dhtmlx.alert({
						type : "alert-warning",
						text : decodeURIComponent((result.message).replace(Ca, " ")),
					});
				}
			});
			break;
		case 'btnPoint':
			$.get("tax/form/auth", {
				"type" : "CHRG"
			}, function(result) {
				if (result.state == "success") {

					window.open(result.message, '_blank');
				}else{
					dhtmlx.alert({
						type : "alert-warning",
						text : decodeURIComponent((result.message).replace(Ca, " ")),
					});
				}
			});
			break;
		case 'btnLogin':
			$.get("tax/form/auth", {
				"type" : "LOGIN"
			}, function(result) {
				if (result.state == "success") {

					window.open(result.message, '_blank');
				}else{
					dhtmlx.alert({
						type : "alert-warning",
						text : decodeURIComponent((result.message).replace(Ca, " ")),
					});
				}
			});
			break;
		}
	});
}

PopbillJoinForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);

	console.log(data);

	return true;
}

PopbillJoinForm.prototype.onInitedForm = function(form) {

	DataForm.prototype.onInitedForm.call(this, form);
	this.form = form;
	console.log('onInitedForm');

};
