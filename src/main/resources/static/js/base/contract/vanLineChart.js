function VanLineChart(container, config) {


	this.init = function(){
		var chart = container.attachChart(config);
		chart.load("xml/base/contract/vanTestChart.xml");
		
		chart.addSeries({
			value : "#sales1#",
			label : "NICE",
			tooltip:{
				template:"#sales1#"
			}
		});
		
	}
}