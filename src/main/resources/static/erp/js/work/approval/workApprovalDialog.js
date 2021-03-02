function WorkApprovalDialog(x, y) {
	Dialog.call(this, "workApprovalDialog", "결제 라인 편집", 870, 650, x, y);
	
	this.work;
	this.employeeGrid;
};

WorkApprovalDialog.prototype = Object.create(Dialog.prototype);
WorkApprovalDialog.prototype.constructor = WorkApprovalDialog;

WorkApprovalDialog.prototype.onInited = function(container) {

	this.setModal(true);
	
	console.log(this.work);
	
	var layout = container.attachLayout('3L');
	layout.cells("a").setText('직 원');
	layout.cells("b").setText('결 재');
	layout.cells("c").setText('참 조');
	
	layout.cells("a").setWidth(420);
	
	var me = this;
	
	this.employeeGrid = new EmployeeGrid();
	this.employeeGrid.work = this.work;
	this.employeeGrid.init(layout.cells("a"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	this.employeeGrid.addProgressCell('a', layout.cells("a"));
	
	this.employeeGrid.setOnMoved(function(){
		me.employeeGrid.reload();
		approvalLineGrid.reload();
		approvalLineGrid2.reload();
	});
	
	var approvalLineGrid = new ApprovalLineGrid();
	approvalLineGrid.kind = 'LK0001';
	approvalLineGrid.work = this.work;
	approvalLineGrid.approvalInit(layout.cells("b"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	approvalLineGrid.addProgressCell('b', layout.cells("b"));
	
	approvalLineGrid.setOnAfterDeleted(function(result){
		me.employeeGrid.reload();
	});
	
	 var approvalLineGrid2 = new ApprovalLineGrid();
	approvalLineGrid2.kind = 'LK0002';
	approvalLineGrid2.work = this.work;
	approvalLineGrid2.referInit(layout.cells("c"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	approvalLineGrid2.addProgressCell('c', layout.cells("c"));
	
	approvalLineGrid2.setOnAfterDeleted(function(result){
		me.employeeGrid.reload();
	});
};