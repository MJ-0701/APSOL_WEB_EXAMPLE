function WorkDocument(config) {
	this.layout;
	this.toolbar;
}

WorkDocument.prototype.initToolbar = function(container, config) {
	var toolbar = container.attachToolbar();
	this.toolbar = toolbar;
	toolbar.setIconsPath("img/18/");
	toolbar.loadStruct(config.xml, function() {
		setToolbarStyle(toolbar);

		$(toolbar.cont.offsetParent).removeClass('dhx_cell_toolbar_def').addClass('dhx_cell_toolbar_no_borders');

	});

	toolbar.attachEvent("onClick", function(id) {

		if (id == 'btnAdd') {
		}
		
	});
}

WorkDocument.prototype.init = function(container, config) {
	this.layout = container.attachLayout('2E');

	container.hideHeader();
	// $(container.cell).find('.dhx_cell_cont_layout').css('overflow', 'auto');

}