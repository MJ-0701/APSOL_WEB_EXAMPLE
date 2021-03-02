//계약 목록
function ContractDialog() {

	var wnd;
	var grid;

	var detailDlg;

	var me = this;

	var id = 0;

	var contentCell;
	
	this.move = function(x, y) {
		if (wnd)
			wnd.setPosition(x, y);
	}
	
	this.size = function(w, h) {
		if( wnd )
		wnd.setDimension(w, h);
	};

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
		detailDlg = new ContractDetailDialog();
		detailDlg.init();
	};

	this.open = function(id, moveCenter) {

		wnd = openWindow('contractDlg', '계약 정보', 600, 550);

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
			console.log(wnd.getPosition());
		});
		
		wnd.attachEvent("onResizeFinish", function(win){
			console.log(wnd.getDimension());
		});

		var layout = wnd.attachLayout("2E");

		layout.cells('a').hideHeader();
		layout.cells('b').hideHeader();

		layout.cells('a').setHeight(150);

		initGrid(layout.cells('a'));
		initToolbar(layout.cells('b'));

		contentCell = layout.cells('b');
		contentCell.showInnerScroll();
	};

	this.load = function(_id) {

		id = _id;
		detailDlg.clear();

		if(contentCell)
			contentCell.attachHTMLString('');

		if (!grid)
			return;

		if (id == undefined || id == 0) {
			return;
		}

		grid.clearAll();
		wnd.progressOn();
		grid.load('contract/dialog/records?customer=' + id, function() {
			wnd.progressOff();
			grid.selectRow(0, true);
		}, 'json');

	};

	function initGrid(container) {
		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load('xml/dialog/contract/grid.xml', function() {
			setupDefaultGrid(grid);

			me.load(id);
		});

		grid.attachEvent("onRowSelect", function(rId, ind) {

			var content = getData(grid, rId, 'content');
			if (content == null)
				contentCell.attachHTMLString('');
			else
				contentCell.attachHTMLString(content);

			detailDlg.load(rId);

		});
	}

	function initToolbar(container) {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/dialog/contract/detailToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(name) {
			switch (name) {
			case 'btnDetail':

				console.log(id);
				var pos = wnd.getPosition();
				detailDlg.open(grid.getSelectedRowId(), true);
				detailDlg.move(pos[0] + 250, pos[1] + 100);
				break;
			}
		});

	}

}