L.Edit = L.Edit || {};
/**
 * @class L.Edit.CircleMarker
 * @aka Edit.Circle
 * @inherits L.Edit.SimpleShape
 */
L.Edit.Role = L.Edit.SimpleShape.extend({
	_createMoveMarker: function () {
		this._moveMarker = this._createMarker(
			this._shape.getCenterCus(),
			this.options.moveIcon
		);
	},

	_createResizeMarker: function () {
		// To avoid an undefined check in L.Edit.SimpleShape.removeHooks
		const latLngs = this._shape.getLatLngs();
		this._resizeMarkers = [];
		this._resizeMarkers.push(
			this._createMarker(latLngs[0], this.options.resizeIcon)
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
		this._map.fire(L.Draw.Event.EDITROTATE, { layer: this._shape });
	},

	_updateMarkers: function () {
		this._resizeMarkers[0].setLatLng(this._shape.getLatLngs()[0]);
		this._rotateMarker.setLatLng(this._shape.getRotateMarker());
	},
});

L.Role.addInitHook(function () {
	if (this.editing) {
		return;
	}

	if (L.Edit.Role) {
		this.editing = new L.Edit.Role(this);

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
