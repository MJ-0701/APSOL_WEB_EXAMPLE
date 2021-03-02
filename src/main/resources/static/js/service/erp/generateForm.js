function GenerateForm(container, config) {
	var form;

	this.focus = function() {
		form.setFocusOnFirstActive();
	};

	this.reset = function() {
		form.clear();
	};

	this.init = function() {
		form = container.attachForm();
		form.loadStruct(config.form.xml, function() {
			form.setFocusOnFirstActive();
		});

		form.attachEvent("onButtonClick", function(name) {
			if (name == 'btnReset') {
				form.clear();
			}

			if (name == 'btnCreate') {

				if (!form.validate()) {
					dhtmlx.alert({
						title : "ERP를 생성할 수 없습니다.",
						type : "alert-error",
						text : "유효하지 않은 값들이 있습니다.",
					});
					return;
				}

				var id = form.getItemValue("id");
				if (id.match(/[^a-zA-Z]/) != null) {

					dhtmlx.alert({
						title : "ERP를 생성할 수 없습니다.",
						type : "alert-error",
						text : "ERP ID는 영문만 입력할 수 있습니다.",
					});

					return;
				}

				if (id.length < 4) {
					dhtmlx.alert({
						title : "ERP를 생성할 수 없습니다.",
						type : "alert-error",
						text : "ERP ID 의 길이가 너무 짧습니다.",
					});

					return;
				}

				if (id.length > 20) {
					dhtmlx.alert({
						title : "ERP를 생성할 수 없습니다.",
						type : "alert-error",
						text : "ERP ID 의 길이가 너무 깁니다.",
					});

					return;
				}

				var admin = form.getItemValue("admin");
				if (admin.match(/[^a-zA-Z0-9]/) != null) {

					dhtmlx.alert({
						title : "ERP를 생성할 수 없습니다.",
						type : "alert-error",
						text : "관리자 아이디는 영문과 숫자만 가능합니다.",
					});

					return;
				}

				if (admin.length < 4) {
					dhtmlx.alert({
						title : "ERP를 생성할 수 없습니다.",
						type : "alert-error",
						text : "관리자 아이디의 길이가 너무 짧습니다.",
					});

					return;
				}

				if (admin.length > 30) {
					dhtmlx.alert({
						title : "ERP를 생성할 수 없습니다.",
						type : "alert-error",
						text : "관리자 아이디의 길이가 너무 깁니다.",
					});

					return;
				}

				dhtmlx.alert({
					width : '500px',
					title : "ERP를 생성합니다.",
					text : "기초 데이터 설정에 약 최대 5분정도 걸릴 수 있습니다. 잠시만 기다려주세요.",
				});

				config.callback.onBeforeUpdate();
				$.post('erp/generate', form.getFormData(true), function(result) {

					config.callback.onAfterUpdate();

					if (result.error) {
						dhtmlx.alert({
							title : "ERP를 생성할 수 없습니다.",
							type : "alert-error",
							text : result.error,
							callback : config.callback.onAfterError
						});

						return;
					} else {
						dhtmlx.alert({
							width : '400px',
							title : "ERP가 생성되었습니다.",
							text : "생성된 관리자의 패스워드는 [0000]입니다. <br/>관리자 아이디로 로그인하셔서 패스워드를 바꿔주세요. <br /> 최초 생성된 ERP 는 60일간 모든 기능을 사용 가능합니다.",
						});
					}

				});

			}
		});
	};
}