function openCustomerInfoWindow(customerId){
	window.open('customerInfo?code=' + customerId, '거래처명', 'width=1000,height=950,resizable=no,location=no,toolbar=no,menubar=no');
}


function openContractInfoWindow(contractId){
	if(!contractId){
		window.open('contractInfo', '신규 계약', 'width=920,height=870,resizable=no,location=no,toolbar=no,menubar=no');
	}else{
		window.open('contractInfo?code=' + contractId, '거래처명', 'width=920,height=870,resizable=no,location=no,toolbar=no,menubar=no');	
	}
}

function openAddJournalWindow(journalId){
	var w = 660;
	var h = 870;
	var left = (screen.width/2)-(w/2);
	  var top = (screen.height/2)-(h/2);
	  
	  if(!journalId){
		window.open('journalInfo', '일지추가', 'width=660,height=870,resizable=no,location=no,toolbar=no,menubar=no,fullscreen=no,left='+left+',top='+top);
	  }else{	  
		  window.open('journalInfo?journalId='+journalId, '일지수정', 'width=660,height=870,resizable=no,location=no,toolbar=no,menubar=no,fullscreen=no,left='+left+',top='+top);
	  }
}

function openNewBusinessContact(){
	window.open('businessContactInfo', '업무연락', 'width=970,height=680,resizable=no,location=no,toolbar=no,menubar=no,scrollbars=no');
}

function openAddProject(customerId){
	window.open('project?customerId='+customerId, '업무추가', 'width=660,height=870,resizable=no,location=no,toolbar=no,menubar=no,scrollbars=no');
}

function openNewContractWindow(code){
	if(!code){
		window.open('newContract', '새 계약', 'width=920,height=950,resizable=no,location=no,toolbar=no,menubar=no');
	}else{
	window.open('newContract?code='+code, '새 계약', 'width=920,height=950,resizable=no,location=no,toolbar=no,menubar=no');
	}

}