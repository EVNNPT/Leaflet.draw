/**
 * @class L.Draw.DuongDay
 * @aka Draw.DuongDay
 * @inherits L.Draw.Feature
 */
L.Draw.DuongDay = L.Draw.Polyline.extend({
	statics: {
		TYPE: "duongDay",
	},
	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);
		this.type = L.Draw.DuongDay.TYPE;
	},
	_fireCreatedEvent: function () {
		var poly = L.duongDay(this._poly.getLatLngs(), this.options);
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, poly);
	},
});
