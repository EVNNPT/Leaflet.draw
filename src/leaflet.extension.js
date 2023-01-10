L.Renderer.include({
	_updateMayBienAp: function (layer) {
		const o1 = layer._xuLy(layer._getLatLngI1(), layer._getRadiusR1());
		const i1 = o1[0];
		const r1x = Math.max(Math.round(o1[1]), 1);
		const r1y = Math.max(Math.round(o1[2]), 1) || r1x;

		const o2 = layer._xuLy(layer._getLatLngI2(), layer._getRadiusR2());
		const i2 = o2[0];
		const r2x = Math.max(Math.round(o2[1]), 1);
		const r2y = Math.max(Math.round(o2[2]), 1) || r2x;

		const arc1 = "a" + r1x + "," + r1y + " 0 1,0 ";

		const arc2 = "a" + r2x + "," + r2y + " 0 1,0 ";

		const pA = layer._xuLy(layer._getLatLngA(), layer._getRadiusR1())[0];
		const pN = layer._xuLy(layer._getLatLngN(), layer._getRadiusR1())[0];
		const pB = layer._xuLy(layer._getLatLngB(), layer._getRadiusR1())[0];

		const arc3 =
			"M" +
			pA.x +
			" " +
			pA.y +
			" Q " +
			pN.x +
			" " +
			pN.y +
			" " +
			pB.x +
			" " +
			pB.y;

		var d = layer._empty()
			? "M0 0"
			: "M" +
			  (i1.x - r1x) +
			  "," +
			  i1.y +
			  arc1 +
			  r1x * 2 +
			  ",0 " +
			  arc1 +
			  -r1y * 2 +
			  ",0 " +
			  "M" +
			  (i2.x - r2x) +
			  "," +
			  i2.y +
			  arc2 +
			  r2x * 2 +
			  ",0 " +
			  arc2 +
			  -r2y * 2 +
			  ",0 " +
			  arc3;

		this._setPath(layer, d);
	},
});

//#region L.MayBienAp
L.MayBienAp = L.Path.extend({
	options: {
		fill: false,
		chieuDai: 150,
		gocXoay: 0,
	},

	initialize: function (latlng, options) {
		L.setOptions(this, options);
		this._latlng = L.latLng(latlng);
	},

	// @method setLatLng(latLng: LatLng): this
	// Sets the position of a circle marker to a new location.
	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		this.redraw();
		return this.fire("move", { latlng: this._latlng });
	},

	// @method getLatLng(): LatLng
	// Returns the current geographical position of the circle marker
	getLatLng: function () {
		return this._latlng;
	},

	_getRadiusR1: function () {
		return (
			(this.options.chieuDai * 4) / (2 + 3 * Math.sin(Math.acos(1 / 3)) * 4)
		);
	},

	_getLatLngI1: function () {
		return L.GeometryUtil.destination(
			this._latlng,
			this.options.gocXoay - 90,
			this._getRadiusR1() / 4
		);
	},

	_getRadiusR2: function () {
		return 0.6 * this._getRadiusR1();
	},

	_getLatLngI2: function () {
		return L.GeometryUtil.destination(
			this._getLatLngC(),
			this.options.gocXoay - 90,
			this._getRadiusR2()
		);
	},

	_getLatLngA: function () {
		return L.GeometryUtil.destination(
			this._latlng,
			this.options.gocXoay - 90,
			this.options.chieuDai / 2
		);
	},

	_getLatLngB: function () {
		return L.GeometryUtil.destination(
			this._getLatLngI1(),
			this.options.gocXoay,
			this._getRadiusR1()
		);
	},

	_getLatLngC: function () {
		return L.GeometryUtil.destination(
			this._latlng,
			this.options.gocXoay + 90,
			this.options.chieuDai / 2
		);
	},

	_getLatLngD: function () {
		return L.GeometryUtil.destination(
			this._getLatLngI1(),
			this.options.gocXoay + 180,
			this._getRadiusR1()
		);
	},

	_getLatLngE: function () {
		return L.GeometryUtil.destination(
			this._getLatLngI2(),
			this.options.gocXoay,
			this._getRadiusR2()
		);
	},

	_getLatLngF: function () {
		return L.GeometryUtil.destination(
			this._getLatLngI2(),
			this.options.gocXoay + 180,
			this._getRadiusR2()
		);
	},

	_getLatLngM: function () {
		const angleAB = L.GeometryUtil.angle(
			this._map,
			this._getLatLngA(),
			this._getLatLngB()
		);
		const d = this._getLatLngA().distanceTo(this._getLatLngB());
		return L.GeometryUtil.destination(this._getLatLngA(), angleAB, d / 2);
	},

	_getLatLngN: function () {
		const pM = this._getLatLngM();
		const pI1 = this._getLatLngI1();
		const angleMB = L.GeometryUtil.angle(this._map, pM, this._getLatLngB());
		const angleMI1 = L.GeometryUtil.angle(this._map, pM, pI1);
		const angleMBMI1 = angleMI1 - angleMB;
		const d = pM.distanceTo(pI1);
		const dI1AB = Math.sin((angleMBMI1 * Math.PI) / 180) * d;
		return L.GeometryUtil.destination(
			this._getLatLngM(),
			angleMB - 90,
			(3 * dI1AB) / 4
		);
	},

	getRotateMarker: function () {
		return L.GeometryUtil.destination(
			this._latlng,
			this.options.gocXoay,
			(3 * this._getRadiusR1()) / 2
		);
	},

	_xuLy: function (latlng, radius) {
		var lng = latlng.lng,
			lat = latlng.lat,
			map = this._map,
			crs = map.options.crs,
			retP,
			retRadiusX,
			retRadiusY;

		if (crs.distance === L.CRS.Earth.distance) {
			var d = Math.PI / 180,
				latR = radius / L.CRS.Earth.R / d,
				top = map.project([lat + latR, lng]),
				bottom = map.project([lat - latR, lng]),
				p = top.add(bottom).divideBy(2),
				lat2 = map.unproject(p).lat,
				lngR =
					Math.acos(
						(Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
							(Math.cos(lat * d) * Math.cos(lat2 * d))
					) / d;

			if (isNaN(lngR) || lngR === 0) {
				lngR = latR / Math.cos((Math.PI / 180) * lat); // Fallback for edge case, #2425
			}

			retP = p.subtract(map.getPixelOrigin());
			retRadiusX = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
			retRadiusY = p.y - top.y;
		} else {
			var latlng2 = crs.unproject(crs.project(latlng).subtract([radius, 0]));

			retP = map.latLngToLayerPoint(latlng);
			retRadiusX = retP.x - map.latLngToLayerPoint(latlng2).x;
			retRadiusY = radius;
		}

		return [retP, retRadiusX, retRadiusY];
	},

	_project: function () {
		this._updateBounds();
	},

	_updateBounds: function () {
		const bounds = this.getBounds();
		this._pxBounds = L.bounds(
			this._map.latLngToLayerPoint(bounds._northEast),
			this._map.latLngToLayerPoint(bounds._southWest)
		);
	},

	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},

	_updatePath: function () {
		this._renderer._updateMayBienAp(this);
	},

	_empty: function () {
		return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
	},

	// Needed by the `Canvas` renderer for interactivity
	_containsPoint: function (p) {
		return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
	},

	// @method getBounds(): LatLngBounds
	// Returns the `LatLngBounds` of the path.
	getBounds: function () {
		const pA = this._getLatLngA();
		const pC = this._getLatLngC();

		return L.latLngBounds(
			L.GeometryUtil.destination(
				pC,
				-this.options.gocXoay,
				this._getRadiusR1()
			),
			L.GeometryUtil.destination(
				pA,
				this.options.gocXoay + 180,
				this._getRadiusR1()
			)
		);
	},

	rotate: function (latlng) {
		const map = this._map;
		const centerPoint = this._latlng;
		const angle = L.GeometryUtil.angle(map, centerPoint, latlng);
		this.options.gocXoay = angle;
		this.redraw();
	},

	resize: function (latlng) {
		const map = this._map;
		const pC = this._getLatLngC();
		const centerPoint = this._latlng;
		const angleMC = L.GeometryUtil.angle(map, centerPoint, pC);
		const angleMCDetal = L.GeometryUtil.angle(map, centerPoint, latlng);
		const angle = Math.abs(angleMCDetal - angleMC);
		const d =
			Math.cos((angle * Math.PI) / 180) * centerPoint.distanceTo(latlng);
		this.options.chieuDai = Math.abs(2 * d);
		this.redraw();
	},

	move: function (latlng) {
		this._latlng = latlng;
		this.redraw();
	},
});

L.mayBienAp = function (latlng, options) {
	return new L.MayBienAp(latlng, options);
};
//#endregion

// Thêm hàm/thuộc tính vào lớp Layer đã tồn tại.
L.Layer.include({
	// Hàm trả về centerPoint của layer
	getCenterCus: function () {
		const pNE = this._map.project(this._bounds._northEast, this._map.getZoom());
		const pSW = this._map.project(this._bounds._southWest, this._map.getZoom());
		return this._map.unproject(
			L.point((pNE.x + pSW.x) / 2, (pNE.y + pSW.y) / 2),
			this._map.getZoom()
		);
	},
});

//#region L.ThanhCai
L.ThanhCai = L.Polyline.extend({
	options: {
		chieuDai: 300,
		gocXoay: 0,
		distanceRotateMarker: 20,
	},
	initialize: function (centerPoint, options) {
		L.setOptions(this, options);
		const latlngs = this._thanhCaiLatLngs(centerPoint);
		L.Polyline.prototype.initialize.call(this, latlngs, options);
	},
	_thanhCaiLatLngs: function (centerPoint) {
		const gocXoayA = this.options.gocXoay;
		const gocXoayB = gocXoayA + 180;
		const diemA = L.GeometryUtil.destination(
			centerPoint,
			gocXoayA,
			this.options.chieuDai / 2
		);
		const diemB = L.GeometryUtil.destination(
			centerPoint,
			gocXoayB,
			this.options.chieuDai / 2
		);
		return [diemA, diemB];
	},
	getRotateMarker: function () {
		const centerPoint = this.getCenterCus();
		return L.GeometryUtil.destination(
			centerPoint,
			this.options.gocXoay - 90,
			this.options.distanceRotateMarker
		);
	},
	rotate: function (latlng) {
		const map = this._map;
		const centerPoint = this.getCenterCus();
		const angle = L.GeometryUtil.angle(map, centerPoint, latlng);
		this.options.gocXoay = angle + 90;
		this.setLatLngs(this._thanhCaiLatLngs(centerPoint));
	},
	resize: function (latlng) {
		const map = this._map;
		const latLngs = this.getLatLngs();
		const centerPoint = this.getCenterCus();
		const pA = latLngs[0];
		const angleMA = L.GeometryUtil.angle(map, centerPoint, pA);
		const angleMADetal = L.GeometryUtil.angle(map, centerPoint, latlng);
		const angle = Math.abs(angleMADetal - angleMA);
		const d =
			Math.cos((angle * Math.PI) / 180) * centerPoint.distanceTo(latlng);
		this.options.chieuDai = Math.abs(2 * d);
		this.setLatLngs(this._thanhCaiLatLngs(centerPoint));
	},
	move: function (latlng) {
		this.setLatLngs(this._thanhCaiLatLngs(latlng));
	},
});

L.thanhCai = function (latlng, map, options) {
	return new L.ThanhCai(latlng, map, options);
};
//#endregion

//#region L.Role
L.Role = L.Polyline.extend({
	options: {
		chieuDai: 50,
		chieuRong: 25,
		gocXoay: 0,
	},
	initialize: function (centerPoint, options) {
		L.setOptions(this, options);
		const latlngs = this._roleLatLngs(centerPoint);
		L.Polyline.prototype.initialize.call(this, latlngs, options);
	},
	_roleLatLngs: function (centerPoint) {
		const gocXoayM = -this.options.gocXoay;
		const gocXoayA = -90 - this.options.gocXoay;
		const gocXoayB = gocXoayA + 180;
		const gocXoayC = 180 + gocXoayM;
		const gocXoayD = 180 + gocXoayM;
		const trungDiemAB = L.GeometryUtil.destination(
			centerPoint,
			-gocXoayM,
			this.options.chieuRong / 2
		);
		const diemA = L.GeometryUtil.destination(
			trungDiemAB,
			-gocXoayA,
			this.options.chieuDai / 2
		);
		const diemB = L.GeometryUtil.destination(
			trungDiemAB,
			-gocXoayB,
			this.options.chieuDai / 2
		);
		const diemC = L.GeometryUtil.destination(
			diemB,
			-gocXoayC,
			this.options.chieuRong
		);
		const diemD = L.GeometryUtil.destination(
			diemA,
			-gocXoayD,
			this.options.chieuRong
		);
		return [diemA, diemB, diemC, diemD, diemA];
	},
	getRotateMarker: function () {
		const centerPoint = this.getCenterCus();
		return L.GeometryUtil.destination(
			centerPoint,
			this.options.gocXoay,
			this.options.chieuRong
		);
	},
	move: function (latlng) {
		this.setLatLngs(this._roleLatLngs(latlng));
	},
	resize: function (latlng) {
		const latLngs = this.getLatLngs();
		const centerPoint = this.getCenterCus();
		const map = this._map;
		const pA = latLngs[0];
		const pB = latLngs[1];
		const pD = latLngs[3];
		const trungDiemAB = L.GeometryUtil.closestOnSegment(
			map,
			centerPoint,
			pA,
			pB
		);
		const trungDiemAD = L.GeometryUtil.closestOnSegment(
			map,
			centerPoint,
			pA,
			pD
		);
		const angleMAB_A = L.GeometryUtil.angle(map, trungDiemAB, pA);
		const angleMAD_A = L.GeometryUtil.angle(map, trungDiemAD, pA);
		const angleMAB_ADetal = L.GeometryUtil.angle(map, trungDiemAB, latlng);
		const angleMAD_ADetal = L.GeometryUtil.angle(map, trungDiemAD, latlng);
		const angleA = Math.abs(angleMAB_ADetal - angleMAB_A);
		const angleB = Math.abs(angleMAD_ADetal - angleMAD_A);
		const dxAB =
			Math.cos((angleA * Math.PI) / 180) * trungDiemAB.distanceTo(latlng);
		const dxAD =
			Math.cos((angleB * Math.PI) / 180) * trungDiemAD.distanceTo(latlng);
		this.options.chieuDai = Math.abs(this.options.chieuDai / 2 + dxAB);
		this.options.chieuRong = Math.abs(this.options.chieuRong / 2 + dxAD);
		this.setLatLngs(this._roleLatLngs(centerPoint));
	},
	rotate: function (latlng) {
		const map = this._map;
		const centerPoint = this.getCenterCus();
		const angle = L.GeometryUtil.angle(map, centerPoint, latlng);
		this.options.gocXoay = angle;
		this.setLatLngs(this._roleLatLngs(centerPoint));
	},
});

L.role = function (latlng, options) {
	return new L.Role(latlng, options);
};
