function WorkDialog(name, x, y) {
	Dialog.call(this, "workDialog", "업무 문서", 940, 800, 10, 10);
	
	this.code;

	this.name = name;
	this.item = null;
	this.approvalGrid1;
	this.approvalGrid2;

	this.approvalDlg = new WorkApprovalDialog();

	var me = this;
	this.approvalDlg.setOnClose(function() {
		me.approvaGrid1.reload();
		me.approvaGrid2.reload();
	});

	this.fileGrid;
	this.layout;
	this.tabbar;
};

WorkDialog.prototype = Object.create(Dialog.prototype);
WorkDialog.prototype.constructor = WorkDialog;

WorkDialog.prototype.onAfterLoaded = function(data) {

	this.code = data.id;
	this.approvalDlg.work = data.id;
	this.approvaGrid1.work = data.id;
	this.approvaGrid2.work = data.id;
	if( this.item )
		this.item.work = data.id;
	
	this.fileGrid.dataId = data.id;

}

WorkDialog.prototype.onInitedLayout = function(container) {
}

WorkDialog.prototype.onInitedToolbar = function(toolbar) {
}

WorkDialog.prototype.initApprovaLine = function(container) {

	var me = this;

	var toolbar = container.attachToolbar();
	toolbar.setIconsPath("img/18/");
	toolbar.loadStruct("erp/xml/work/approval/toolbar.xml", function() {
		setToolbarStyle(toolbar);
	});

	toolbar.attachEvent("onClick", function(id) {
		if (id == 'btnEdit') {
			me.approvalDlg.work = me.code;
			me.approvalDlg.position(me.getX() + 20, me.getY() + 20);
			me.approvalDlg.open(false);
		}
	});

	var layout = container.attachLayout('2U');
	layout.cells('a').setText('결재');
	layout.cells('a').setWidth(500);
	layout.cells('b').setText('참조');

	this.approvaGrid1 = new WorkApprovalGrid();
	this.approvaGrid1.work = this.code;
	this.approvaGrid1.kind = "LK0001";

	this.approvaGrid1.addProgressCell('b', layout.cells('a'));
	this.approvaGrid1.approvalInit(layout.cells('a'), {
		imageUrl : imageUrl,
		iconsPath : "img/18/"
	});

	this.approvaGrid2 = new WorkApprovalGrid();
	this.approvaGrid2.work = this.code;
	this.approvaGrid2.kind = "LK0002";
	this.approvaGrid2.addProgressCell('b', layout.cells('b'));
	this.approvaGrid2.referInit(layout.cells('b'), {
		imageUrl : imageUrl,
		iconsPath : "img/18/"
	});

}

WorkDialog.prototype.addItemTab = function(tabId, name) {

	this.tabbar.addTab(tabId, name);

	this.tabbar.cells(tabId).setActive();

	this.initItem(this.tabbar.cells(tabId));
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

	/*
	 * var toolbar = wnd.attachToolbar(); toolbar.setIconsPath("img/18/"); toolbar.loadStruct("erp/xml/work/form/toolbar.xml", function() { setToolbarStyle(toolbar);
	 * 
	 * me.onInitedToolbar(toolbar); });
	 * 
	 * toolbar.attachEvent("onClick", function(id) { if (id == 'btnSend') { } });
	 */

	this.layout = wnd.attachLayout('2E');

	this.layout.cells('a').hideHeader();
	this.layout.cells('b').hideHeader();

	this.layout.cells('b').setHeight(300);

	// 조회부가 아니라 작성부. 결재부에서 편집 키를 이용해서 팝업을 띄운 후 결재를 수정한다.
	// 첨부 파일에서는 fileValut 를 활용한다.
	this.tabbar = this.layout.cells('b').attachTabbar({
		tabs : [ {
			id : "a1",
			text : "결재선",
			active : true
		}, {
			id : "af",
			text : "첨부 파일",
		} ]
	});

	this.initApprovaLine(this.tabbar.cells('a1'));

	this.fileGrid = new FileGrid();
	this.fileGrid.dataId = this.code;
	this.fileGrid.init(this.tabbar.cells('af'), {
		iconsPath : "img/18/",
		imageUrl : imageUrl,
	});

	this.onInitedLayout(this.layout.cells('a'));

};