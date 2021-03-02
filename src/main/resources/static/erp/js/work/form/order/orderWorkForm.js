/**
 * 매입매출 폼
 */
function OrderWorkForm(config) {
	WorkForm.call(this);

	this.ignoreCells = [ 'amount' ];
	this.tabbar;
}

OrderWorkForm.prototype = Object.create(WorkForm.prototype);
OrderWorkForm.prototype.constructor = OrderWorkForm;

OrderWorkForm.prototype.init = function(container) {
	
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/work/form/order/toolbar.xml',
	});
	
	var layout = container.attachLayout('2U');
	this.layout = layout;

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('a').setWidth(500);

	layout.cells('a').fixSize(true, true);
	
	this.tabbar = layout.cells('a').attachTabbar({
		tabs: [
			{id: "a1", text: "주 문", active: true},
			{id: "a2", text: "배 송"},
			{id: "a3", text: "결 제"},
			{id: "a4", text: "문서 설정"}
		]
	});

	this.initForm(this.tabbar.cells('a1'), {
		xml : 'erp/xml/work/form/order/form.xml',
	});
	
	this.editor = layout.cells('b').attachEditor();

	WorkForm.prototype.init.call(this, container);
}

OrderWorkForm.prototype.onInitedForm = function(form) {
	WorkForm.prototype.onInitedForm.call(this, form);

	var me = this;
	
	me.tabbar.cells("a2").attachObject("deliveryForm");
	me.tabbar.cells("a3").attachObject("paymentForm");
	me.tabbar.cells("a4").attachObject("orderWorkSettingForm");

	form.attachEvent("onInputChange", function(name, value, form) {

		if (name == 'amount') {
			form.setItemValue('tax', Number(value) * 0.1);
		}
	});

	this.addCustomerCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		project : {
			name : 'project'
		},
		projectName : {
			name : 'projectName'
		}
	}).setNextFocus('projectName');
	
	this.addBascodeCell('projectName', 'PJ').setFieldMap({
		project : {
			name : 'uuid',
			//required : true,
		},
		projectName : {
			name : 'name',
		}
	}).setNextFocus('orderAmount');

	this.addCustomerCell('customer2Name').setFieldMap({
		customer2 : {
			name : 'uuid',
			//required : true,
		},
		customer2Name : {
			name : 'name',
		},
	});



}

OrderWorkForm.prototype.onAfterLoaded = function(result) {
	WorkForm.prototype.onAfterLoaded.call(this, result);

	var me = this;

	this.form.forEachItem(function(name) {
		if (name.includes('dhxId_'))
			return;

		me.form.enableItem(name);
	});

	console.log(result);
	
	var selObj = me.form.getSelect('slipKind');
	
	console.log(selObj);
	
	

	if (result.data.kind == 'WK0004') {
		// 발주
		me.form.hideItem('collectDate');
		me.form.hideItem('publishDate');
		
		$(selObj).append('<option value="S10003">주 문</option>');		
		$(selObj).append('<option value="S10005"'+ ( result.data.slipKind == 'S10005' ? 'selected="selected"' : '' ) +'>반 품</option>');
		
	} else {
		// 수주
		me.form.showItem('collectDate');
		me.form.showItem('publishDate');
		
		$(selObj).append('<option value="S10004">주 문</option>');		
		$(selObj).append('<option value="S10006"'+ ( result.data.slipKind == 'S10006' ? 'selected="selected"' : '' ) +'>반 품</option>');
	}

	if (result.data.workType == 'DK0002') {
		// 보고일 때
		this.form.forEachItem(function(name) {
			if (name.includes('dhxId_'))
				return;

			me.form.disableItem(name);
		});

		me.form.enableItem('title');
		me.form.enableItem('memo');
		me.form.enableItem('btnSend');
	}

}