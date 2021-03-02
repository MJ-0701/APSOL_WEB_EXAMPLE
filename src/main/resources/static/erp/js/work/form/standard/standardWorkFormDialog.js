/**
 * 일반 문서 폼 다이얼로그
 * @param x
 * @param y
 * @returns
 */
function StandardWorkFormDialog(name, x, y) {
	WorkFormDialog.call(this, name, 10, 10);
	
};

StandardWorkFormDialog.prototype = Object.create(WorkFormDialog.prototype);
StandardWorkFormDialog.prototype.constructor = StandardWorkFormDialog;

StandardWorkFormDialog.prototype.buildForm = function() {	
	
	return new StandardWorkForm();
}

StandardWorkFormDialog.prototype.getTitle = function() {
	return "문서 편집"
}