function VanChartDialog() {

	var wnd;
	var id;
	var chart;

	var lineData = {
		labels : [ "10월", "9월", "8월", "7월", "6월", "5월", "4월" ],
		datasets : [

		{
			lineTension : 0,
			label : "총합",
			backgroundColor : 'rgba(220,220,220,0.5)',
			borderColor : "rgba(220,220,220,0.7)",
			pointBorderWidth : 1,
			pointBackgroundColor : "rgba(220,220,220,1)",
			pointRadius : 3,
			pointBorderColor : '#ffffff',
			borderWidth : 1,
			data : [ 5961, 5747, 5961, 5861, 5761, 5811, 5661 ]
		}, {
			label : "KSNET",
			backgroundColor : 'rgba(98,203,49, 0.5)',
			pointBorderWidth : 1,
			pointBackgroundColor : "rgba(98,203,49,1)",
			pointRadius : 3,
			pointBorderColor : '#ffffff',
			borderWidth : 1,
			lineTension : 0,
			data : [ 3961, 3747, 3961, 3861, 3761, 3811, 3661 ]
		}, {
			label : "KCP",
			backgroundColor : 'rgba(120,120,180,0.5)',
			borderColor : "rgba(120,120,180,0.7)",
			pointBorderWidth : 1,
			pointBackgroundColor : "rgba(120,120,180,1)",
			pointRadius : 3,
			pointBorderColor : '#ffffff',
			borderWidth : 1,
			lineTension : 0,
			data : [ 3200, 2400, 1700, 2300, 4600, 2500, 1700 ]
		} ]
	};

	var lineOptions = {
		responsive : true
	};

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

		wnd = openWindow('vanChartDlg', 'VAN사별 실적', 550, 310);

		if (chart) {
			
			
			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {			
			chart = null;
			wnd = null;
			return true;
		});

		wnd.attachEvent("onMoveFinish", function(win) {
			console.log(wnd.getPosition());
		});
		
		wnd.attachEvent("onResizeFinish", function(win){
			console.log(wnd.getDimension());
		});
		
		initChart();
	};

	this.load = function(id) {
	};
	
	function initChart(){
	
		wnd.attachHTMLString('<canvas id="canvasVan"></canvas>');		
		var ctx = document.getElementById("canvasVan").getContext("2d");
		chart = new Chart(ctx, {
			type : 'line',
			data : lineData,
			options : lineOptions
		});
		
	}
}