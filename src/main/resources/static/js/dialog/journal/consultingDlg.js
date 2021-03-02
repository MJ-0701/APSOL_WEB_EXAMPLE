//상담 목록
function ConsultingDialog() {

	var wnd;
	var dataGrid;

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

		wnd = openWindow('consultDlg', '상 담', 600, 550);

		if (dataGrid) {

			//TODO

			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
			dataGrid = null;
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
		dataGrid = new DataGrid(container, {
			imageUrl : imageUrl,
			grid : {
				xml : "xml/window/consulting/grid.xml",
				onInited : function(grid) {
					dataGrid.reload();
				},
				onRowSelect : function() {
				}
			},
			toolbar : {
				xml : "xml/window/consulting/toolbar.xml",
				iconsPath : "img/18/",
				onInited : function() {
				},
			},
			urls : {
				deleted : 'journal/delete',
				updated : 'journal/update',
				record : 'windowCustomer/consulting/records'
			},
			inserted : {
				url : 'consulting/insert',
				focusField : 'work',
			},
			numberFormats : [ {
				format : '000.0',
				columns : [ 'debit', 'credit', 'amount', 'total', 'tax', 'commission', 'deposit', 'withdraw' ]
			}, {
				format : '000',
				columns : [ '' ]
			}, ],
			callback : {
				onBeforeReload : function() {
				},
				onBeforeParams : function() {
					return "customer=" + customerId;
				},
				onInserted : function(grid, id, data) {

					setData(grid, id, 'customer', customerId);

				}
			}

		});

		dataGrid.init();
	}

	

}