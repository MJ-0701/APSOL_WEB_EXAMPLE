function CustomerManagerGrid() {
	DataGrid.call(this);
	
	var me = this;

	this.setRecordUrl('customerManager/records');
	
	this.setBascodeSelectFilterData('stateName', 'ST');
	this.setBascodeSelectFilterData('kindName', 'CT');
	this.setBascodeSelectFilterData('activatedName', 'AT');

	/*this.setSelectFilterData('managerName', new Array());
	$.get('customer/manager/filter', function(dataArray) {
		me.setSelectFilterData('managerName', dataArray);
	});*/

}
CustomerManagerGrid.prototype = Object.create(DataGrid.prototype);
CustomerManagerGrid.prototype.constructor = CustomerManagerGrid;

CustomerManagerGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/manager/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/manager/grid.xml",
	}, 'server');

};

CustomerManagerGrid.prototype.onInitedGrid = function(grid) {
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

	/*
	 * grid.attachEvent("onRightClick", function(rowId, nd, obj) { console.log("copy " + rowId); grid.cellToClipboard(rowId, 0); });
	 */

	// grid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
	// grid.detachHeader(1);
	// 즉시 로딩
	this.loadRecords();
};