function CmsInfoDialog() {

	var wnd;
	var inited = false;
	
	this.move = function(x, y) {
		if (wnd)
			wnd.setPosition(x, y);
	}
	
	this.size = function(w, h) {
		if( wnd )
		wnd.setDimension(w, h);
	};

	this.clear = function() {

	};

	this.close = function() {
		wnd.close();
	};

	this.init = function() {
	};

	this.open = function(id, moveCenter) {

		wnd = openWindow('cmsInfoDlg', 'CMS 실적', 550, 310);

		if (inited) {					
			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
			wnd = null;
			inited = false;
			return true;
		});

		wnd.attachEvent("onMoveFinish", function(win) {
			console.log(wnd.getPosition());
		});
		
		wnd.attachEvent("onResizeFinish", function(win){
			console.log(wnd.getDimension());
		});
		
		inited = true;
		initInfo();
	};

	this.load = function(id) {
	};
	
	function initInfo(){	
		wnd.appendObject("cms");	
				
	}
}