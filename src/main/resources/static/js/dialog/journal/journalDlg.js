//업무일지
function JournalDialog() {

	var dataForm;
	var wnd;

	var itemDlg;
	var approvalDlg;
	var editor;
	
	this.move = function(x, y) {
		if (wnd)
			wnd.setPosition(x, y);
	}

	this.clear = function(){
		if(dataForm)
			dataForm.clear();
		
		if(editor)
			editor.setContent('');
		
		if( itemDlg )
			itemDlg.clear();
		
		if( approvalDlg )
			approvalDlg.clear();
		
	};
	
	this.close = function() {
		wnd.close();
	};

	this.init = function() {
		itemDlg = new ItemDialog("itemDlg", {
			callback : {
				onInited : function() {
				}
			}
		});

		itemDlg.init();
		
		approvalDlg = new ApprovalLineDialog('approvalLineDlg', {});
		approvalDlg.init();
	};

	this.open = function(id, moveCenter) {

		wnd = openWindow('journalDlg', '업무 일지', 550, 600);

		if (dataForm) {
			dataForm.load(code);

			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
			dataForm = null;
			editor = null;
			wnd = null;
			itemDlg.close();
			approvalDlg.close();
			return true;
		});

		wnd.attachEvent("onMoveFinish", function(win) {
			if (itemDlg) {
				// var pos = wnd.getPosition();
				// itemDlg.move(pos[0] + 250, pos[1] + 100);
			}
		});

		var layout = wnd.attachLayout("2E");

		layout.cells('a').hideHeader();
		layout.cells('b').hideHeader();

		layout.cells('a').setHeight(250);

		initForm(layout.cells('a'), id);
		initEditor(layout.cells('b'));
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
			name : '업무일지',
			url : {
				info : 'journal/info',
				update : 'journal/update',
				remove : 'journal/delete',
			},
			toolbar : {
				xml : 'xml/dialog/journal/formToolbar.xml',
				onClick : function(id) {
				},
				onAdded : function() {
					dataForm.focus('date');
				}
			},
			form : {
				xml : 'xml/dialog/journal/form.xml',
				onClick : function(id, form) {
					if (id == 'btnItem') {

						var pos = wnd.getPosition();
						itemDlg.open();
						itemDlg.move(pos[0] + 250, pos[1] + 100);
					}
					
					if (id == 'btnApproval') {

						var pos = wnd.getPosition();
						approvalDlg.open();
						approvalDlg.move(pos[0] + 260, pos[1] + 120);
					}
				},
				onInited : function(form) {

					dataForm.addBascode("typeName", "JT", {
						map : {
							type : 'uuid',
							typeName : 'name'
						}
					});

					dataForm.addBascode("kindName", "W1", {
						map : {
							kind : 'uuid',
							kindName : 'name'
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
				itemDlg.clear();
				approvalDlg.clear();
			},
			onBeforeUpdate : function(json) {
			
				itemDlg.progressOn();
				approvalDlg.progressOn();
				
				json.data.content = editor.getContent();
				
				console.log(json.data);
				
				json.items = itemDlg.getRows();
				
				json.approvals = approvalDlg.getRows();
				
				return json;
			},
			onUpdated : function(result) {
				itemDlg.progressOff();
				approvalDlg.progressOff();
				if (result.error || result.invalids) {
				} else {
					itemDlg.setRows(result.items);
					approvalDlg.setRows(result.approvals);
				}
			},
			onRemoved : function(result) {
			},
			onBeforeLoaded : function() {
				itemDlg.progressOn();
				approvalDlg.progressOn();
			},
			onLoaded : function(result) {
				itemDlg.progressOff();
				approvalDlg.progressOff();
				
				editor.setContent(result.data.content);
				
				approvalDlg.setRows(result.approvals);
				itemDlg.setRows(result.items);
			}

		});

		dataForm.load(id);
		dataForm.init();
	}

}