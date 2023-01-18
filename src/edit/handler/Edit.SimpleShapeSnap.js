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
		if (this.options.guideLayers) {
			for (var i = 0; i < this.options.guideLayers.length; i++) {
				this._moveMarker.snapediting.addGuideLayer(this.options.guideLayers[i]);
			}
		}
		this._moveMarker.snapediting.enable();
	},

	removeHooks: function () {
		L.Edit.SimpleShape.prototype.removeHooks.call(this);
		this._moveMarker.snapediting.disable();
	},
});
