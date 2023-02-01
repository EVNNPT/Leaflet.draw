L.Edit = L.Edit || {};

/**
 * @class L.Edit.Label
 * @aka Edit.Label
 */
L.Edit.Label = L.Edit.Marker.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(20, 20),
			className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-move",
		}),
	},

	initialize: function (marker, options) {
		this._marker = marker;
		this._markerGroup = new L.LayerGroup();
		L.Util.setOptions(this, options);
		L.Edit.Marker.prototype.initialize.call(this, marker, options);
	},

	addHooks: function () {
		L.Edit.Marker.prototype.addHooks.call(this);
		this._createRotateMarker();
		this._marker._map.addLayer(this._markerGroup);
	},

	_createRotateMarker: function () {
		this._rotateMarker = this._createMarker(
			this._marker.getLatLng(),
			this.options.moveIcon
		);
	},

	_createMarker: function (latlng, icon) {
		// Extending L.Marker in TouchEvents.js to include touch.
		var marker = new L.Marker.Touch(latlng, {
			draggable: true,
			icon: icon,
			zIndexOffset: 10,
		});

		this._bindMarker(marker);

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_bindMarker: function (marker) {
		marker
			.on("dragstart", this._onMarkerDragStart, this)
			.on("drag", this._onMarkerDrag, this)
			.on("dragend", this._onMarkerDragEnd, this);
		// .on("touchstart", this._onTouchStart, this)
		// .on("touchmove", this._onTouchMove, this)
		// .on("MSPointerMove", this._onTouchMove, this)
		// .on("touchend", this._onTouchEnd, this)
		// .on("MSPointerUp", this._onTouchEnd, this);
	},

	_unbindMarker: function (marker) {
		if (marker === undefined) return;
		marker
			.off("dragstart", this._onMarkerDragStart, this)
			.off("drag", this._onMarkerDrag, this)
			.off("dragend", this._onMarkerDragEnd, this);
	},

	_onMarkerDragStart: function (e) {
		var marker = e.target;
		marker.setOpacity(0);
		this._marker.fire("editstart");
	},

	_onMarkerDrag: function (e) {
		var marker = e.target,
			latlng = marker.getLatLng();

		if (marker === this._rotateMarker) {
			this._rotate(latlng);
		}

		this._marker.fire("editdrag");
	},

	_onMarkerDragEnd: function (e) {
		var marker = e.target;
		marker.setOpacity(1);
		this._fireEdit();
	},

	_fireEdit: function () {
		this._marker.edited = true;
		this._marker.fire("edit");
	},

	_rotate: function (latlng) {
		this._marker.rotate(latlng);
	},
});

L.Label.addInitHook(function () {
	if (L.Edit.Label) {
		this.editing = new L.Edit.Label(this, this.options);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on("add", function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on("remove", function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});
