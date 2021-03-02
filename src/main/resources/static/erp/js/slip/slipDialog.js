function SlipDialog(x, y) {
	Dialog.call(this, "slipDialog", "전표 편집", 890, 800, 10, 10);

	this.code;
	this.item;
	var me = this;	
	this.layout;
	this.tabbar;
};

SlipDialog.prototype = Object.create(Dialog.prototype);
SlipDialog.prototype.constructor = SlipDialog;

SlipDialog.prototype.onAfterLoaded = function(result) {
	if( this.item ){
		this.item.kind = result.data.kind;
	}
}

SlipDialog.prototype.onInitedLayout = function(container) {
}

SlipDialog.prototype.onInitedToolbar = function(toolbar) {
}

SlipDialog.prototype.addItemTab = function(tabId, name) {
			
	this.tabbar.addTab(tabId, name);	
	this.tabbar.cells(tabId).setActive();
	this.initItem( this.tabbar.cells(tabId) );
}

SlipDialog.prototype.initItem = function(container) {

	//TODO 제대로 수정할 것.
	this.item = new SlipItem();
	this.item.slip = this.code;
	this.item.addProgressCell('b', container);
	this.item.init(container, {
		imageUrl : imageUrl,
		iconsPath : "img/18/"
	});

}

SlipDialog.prototype.onInited = function(wnd) {

	var me = this;

	this.setModal(true);

	this.move(undefined, 20);

	this.layout = wnd.attachLayout('2E');
	this.layout.cells('a').hideHeader();
	this.layout.cells('b').hideHeader();
	this.layout.cells('b').setHeight(300);
	
	this.onInitedLayout(this.layout.cells('a'));

};