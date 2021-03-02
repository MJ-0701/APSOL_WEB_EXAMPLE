function CustomerGroupGridPopup(targetGrid, idx, onSelected, onReload) {

	var params = '';
	var recordUrl = 'popup/customer/group/records';
	var searchUrl = 'popup/customer/group/search';

	var popup;
	var grid;

	var rowId;
	var cellStage;
	var obj = null;
	var timer = null;
	var searchToken = '';

	var x;
	var y;
	var w;
	var h;

	init();

	this.isHide = function() {
		return !popup.isVisible();
	};

	function onKeyDown(ev) {
		if (!grid)
			return;

		if (ev.keyCode == 13) {
			$.post(searchUrl, {
				keyword : obj.value,
			}, function(result) {
				if (result.count == 1) {
					popup.hide();
					if (timer != null)
						clearTimeout(timer);

					onSelected(result.id, rowId);
				} else {
					if (popup.isVisible()) {
						reloadGrid(function() {

							if (searchToken) {
								grid.filterBy(1, function(data) {
									return data.toString().indexOf(searchToken) != -1;
								});
							}
						});

					} else {
						searchToken = obj.value;
						popup.show(x, y, w, h);
					}

				}

			});

		}
	}

	function onKeyUp(ev) {
		if (!grid)
			return;

		if (ev.keyCode == 13) {
		} else {

			if (timer != null)
				clearTimeout(timer);

			timer = setTimeout(function() {

				if (popup.isVisible()) {
					// TODO 필터링
					grid.filterBy(1, function(data) {
						return data.toString().indexOf(obj.value) != -1;
					});

				} else {
					//TODO obj 가 null 이면 포커스 잡은 뒤 팝업 보이기
					searchToken = obj.value;
					popup.show(x, y, w, h);
				}

			}, 500);
		}
	}

	function init() {

		setupPopup();
		setupGrid();

		targetGrid.attachEvent("onEditCell", function(stage, rId, colInd) {

			if (colInd != idx)
				return true;

			if (stage == 1 && targetGrid.editor && targetGrid.editor.obj) {
				this.editor.obj.select();
			}

			cellStage = stage;

			if (stage == 1) {

				rowId = rId;

				obj = targetGrid.editor.obj;
				$(obj).keydown(onKeyDown);
				$(obj).keyup(onKeyUp);

				x = window.dhx4.absLeft(obj);
				y = window.dhx4.absTop(obj);
				w = obj.offsetWidth;
				h = obj.offsetHeight;

				popup.show(x, y, w, h);
			}
			if (stage == 2) {
				obj = null;
				popup.hide();
			}

			return true;
		});
	}

	function setupPopup() {
		popup = new dhtmlXPopup();

		popup.attachEvent("onShow", function(id) {

			reloadGrid(function() {

				if (searchToken) {
					grid.filterBy(1, function(data) {
						return data.toString().indexOf(searchToken) != -1;
					}, true);
				}
			});
		});
	}

	function setupGrid(pop) {

		grid = popup.attachGrid(400, 300);
		grid.setImagePath(imageUrl);

		grid.load('xml/popup/customerGroup/grid.xml', function() {

			grid.setFiltrationLevel(-2);

			grid.enableSmartRendering(true, 50);

			grid.attachEvent("onRowDblClicked", function(id) {

				popup.hide();
				grid.clearSelection();

				if (onSelected)
					onSelected(id, rowId);

			});

			grid.attachEvent("onFilterEnd", function(elements) {
				if (elements.length == 0) {
					if (onReload)
						onReload();
				}
			});

		});
	}

	function reloadGrid(callback) {
		if (!grid)
			return;

		if (onReload)
			onReload();

		timer = null;

		grid.clearAll();
		grid.load(recordUrl, function() {

			for (var i = 0; i < grid.getRowsNum(); i++) {
				var rowId = grid.getRowId(i);
				grid.openItem(rowId);
			}

			if (callback)
				callback();

		}, 'json');
	}
}