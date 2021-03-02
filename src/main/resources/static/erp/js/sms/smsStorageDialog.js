function SmsStorageDialog(type, readOnly, x, y) {
	Dialog.call(this, "smsStorageDialog", "문자보관함", 450, 250, x, y);

	this.form;
	this.grid;
	
	this.type = type;
};

SmsStorageDialog.prototype = Object.create(Dialog.prototype);
SmsStorageDialog.prototype.constructor = SmsStorageDialog;

SmsStorageDialog.prototype.reload = function(){
};

SmsStorageDialog.prototype.onInited = function(wnd) {
	
	var me = this;
	console.log("THIS TYPE IS " + this.type);
	
	this.layout = wnd.attachLayout("1C");	
	this.layout.cells('a').hideHeader();
	
	this.grid = new SmsStorageGrid(this.type);

	this.grid.init(this.layout.cells("a"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
};