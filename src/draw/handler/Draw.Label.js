/**
 * @class L.Draw.Label
 * @aka Draw.Label
 * @inherits L.Draw.Marker
 */
L.Draw.Label = L.Draw.Marker.extend({
	statics: {
		TYPE: "lable",
	},

	options: {
		icon: new L.Icon.Default(),
		repeatMode: false,
		zIndexOffset: 2000, // This should be > than the highest z-index any markers
		forms: {
			id: "divTop",
			btnBold: "btnBold",
			btnItalic: "btnItalic",
			btnOK: "btnOK",
			btnCancel: "btnCancel",
			inputText: "text-val",
			comboboxFont: "font-val",
			inputSize: "size-val",
			inputColor: "color-val",
		},
		dialogFormLabel: null,
	},

	// @method initialize(): void
	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(

		L.Draw.Marker.prototype.initialize.call(this, map, options);

		this.type = L.Draw.Label.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.label.tooltip.start;
	},

	// @method addHooks(): void
	// Add listener hooks to this handler.
	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);

		if (this._map) {
			this._tooltip.updateContent({ text: this._initialLabelText });

			// Same mouseMarker as in Draw.Polyline
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: "leaflet-mouse-label",
					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset,
				});
			}

			this._mouseMarker.on("click", this._onClick, this).addTo(this._map);

			this._map.on("mousemove", this._onMouseMove, this);
			this._map.on("click", this._onTouch, this);
		}
		this._map.on(L.Draw.Event.FINISHDRAWLABEL, this._fireCreatedEvent, this);
	},

	removeHooks: function () {
		L.Draw.Marker.prototype.removeHooks.call(this);
		this._map.off(L.Draw.Event.FINISHDRAWLABEL, this._fireCreatedEvent, this);
	},

	_onClick: function () {
		this._map.fire(L.Draw.Event.STARTDRAWLABEL);
	},

	_onTouch: function (e) {
		// called on click & tap, only really does any thing on tap
		this._onMouseMove(e); // creates & places marker
		this._onClick(); // permanently places marker & ends interaction
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;
		this._tooltip.updatePosition(latlng);
		this._mouseMarker.setLatLng(latlng);
	},

	_fireCreatedEvent: function (options) {
		var label = L.label(this._mouseMarker.getLatLng(), options);
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, label);
	},
});
