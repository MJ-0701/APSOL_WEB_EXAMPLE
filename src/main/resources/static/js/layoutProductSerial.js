function ProductSerialLayout(container) {

	var layout;
	var grid;
	var actionForm;
	var infoForm;
	var params = '';
	var gridUrl = 'product/serial/records';
	var selectedCallback;

	this.load = function(productId, selected) {
		loadData(productId);
		selectedCallback = selected;
	};

	init();

	function loadData(productId) {
		params = '?code=' + productId;

		$.post("product/info", {
			code : productId
		}, function(data) {
			actionForm.setItemValue("product", productId);
			actionForm.setItemValue("productName", data.name);
			actionForm.setItemValue("productCode", data.uuid);

			infoForm.setItemValue("name", data.name);
			infoForm.setItemValue("standard", data.standard);

			reloadGrid();
		});
	}

	function init() {

		layout = container.attachLayout("3T");

		layout.cells("a").hideHeader();
		layout.cells("b").hideHeader();
		layout.cells("c").hideHeader();

		layout.cells("a").setHeight(50);
		layout.cells("b").setWidth(250);

		ActionForm(layout.cells("a"));
		InfoForm(layout.cells("b"));
		Grid(layout.cells("c"));

	}

	function ActionForm(container) {

		actionForm = container.attachForm();
		actionForm.loadStruct('xml/productSerial/actionForm.xml', function() {

			FormProductPopup(actionForm, "productName", function(id) {

				loadData(id);

			}, function() {
				actionForm.clear();
				// infoForm.clear();
				grid.clearAll();
				
				infoForm.setItemValue("productCode", "");
				infoForm.setItemValue("product", 0);
			});

		});

	}

	function InfoForm(container) {

		infoForm = container.attachForm();
		infoForm.loadStruct('xml/productSerial/infoForm.xml', function() {

		});

	}

	function Grid(container) {

		var toolbar = container.attachToolbar();
		toolbar.loadStruct("xml/productSerial/gridToolbar.xml", function() {

			var searchPop = new dhtmlXPopup({
				toolbar : toolbar,
				id : "btnSearch"
			});

			var searchForm = searchPop.attachForm();

			searchForm.loadStruct('xml/productSerial/searchForm.xml', function() {
				searchForm.setFocusOnFirstActive();
				searchForm.attachEvent("onButtonClick", function(id) {

					searchPop.hide();
					params = '?code=' + actionForm.getItemValue("product") + '&' + toParams(searchForm.getFormData());
					reloadGrid();
				});
			});

			searchPop.attachEvent("onShow", function() {
				searchForm.setFocusOnFirstActive();
			});

		});

		grid = container.attachGrid();

		grid.setImagePath(imageUrl);
		grid.load("xml/productSerial/grid.xml", function() {

			grid.attachEvent("onBeforeSorting", function(ind, gridObj, direct) {

				var sortparams = params + (params.indexOf("?") >= 0 ? "&" : "?") + "orderby=" + ind + "&direct=" + direct;

				grid.clearAll();
				grid.load(gridUrl + sortparams, 'json');
				grid.setSortImgState(true, ind, direct);
				return false;
			});

			grid.attachEvent("onRowDblClicked", function(rId, cInd) {
				if (selectedCallback)
					selectedCallback(grid.cells(rId, 0).getValue());
			});

		});
	}

	function reloadGrid() {
		var url = gridUrl + params;
		grid.clearAll();
		grid.load(url, function() {
		}, 'json');
	}

}
