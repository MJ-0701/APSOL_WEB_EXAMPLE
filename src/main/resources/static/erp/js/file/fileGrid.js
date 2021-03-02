function FileGrid(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('fileData');
	this.filePopup;
	this.form;
	this.kind;
	this.customerCode;
	this.dataId;
	
	this.enableStaus = false;
	this.chosunis = false;

}
FileGrid.prototype = new DataGrid();
FileGrid.prototype.constructor = FileGrid;

FileGrid.prototype.setForm = function(form) {
	this.form = form;

	var me = this;
	form.setOnClearListener(function() {
		me.clear();
	});

	form.setOnBeforeUpdatedEvent(function(data) {
	});

	form.setOnInserted(function(result) {
		console.log('setOnInserted');
	});

	form.setOnBeforeLoaded(function(param) {
		console.log('setOnBeforeLoaded ' + form.getId());
		me.dataId =  form.getId();
		me.reload();
	});

	form.setOnAfterLoaded(function(result) {
		// me.reload();
	});
};

FileGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	var me = this;
	this.filePopup = new FilePopup(this.container, {
		name : 'fileData',
		uploadUrl : 'fileData/upload',
		toolbar : {
			obj : toolbar,
			btnId : 'btnUpload'
		},
		form : {
			xml : '../erp/xml/file/form.xml',

		},
		getData : function() {

			if (me.form) {

				var dataId = me.dataId;
				if (dataId == undefined)
					dataId = 0;

				me.form.setId(dataId);
				return {
					code : dataId,
					kind : me.kind,
					customerCode : me.customerCode
				}

			}
			else{
				return {
					code : me.dataId,
					kind : me.kind, 
				}
			}

		},
		onUploaded : function(result) {
			me.reload();
		}

	});

	this.filePopup.init();

};

FileGrid.prototype.initSamil = function(container, config) {

	this.enableUpdateTitle = true;

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "../erp/xml/file/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "../erp/xml/file/grid3.xml",
	});

};

FileGrid.prototype.init = function(container, config) {

	this.enableUpdateTitle = true;

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "../erp/xml/file/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "../erp/xml/file/grid.xml",
	});

};


FileGrid.prototype.initOffice = function(container, config) {

	this.enableUpdateTitle = true; 

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "../erp/xml/file/grid.xml",
	});

};

FileGrid.prototype.init2 = function(container, config) {

	this.enableUpdateTitle = true;

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "../erp/xml/file/grid.xml",
	});

};

FileGrid.prototype.init3 = function(container, config) {

	this.enableUpdateTitle = true;

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "../erp/xml/file/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "../erp/xml/file/grid2.xml",
	});

};

FileGrid.prototype.init4 = function(container, config) {

	this.enableUpdateTitle = true;

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "../erp/xml/file/grid2.xml",
	});

};

FileGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
};

FileGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	params.kind = this.kind;
	if (this.dataId)
		params.code = this.dataId;
	if (this.customerCode)
		params.customerCode = this.customerCode;
	
	params.chosunis = this.chosunis;
};

FileGrid.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);
	
	var me = this;

	$(".btnFileInfo").click(function() {
		
		var code = $(this).attr('code');
		console.log(code);
		$.get('fileData/info?code=' + code + '&chosunis=' + me.chosunis, function(data) {
			console.log(data);
			if( data.contentType != 'image/jpeg' ){
				window.location.href = 'fileData/download?code=' + code + '&chosunis=' + me.chosunis;
			}
			else{
				window.open('fileData/image?code=' + code + '&chosunis=' + me.chosunis, "img" + code, "resizable=0,width="+(data.size.width/2)+",height="+(data.size.height/2)+"");
			}
			
		});
	});
};
