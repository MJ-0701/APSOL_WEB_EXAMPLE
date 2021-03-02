function StockGrid(container, config) {

	var grid;
	var params = '';
	var gridUrl = config.grid.records;
	var toolbar;

	init();

	this.clearSelectRow = function() {
		grid.clearSelection();
	};

	this.removeRow = function(id) {
		grid.deleteRow(id);

		updateFooter();
	};

	this.updateRow = function(data) {

		var row = [ data.typeName, data.date, data.uuid, data.customerName, data.totalNet, data.totalTax, data.totalValue, '', data.masterRemarks ];

		var rowIndex = grid.getRowIndex(data.code);

		if (rowIndex < 0) {
			grid.addRow(data.code, row);
		} else {
			for (var i = 0; i < row.length; ++i) {
				grid.cells(data.code, i).setValue(row[i]);
			}
		}

		if (data.confirm == '1') {
			grid.setRowTextStyle(data.code, "color:black");
			grid.cells(data.code, 7).setValue("확 정");
		} else {
			grid.setRowTextStyle(data.code, "color:red");
			grid.cells(data.code, 7).setValue("편 집");
		}

		grid.selectRowById(data.code);

		updateFooter();

	};

	this.remove = function(id) {
		grid.deleteRow(id);
	};

	this.getObject = function() {
		return grid;
	};

	function init() {

		Grid(container);
	}

	function setDateRange(range) {
		var fromInput = toolbar.objPull[toolbar.idPrefix + "from"].obj.firstChild;
		fromInput.value = range.from;

		var toInput = toolbar.objPull[toolbar.idPrefix + "to"].obj.firstChild;
		toInput.value = range.to;
	}

	function setupHelpPopup(toolbar) {
		var popup = new dhtmlXPopup({
			toolbar : toolbar,
			id : "btnHelp"
		});
		popup.attachObject("helpMessage");
	}

	function setupSearchPopup(toolbar) {
		var searchPop = new dhtmlXPopup({
			toolbar : toolbar,
			id : "btnDetailSearch"
		});

		var groupPopup;
		var customerPopup;
		var warehousePopup;
		var managerPopup;

		searchPop.attachEvent("onBeforeHide", function(type, ev, id) {

			return groupPopup.isHide() && customerPopup.isHide() && warehousePopup.isHide() && managerPopup.isHide();
		});

		var searchForm = searchPop.attachForm();

		searchForm.loadStruct(config.toolbar.searchForm.xml, function() {
			searchForm.setFocusOnFirstActive();
			searchForm.attachEvent("onButtonClick", function(id) {

				if (id == 'btnSearch') {

					searchPop.hide();
					params = toParams(searchForm.getFormData());
					reloadGrid();

				} else if (id == 'btnClear') {
					searchForm.clear();
				}
			});

			groupPopup = new FormCustomerGroupPopup(searchForm, 'groupName', function(id) {

				$.post("popup/customer/group/info", {
					code : id
				}, function(data) {

					searchForm.setItemValue("groupName", data.name);

				});

			}, function() {
			});

			customerPopup = new FormCustomerPopup(searchForm, 'customerName', function(id) {

				$.post("popup/customer/info", {
					code : id
				}, function(data) {

					searchForm.setItemValue("customerName", data.name);

				});

			}, function() {
			});

			warehousePopup = new FormWarehousePopup(searchForm, 'warehouseName', function(id) {

				$.post("popup/warehouse/info", {
					code : id
				}, function(data) {

					searchForm.setItemValue("warehouseName", data.name);

				});

			}, function() {
			});

			managerPopup = new FormEmployeePopup(searchForm, 'managerName', function(id) {

				$.post("popup/employee/info", {
					code : id
				}, function(data) {

					searchForm.setItemValue("managerName", data.name);

				});

			}, function() {
			});

		});

		searchPop.attachEvent("onShow", function() {
			searchForm.setFocusOnFirstActive();
		});
	}

	function Grid(container) {

		toolbar = container.attachToolbar();
		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		toolbar.loadStruct(config.toolbar.xml, function() {
			
			setToolbarStyle(toolbar);

			if (config.toolbar.onInit)
				config.toolbar.onInit(toolbar);

			setupSearchPopup(toolbar);
			setupHelpPopup(toolbar);

			var fromInput = toolbar.objPull[toolbar.idPrefix + "from"].obj.firstChild;
			fromInput.readOnly = true;
			var calendarFrom = new dhtmlxCalendarObject(fromInput);
			calendarFrom.hideTime();

			var toInput = toolbar.objPull[toolbar.idPrefix + "to"].obj.firstChild;
			toInput.readOnly = true;
			var calendarTo = new dhtmlxCalendarObject(toInput);
			calendarTo.hideTime();

			var range = getRange(30);
			setDateRange(range);

			toolbar.attachEvent("onClick", function(id) {
				if( config.toolbar.onClick )
					if( config.toolbar.onClick(id) )
						return;
					
				if (id == 'thisMonth') {
					setDateRange(getRangeThisMonth());
					reloadGrid();
				} else if (id == 'lastMonth') {
					setDateRange(getRangeLastMonth());
					reloadGrid();
				} else if (id == 'last7d') {
					var range = getRange(7);
					setDateRange(range);
					reloadGrid();
				} else if (id == 'last30d') {
					var range = getRange(30);
					setDateRange(range);
					reloadGrid();
				} else if (id == 'btnSearch') {
					reloadGrid();
				} else if (id == 'btnResetSize') {
					clearGridCookie(grid, config.grid.name);
					alert('그리드 설정값이 삭제되었습니다. 다음에 이 탭을 열때 적용이 됩니다.');
				}
			});

			grid.load(config.grid.xml, function() {

				grid.setNumberFormat(numberFormat, 3);
				grid.setNumberFormat(numberFormat, 4);
				grid.setNumberFormat(numberFormat, 5);
				grid.setNumberFormat(numberFormat, 6);

				grid.attachEvent("onBeforeSorting", function(ind, gridObj, direct) {

					if (grid.fldSort[ind] != 'server')
						return true;

					var range = "?from=" + toolbar.getValue("from") + "&to=" + toolbar.getValue("to");

					var sortparams = range + params + "&orderby=" + ind + "&direct=" + direct;

					grid.clearAll();
					grid.load(gridUrl + sortparams, function() {
					}, 'json');
					grid.setSortImgState(true, ind, direct);
					return false;
				});

				grid.attachEvent("onRowSelect", function(rId, cInd) {
					if (config.callback.selected)
						config.callback.selected(rId);
				});

				grid.attachEvent("onRowDblClicked", function(rId, cInd) {
					if (config.callback.dblClick)
						config.callback.dblClick(rId);
				});

				grid.attachFooter("합 계,#cspan,#cspan,#cspan,<div id='sum_net'>0</div>,<div id='sum_tax'>0</div>,<div id='sum_value'>0</div>,,#cspan,#cspan", //
				[ "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);

				// grid.splitAt(3);

				setGridCookie(grid, config.grid.name);

				reloadGrid();
			});

		});

	}

	function updateSummary(callback) {

		var range = "?from=" + toolbar.getValue("from") + "&to=" + toolbar.getValue("to");

		$.post(config.grid.sum + range + params, function(data) {

			$("#sum_net").text(data.net.format());
			$("#sum_tax").text(data.tax.format());
			$("#sum_value").text(data.value.format());

			if (callback)
				callback();
		});

	}

	function reloadGrid() {

		// updateSummary(function() {

		var range = "?from=" + toolbar.getValue("from") + "&to=" + toolbar.getValue("to");

		grid.clearAll();

		var url = gridUrl + range + params;
		grid.clearAll();
		grid.load(url, function() {
			updateFooter();
		}, 'json');

		// });

	}

	function updateFooter() {

		// 합산 갱신
		var net = 0;
		var tax = 0;
		var amt = 0;
		
		for (var i = 0; i < grid.getRowsNum(); i++) {
			var rowId = grid.getRowId(i);
			if (grid.cells(rowId, 7).getValue() != '확 정')
				return;
			
			net += Number(grid.cells(rowId, 4).getValue());
			tax += Number(grid.cells(rowId, 5).getValue());
			amt += Number(grid.cells(rowId, 6).getValue());

		}

		$("#sum_net").text(net.format());
		$("#sum_tax").text(tax.format());
		$("#sum_value").text(amt.format());

	}

}