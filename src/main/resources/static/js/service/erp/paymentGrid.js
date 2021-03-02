function PaymentGrid(container, config) {
	var grid;
	var recordUrl = config.recordsUrl;
	
	function reloadGrid() {

		container.progressOn();

		var url = recordUrl;
		grid.clearAll();

		grid.load(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');

	}

	this.init = function() {

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load(config.grid.xml, function() {
			grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
		});
	};
}