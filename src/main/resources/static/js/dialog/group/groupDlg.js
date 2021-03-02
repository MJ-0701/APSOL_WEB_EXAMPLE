//그룹 목록
function GroupDialog() {

	var wnd;
	var grid;
	var me = this;
	var id = 0;
	
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

	};

	this.close = function() {
		if (wnd)
			wnd.close();
	};

	this.init = function() {
	};

	this.open = function(id, moveCenter) {

		wnd = openWindow('groupDlg', '그룹 정보', 600, 550);

		if (grid) {

			me.load(code);

			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
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

		initGrid(wnd);
	};

	this.load = function(_id) {

		id = _id;

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
		grid.load('xml/summary/group/grid.xml', function() {
			setupDefaultGrid(grid);

			me.load(id);
		});

		grid.attachEvent("onRowSelect", function(rId, ind) {
		});
	}	
}