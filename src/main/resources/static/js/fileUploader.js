function FileUploader(container, config) {
	var vault;
	var parentId;
	
	function refresh(){
		container.progressOn();
		vault.load(config.recordUrl, function() {
			container.progressOff();
		});
	}
	
	this.getRows = function() {
		return gridToJson(grid);
	};

	this.setParent = function(_parentId) {
		parentId = _parentId;
	};

	this.clear = function() {
		vault.clear();
	};

	this.reload = function() {
		refresh();
	};

	this.init = function() {
		vault = container.attachVault({
			uploadUrl : config.uploadUrl,
		});

		vault.setDownloadURL(config.downloadUrl + "?code={serverName}");

		vault.setStrings({
			done : "성공",
			error : "실패",
			// size_exceeded: "Dateigröße überschritten (max #size#)",
			btnAdd : "파일 추가",
			btnUpload : "업로드",
			btnClean : "모두 지우기",
			btnCancel : "취소",
		// dnd: "Drop dateien hier"
		});

		vault.attachEvent("onBeforeFileAdd", function(file) {

			if (config.callback.onBeforeFileAdd)
				return config.callback.onBeforeFileAdd(file);
			/*
			 * console.log(file); var ext = this.getFileExtension(file.name); // return (ext=="txt"||ext=="doc");
			 */
			return true;
		});

		vault.attachEvent("onBeforeFileRemove", function(file) {
			
			
			dhtmlx.confirm({
				title : "파일을 삭제하시겠습니까?",
				type : "confirm-warning",
				text : "삭제된 파일은 복구할 수 없습니다.",
				callback : function(r) {
					if (r) {
						container.progressOn();
						$.post(config.deleteUrl, {
							code : file.serverName
						}, function(result) {
							
							container.progressOff();

							if (result.error) {
								dhtmlx.alert({
									title : "파일을 삭제할 수 없습니다.",
									type : "alert-error",
									text : result.error
								});
							} else {
								refresh();
							}

							
						});
					}
				}
			});
			
			return false;
		});
	}
}