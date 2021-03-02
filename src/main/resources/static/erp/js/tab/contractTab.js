function ContractTab(container, config){
	
	var layout =container.attachLayout('2E');

	layout.cells("a").hideHeader();
	layout.cells("b").hideHeader();
	
	layout.cells("a").setHeight(300);
	
	
	var grid = new ContractGrid();
	grid.setEnableDateRange(false);
	//TODO
	//grid.setCustomerCode();
	
	grid.addProgressCell('layout', container);
	
	grid.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/contract/grid.xml",
	});
	
}