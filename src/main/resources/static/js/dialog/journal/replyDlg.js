//계약 목록
function ReplyDialog() {

	var wnd;
	var grid;

	var detailDlg;

	var me = this;

	var id = 0;

	this.move = function(x, y) {
		if (wnd)
			wnd.setPosition(x, y);
	}

	this.clear = function() {
		id = 0;

		if (grid)
			grid.clearAll();

		if (detailDlg)
			detailDlg.clear();
	};

	this.close = function() {
		if (wnd)
			wnd.close();
	};

	this.init = function() {
		detailDlg = new ReplyDetailDialog();
		detailDlg.init();
	};

	this.open = function(id, moveCenter) {

		wnd = openWindow('replyDlg', '댓글 목록', 600, 550);

		if (grid) {

			me.load(code);

			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
			detailDlg.close();
			grid = null;
			id = 0;
			wnd = null;

			return true;
		});

		wnd.attachEvent("onMoveFinish", function(win) {

		});

		initGrid(wnd);
		initToolbar(wnd);
	};

	this.load = function(_id) {

		id = _id;
		detailDlg.clear();

		if (!grid)
			return;

		if (id == undefined || id == 0) {
			return;
		}

		grid.clearAll();
		wnd.progressOn();
		grid.load('journalReply/dialog/records?journal=' + id, function() {
			wnd.progressOff();
			grid.selectRow(0, true);
		}, 'json');

	};

	function initGrid(container) {
		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load('xml/dialog/journal/reply/grid.xml', function() {
			setupDefaultGrid(grid);

			me.load(id);
		});

		grid.attachEvent("onRowSelect", function(rId, ind) {
			detailDlg.load(rId);
			detailDlg.setJournal(id);

		});
	}

	function initToolbar(container) {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/dialog/journal/reply/detailToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(name) {
			switch (name) {
			case 'btnDetail':

				var pos = wnd.getPosition();
				detailDlg.open(grid.getSelectedRowId(), true);
				detailDlg.setJournal(id);
				detailDlg.move(pos[0] + 250, pos[1] + 100);
				break;
			}
		});

	}

}