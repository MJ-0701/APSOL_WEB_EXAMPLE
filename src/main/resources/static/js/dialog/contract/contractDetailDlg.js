//계약 정보
function ContractDetailDialog() {

	var dataForm;
	var wnd;
	var editor;
	
	this.clear = function(){
		if(dataForm)
			dataForm.clear();
		
		if(editor)
			editor.setContent('');
	};

	this.close = function() {
		if (wnd)
			wnd.close();
	};

	this.init = function() {
	};
	
	this.progressOn = function() {
		if (wnd)
			wnd.progressOn();
	};

	this.progressOff = function() {
		if (wnd)
			wnd.progressOff();
	};

	this.move = function(x, y) {
		if (wnd)
			wnd.setPosition(x, y);
	}

	this.open = function(id, moveCenter) {

		wnd = openWindow('contractDetailDlg', '계약 상세 정보', 620, 650);

		if (dataForm) {
			dataForm.load(code);

			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
			dataForm = null;
			wnd = null;
			editor = null;
			return true;
		});

		wnd.attachEvent("onMoveFinish", function(win) {
			
		});
		
		var layout = wnd.attachLayout("2E");
		
		layout.cells('a').hideHeader();
		layout.cells('b').hideHeader();

		layout.cells('a').setHeight(210);
		
		initEditor(layout.cells('b'));
		initForm(layout.cells('a'), id);
		
	};

	this.load = function(id) {
		if (dataForm)
			dataForm.load(id);
	};
	
	function initEditor(container) {
		editor = container.attachEditor();
		editor.attachEvent("onFocusChanged", function(state) {
			dataForm.hideCells();
		});
	}

	function initForm(container, id) {

		dataForm = new DataForm(container, {
			name : '계약 정보',
			url : {
				info : 'contract/info',
				update : 'contract/update',
				remove : 'contract/delete',
			},
			toolbar : {
				xml : 'xml/dialog/contract/toolbar.xml',
				onClick : function(id) {
				},
				onAdded : function() {
					dataForm.focus('date');
				}
			},
			form : {
				xml : 'xml/dialog/contract/form.xml',
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
					
					dataForm.addCustomer("name", {
						map : {
							customer : 'code',
							name : 'name',
							businessNumber : 'businessNumber',
							address : 'address'
						}
					});

					dataForm.load();
				}
			},

			onReset : function() {
				dataForm.setData('date', new Date());
				editor.setContent('');
			},
			onBeforeUpdate : function(json) {
				json.data.content = editor.getContent();
				return json;
			},
			onUpdated : function(result) {
			},
			onRemoved : function(result) {
			},
			onBeforeLoaded : function() {
			},
			onLoaded : function(result) {
				editor.setContent(result.data.content);
			}

		});

		dataForm.load(id);
		dataForm.init();
	}
}