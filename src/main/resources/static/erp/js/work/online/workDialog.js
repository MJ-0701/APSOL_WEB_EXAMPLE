function WorkDialog(x, y) {
	Dialog.call(this, "workDialog", "업무 문서", 890, 800, 10, 10);

	this.code;

	this.item;

	var me = this;
	
	this.layout;
	this.tabbar;
};

WorkDialog.prototype = Object.create(Dialog.prototype);
WorkDialog.prototype.constructor = WorkDialog;

WorkDialog.prototype.onAfterLoaded = function(data) {
}

WorkDialog.prototype.onInitedLayout = function(container) {
}

WorkDialog.prototype.onInitedToolbar = function(toolbar) {
}

WorkDialog.prototype.addItemTab = function(tabId, name) {
	
	this.tabbar.addTab(tabId, name);
	
	this.tabbar.cells(tabId).setActive();
	
	this.initItem( this.tabbar.cells(tabId) );
}

WorkDialog.prototype.initItem = function(container) {

	this.item = new WorkItem();
	this.item.work = this.code;
	this.item.addProgressCell('b', container);
	this.item.init(container, {
		imageUrl : imageUrl,
		iconsPath : "img/18/"
	});

}

WorkDialog.prototype.onInited = function(wnd) {

	var me = this;

	this.setModal(true);

	this.move(undefined, 20);

	this.layout = wnd.attachLayout('2E');

	this.layout.cells('a').hideHeader();
	this.layout.cells('b').hideHeader();

	this.layout.cells('b').setHeight(300);

	// 조회부가 아니라 작성부. 결재부에서 편집 키를 이용해서 팝업을 띄운 후 결재를 수정한다.
	// 첨부 파일에서는 fileValut 를 활용한다.
	this.tabbar = this.layout.cells('b').attachTabbar({
		tabs : [ {
			id : "a1",
			text : "결제선",
			active : true
		}]
	});
		
	this.onInitedLayout(this.layout.cells('a'));

};