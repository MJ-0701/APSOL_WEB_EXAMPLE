function Files(container, config) {

	var grid;
	var toolbar;
	var popup;
	var form;
	var parentId;
	
	this.getRows = function() {
		return gridToJson(grid);
	};

	this.clear = function() {
		parentId = 0;
		grid.clearAll();
	};

	this.reload = function() {
		_reload();
	};

	this.progressOn = function() {
		container.progressOn();

		// 업로드를 수시로 체크...
	};

	this.init = function() {
		setupGrid();
		setupToolbar();
	};

	this.setParentId = function(_parentId) {
		parentId = _parentId;
		_reload();
	};

	function _reload() {

		if (grid == null)
			return;

		container.progressOn();
		var url = config.recordUrl + "?parent=" + parentId;

		grid.clearAndLoad(url, function() {
			container.progressOff();
		}, 'json');
	}

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);
		});
	}

	function setupToolbar() {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

			popup(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {
			if (id == 'btnDelete') {
				remove();
			}
		});
	}

	function remove() {

		dhtmlx.confirm({
			title : "파일을 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 파일은 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.deleteUrl, {
						ids : grid.getSelectedRowId()
					}, function(result) {

						container.progressOff();

						if (result.error) {
							dhtmlx.alert({
								title : "파일을 삭제할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {

							if (config.callback.onDeleted) {
								config.callback.onDeleted(result);
							}

							_reload();

						}

					});
				}
			}
		});

	}

	function popup(toolbar) {
		popup = new dhtmlXPopup({
			toolbar : toolbar,
			id : "btnUpload"
		});

		popup.attachEvent("onShow", function() {
			if (form == null) {

				if ($("#" + config.name + "Uploader").length == 0) {
					$("body").append('<form id="' + config.name + 'Uploader" method="POST" enctype="multipart/form-data"></form>');
					$("#" + config.name + "Uploader").append($("<div id='" + config.name + "UploaderForm' >"));
				}

				popup.attachObject("" + config.name + "Uploader");

				form = new dhtmlXForm("" + config.name + "UploaderForm");

				form.loadStruct(config.form.xml, function() {
				});

				form.attachEvent("onButtonClick", function() {

					popup.hide();

					container.progressOn();

					console.log(parentId);

					$("#" + config.name + "Uploader").ajaxSubmit({
						url : config.uploadUrl,
						data : {
							parent : parentId
						},
						success : function(result) {

							container.progressOff();

							if (result.error) {
								dhtmlx.alert({
									width : '400px',
									title : "파일을 업로드 할 수 없습니다.",
									type : "alert-error",
									text : result.error
								});
								return;
							} else if (result.invalids) {

								dhtmlx.alert({
									width : '400px',
									title : "파일을 업로드 할 수 없습니다.",
									type : "alert-error",
									text : result.invalids
								});
								return;
							}

							dhtmlx.alert("데이터 업로드가 완료되었습니다.", function(result) {
								_reload();
							});
						},
						error : function() {
							container.progressOff();

							dhtmlx.alert({
								width : '400px',
								title : "파일 업로드 에러!!",
								type : "alert-error",
								text : "형식에 맞지 않는 데이터 일 수 있습니다.<br/>확인해주세요."
							});
						}
					});
				});
			}
		});

	}
}