function MemberGrid(config) {
	DataGrid.call(this);

	this.excelTitle = '회원 목록';
	this.setSelectFilterData('state', [  '활성', '비활성' ]);
	
	this.setBascodeSelectFilterData('levelName', 'LV'); 
	this.setBascodeSelectFilterData('typeName', 'MT');

	this.setUrlPrefix('member'); 

}
MemberGrid.prototype = Object.create(DataGrid.prototype);
MemberGrid.prototype.constructor = MemberGrid;

MemberGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/member/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/member/grid.xml",
	}, 'server');

};

MemberGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

MemberGrid.prototype.onInitedToolbar = function(toolbar) {

	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	
	var filePopup = new FilePopup(this.container, {
		name : 'fileDataMember',
		uploadUrl : 'member/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadMember'
		},
		form : {
			xml : 'xml/member/excel.xml',

		},
		getData : function() {

			return { 
				name : 'member'
			}

		},
		onClickDelete : function(form) { 

		},
		onUploaded : function(result) {
		},
		onInited : function(form) { 
		}

	});

	filePopup.init();
	
};

MemberGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnResetPw') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			dhtmlx.confirm({
				title : "비밀번호를 초기화 하시겠습니까?",
				type : "confirm-warning",
				text : "초기화 된 비밀번호는 복구할 수 없습니다.",
				callback : function(r) {
					if (r) {
						var selectedId = me.grid.getSelectedRowId();
						$.get('member/resetPassword', {
							"id" : selectedId
						}, function(result) {
							var Ca = /\+/g;
							var response = decodeURIComponent(result.replace(Ca, " "));
							dhtmlx.alert({
								title : "알림",
								type : "alert-error",
								text : response,
								callback : function() {
									
									me.reload();
								}
							});

						});
					}
					me.progressOff();
				}
			});

			
		} else {
			dhtmlx.alert({
				title : "비밀번호를 초기화 할 수 없습니다.",
				type : "alert-error",
				text : "초기화 할 항목을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	} else if (id == 'btnSms') {
		var params = me.buildParams();
		smsDialog = new SmsDialog();
		smsDialog.setParams(params);
		smsDialog.open(true);

	}

};

MemberGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

MemberGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.option1 = this.fOption1;
	param.option2 = this.fOption2;
}