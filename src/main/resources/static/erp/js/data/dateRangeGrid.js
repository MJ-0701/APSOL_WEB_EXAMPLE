function DateRangeGrid(config) {
    DataGrid.call(this, config);

    this.calendar;
    this.enableDateRange = true;
    this.dateRange = 30;

}
DateRangeGrid.prototype = new DataGrid();
DateRangeGrid.prototype.constructor = DateRangeGrid;

DateRangeGrid.prototype.setEnableDateRange = function(enable) {
    this.enableDateRange = enable;
}

DateRangeGrid.prototype.onInitedToolbar = function(toolbar) {
    DataGrid.prototype.onInitedToolbar.call(this, toolbar);

    if (this.enableDateRange) {
        var me = this;

        this.calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(
                from, to) {
            // 달력내용이 변하면 호출
            me.reload();
        });

        // this.calendar.setLastDay(this.dateRange);
        this.calendar.setThisMonth();

        setupDateRangeBtns(toolbar, this.calendar);
    }

};

DateRangeGrid.prototype.onInitedGrid = function(grid) {
    DataGrid.prototype.onInitedGrid.call(this, grid);

    if (this.enableDateRange) {
        this.reload();
    }
};

DateRangeGrid.prototype.getRange = function() {
    var range = null;
    if (this.calendar)
        range = this.calendar.getRange();
    else {
        range = getRange(this.dateRange);
        // range = getRangeThisMonth();
    }

    var data = {};

    data.from = range.from;
    data.to = range.to;

    return data;
};
DateRangeGrid.prototype.toExcel = function() {

    var params = this.getParams();
    console.log(params)

    var sdt = new Date(params.from);
    var edt = new Date(params.to);
    var dateDiff = Math.ceil((edt.getTime() - sdt.getTime())
            / (1000 * 3600 * 24));

    if (dateDiff > 31) {
        dhtmlx.alert({
            title : "엑셀을 출력할 수 없습니다.",
            type : "alert-error",
            text : "최대 31일간의 자료만 출력할 수 있습니다."
        });
        return;
    }

    var queryString = '';
    for (key in params) {
        queryString += (queryString.indexOf('?') > -1 ? '&' : '?') + key + '='
                + encodeURIComponent(params[key]);
    }

    queryString += "&title=" + encodeURIComponent(this.excelTitle);

    console.log(queryString);

    this.grid.toExcel('xml2Excel/generate' + queryString);

    DataGrid.prototype.toExcel.call(this);

}

DateRangeGrid.prototype.onBeforeParams = function(param) {
    if (this.enableDateRange) {

        var range = null;
        if (this.calendar)
            range = this.calendar.getRange();
        else {
            // range = getRange(this.dateRange);
            range = getRangeThisMonth();
        }

        param.from = range.from;
        param.to = range.to;

    }
};