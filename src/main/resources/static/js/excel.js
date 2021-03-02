function Excel(container, name, config) {

	if (name == undefined) {
		name = 'excel';
	}
	
	var uploaderName = name + 'Uploader';
	var formName = name + 'UploaderForm';

	var layout = container.attachLayout('2E');

	layout.cells('a').setHeight("50");
	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();

	if ($("#" + uploaderName).length == 0) {
		$("body").append('<form id="' + uploaderName + '" method="POST" enctype="multipart/form-data"></form>');
		$("#" + uploaderName).append($("<div id='" + formName + "' >"));
	}

	layout.cells('a').attachObject(uploaderName);

	var excelLoadForm = new dhtmlXForm(formName);

	excelLoadForm.loadStruct(config.form.xml, function() {

		excelLoadForm.enableLiveValidation(true);

		excelLoadForm.attachEvent("onButtonClick", function(name) {
			if (name == 'btnUpload') {

				if (!excelLoadForm.validate()) {
					alert("유효하지 않은 값이 있어 저장할 수 없습니다. 확인해주세요.");
					return;
				}

				container.progressOn();

				$("#" + uploaderName).ajaxSubmit({
					url : config.url,
					success : function(data) {

						if (data) {
							grid.clearAll();
							grid.parse(data, function() {
								container.progressOff();
								alert("데이터 업로드가 완료되었습니다.");
							}, 'json');
						} else {
							container.progressOff();
							alert("데이터 업로드가 완료되었습니다.");
						}

					}, 
					error : function(e){
						alert(e);
					}
				});

			} else if (name == 'btnSample') {
				window.location.href = config.sampleUrl;
			}
		});
	});

	var grid = layout.cells('b').attachGrid();

	grid.load(config.grid.xml, function() {

	});

}