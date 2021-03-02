function CarryOverAccount(){
	
	// 거래처 코드가 있을때.
	this.customerCode;
}

CarryOverAccount.prototype = new DateGrid();
CarryOverAccount.prototype.constructor = CarryOverAccount;

CarryOverAccount.prototype.setCustomerCode = function(customerCode){
	this.customerCode = customerCode;
}