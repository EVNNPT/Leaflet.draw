/**
 * @class L.Draw.Marker
 * @aka Draw.Marker
 * @inherits L.Draw.Feature
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
	},

	_onClick: function () {
		var self = this;
		var inputText = document.getElementById(self.options.forms.inputText);
		inputText.value = "";
		var comboboxFont = document.getElementById(self.options.forms.comboboxFont);
		var inputSize = document.getElementById(self.options.forms.inputSize);
		var inputColor = document.getElementById(self.options.forms.inputColor);

		L.DomUtil.setOpacity(this._map.getContainer(), 0.5);
		var divTop = document.getElementById(this.options.forms.id);
		divTop.style = "display: block";
		var btnBold = document.getElementById(this.options.forms.btnBold);
		var btnItalic = document.getElementById(this.options.forms.btnBold);
		var isBold = false;
		btnBold.addEventListener("click", function () {
			isBold = !isBold;
		});
		var isItalic = false;
		btnItalic.addEventListener("click", function () {
			isItalic = !isItalic;
		});
		var btnOK = document.getElementById(this.options.forms.btnOK);
		var btnCancel = document.getElementById(this.options.forms.btnCancel);

		btnCancel.addEventListener("click", function () {
			self.disable();
			divTop.style = "display: none";
			L.DomUtil.setOpacity(self._map.getContainer(), 1);
		});
		btnOK.addEventListener("click", function () {
			var obj = {
				text: inputText.value,
				fontSize: Number.parseInt(inputSize.value),
				fontFamily: comboboxFont.value,
				fontColor: inputColor.value,
				isBold: isBold,
				isItalic: isItalic,
			};
			self._fireCreatedEvent(obj);
			self.disable();
			divTop.style = "display: none";
			L.DomUtil.setOpacity(self._map.getContainer(), 1);
		});
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

	_createMarker: function (latlng) {},

	_fireCreatedEvent: function (obj) {
		var label = L.label(this._mouseMarker.getLatLng(), obj);
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, label);
	},
});
