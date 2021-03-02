//업무 댓글
function ReplyDetailDialog() {

	var wnd;
	var editor;
	var id = 0;
	var journal = 0;
	var data = null;
	var me = this;

	this.clear = function() {
		id = 0;
		data = null;
		
		if (editor)
			editor.setContent('');
	};

	this.close = function() {
		id = 0;
		data = null;
		journal = 0;
		if (wnd)
			wnd.close();
	};

	this.setJournal = function(_journal) {
		journal = _journal;
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

		wnd = openWindow('replyDetailDlg', '업무 댓글', 550, 400);

		if (editor) {

			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
			editor = null;
			wnd = null;
			return true;
		});

		wnd.attachEvent("onMoveFinish", function(win) {
		});

		initEditor(wnd);
		initToolbar(wnd);
		me.load(id);
	};

	this.load = function(_id) {

		id = _id;

		if (!editor)
			return;

		editor.setContent('');

		console.log(id);

		if (id == 0 || id == undefined)
			return;

		wnd.progressOn();
		$.get('journalReply/info?code=' + id, function(result) {
			wnd.progressOff();

			id = result.id;
			data = result.data;
			editor.setContent(data.comment);

		});
	};

	function initEditor(container) {
		editor = container.attachEditor();
		editor.attachEvent("onFocusChanged", function(state) {
		});
	}

	function initToolbar(container) {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/dialog/journal/reply/formToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(name) {
			switch (name) {
			case 'btnAdd':
				id = 0;
				data = null;
				
				if (editor)
					editor.setContent('');
				
				break;
			case 'btnUpdate':
				update();
				break;
			case 'btnDelete':
				break;
			}
		});

	}

	function update() {

		if (journal == 0) {
			dhtmlx.alert({

				type : "alert-error",
				text : "업무 일지가 선택되지 않았습니다.",
			});
			return;
		}

		wnd.progressOn();
		sendJson('journalReply/update', {
			id : id,
			data : {
				journal : journal,
				comment : editor.getContent(),
			}
		}, function(result) {
			wnd.progressOff();
			console.log(result);
		});
	}

	function remove() {

		if (id == 0) {
			dhtmlx.alert({
				title : "자료를 삭제할 수 없습니다.",
				type : "alert-error",
				text : "저장된 자료가 아닙니다."
			});

			return;
		}

		dhtmlx.confirm({
			title : "자료를 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 내용은 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post('journalReply/delete', {
						code : id
					}, function(result) {

						if (result.error) {
							dhtmlx.alert({
								title : "자료를 삭제할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {

							if (config.onDeleted) {
								config.onDeleted(result);
							}

							me.clear();

						}

						container.progressOff();
					});
				}
			}
		});

	}

}