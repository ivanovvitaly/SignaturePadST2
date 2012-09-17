Ext.define('ST2.plugin.SignaturePad', {
	extend : 'Ext.util.Observable',

	init : function(cmp) {
		this.cmp = cmp;
		
		this.cmp.setHtml('<canvas width="'
				+ this.config.width
				+ '" height="'
				+ this.config.height
				+ '" id="'
				+ this.config.canvasId +'"></canvas>');
		
		cmp.on("painted", this.initCanvas, this);
	},

	initCanvas : function(comp, opts) {
		this.reset();
		var bMouseIsDown, canvas, ctx, iWidth, iHeight, panel;
		var self = this;
		
		bMouseIsDown = false;
		
		canvas = Ext.get(this.config.canvasId).dom;

		canvas.addEventListener("touchstart", ST2.signaturepad.util.Event.handleTouchEvent, true);
		canvas.addEventListener("touchmove", ST2.signaturepad.util.Event.handleTouchEvent, true);
		canvas.addEventListener("touchend", ST2.signaturepad.util.Event.handleTouchEvent, true);
		canvas.addEventListener("touchcancel", ST2.signaturepad.util.Event.handleTouchEvent, true);

		panel = this.cmp;

		if (canvas) {

			this.canvas = canvas;

			ctx = canvas.getContext("2d");

			iWidth = canvas.width;
			iHeight = canvas.height;

			ctx.beginPath();			

			canvas.onmousedown = function(e) {
				Ext.ComponentQuery.query(self.config.disableScrollCmp)[0].setScrollable({ disabled: true });
				
				bMouseIsDown = true;
				iLastX = e.clientX - panel.element.getX();
				iLastY = e.clientY - panel.element.getY();
			};
			
			canvas.onmouseup = function() {
				bMouseIsDown = false;
				iLastX = -1;
				iLastY = -1;
				
				Ext.ComponentQuery.query(self.config.disableScrollCmp)[0].setScrollable({ disabled: false });
			};
			
			canvas.onmouseout = function() {
				bMouseIsDown = false;
				iLastX = -1;
				iLastY = -1;
				
				Ext.ComponentQuery.query(self.config.disableScrollCmp)[0].setScrollable({ disabled: false });
			};
			
			canvas.onmousemove = function(e) {
				if (bMouseIsDown) {
					var iX = e.clientX - panel.element.getX();
					var iY = e.clientY - panel.element.getY();

					ctx.moveTo(iLastX, iLastY);
					ctx.lineTo(iX, iY);
					ctx.stroke();
					iLastX = iX;
					iLastY = iY;
				}
			};
		}
	},

	getSignatureAsImage : function(strType) {
		var canvas = document.getElementById(this.config.canvasId);
		var bRes = false;
		if (canvas) {
			
			var canvasContext = Ext.create('ST2.signaturepad.util.CanvasContext');
			
			if (strType == "DATA")
				bRes = canvasContext.getDataStr(canvas);
			if (strType == "PNG")
				bRes = canvasContext.saveAsPNG(canvas, true);
			if (strType == "BMP")
				bRes = canvasContext.saveAsBMP(canvas, true);
			if (strType == "JPEG")
				bRes = canvasContext.saveAsJPEG(canvas, true);

			if (!bRes) {
				return false;
			}
		}

		return bRes;
	},

	reset : function() {		
		canvas = document.getElementById(this.config.canvasId);
		ctx = canvas.getContext("2d");
		ctx.lineWidth = 3;
		ctx.strokeStyle = "black";
		ctx.fillStyle = "black";
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.font = "bold 24pt Arial";		
		ctx.fillText("X", 0, canvas.height - 40);
		
		ctx.beginPath();
		ctx.moveTo(30, canvas.height - 40);
		ctx.lineTo(canvas.width, canvas.height - 40);
		ctx.stroke();
		
		ctx.beginPath();
	}
});

Ext.define('ST2.signaturepad.util.Event', {
	statics: {
		
		handleTouchEvent: function(event){
			var touches = event.changedTouches, 
				first = touches[0], 
				type = "";
			
			switch (event.type) {
				case "touchstart":
					type = "mousedown";
					break;
				case "touchmove":
					type = "mousemove";
					break;
				case "touchend":
					type = "mouseup";
					break;
				default:
					return;
			}

			var simulatedEvent = document.createEvent("MouseEvent");
			simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX,
					first.screenY, first.clientX, first.clientY, false, false, false,
					false, 0/* left */, null);

			first.target.dispatchEvent(simulatedEvent);
			event.preventDefault();
		}			
	}
});

Ext.define('ST2.signaturepad.util.CanvasContext', {
	
	hasImageData: false,
	hasDataURL: false,
	isBase64Supported: false,	
	downloadMime: "image/octet-stream",
	isCanvasSupported: false,
	
	constructor: function(config){
		this.isCanvasSupported = false;
		var canvas = document.createElement("canvas");
		if (canvas.getContext("2d")) {
			this.isCanvasSupported = true;
		}
		
		this.hasImageData = !!(canvas.getContext("2d").getImageData);
		this.hasDataURL = !!(canvas.toDataURL);
		this.isBase64Supported = !!(window.btoa);
		
	},
	
	getDataStr : function(canvas, bReturnImg, iWidth, iHeight) {
		if (this.isCanvasSupported == false){
			return null;
		}
			
		if (!this.hasDataURL) {
			return false;
		}
		var oScaledCanvas = this.scaleCanvas(canvas, iWidth, iHeight);
		var strData = oScaledCanvas.toDataURL("image/png");

		return strData;
	},

	saveAsPNG : function(canvas, bReturnImg, iWidth, iHeight) {
		if (this.isCanvasSupported == false){
			return null;
		}
		
		if (!this.hasDataURL) {
			return false;
		}
		var oScaledCanvas = this.scaleCanvas(canvas, iWidth, iHeight);
		var strData = oScaledCanvas.toDataURL("image/png");
		
		if (bReturnImg) {
			return this.makeImageObject(strData);
		} else {
			this.saveFile(strData.replace("image/png", downloadMime));
		}
		return true;
	},

	saveAsJPEG : function(canvas, bReturnImg, iWidth, iHeight) {
		if (this.isCanvasSupported == false){
			return null;
		}
		
		if (!this.hasDataURL) {
			return false;
		}

		var oScaledCanvas = this.scaleCanvas(canvas, iWidth, iHeight);
		var strMime = "image/jpeg";
		var strData = oScaledCanvas.toDataURL(strMime);

		// check if browser actually supports jpeg by looking for the mime
		// type in the data uri.
		// if not, return false
		if (strData.indexOf(strMime) != 5) {
			return false;
		}

		if (bReturnImg) {
			return this.makeImageObject(strData);
		} else {
			this.saveFile(strData.replace(strMime, strDownloadMime));
		}
		
		return true;
	},

	saveAsBMP : function(canvas, bReturnImg, iWidth, iHeight) {
		if (this.isCanvasSupported == false){
			return null;
		}
		
		if (!(this.hasImageData && this.isBase64Supported)) {
			return false;
		}

		var oScaledCanvas = this.scaleCanvas(canvas, iWidth, iHeight);

		var oData = this.readCanvasData(oScaledCanvas);
		var strImgData = this.createBMP(oData);
		
		if (bReturnImg) {
			return this.makeImageObject(this.makeDataURI(strImgData, "image/bmp"));
		} else {
			this.saveFile(this.makeDataURI(strImgData, downloadMime));
		}
		return true;
	},
	
	// private
	readCanvasData: function(canvas) {
		var iWidth = parseInt(canvas.width);
		var iHeight = parseInt(canvas.height);
		return canvas.getContext("2d").getImageData(0, 0, iWidth, iHeight);
	},
	
	encodeData: function(data) {
		var strData = "";
		if (typeof data == "string") {
			strData = data;
		} else {
			var aData = data;
			for ( var i = 0; i < aData.length; i++) {
				strData += String.fromCharCode(aData[i]);
			}
		}
		return btoa(strData);
	},
	/**
	 * Creates BMP image from canvas context.
	 * 
	 * @private
	 * @param {Object} oData The imagedata object
	 * */
	createBMP: function(oData) {
		var aHeader = [];

		var iWidth = oData.width;
		var iHeight = oData.height;

		aHeader.push(0x42); // magic 1
		aHeader.push(0x4D);

		var iFileSize = iWidth * iHeight * 3 + 54; // total header size = 54
													// bytes
		aHeader.push(iFileSize % 256);
		iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256);
		iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256);
		iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256);

		aHeader.push(0); // reserved
		aHeader.push(0);
		aHeader.push(0); // reserved
		aHeader.push(0);

		aHeader.push(54); // dataoffset
		aHeader.push(0);
		aHeader.push(0);
		aHeader.push(0);

		var aInfoHeader = [];
		aInfoHeader.push(40); // info header size
		aInfoHeader.push(0);
		aInfoHeader.push(0);
		aInfoHeader.push(0);

		var iImageWidth = iWidth;
		aInfoHeader.push(iImageWidth % 256);
		iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256);
		iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256);
		iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256);

		var iImageHeight = iHeight;
		aInfoHeader.push(iImageHeight % 256);
		iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256);
		iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256);
		iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256);

		aInfoHeader.push(1); // num of planes
		aInfoHeader.push(0);

		aInfoHeader.push(24); // num of bits per pixel
		aInfoHeader.push(0);

		aInfoHeader.push(0); // compression = none
		aInfoHeader.push(0);
		aInfoHeader.push(0);
		aInfoHeader.push(0);

		var iDataSize = iWidth * iHeight * 3;
		aInfoHeader.push(iDataSize % 256);
		iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256);
		iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256);
		iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256);

		for ( var i = 0; i < 16; i++) {
			aInfoHeader.push(0); // these bytes not used
		}

		var iPadding = (4 - ((iWidth * 3) % 4)) % 4;

		var aImgData = oData.data;

		var strPixelData = "";
		var y = iHeight;
		do {
			var iOffsetY = iWidth * (y - 1) * 4;
			var strPixelRow = "";
			for ( var x = 0; x < iWidth; x++) {
				var iOffsetX = 4 * x;

				strPixelRow += String.fromCharCode(aImgData[iOffsetY + iOffsetX + 2]);
				strPixelRow += String.fromCharCode(aImgData[iOffsetY + iOffsetX + 1]);
				strPixelRow += String.fromCharCode(aImgData[iOffsetY + iOffsetX]);
			}
			for ( var c = 0; c < iPadding; c++) {
				strPixelRow += String.fromCharCode(0);
			}
			strPixelData += strPixelRow;
		} while (--y);

		var strEncoded = encodeData(aHeader.concat(aInfoHeader))
				+ encodeData(strPixelData);

		return strEncoded;
	},
	
	/**
	 * Sends the generated file to the client
	 * @private
	 * 
	 * */
	saveFile: function(strData) {
		document.location.href = strData;
	},

	/**
	 * @private
	 * 
	 * */
	makeDataURI: function(strData, strMime) {
		return "data:" + strMime + ";base64," + strData;
	},

	/** 
	 * generates a IMG object containing the imagedata
	 * @private
	 */
	makeImageObject: function(strSource) {
		var oImgElement = document.createElement("img");
		oImgElement.src = strSource;
		return oImgElement;
	},

	/**
	 * Scales canvas
	 * @private
	 * */
	scaleCanvas: function(canvas, iWidth, iHeight) {
		if (iWidth && iHeight) {
			var oSaveCanvas = document.createElement("canvas");
			oSaveCanvas.width = iWidth;
			oSaveCanvas.height = iHeight;
			oSaveCanvas.style.width = iWidth + "px";
			oSaveCanvas.style.height = iHeight + "px";

			var oSaveCtx = oSaveCanvas.getContext("2d");

			oSaveCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, iWidth, iHeight);
			return oSaveCanvas;
		}
		return canvas;
	}
});
