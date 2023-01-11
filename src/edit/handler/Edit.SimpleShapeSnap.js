L.Edit.SimpleShapeSnap = L.Edit.SimpleShape.extend({
	initialize: function (shape, options) {
		L.Edit.SimpleShape.prototype.initialize.call(this, shape, options);
	},

	addHooks: function () {
		L.Edit.SimpleShape.prototype.addHooks.call(this);
		this._moveMarker.snapediting = new L.Handler.MarkerSnap(
			this._map,
			this._moveMarker
		);
		this.options.guideLayers.forEach((element) => {
			this._moveMarker.snapediting.addGuideLayer(element);
		});
		this._moveMarker.snapediting.enable();
	},

	removeHooks: function () {
		L.Edit.SimpleShape.prototype.removeHooks.call(this);
		this._moveMarker.snapediting.disable();
	},
});
