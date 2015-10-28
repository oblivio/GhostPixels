
sjcl.random.startCollectors();
//GhostImage - 
//inspired by http://codepen.io/gschier/details/GLvAy
function GhostImage(){
	// Max value for a color component
	var GhostImage = this;
	 
	this.config = {
			  'MAX_COLOR':255,
			  'MIN_COLOR':0,
			  'FILL_CHANCE':0.5, //[0,1]
			  'SQUARE':2,//square-size in pixels
			  'GRID':250,//grid size
			  'SIZE':250
	  };
	
	  /**
	   * Setup a context and size for a canvas
	   */
	  this.helperFunctions = {
		  "setupCanvas":function(c) {
			    var ctx = c.getContext('2d');
			    c.width = GhostImage.config.SIZE;
			    c.height = GhostImage.config.SIZE;
			    return ctx;
			  },
			  "fillBlock":function(x, y, color, ctx) {
				    ctx.beginPath();
				    ctx.rect(
		    		x*GhostImage.config.SQUARE,
		    		y*GhostImage.config.SQUARE,
					GhostImage.config.SQUARE,
					GhostImage.config.SQUARE
				    );
				    ctx.fillStyle = 'rgb('+color.join(',')+')';
				    ctx.fill();
				  },
			  "genColor":function() { //generate random color
				    var rgb = [ ];
				    for (var i=0; i<3; i++) {
				      var val = Math.floor(Math.random()*256);
				      var minEnforced = Math.max(GhostImage.config.MIN_COLOR, val);
				      var maxEnforced = Math.min(GhostImage.config.MAX_COLOR, minEnforced);
				      rgb.push(maxEnforced);
				    }
				    return rgb;
				  },
			  "setSize":function(newSize){
				  GhostImage.config.SIZE = newSize;
				  GhostImage.config.GRID = newSize;
			  }
	  };

	    this.canvas = document.createElement('canvas');
	    this.ctx = GhostImage.helperFunctions.setupCanvas(this.canvas);
	  
	  this.generate = function() {
		  var ctx = this.ctx;
	    // FILL CANVAS BG
	    ctx.beginPath();
	    ctx.rect(0, 0, this.config.SIZE, this.config.SIZE);
	    ctx.fillStyle = '#F0ECE6';
	    ctx.fill();

	    // FILL THE SQUARES
	    for (var x=0; x<Math.ceil(this.config.GRID/2); x++) {
	      for (var y=0; y<this.config.GRID; y++) {
	        if (Math.random() < this.config.FILL_CHANCE) {
	        	// GENERATE COLOR
	    	    var color = this.helperFunctions.genColor();
	        	this.helperFunctions.fillBlock(x, y, color, ctx);
	          // FILL RIGHT SIDE SYMMETRICALLY
	          if (x < Math.floor(this.config.GRID/2)) {
	            this.helperFunctions.fillBlock((this.config.GRID-1) - x, y, color, ctx);
	          }
	        }
	      }
	    }
	    return this.canvas;
	  };

};
var GhostImage = new GhostImage();
function GhostPixels(){
	var GhostPixels = this;
	// artificially limit the message size
	GhostPixels.maxMessageSize = 1000;
	GhostPixels.dimensions = {
			'width':GhostImage.config.SIZE,
			'height':GhostImage.config.SIZE,
			'covermaxwidth':1080,
			'covermaxheight':1080,
	};
	GhostPixels.cover_data = {
			canvas:null
	};
	GhostPixels.hasCover = false;
	//helpers 'interface'
	GhostPixels.helpers = {
		'getBit':	function(number, location) {},
		'setBit':function(number, location, bit) {},
		'getBitsFromNumber':function(number) {},
		'getNumberFromBits':function(bytes, history, hash) {},
		'getMessageBits':function(message) {},
		'getNextLocation':function(history, hash, total) {},
	};
	
	//define helpers
	GhostPixels.helpers.getBit = function(number, location) {
		// returns a 1 or 0 for the bit in 'location'
		   return ((number >> location) & 1);
	};
	GhostPixels.helpers.setBit = function(number, location, bit) {
		// sets the bit in 'location' to 'bit' (either a 1 or 0)
		   return (number & ~(1 << location)) | (bit << location);
	};
	GhostPixels.helpers.getBitsFromNumber = function(number) {
		// returns an array of 1s and 0s for a 2-byte number
		   var bits = [];
		   for (var i = 0; i < 16; i++) {
		       bits.push(GhostPixels.helpers.getBit(number, i));
		   }
		   return bits;
	};
	GhostPixels.helpers.getNumberFromBits = function(bytes, history, hash) {
		// returns the next 2-byte number
	    var number = 0, pos = 0;
	    while (pos < 16) {
	        var loc = GhostPixels.helpers.getNextLocation(history, hash, bytes.length);
	        var bit = GhostPixels.helpers.getBit(bytes[loc], 0);
	        number = GhostPixels.helpers.setBit(number, pos, bit);
	        pos++;
	    }
	    return number;
	};
	GhostPixels.helpers.getMessageBits = function(message) {
		// returns an array of 1s and 0s for the string 'message'
	    var messageBits = [];
	    for (var i = 0; i < message.length; i++) {
	        var code = message.charCodeAt(i);
	        messageBits = messageBits.concat(GhostPixels.helpers.getBitsFromNumber(code));
	    }
	    return messageBits;
	};
	GhostPixels.helpers.getNextLocation = function(history, hash, total) {
		// gets the next location to store a bit
	    var pos = history.length;
	    var loc = Math.abs(hash[pos % hash.length] * (pos + 1)) % total;
	    while (true) {
	        if (loc >= total) {
	            loc = 0;
	        } else if (history.indexOf(loc) >= 0) {
	            loc++;
	        } else if ((loc + 1) % 4 === 0) {
	            loc++;
	        } else {
	            history.push(loc);
	            return loc;
	        }
	    }
	};
};
//interface
GhostPixels.prototype.encode = function(msg,pwd){};
GhostPixels.prototype.decode = function(){};
GhostPixels.prototype.encodeMessage = function(colors, hash, message) {};
GhostPixels.prototype.decodeMessage = function(colors, hash) {};

//define functions
GhostPixels.prototype.encode = function(msg,pwd){
	var GhostPixels = this;
	var message,password,output,canvas;
	
		message = String(msg);
	
	password = String(pwd);
	
	if(GhostPixels.hasCover){
		canvas = GhostPixels.cover_data.canvas;
	}else{
		var d = new Date();
		var timestamp = d.getTime(); 
	    canvas = GhostImage.generate();
	}
	
    var ctx = canvas.getContext('2d');
    // encrypt the message with supplied password if necessary
    if (password.length > 0) {
        message = sjcl.encrypt(password, message);
    } else {
        message = JSON.stringify({'text': message});
    }

    // exit early if the message is too big for the image
    var pixelCount = canvas.width * canvas.height;
    if ((message.length + 1) * 16 > pixelCount * 4 * 0.75) {
        alert('Message is too big for the image.');
        return;
    }

    // exit early if the message is above an artificial limit
    if (message.length > GhostPixels.maxMessageSize) {
        alert('Message is too big.');
        return;
    }
    // encode the encrypted message with the supplied password
    var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    //message = window.btoa(message);
    var newImgData = GhostPixels.encodeMessage(imgData, sjcl.hash.sha256.hash(password), message);
    
    ctx.putImageData(newImgData, 0, 0);

    
    return canvas.toDataURL();
};
GhostPixels.prototype.decode = function(pwd,image_src) {
	var GhostPixels = this;
    return new RSVP.Promise(function (fulfill, reject){
        var password,canvas;
    	password = String(pwd);
        var passwordFail = 'Password is incorrect or there is nothing here.';
        
        // decode the message with the supplied password
        canvas = document.createElement('canvas');
    	canvas.width = GhostPixels.dimensions.width;
    	canvas.height = GhostPixels.dimensions.height;
    	var img = new Image();
        img.onload = function() {
            var ctx = canvas.getContext('2d');
            ctx.canvas.width = img.width;
            ctx.canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            var message = GhostPixels.decodeMessage(imgData.data, sjcl.hash.sha256.hash(password));
            
            // try to parse the JSON
            var obj = null;
            try {
                obj = JSON.parse(message);
            } catch (e) {
                if (password.length > 0) {
                    fulfill(passwordFail);
                }
            }

            // display the "reveal" view
            if (obj) {
                // decrypt if necessary
                if (obj.ct) {
                    try {
                        obj.text = sjcl.decrypt(password, message);
                    } catch (e) {
                        fulfill(passwordFail);
                    }
                }

                // escape special characters
                var escChars = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    '\'': '&#39;',
                    '/': '&#x2F;',
                    '\n': '<br/>'
                };
                var escHtml = function(string) {
                    return String(string).replace(/[&<>"'\/\n]/g, function (c) {
                        return escChars[c];
                    });
                };
                fulfill( escHtml(obj.text) );
            }
        };
        var tmpImgSrc = image_src;
        img.src = tmpImgSrc;
      });
};
GhostPixels.prototype.encodeMessage = function(imgData, hash, message) {
	// encodes the supplied 'message' into the CanvasPixelArray 'colors'
    // make an array of bits from the message
	var GhostPixels = this;
	var colors = imgData.data;
    var messageBits = GhostPixels.helpers.getBitsFromNumber(message.length);
    messageBits = messageBits.concat(GhostPixels.helpers.getMessageBits(message));

    // this will store the color values we've already modified
    var history = [];

    // encode the bits into the pixels
    var pos = 0;
    while (pos < messageBits.length) {
        // set the next color value to the next bit
        var loc = GhostPixels.helpers.getNextLocation(history, hash, colors.length);
        colors[loc] = GhostPixels.helpers.setBit(colors[loc], 0, messageBits[pos]);

        // set the alpha value in this pixel to 255
        // we have to do this because browsers do premultiplied alpha
        // see for example: http://stackoverflow.com/q/4309364
        while ((loc + 1) % 4 !== 0) {
            loc++;
        }
        colors[loc] = 255;

        pos++;
    }
    imgData.data = colors;
    return imgData;
};
GhostPixels.prototype.decodeMessage = function(colors, hash) {
	var GhostPixels = this;
	
	// returns the message encoded in the CanvasPixelArray 'colors'
    // this will store the color values we've already read from
    var history = [];

    // get the message size
    var messageSize = GhostPixels.helpers.getNumberFromBits(colors, history, hash);
    
    // exit early if the message is too big for the image
    if ((messageSize + 1) * 16 > colors.length * 0.75) {
        return '';
    }

    // exit early if the message is above an artificial limit
    if (messageSize === 0 || messageSize > GhostPixels.maxMessageSize) {
        return '';
    }

    // put each character into an array
    var message = [];
    for (var i = 0; i < messageSize; i++) {
        var code = GhostPixels.helpers.getNumberFromBits(colors, history, hash);
        var character = String.fromCharCode(code);
        message.push(character);
    }
    // the characters should parse into valid JSON
    //but for some ungodly reason, it fails on mobile webkit.
    var msg = message.join('');// window.atob(message.join(''));
    
    return msg;
};
var GhostPixels = new GhostPixels();





