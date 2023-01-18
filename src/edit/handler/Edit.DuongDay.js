L.Edit = L.Edit || {};

/**
 * @class L.Edit.DuongDay
 * @aka L.Edit.Poly
 * @aka Edit.Poly
 */
L.Edit.DuongDay = L.Edit.Poly.extend({
	initialize: function (poly, options) {
		L.Edit.Poly.prototype.initialize.call(this, poly, options);
		L.Util.setOptions(this, options);
	},
	addHooks: function () {
		L.Edit.Poly.prototype.addHooks.call(this);
		this._poly.snapediting = new L.Handler.PolylineSnap(
			this._poly._map,
			this._poly,
			this._poly.options
		);
		if (this.options.guideLayers) {
			for (var i = 0; i < this.options.guideLayers.length; i++) {
				this._poly.snapediting.addGuideLayer(this.options.guideLayers[i]);
			}
		}
		this._poly.snapediting.enable();
	},
	removeHooks: function () {
		L.Edit.Poly.prototype.removeHooks.call(this);
		this._poly.snapediting.disable();
	},
});

L.DuongDay.addInitHook(function () {
	// Check to see if handler has already been initialized. This is to support versions of Leaflet that still have L.Handler.PolyEdit
	if (this.editing) {
		return;
	}

	if (L.Edit.DuongDay) {
		this.editing = new L.Edit.DuongDay(this, this.options);

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
