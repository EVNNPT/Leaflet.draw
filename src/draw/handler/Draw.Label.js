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
		fonts: [
			"Times New Roman",
			"Georgia",
			"Garamond",
			"Arial",
			"Verdana",
			"Helvetica",
			"Courier New",
			"Lucida Console",
			"Monaco",
		],
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

	_onClick: function () {
		let mapContainer = this._map.getContainer();

		var divTop = document.createElement("DIV");
		divTop.className = "div-top";

		var form = document.createElement("FORM");
		form.className = "form-label";

		var tableLayout = document.createElement("TABLE");

		var row1 = tableLayout.insertRow(0);
		var cell11 = row1.insertCell(0);
		var cell12 = row1.insertCell(1);

		var row2 = tableLayout.insertRow(1);
		var cell21 = row2.insertCell(0);
		var cell22 = row2.insertCell(1);

		var row3 = tableLayout.insertRow(2);
		var cell31 = row3.insertCell(0);
		var cell32 = row3.insertCell(1);

		var row4 = tableLayout.insertRow(3);
		var cell41 = row4.insertCell(0);
		var cell42 = row4.insertCell(1);

		var row5 = tableLayout.insertRow(4);
		var cell51 = row5.insertCell(0);
		var cell52 = row5.insertCell(1);

		var row6 = tableLayout.insertRow(5);
		var cell61 = row6.insertCell(0);
		var cell62 = row6.insertCell(1);

		// Input Text
		var labelInputText = document.createElement("LABEL");
		var textNodeText = document.createTextNode("Text: ");
		labelInputText.append(textNodeText);
		labelInputText.setAttribute("for", "text-val");

		var inputText = document.createElement("INPUT");
		inputText.id = "text-val";
		// inputText.setAttribute("rows", 3);
		inputText.setAttribute("type", "text");

		cell11.appendChild(labelInputText);
		cell12.appendChild(inputText);

		// Input Size
		var labelInputSize = document.createElement("LABEL");
		var textNodeSize = document.createTextNode("Font size: ");
		labelInputSize.append(textNodeSize);
		labelInputSize.setAttribute("for", "size-val");

		var inputSize = document.createElement("INPUT");
		inputSize.id = "size-val";
		inputSize.setAttribute("type", "number");
		inputSize.setAttribute("value", 14);

		cell21.appendChild(labelInputSize);
		cell22.appendChild(inputSize);

		// Combobox Font
		var labelComboboxFont = document.createElement("LABEL");
		var textNodeFont = document.createTextNode("Font: ");
		labelComboboxFont.append(textNodeFont);
		labelComboboxFont.setAttribute("for", "font-val");

		var comboboxFont = document.createElement("SELECT");
		comboboxFont.id = "font-val";

		for (var i = 0; i < this.options.fonts.length; i++) {
			var optionFont = document.createElement("OPTION");
			optionFont.text = this.options.fonts[i];
			optionFont.value = this.options.fonts[i];
			comboboxFont.options.add(optionFont, i + 1);
		}

		cell31.appendChild(labelComboboxFont);
		cell32.appendChild(comboboxFont);

		// Input Color
		var labelInputColor = document.createElement("LABEL");
		var textNodeColor = document.createTextNode("Color: ");
		labelInputColor.append(textNodeColor);
		labelInputColor.setAttribute("for", "color-val");

		var inputColor = document.createElement("INPUT");
		inputColor.id = "color-val";
		inputColor.setAttribute("type", "color");
		inputColor.setAttribute("value", 14);

		cell41.appendChild(labelInputColor);
		cell42.appendChild(inputColor);

		// Bold, Italic, Underline
		var btnBold = document.createElement("BUTTON");
		btnBold.innerHTML = "Bold";
		btnBold.style = "width: 50px; font-weight: bold;";
		btnBold.setAttribute("type", "button");
		var btnItalic = document.createElement("BUTTON");
		btnItalic.innerHTML = "Italic";
		btnItalic.style = "width: 50px; font-style: italic;";
		btnItalic.setAttribute("type", "button");

		var isBold = false;
		btnBold.addEventListener("click", function () {
			isBold = !isBold;
		});
		var isItalic = false;
		btnItalic.addEventListener("click", function () {
			isItalic = !isItalic;
		});

		// var btnUnderline = document.createElement("BUTTON");
		// btnUnderline.innerHTML = "U";
		cell52.appendChild(btnBold);
		cell52.appendChild(btnItalic);
		// cell42.appendChild(btnUnderline);

		// Button: OK, Cancel
		// row5.style = "padding-top: 10px";
		var btnOK = document.createElement("BUTTON");
		btnOK.innerHTML = "OK";
		btnOK.style = "width: 80px;";
		btnOK.setAttribute("type", "button");
		var btnCancel = document.createElement("BUTTON");
		btnCancel.innerHTML = "Cancel";
		btnCancel.style = "width: 80px;";
		btnCancel.setAttribute("type", "button");

		cell62.style = "padding-top: 10px";
		cell62.appendChild(btnOK);
		cell62.appendChild(btnCancel);

		form.append(tableLayout);

		divTop.append(form);

		document.body.append(divTop);

		// #b7b3b3

		var self = this;
		btnCancel.addEventListener("click", function () {
			// self._fireCreatedEvent();
			self.disable();
			divTop.remove();
		});

		btnOK.addEventListener("click", function () {
			var obj = {
				textVal: inputText.value,
				fontVal: comboboxFont.value,
				fontSize: inputSize.value,
				colorVal: inputColor.value,
				boldVal: isBold,
				italicVal: isItalic,
			};

			self._fireCreatedEvent(obj);
			self.disable();
			divTop.remove();
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
		// if (!this._marker) {
		// 	this._marker = this._createMarker(latlng);
		// 	// Bind to both marker and map to make sure we get the click event.
		// 	this._marker.on("click", this._onClick, this);
		// 	this._map.on("click", this._onClick, this).addLayer(this._marker);
		// } else {
		// 	latlng = this._mouseMarker.getLatLng();
		// 	this._marker.setLatLng(latlng);
		// }
	},

	_createMarker: function (latlng) {
		// console.log(latlng);
		// const img =
		// 	"data:image/svg+xml," + encodeURIComponent(this._svgText("Demo Label"));
		// const icon = L.icon({
		// 	iconUrl: img,
		// 	iconSize: [100, 30],
		// 	iconAnchor: [50, 15],
		// });
		// return new L.Marker(latlng, {
		// 	icon: icon,
		// 	zIndexOffset: this.options.zIndexOffset,
		// });
	},

	_fireCreatedEvent: function (obj) {
		var canvas = document.createElement("CANVAS");
		var ctx = canvas.getContext("2d");
		// ctx.font = `${obj.boldVal ? "bold" : ""}  ${
		// 	obj.italicVal ? "italic" : ""
		// } ${obj.fontSize}px ${obj.fontVal};`;
		ctx.font = `${obj.boldVal ? "bold" : ""} ${obj.italicVal ? "italic" : ""} ${
			obj.fontSize
		}px ${obj.fontVal}`;
		ctx.fillStyle = obj.colorVal;

		var textWidth = ctx.measureText(obj.textVal).width;
		var textHeight = 30;

		canvas.width = textWidth + 20;
		canvas.height = obj.fontSize;

		ctx.font = `${obj.boldVal ? "bold" : ""} ${obj.italicVal ? "italic" : ""} ${
			obj.fontSize
		}px ${obj.fontVal}`;
		ctx.fillStyle = obj.colorVal;
		ctx.fillText(obj.textVal, 10, obj.fontSize);

		// ctx.lineWidth = 5;
		// ctx.strokeStyle = "red";
		// ctx.strokeRect(0, 0, canvas.width, canvas.height);

		const img = canvas.toDataURL("image/png");
		console.log(img);
		const icon = L.icon({
			iconUrl: img,
			iconSize: null,
			// iconAnchor: [50, 15],
		});
		var marker = new L.Marker.Touch(this._mouseMarker.getLatLng(), {
			icon: icon,
			rotationAngle: 45,
		});
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, marker);
	},

	_svgText: function (obj) {
		return (
			`<svg width='${obj.width}' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='box-sizing: border-box; border: 1px solid red;'>` +
			`<style>` +
			`.font {
				font: ${obj.boldVal ? "bold" : ""}  ${obj.italicVal ? "italic" : ""} ${
				obj.fontSize
			}px ${obj.fontVal};
				fill: ${obj.colorVal};
			  }` +
			`</style>` +
			`<text dominant-baseline="hanging" class='font'>` +
			obj.textVal +
			"</text>" +
			"</svg>"
		);
	},
});
