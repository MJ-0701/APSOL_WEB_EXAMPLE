// 분개 내역
function IndignationGrid(container, config) {

	var grid;
	var slipId;

	var recordUrls = 'indignation/records';
	var layout;

	var reloadTimer;

	this.clearAll = function() {
		clearAll();
	};

	this.reload = function(_slipId) {
		clearAll();
		
		slipId = _slipId;

		if (reloadTimer != null)
			clearTimeout(reloadTimer);

		reloadTimer = setTimeout(reloadAll, 300);

	};

	this.clear = function() {
		grid.clearAll();
		slipId = null;
	};

	function clearAll() {
		grid.clearAll();
		slipId = null;
	}

	function reloadAll() {
		reload();
	}

	function reload() {
		container.progressOn();
		var url = recordUrls + "?slip=" + slipId;

		grid.clearAndLoad(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');

	}

	this.init = function() {

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load("xml/slip/indignation/reportGrid.xml", function() {
			grid.setNumberFormat(numberFormat, 2);
			grid.setNumberFormat(numberFormat, 5);
		});

	};
}