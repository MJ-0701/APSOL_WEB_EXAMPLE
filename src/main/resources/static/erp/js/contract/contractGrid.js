function ContractGrid() {
	DateRangeGrid.call(this);

	// this.setRecordUrl('contract/records');
	this.setUrlPrefix('contract');

	this.dateRange = 30;

	/*
	 * this.setSelectFilterData('stateName', ['정상', '종결']); this.setSelectFilterData('kindName', ['가맹점', '매입처', '매출처', '기타']);
	 */

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	this.customerCode = null;

}
ContractGrid.prototype = Object.create(DateRangeGrid.prototype);
ContractGrid.prototype.constructor = ContractGrid;

ContractGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/contract/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/contract/grid.xml",
	});

};

ContractGrid.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	grid.kidsXmlFile = this.recordUrl + "?xml=" + this.xmlUrl;

	var me = this;
	grid.attachEvent("onKeyPress", function(code, ctrl, shift) {

		if (code == 67 && ctrl) {

			$('#clipBoardInp').val(me.getData('businessNumber'));
			$('#clipBoardInp').select();

			try {
				var successful = document.execCommand('copy');
			} catch (err) {
				alert('이 브라우저는 지원하지 않습니다.')
			}
		}
		return true;
	});

	if (this.customerCode)
		// 즉시 로딩
		this.loadRecords();
};

ContractGrid.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

ContractGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

};

ContractGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

};

dhtmlXGridObject.prototype.toPDF = function(g, r, w, u, n, D) {
	var h = {
		row : (this.getSelectedRowId() || "").split(this.delim),
		col : this.getSelectedCellIndex()
	};
	if (h.row === null || h.col === -1) {
		h = false
	} else {
		if (h.row) {
			for (var x = 0; x < h.row.length; x++) {
				if (h.row[x]) {
					var c = this.cells(h.row[x], h.col).cell;
					c.parentNode.className = c.parentNode.className.replace(" rowselected", "");
					c.className = c.className.replace(" cellselected", "");
					h.row[x] = c
				}
			}
		} else {
			h = false
		}
	}
	r = r || "color";
	var y = r == "full_color";
	var a = this;
	a._asCDATA = true;
	if (typeof (D) === "undefined") {
		this.target = ' target="_blank"'
	} else {
		this.target = D
	}
	eXcell_ch.prototype.getContent = function() {
		return this.getValue()
	};
	eXcell_ra.prototype.getContent = function() {
		return this.getValue()
	};
	function C(H) {
		var N = [];
		for (var L = 1; L < a.hdr.rows.length; L++) {
			N[L] = [];
			for (var K = 0; K < a._cCount; K++) {
				var P = a.hdr.rows[L].childNodes[K];
				if (!N[L][K]) {
					N[L][K] = [ 0, 0 ]
				}
				if (P) {
					N[L][P._cellIndexS] = [ P.colSpan, P.rowSpan ]
				}
			}
		}
		var M = "<rows profile='" + H + "'";
		if (w) {
			M += " header='" + w + "'"
		}
		if (u) {
			M += " footer='" + u + "'"
		}
		M += "><head>" + a._serialiseExportConfig(N).replace(/^<head/, "<columns").replace(/head>$/, "columns>");
		for (var L = 2; L < a.hdr.rows.length; L++) {
			var E = 0;
			var T = a.hdr.rows[L];
			var O = "";
			for (var K = 0; K < a._cCount; K++) {
				if ((a._srClmn && !a._srClmn[K]) || (a._hrrar[K] && (!a._fake || K >= a._fake.hdrLabels.length))) {
					E++;
					continue
				}
				var S = N[L][K];
				var Q = ((S[0] && S[0] > 1) ? ' colspan="' + S[0] + '" ' : "");
				if (S[1] && S[1] > 1) {
					Q += ' rowspan="' + S[1] + '" ';
					E = -1
				}
				var F = "";
				var J = T;
				if (a._fake && K < a._fake._cCount) {
					J = a._fake.hdr.rows[L]
				}
				for (var I = 0; I < J.cells.length; I++) {
					if (J.cells[I]._cellIndexS == K) {
						if (J.cells[I].getElementsByTagName("SELECT").length) {
							F = ""
						} else {
							F = _isIE ? J.cells[I].innerText : J.cells[I].textContent
						}
						F = F.replace(/[ \n\r\t\xA0]+/, " ");
						break
					}
				}
				if (!F || F == " ") {
					E++
				}
				O += "<column" + Q + "><![CDATA[" + F + "]]></column>"
			}
			if (E != a._cCount) {
				M += "\n<columns>" + O + "</columns>"
			}
		}
		M += "</head>\n";
		M += o();
		return M
	}
	function e() {
		var E = [];
		/*if (n) {
			for (var F = 0; F < n.length; F++) {
				E.push(v(a.getRowIndex(n[F])))
			}
		} else {
			for (var F = 0; F < a.getRowsNum(); F++) {
				E.push(v(F))
			}
		}*/
		return E.join("\n")
	}
	function o() {
		var H = [ "<foot>" ];
		if (!a.ftr) {
			return ""
		}
		for (var I = 1; I < a.ftr.rows.length; I++) {
			H.push("<columns>");
			var L = a.ftr.rows[I];
			for (var F = 0; F < a._cCount; F++) {
				if (a._srClmn && !a._srClmn[F]) {
					continue
				}
				if (a._hrrar[F] && (!a._fake || F >= a._fake.hdrLabels.length)) {
					continue
				}
				for (var E = 0; E < L.cells.length; E++) {
					var K = "";
					var J = "";
					if (L.cells[E]._cellIndexS == F) {
						K = _isIE ? L.cells[E].innerText : L.cells[E].textContent;
						K = K.replace(/[ \n\r\t\xA0]+/, " ");
						if (L.cells[E].colSpan && L.cells[E].colSpan != 1) {
							J = " colspan='" + L.cells[E].colSpan + "' "
						}
						if (L.cells[E].rowSpan && L.cells[E].rowSpan != 1) {
							J = " rowspan='" + L.cells[E].rowSpan + "' "
						}
						break
					}
				}
				H.push("<column" + J + "><![CDATA[" + K + "]]></column>")
			}
			H.push("</columns>")
		}
		H.push("</foot>");
		return H.join("\n")
	}
	function m(F, E) {
		return (window.getComputedStyle ? (window.getComputedStyle(F, null)[E]) : (F.currentStyle ? F.currentStyle[E] : null)) || ""
	}
	function v(I) {
		if (!a.rowsBuffer[I]) {
			return ""
		}
		var E = a.render_row(I);
		if (E.style.display == "none") {
			return ""
		}
		var F = a.isTreeGrid() ? ' level="' + a.getLevel(E.idd) + '"' : "";
		var M = "<row" + F + ">";
		for (var K = 0; K < a._cCount; K++) {
			if (((!a._srClmn) || (a._srClmn[K])) && (!a._hrrar[K] || (a._fake && K < a._fake.hdrLabels.length))) {
				var Q = a.cells(E.idd, K);
				if (y) {
					var J = m(Q.cell, "color");
					var P = m(Q.cell, "backgroundColor");
					var O = m(Q.cell, "font-weight") || m(Q.cell, "fontWeight");
					var L = m(Q.cell, "font-style") || m(Q.cell, "fontStyle");
					var N = m(Q.cell, "text-align") || m(Q.cell, "textAlign");
					var H = m(Q.cell, "font-family") || m(Q.cell, "fontFamily");
					if (P == "transparent" || P == "rgba(0, 0, 0, 0)") {
						P = "rgb(255,255,255)"
					}
					M += "<cell bgColor='" + P + "' textColor='" + J + "' bold='" + O + "' italic='" + L + "' align='" + N + "' font='" + H + "'>"
				} else {
					M += "<cell>"
				}
				M += "<![CDATA[" + (Q.getContent ? Q.getContent() : Q.getTitle()) + "]]></cell>"
			}
		}
		return M + "</row>"
	}
	function s() {
		var E = "</rows>";
		return E
	}
	var A = document.createElement("div");
	A.style.display = "none";
	document.body.appendChild(A);
	var l = "form_" + a.uid();
	A.innerHTML = '<form id="' + l + '" method="post" action="' + g + '" accept-charset="utf-8"  enctype="application/x-www-form-urlencoded"' + this.target + '><input type="hidden" name="grid_xml" id="grid_xml"/> </form>';
	document.getElementById(l).firstChild.value = encodeURIComponent(C(r).replace("\u2013", "-") + e() + s());
	document.getElementById(l).submit();
	A.parentNode.removeChild(A);
	a = null;
	if (h && h.row.length) {
		for (var x = 0; x < h.row.length; x++) {
			h.row[x].parentNode.className += " rowselected";
			if (h.row.length == 1) {
				h.row[x].className += " cellselected"
			}
		}
	}
	h = null
};
dhtmlXGridObject.prototype._serialiseExportConfig = function(l) {
	function h(r) {
		if (typeof (r) !== "string") {
			return r
		}
		r = r.replace(/&/g, "&amp;");
		r = r.replace(/"/g, "&quot;");
		r = r.replace(/'/g, "&apos;");
		r = r.replace(/</g, "&lt;");
		r = r.replace(/>/g, "&gt;");
		return r
	}
	var c = "<head>";
	for (var e = 0; e < this.hdr.rows[0].cells.length; e++) {
		if (this._srClmn && !this._srClmn[e]) {
			continue
		}
		if (this._hrrar[e] && (!this._fake || e >= this._fake.hdrLabels.length)) {
			continue
		}
		var g = this.fldSort[e];
		if (g == "cus") {
			g = this._customSorts[e].toString();
			g = g.replace(/function[\ ]*/, "").replace(/\([^\f]*/, "")
		}
		var o = l[1][e];
		var m = ((o[1] && o[1] > 1) ? ' rowspan="' + o[1] + '" ' : "") + ((o[0] && o[0] > 1) ? ' colspan="' + o[0] + '" ' : "");
		c += "<column " + m + " width='" + this.getColWidth(e) + "' align='" + this.cellAlign[e] + "' type='" + this.cellType[e] + "' hidden='" + ((this.isColumnHidden && this.isColumnHidden(e)) ? "true" : "false") + "' sort='" + (g || "na") + "' color='" + (this.columnColor[e] || "") + "'" + (this.columnIds[e] ? (" id='" + this.columnIds[e] + "'") : "") + ">";
		if (this._asCDATA) {
			c += "<![CDATA[" + this.getColumnLabel(e) + "]]>"
		} else {
			c += this.getColumnLabel(e)
		}
		var n = this.combos[e] ? this.getCombo(e) : null;
		if (n) {
			for (var a = 0; a < n.keys.length; a++) {
				c += "<option value='" + h(n.keys[a]) + "'><![CDATA[" + n.values[a] + "]]></option>"
			}
		}
		c += "</column>"
	}
	return c += "</head>"
};

if (window.eXcell_sub_row_grid) {
	window.eXcell_sub_row_grid.prototype.getContent = function() {
		return ""
	}
}