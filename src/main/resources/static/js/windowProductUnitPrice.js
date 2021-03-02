function ProductUnitPriceWindow(dhxWins) {

	var wnd;
	var layout;
	var unitPriceLayout;
	this.show = function(productId, customer, type, selected) {
		wnd.show();
		wnd.setModal(true);
		unitPriceLayout.load(productId, customer, type, function(id) {
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

		wnd = openWindow(dhxWins, "productUnitPriceWnd", "품목 단가 조회", 800, 400);
		unitPriceLayout = new ProductUnitPriceLayout(wnd);

		close();

		wnd.attachEvent("onClose", function(win) {
			close();
			return false;
		});
	}

}