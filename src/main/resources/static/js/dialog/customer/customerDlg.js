//가맹점(거래처)
function CustomerDialog() {

	var dataForm;
	var wnd;
	
	this.clear = function(){
		if(dataForm)
			dataForm.clear();
		
	};

	this.close = function() {
		wnd.close();
	};

	this.init = function() {
	};

	this.open = function(id, moveCenter) {

		wnd = openWindow('customerDlg', '가맹점 정보', 820, 550);

		if (dataForm) {
			dataForm.load(code);

			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
			dataForm = null;
			return true;
		});

		wnd.attachEvent("onMoveFinish", function(win) {
			
		});

		initForm(wnd, id);
	};

	this.load = function(id) {
		if (dataForm)
			dataForm.load(id);
	};

	function initForm(container, id) {

		dataForm = new DataForm(container, {
			name : '거래처 정보',
			url : {
				info : 'customer/info',
				update : 'customer/update',
				remove : 'customer/delete',
			},
			toolbar : {
				xml : 'xml/base/customer/formToolbar.xml',
				onClick : function(id) {
				},
				onAdded : function() {
					dataForm.focus('name');
				}
			},
			form : {
				xml : 'xml/base/customer/form.xml',
				onClick : function(id, form) {
				},
				onInited : function(form) {

					dataForm.addBascode("categoryName", "CE", {
						map : {
							category : 'uuid',
							categoryName : 'name'
						}
					});

					dataForm.addEmployee("managerName", {
						map : {
							manager : 'username',
							managerName : 'name'
						}
					});

					dataForm.load();
				}
			},

			onReset : function() {
			},
			onBeforeUpdate : function(json) {
				return json;
			},
			onUpdated : function(result) {
			},
			onRemoved : function(result) {
			},
			onBeforeLoaded : function() {
			},
			onLoaded : function(result) {
				console.log(result);
			}

		});

		dataForm.load(id);
		dataForm.init();
	}
}