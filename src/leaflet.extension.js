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

L.Layer.include({
	_processAngle: function (angle) {
		var ret = 0;
		if (angle >= 0 && angle <= 90) {
			ret = 0;
		} else if (angle > 90 && angle <= 180) {
			ret = 90;
		} else if (angle > 180 && angle <= 270) {
			ret = 180;
		} else {
			ret = 270;
		}
		return ret;
	},
});

//#region L.DuongDay
L.DuongDay = L.Polyline.extend({
	initialize: function (latlngs, options) {
		L.Polyline.prototype.initialize.call(this, latlngs, options);
	},
});

L.duongDay = function (latlngs, options) {
	return new L.DuongDay(latlngs, options);
};
//#endregion

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

	getLayerSnap: function () {
		return L.layerGroup([
			L.circleMarker(this._getLatLngA(), { opacity: 0, weight: 0.5 }),
			L.circleMarker(this._getLatLngB(), { opacity: 0, weight: 0.5 }),
			L.circleMarker(this._getLatLngC(), { opacity: 0, weight: 0.5 }),
			L.circleMarker(this._getLatLngD(), { opacity: 0, weight: 0.5 }),
			L.circleMarker(this._getLatLngE(), { opacity: 0, weight: 0.5 }),
			L.circleMarker(this._getLatLngF(), { opacity: 0, weight: 0.5 }),
		]);
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
	getLayerSnap: function () {
		return L.polyline(this.getLatLngs(), { opacity: 0 });
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
		this._centerPoint = centerPoint;
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
	getLayerSnap: function () {
		const latlngs = this.getLatLngs();
		const pA = latlngs[0];
		const pB = latlngs[1];
		const pMAD = L.GeometryUtil.destination(
			pA,
			this.options.gocXoay + 180,
			this.options.chieuRong / 2
		);
		const pMBC = L.GeometryUtil.destination(
			pB,
			this.options.gocXoay + 180,
			this.options.chieuRong / 2
		);
		return L.layerGroup([
			L.circleMarker(pMAD, { opacity: 0, weight: 0.5 }),
			L.circleMarker(pMBC, { opacity: 0, weight: 0.5 }),
		]);
	},
	getCenter: function () {
		return this._centerPoint;
	},
});

L.role = function (latlng, options) {
	return new L.Role(latlng, options);
};
//#endregion

//#region Draw GuidLayer

L.GuideLayer = L.Class.extend({
	options: {
		width: 10,
		height: 10,
	},
	initialize: function (map, options) {
		L.setOptions(this, options);
		this._map = map;
		this._gocO = L.latLng(0, 0);
		this._lineX = this._getLineX();
		this._lineY = this._getLineY();
		this._drawGuidLayer();
		this._map.on(
			"move",
			function () {
				this.options.layer.clearLayers();
				const zoom = this._map.getZoom();
				if (zoom >= this.options.zoom) {
					this._drawGuidLayer();
				}
			},
			this
		);
	},
	_drawGuidLayer: function () {
		var ret = [];
		var tpms = this._getLatLngs(
			this._getLatLngO(),
			L.GeometryUtil.closestOnSegment(
				this._map,
				this._getLatLngO(),
				this._getLatLngA(),
				this._getLatLngD()
			),
			this.options.width
		);
		tpms = tpms.concat(
			this._getLatLngs(
				this._getLatLngO(),
				L.GeometryUtil.closestOnSegment(
					this._map,
					this._getLatLngO(),
					this._getLatLngB(),
					this._getLatLngC()
				),
				this.options.width
			)
		);
		tpms.push(this._getLatLngO());
		tpms.forEach((element) => {
			const dAB = L.GeometryUtil.closestOnSegment(
				this._map,
				element,
				this._getLatLngA(),
				this._getLatLngB()
			);
			ret = ret.concat(this._getLatLngs(element, dAB, this.options.height));

			const dCD = L.GeometryUtil.closestOnSegment(
				this._map,
				element,
				this._getLatLngC(),
				this._getLatLngD()
			);
			ret = ret.concat(this._getLatLngs(element, dCD, this.options.height));

			ret.push(element);
		});
		ret.forEach((e) => {
			this.options.layer.addLayer(
				L.circleMarker(e, {
					radius: 0.5,
					color: "black",
					fill: false,
					weight: 1,
					bubblingMouseEvents: false,
				})
			);
		});
	},
	_getLatLngs: function (latlngA, latlngB, distance) {
		var ret = [];
		const n = this._getNumberLatLng(latlngA, latlngB, distance);
		var angle = L.GeometryUtil.angle(this._map, latlngA, latlngB);
		for (var i = 1; i <= n; i++) {
			ret.push(L.GeometryUtil.destination(latlngA, angle, i * distance));
		}
		return ret;
	},
	_getNumberLatLng: function (latlngA, latlngB, distance) {
		return Math.floor(latlngA.distanceTo(latlngB) / distance);
	},
	_getLineX: function () {
		return L.polyline([L.latLng(0, -180), L.latLng(0, 180)]);
	},
	_getLineY: function () {
		return L.polyline([L.latLng(90, 0), L.latLng(-90, 0)]);
	},
	_getGocPhanTu: function () {
		const angle = L.GeometryUtil.angle(
			this._map,
			this._gocO,
			this._map.getCenter()
		);
		var ret = 1;
		if (angle >= 0 && angle <= 90) {
			ret = 1;
		} else if (angle > 90 && angle <= 180) {
			ret = 2;
		} else if (angle > 180 && angle <= 270) {
			ret = 3;
		} else {
			ret = 4;
		}
		return ret;
	},
	_getDistaceCenterToLineX() {
		const latlngs = this._lineX.getLatLngs();
		return L.GeometryUtil.closestOnSegment(
			this._map,
			this._map.getCenter(),
			latlngs[0],
			latlngs[1]
		).distanceTo(this._map.getCenter());
	},
	_getDistaceCenterToLineY() {
		const latlngs = this._lineY.getLatLngs();
		return L.GeometryUtil.closestOnSegment(
			this._map,
			this._map.getCenter(),
			latlngs[0],
			latlngs[1]
		).distanceTo(this._map.getCenter());
	},
	_getLatLngO: function () {
		const gocPhanTu = this._getGocPhanTu();
		const dY = this._getDistaceCenterToLineY();
		const dX = this._getDistaceCenterToLineX();
		const center = this._map.getCenter();
		var rY = dY % this.options.width;
		var rX = dX % this.options.height;
		if (rY !== 0 || rX !== 0) {
			if (gocPhanTu === 1) {
				return L.GeometryUtil.destination(
					L.GeometryUtil.destination(center, 180, rX),
					-90,
					rY
				);
			} else if (gocPhanTu === 2) {
				return L.GeometryUtil.destination(
					L.GeometryUtil.destination(center, 0, rX),
					-90,
					rY
				);
			} else if (gocPhanTu === 3) {
				return L.GeometryUtil.destination(
					L.GeometryUtil.destination(center, 0, rX),
					90,
					rY
				);
			} else {
				return L.GeometryUtil.destination(
					L.GeometryUtil.destination(center, 180, rX),
					90,
					rY
				);
			}
		}
		return center;
	},
	_getDistanceToAB: function (latlng) {
		return L.GeometryUtil.closestOnSegment(
			this._map,
			latlng,
			this._getLatLngA(),
			this._getLatLngB()
		).distanceTo(latlng);
	},
	_getDistanceToBC: function (latlng) {
		return L.GeometryUtil.closestOnSegment(
			this._map,
			latlng,
			this._getLatLngB(),
			this._getLatLngC()
		).distanceTo(latlng);
	},
	_getDistanceToCD: function (latlng) {
		return L.GeometryUtil.closestOnSegment(
			this._map,
			latlng,
			this._getLatLngC(),
			this._getLatLngD()
		).distanceTo(latlng);
	},
	_getDistanceToDA: function (latlng) {
		return L.GeometryUtil.closestOnSegment(
			this._map,
			latlng,
			this._getLatLngD(),
			this._getLatLngA()
		).distanceTo(latlng);
	},
	_getLatLngA: function () {
		return this._map.getBounds().getNorthWest();
	},
	_getLatLngB: function () {
		return this._map.getBounds().getNorthEast();
	},
	_getLatLngC: function () {
		return this._map.getBounds().getSouthEast();
	},
	_getLatLngD: function () {
		return this._map.getBounds().getSouthWest();
	},
});

L.guideLayer = function (map, options) {
	return new L.GuideLayer(map, options);
};

//#endregion
