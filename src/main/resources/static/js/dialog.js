var dhxWins;

function Dialog(config) {

	var wnd;
	var layout;
	var note;
	
	this.cells = function(id){
		return layout.cells(id);
	};

	this.init = function() {

		if (!config.width)
			config.width = 950;

		if (!config.height)
			config.height = 650;
		
		wnd = openWindow(config.name, config.title, config.width, config.height);
		wnd.denyResize();
		layout = wnd.attachLayout(config.layout);
		
		if( config.callback.onCreated )
			config.callback.onCreated(layout, wnd);
		
		_close();

		wnd.attachEvent("onClose", function(win) {
			_close();
			return false;
		});
		
		wnd.attachEvent("onShow", function(win){
			if( config.callback.onShow )
				config.callback.onShow(config.name, config.title);
		});
	};

	this.show = function() {
		wnd.setModal(true);
		wnd.show();

	};

	this.hide = function() {
		wnd.hide();
	};

	this.getWindow = function() {
		return wnd;
	};

	this.close = function() {
		_close();
	};

	function _close() {
		wnd.hide();
		wnd.setModal(false);
		if( config.callback.onClosed )
			config.callback.onClosed(config.name, config.title);
	}

}