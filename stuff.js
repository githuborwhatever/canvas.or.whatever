 (function() {
 	var c = null;
 	var canvasElement = null;
 	var targets = [ ];
	var stuff = { };
	var points = 0;

	 stuff.Setup = {
	 	init: function () {
	 		canvasElement = document.getElementById("le-canvas");
	 		c = canvasElement.getContext("2d");
	 		this.drawPoints();
	 	},

	 	drawPoints: function () {
	 		c.clearRect(899, 5, 111, 25);
	 		c.font = "bold 16px Arial";
	 		c.fillSyle = "black";
  			c.fillText(points, 900, 20);
	 	}
	 };

	 stuff.Shooter = {
	 	heartAvailable: true,

	 	init: function () {
	 		this.drawShooter();
	 		this.hookMouse();
	 	},

	 	drawShooter: function () {
	 		c.fillRect(475, 475, 50, 25);
	 		c.fillRect(495, 470, 10, 10);
	 	},

	 	shoot: function (x, y) {
	 		if (this.heartAvailable) {
	 			this.heartAvailable = false;
	 			new stuff.Models.Bullet(x, y);
	 			setTimeout(function() { this.heartAvailable = true; }.bind(this), 1000);
	 		}
	 	},

	 	hookMouse: function () {
	 		canvasElement.addEventListener("click", this.handleClick.bind(this), false);
	 	},

	 	handleClick: function(e) {
	 		var coords = stuff.Utilities.getCursorPosition(e);
	 		this.shoot(coords.x, coords.y);
	 	}
	 };

	 stuff.Models = {
	 	Bullet: function (trajectoryX, trajectoryY) {
 			this.x = 499.5;
	 		this.y = 455;
	 		this.trajectoryX = trajectoryX - this.x;
	 		this.trajectoryY = trajectoryY - this.y;

	 		this.move = function() {
				var newCoords = this.nextPixel();

				this.clearPixel(this.x, this.y);

				if (stuff.Utilities.isOffscreen(this.x, this.y) 
					|| this.detectHit()) {
					return;
				}

				this.drawPixel(newCoords.x, newCoords.y);

				this.x = newCoords.x;
				this.y = newCoords.y;

				setTimeout(this.move.bind(this), 50);
	 		};

	 		this.nextPixel = function() {
	 			return {
 					x: this.x + (this.trajectoryX / 17),
    				y: this.y + (this.trajectoryY / 17)
 				};
	 		};

	 		this.drawPixel = function (x, y) {
				c.fillRect(x-5.5, y, 5, 5);
				c.fillRect(x+1.5, y, 5, 5);
				c.fillRect(x-3, y+3, 7, 5);
				c.fillRect(x, y+5, 2, 5);
	 		}

	 		this.clearPixel = function (x, y) {
	 			var corner = { x: x-6, y: y-6 };

	 			c.clearRect(corner.x, corner.y, 20, 17);
	 		};

	 		this.detectHit = function () {
	 			for (var i = 0; i <= targets.length; i++) {

 					// hard-coded hit-boxes are janky.
 					// also destruction and removal don't belong in here.
	 				if (targets[i]) {
						if (this.x >= targets[i].x
							&& this.x <= targets[i].x + 60
							&& this.y >= targets[i].y
							&& this.y <= targets[i].y + 80) {
							
							targets[i].destruct();
							targets.splice(i, 1);

							return true;
						}
					}
				}

				return false;
	 		}

	 		this.move();
	 	},

	 	Target: function (
	 		targetTemplate /* from stuff.Targets.targetTemplates */,
	 		startSide /* left, right */, 
	 		startY, 
	 		speed) {

	 		var isLeft = (startSide == 'left');
	 		this.x = isLeft ? 0 : 1000;
	 		this.trajectoryX = 1000;
	 		this.y = startY;
	 		
	 		this.move = function() {
				var deltaMod = isLeft ? 1 : -1;
				var newCoords = {
					x: this.x + ((this.trajectoryX / 100 - speed) * deltaMod),
					y: this.y
				};

				c.clearRect(this.x, this.y, 100,100);
 
				if (stuff.Utilities.isOffscreen(this.x, this.y) 
					|| this.isDestroyed) {
					return;
				}

	 			c.drawImage(targetTemplate, newCoords.x, newCoords.y);

	 			this.x = newCoords.x;
	 			this.y = newCoords.y;

				setTimeout(this.move.bind(this), 50);
	 		};

	 		this.destruct = function () {
	 			this.isDestroyed = true;
	 			points += 1;
	 			stuff.Setup.drawPoints();

	 			new stuff.Models.Explosion(this.x, this.y).explode();
	 		};

	 		this.move();
	 	},

	 	Explosion: function(x, y) {
	 		this.x = x-50;
	 		this.y = y-50;
	 		this.frames = stuff.Targets.asplosionImages;
	 		this.curFrame = 0;

	 		this.explode = function() {
		 		var i;
		 		for (i = 0; i < this.frames.length*50; i+=50) {
		 			setTimeout(this.showFrame.bind(this), i);
		 		}

	 			setTimeout(this.clearFrames.bind(this), 300);
	 		};

	 		this.showFrame = function () {
	 			c.drawImage(this.frames[this.curFrame++], this.x, this.y);
	 		};

	 		this.clearFrames = function () {
	 			c.clearRect(this.x, this.y, 150, 150);
	 		};
	 	}
	 };

	 stuff.Targets = {
	 	targetImages: [],
	 	targetTemplates: [
	 		'img/d-sized.png'
	 		, 'img/hots-sized.png'
	 		, 'img/hs-sized.png'
	 		, 'img/sc-sized.png'
	 		, 'img/wow-sized.png'
	 	],

	 	asplosionImages: [],
	 	asplosionTemplates: [
	 		'img/asplode.01.png'
	 		, 'img/asplode.02.png'
	 		, 'img/asplode.03.png'
	 		, 'img/asplode.04.png'
	 	],

	 	init: function () {
	 		this.createImages(this.targetImages, this.targetTemplates);
	 		this.createImages(this.asplosionImages, this.asplosionTemplates);

 			// daisy-chain image.onload events for the targets
 			// -- except the last, which starts the game.
	 		for (var i = 0; i < this.targetImages.length; i++) {
	 			var nextIdx = i+1;
	 			var nextCallback = (!!this.targetImages[nextIdx])
	 										? this.targetImages[nextIdx].onload
	 										: this.startTargets.bind(this);
	 			
	 			this.targetImages[i].onload = nextCallback;
	 		}
	 	},

	 	createImages: function (images, templates) {
	 		// reversed foreach so collisions cause encasement
	 		// rather than explosion (don't explode blizzard's brands!)
	 		var i = templates.length;
	 		while (--i > -1)
	 		{
	 			var img = new Image();
	 			img.loaded = false;
	 			img.src = templates[i];

	 			images.push(img);
	 		}
	 	},

	 	startTargets: function () {
	 		this.makeTarget();

	 		var randomInterval = stuff.Utilities.getRandomInt(2000, 5000);
	 		setTimeout(this.startTargets.bind(this), randomInterval);
	 	},

	 	makeTarget: function () {
	 		var isLeft = stuff.Utilities.getRandomInt(0, 2);
	 		var startY = stuff.Utilities.getRandomInt(15, 300);
	 		var targetNum = stuff.Utilities.getRandomInt(0, this.targetImages.length);
	 		var targetObj = this.targetImages[targetNum];

	 		targets.push(new stuff.Models.Target(targetObj, (isLeft == 0) ? 'left' : 'right', startY, 0));
	 	}
	 };

	 stuff.Utilities = {
	 	getCursorPosition: function(e) {
	 		// http://diveintohtml5.info/canvas.html
		    var x;
		    var y;
		    if (e.pageX != undefined && e.pageY != undefined) {
				x = e.pageX;
				y = e.pageY;
		    }
		    else {
				x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		    }

		    x -= canvasElement.offsetLeft;
		    y -= canvasElement.offsetTop;

		    return { x: x, y: y };
		},

		getRandomInt: function(min, max) {
			return Math.floor(Math.random() * (max - min)) + min;
		},

		isOffscreen: function (x, y) {
			return (x < -50 || y < -50 || y > 500 || x > 1005);
		}
	 };

 	stuff.Setup.init();
	stuff.Shooter.init();
	stuff.Targets.init();
 })();