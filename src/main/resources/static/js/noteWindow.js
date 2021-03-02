function NoteWindow(dhxWins, config) {

	var wnd;
	var layout;
	var note;
	
	this.show = function(){
		wnd.setModal(true);
		wnd.show();
		
	};
	
	this.hide = function(){
		wnd.hide();
	};
	
	this.getWindow = function(){
		return wnd;
	}
	
	this.close = function(){
		_close();
	};

	init();

	function _close() {
		wnd.hide();
		wnd.setModal(false);
	}

	function init() {
		
		if( !config.width )
			config.width = 950;
		
		if( !config.height )
			config.height = 650;

		wnd = openWindow(dhxWins, config.name, config.title, config.width, config.height);
		_close();

		wnd.attachEvent("onClose", function(win) {
			_close();
			return false;
		});
	}
	
	

}