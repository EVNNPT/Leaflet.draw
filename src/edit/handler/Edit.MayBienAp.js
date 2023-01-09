L.Edit = L.Edit || {};
/**
 * @class L.Edit.CircleMarker
 * @aka Edit.Circle
 * @inherits L.Edit.SimpleShape
 */
L.Edit.MayBienAp = L.Edit.SimpleShape.extend({
	initialize: function (shape, options) {
		L.Edit.SimpleShape.prototype.initialize.call(this, shape, options);
	},

	_createMoveMarker: function () {
		this._moveMarker = this._createMarker(
			this._shape._latlng,
			this.options.moveIcon
		);
	},

	_createResizeMarker: function () {
		// To avoid an undefined check in L.Edit.SimpleShape.removeHooks
		this._resizeMarkers = [];
		this._resizeMarkers.push(
			this._createMarker(this._shape._getLatLngC(), this.options.resizeIcon)
		);
	},

	_createRotateMarker: function () {
		const latLng = this._shape.getRotateMarker();
		this._rotateMarker = this._createMarker(latLng, this.options.moveIcon);
	},

	_move: function (latlng) {
		this._shape.move(latlng);
		this._updateMarkers();
		this._map.fire(L.Draw.Event.EDITMOVE, { layer: this._shape });
	},

	_resize: function (latlng) {
		this._shape.resize(latlng);
		this._updateMarkers();
		this._map.fire(L.Draw.Event.EDITRESIZE, { layer: this._shape });
	},

	_rotate: function (latlng) {
		this._shape.rotate(latlng);
		this._updateMarkers();
	},

	_updateMarkers: function () {
		this._resizeMarkers[0].setLatLng(this._shape._getLatLngC());
		this._rotateMarker.setLatLng(this._shape.getRotateMarker());
	},
});

L.MayBienAp.addInitHook(function () {
	if (this.editing) {
		return;
	}

	if (L.Edit.MayBienAp) {
		this.editing = new L.Edit.MayBienAp(this);

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
