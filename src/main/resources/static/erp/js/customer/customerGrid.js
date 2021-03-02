function CustomerGrid() {
	DataGrid.call(this);

	var me = this;

	this.setRecordUrl('customer/records');
	this.setExcelUrl('customer/excel');

	this.setBascodeSelectFilterData('stateName', 'ST');
	this.setBascodeSelectFilterData('kindName', 'CT');
	this.setBascodeSelectFilterData('customerKindName', 'FK');
	this.setBascodeSelectFilterData('activatedName', 'AT');

	this.setSelectFilterData('managerName', new Array());
	$.get('customer/manager/filter', function(dataArray) {
		me.setSelectFilterData('managerName', dataArray);
	});

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	var hasFilter = false
	this.chosunis = false;

	this.showAll = false;
}
CustomerGrid.prototype = Object.create(DataGrid.prototype);
CustomerGrid.prototype.constructor = CustomerGrid;

CustomerGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/grid.xml",
	}, 'server');

};

CustomerGrid.prototype.init2 = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer2/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer2/grid.xml",
	}, 'server');

	this.chosunis = true;
};

CustomerGrid.prototype.init22 = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer2/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer2/grid22.xml",
	}, 'server');

	this.chosunis = false;
};

CustomerGrid.prototype.initOffice = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer2/gridToolbar2.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer2/grid.xml",
	}, 'server');

};

CustomerGrid.prototype.init3 = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer2/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer2/grid2.xml",
	}, 'server');

};

CustomerGrid.prototype.onInitedToolbar = function(toolbar) {
	
	var me = this;
	
	toolbar.attachEvent("onEnter", function(id, value){
		
		if( id == 'catIdInp' ){
			me.reload();
		}
	     
	});
	var me = this;
	toolbar.attachEvent("onStateChange", function(id, state) {
		
		
		if( id == 'btnShowAll'){			
			me.showAll = state;
			
			me.reload();
		}
	});
	
}

CustomerGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	grid.attachEvent("onKeyPress", function(code, ctrl, shift) {

		if (code == 67 && ctrl) {

			$('#clipBoardInp').val(me.getData('businessNumber'));
			$('#clipBoardInp').select();

			try {
				var successful = document.execCommand('copy');
			} catch (err) {
				alert('이 브라우저는 지원하지 않습니다.')
			}
		}
		return true;
	});

	var now = new Date();
	now.setDate(1);
	
	now.setMonth(now.getMonth() - 1);

	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	
	grid.setColLabel(grid.getColIndexById("vanCnt"),  year + '-' + month);
	var filterObject = grid.getFilterElement(grid.getColIndexById("vanCnt"));
	if (filterObject) {
		$(filterObject).attr('placeHolder', '-' +  year + '-' + month + '-');
	}
	
	now.setMonth(now.getMonth() - 1);
	
	var year = now.getFullYear();
	var month = now.getMonth() + 1;

	grid.setColLabel(grid.getColIndexById("vanCnt1"),  year + '-' + month);
	var filterObject = grid.getFilterElement(grid.getColIndexById("vanCnt1"));
	if (filterObject) {
		$(filterObject).attr('placeHolder', '-' +  year + '-' + month + '-');
	}

	now.setMonth(now.getMonth() - 1);
	
	var year = now.getFullYear();
	var month = now.getMonth() + 1;

	grid.setColLabel(grid.getColIndexById("vanCnt2"),  year + '-' + month);
	var filterObject = grid.getFilterElement(grid.getColIndexById("vanCnt2"));
	if (filterObject) {
		$(filterObject).attr('placeHolder', '-' +  year + '-' + month + '-');
	}


	/*
	 * grid.attachEvent("onRightClick", function(rowId, nd, obj) { console.log("copy " + rowId); grid.cellToClipboard(rowId, 0); });
	 */

	// grid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
	// grid.detachHeader(1);
	// 즉시 로딩
	this.loadRecords();
};

CustomerGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	
	try
	{
	params.catId = this.toolbar.getValue('catIdInp');
	}catch(e){}
	

	params.chosunis = this.chosunis;
	params.showAll= this.showAll;
	
	
};