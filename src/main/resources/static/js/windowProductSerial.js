function ProductSerialWindow(dhxWins) {

	var wnd;
	var layout;
	var serialLayout;
	this.show = function(productId, selected) {
		wnd.show();
		wnd.setModal(true);
		serialLayout.load(productId, function(id) {
			close();

			if (selected)
				selected(id);
		});
	};

	init();

	function close() {
		wnd.hide();
		wnd.setModal(false);
	}

	function init() {

		wnd = openWindow(dhxWins, "productSerialWnd", "품목 시리얼 조회", 800, 400);
		serialLayout = new ProductSerialLayout(wnd);

		close();

		wnd.attachEvent("onClose", function(win) {
			close();
			return false;
		});
	}

}