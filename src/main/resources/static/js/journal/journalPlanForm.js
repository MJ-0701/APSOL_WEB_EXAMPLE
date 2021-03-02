function JournalPlanForm(container, config) {

	var form;
	var toolbar;
	var entityId;
	var updater;

	this.clear = function() {
		entityId = 0;
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
	};

	this.load = function(_entityId) {
		
		

		entityId = _entityId;
		reload();
	};

	function reload() {
		
		if( !form )
			return;

		reset();
		
		if( !entityId )
			return;

		container.progressOn();

		$.get('journalPlan/info', {
			code : entityId
		}, function(data) {
			form.setFormData(data);
			container.progressOff();
		});

	}

	function reset() {
		form.clear();
		form.reset();
		// form.setFocusOnFirstActive();
		form.setItemValue('code', 0);
	}

	function update() {
		container.progressOn();
		updater.update(entityId);
	}

	function remove() {

		dhtmlx.confirm({
			title : "가맹점 정보를 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 정보는 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.deleteUrl, {
						code : entityId
					}, function(result) {

						if (config.callback.onDeleted) {
							config.callback.onDeleted(result);
						}

						entityId = 0;
						reset();

						container.progressOff();
					});
				}
			}
		});
		
	}

	this.init = function() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/journal/journalPlanFormToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {

			case 'btnAdd':
				entityId = 0;
				reset();
				break;

			case 'btnUpdate':

				update();

				break;

			case 'btnDelete':
				remove();
				break;
				
			case 'btnChange':
				openAddJournalWindow();
				break;
			}

		});
		form = container.attachForm();

		form.loadStruct('xml/journal/journalPlanForm.xml', function() {
			
			reload();
		});

		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			entityId = result.newId;
			// 코드가 같다면... 폼 갱신.
			form.setItemValue('code', entityId);
			
			reload();

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		});
		
		updater.setupEvents('code');

	};

}