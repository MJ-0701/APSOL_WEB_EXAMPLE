function SlipSelectDialog(x, y) {
	GridDialog.call(this, "SlipSelectDialog22", "전표 선택",910, 400, x, y);
	
	this.kind;
	this.businessNumber; 
	
	this.value = '';
	this.tax = '';
	
	this.onConnected ;
};

SlipSelectDialog.prototype = Object.create(GridDialog.prototype);
SlipSelectDialog.prototype.constructor = SlipSelectDialog;

SlipSelectDialog.prototype.onInited = function(wnd) {

	this.grid = new SlipSelectGrid();
	this.grid.kind = this.kind;
	this.grid.businessNumber = this.businessNumber;
	this.grid.value = this.value;
	
	var me = this;
	
	this.grid.setOnRowDblClicked(function(rowId){
		
		dhtmlx.confirm({
			title : "계산서와 전표를 연결하시겠습니까?",
			type : "confirm-alert",
			text : "일자 : " + me.grid.getData('date') + "<br>내용  : "+ me.grid.getData('remarks') +"<br>금액 : " + me.grid.getData('total') ,
			callback : function(result) {
				if (result) {
					console.log({
						slip : rowId,
						tax : me.tax,
					});
					
					$.post('tax/connect', {
						slip : rowId,
						tax : me.tax,
					}, function(result){
						
						if( me.onConnected )
							me.onConnected(result);
						
						console.log(result);
						me.close();
					});
				}
			}
		});
		
		
	});
	
	this.grid.init(wnd, {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

};

SlipSelectDialog.prototype.onClosed = function() {
	GridDialog.prototype.onClosed.call(this);
};