/**
 * @class L.Draw.MayBienAp
 * @aka Draw.MayBienAp
 * @inherits L.Draw.Feature
 */
L.Draw.MayBienAp = L.Draw.Feature.extend({
	statics: {
		TYPE: "mayBienAp",
	},

	options: {
		icon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: "leaflet-div-icon leaflet-editing-icon",
		}),
		touchIcon: new L.DivIcon({
			iconSize: new L.Point(20, 20),
			className: "leaflet-div-icon leaflet-editing-icon leaflet-touch-icon",
		}),
		repeatMode: false,
		zIndexOffset: 2000, // This should be > than the highest z-index any markers
	},

	// @method initialize(): void
	initialize: function (map, options) {
		// if touch, switch to touch icon
		if (L.Browser.touch) {
			this.options.icon = this.options.touchIcon;
		}
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.MayBienAp.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.mayBienAp.tooltip.start;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
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
						className: "leaflet-mouse-marker",
						iconAnchor: [20, 20],
						iconSize: [40, 40],
					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset,
				});
			}

			this._mouseMarker.on("click", this._onClick, this).addTo(this._map);

			this._map.on("mousemove", this._onMouseMove, this);
			this._map.on("click", this._onTouch, this);
		}
	},

	// @method removeHooks(): void
	// Remove listener hooks from this handler.
	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);

		if (this._map) {
			this._map
				.off("click", this._onClick, this)
				.off("click", this._onTouch, this);
			if (this._marker) {
				this._marker.off("click", this._onClick, this);
				this._map.removeLayer(this._marker);
				delete this._marker;
			}

			this._mouseMarker.off("click", this._onClick, this);
			this._map.removeLayer(this._mouseMarker);
			delete this._mouseMarker;

			this._map.off("mousemove", this._onMouseMove, this);
		}
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		this._mouseMarker.setLatLng(latlng);

		if (!this._marker) {
			this._marker = this._createMayBienAp(latlng);
			// Bind to both marker and map to make sure we get the click event.
			this._marker.on("click", this._onClick, this);
			this._map.on("click", this._onClick, this).addLayer(this._marker);
		} else {
			latlng = this._mouseMarker.getLatLng();
			this._map.removeLayer(this._marker);
			this._marker = this._createMayBienAp(latlng);
			this._map.addLayer(this._marker);
		}
	},

	_createMayBienAp: function (latlng) {
		return L.mayBienAp(latlng, this.options);
	},

	_onClick: function () {
		this._fireCreatedEvent();

		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	},

	_onTouch: function (e) {
		// called on click & tap, only really does any thing on tap
		this._onMouseMove(e); // creates & places marker
		this._onClick(); // permanently places marker & ends interaction
	},

	_fireCreatedEvent: function () {
		var mayBienAp = this._createMayBienAp(this._mouseMarker.getLatLng());
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, mayBienAp);
	},
});
