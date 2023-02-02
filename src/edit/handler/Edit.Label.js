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
		dialogFormLabel: null,
	},

	initialize: function (marker, options) {
		this._marker = marker;
		L.Util.setOptions(this, options);
		L.Edit.Marker.prototype.initialize.call(this, marker, options);
	},

	addHooks: function () {
		L.Edit.Marker.prototype.addHooks.call(this);
		this._createRotateMarker();
		this._bindMarker(this._rotateMarker);
		this._bindMarker(this._marker);
		this._marker._map.addLayer(this._markerGroup);

		this._marker._map.on(L.Draw.Event.FORMLABELCONFIRM, this._confirm, this);
		this._marker._map.on(L.Draw.Event.FORMLABELCANCEL, this._cancel, this);
	},

	removeHooks: function () {
		L.Edit.Marker.prototype.removeHooks.call(this);
		this._unbindMarker(this._rotateMarker);
		this._unbindMarker(this._marker);
		this._marker._map.removeLayer(this._markerGroup);
		delete this._markerGroup;

		this._marker._map.off(L.Draw.Event.FORMLABELCONFIRM, this._confirm, this);
		this._marker._map.off(L.Draw.Event.FORMLABELCANCEL, this._cancel, this);
	},

	_cancel: function (e) {
		this.options.dialogFormLabel.hideDialog();
	},

	_confirm: function (e) {
		L.setOptions(this._marker, e);
		this._marker.updateImage();
		this.options.dialogFormLabel.hideDialog();
	},

	_createRotateMarker: function () {
		this._rotateMarker = this._createMarker(
			this._marker.getRotateMarker(),
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

		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}
		this._markerGroup.addLayer(marker);

		return marker;
	},

	_bindMarker: function (marker) {
		marker
			.on("click", this._onClick, this)
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
			.off("click", this._onClick, this)
			.off("dragstart", this._onMarkerDragStart, this)
			.off("drag", this._onMarkerDrag, this)
			.off("dragend", this._onMarkerDragEnd, this);
	},

	_onClick: function (e) {
		this.options.dialogFormLabel.setValue(this._marker.options);
		this.options.dialogFormLabel.showDialog();
	},

	_onMarkerDragStart: function (e) {
		var marker = e.target;
		if (marker !== this._marker) {
			marker.setOpacity(0);
		}
		this._marker.fire("editstart");
	},

	_onMarkerDrag: function (e) {
		var marker = e.target,
			latlng = marker.getLatLng();

		if (marker === this._rotateMarker) {
			this._rotate(latlng);
		} else if (marker === this._marker) {
			this._rotateMarker.setLatLng(this._marker.getRotateMarker());
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
		this._rotateMarker.setLatLng(this._marker.getRotateMarker());
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
