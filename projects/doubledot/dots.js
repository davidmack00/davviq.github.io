$(function() {
	
	//flags and elements
	var contact = false;
	
	var page = $(window);
	var gameWrapper = $(".game-wrapper");
	var gameContainer = $(".game-container");
	var dotArea = $(".dot-area");

	//define color structure
	var colorIndex = {
		col0: 0, //transparent / dead
		col1: 1,
		col2: 2,
		col3: 3,
		col4: 4,
		col5: 5,
		col6: 6
	};

	var colorValues = {
		0: "transparent",
		1: "hsl(350,100%,70%)",    // red
		2: "hsl(200,100%,75%)",    // blue
		3: "hsl(130,100%,70%)",    // green
		4: "hsl(250,100%,70%)",    // purple
		5: "hsl(50,100%,75%)",    // yellow
		6: "hsl(20,100%,65%)",    // orange
		//6: "hsl(20,100%,100%)",    // white
	};

	//-------------------------------
	//dot class
	//-------------------------------

	//dot class
	function dot(x, y, innerCol, outerCol, numColors) {
		//default value of 
		numColors = typeof numColors !== 'undefined' ? numColors : 4;

		this.xPos = x;
		this.yPos = y;
		this.inner = innerCol || this.randomCol(numColors);
		this.outer = outerCol || this.randomCol(numColors);
		
		this.alive = true;
		this.active = false;
		this.flipFlag = false;
	}
	
	//random color generation
	dot.prototype.randomCol = function(n) {
		var integer = Math.ceil(Math.random() * n);
		return integer;
	};
	
	//flip the inner and outer color
	dot.prototype.flipColor = function() {
		var outerTmp = this.outer;
		this.outer = this.inner;
		this.inner = outerTmp;
		
		//make flip animation
		this.flipFlag = true;
		this.refresh();
	};
	
	//destroy the dot
	dot.prototype.eatDot = function() {
		this.outer = 0;
		this.inner = 0;
		this.alive = false;
		
		this.refresh();
	};

	//refresh css of the dot
	dot.prototype.refresh = function() {

		//find the matching html element
		var domDot = dotArea.find(
			"[data-x='" + this.xPos + "']"+
			"[data-y='" + this.yPos + "']"
		);

		//set dead class
		if (this.alive) {
			domDot.removeClass("dead");
		} else {
			domDot.addClass("dead");
		}

		//set active class
		if (this.active) {
			domDot.addClass("active");
		} else {
			domDot.removeClass("active");
		}

		if (this.flipFlag) {
			this.flipFlag = false;
			domDot.toggleClass("flip");
		}

		//set the colors
		domDot.find($(".outer")).css({
			"background-color": colorValues[this.outer]
		});
		domDot.find($(".inner")).css({
			"background-color": colorValues[this.inner]
		});
	};
	

	//-------------------------------
	//dotGroup class
	//-------------------------------
	
	function dotGroup() {
		this.dotList = [];
		this.dotQueue = [];
		this.allowFlip = true;
	};
	
	dotGroup.prototype.add = function(dot) {
		this.dotList.push(dot);
	};
	
	dotGroup.prototype.get = function(x, y) {
		return this.dotList.filter(function(dot) {
			return dot.xPos == x && dot.yPos == y;
		})[0];
	};

	//add dots to the queue
	dotGroup.prototype.addQueue = function(dot) {
		if (!this.alive) {
			this.dotQueue.push(dot);
			dot.active = true;
			dot.refresh();
		}
	};

	//removes last dot from the queue
	dotGroup.prototype.removeQueue = function() {
		var currDot = this.dotQueue.pop();
		currDot.active = false;
		currDot.refresh();
	};

	// //I guess this doesn't do anything...
	// dotGroup.prototype.refreshQueue = function() {
	//   for (var i = 0; i < this.dotQueue.length; i++) {
	//     this.dotQueue[i].refresh();
	//   }
	// };

	dotGroup.prototype.clearQueue = function() {
		for (var i = 0; i < this.dotQueue.length; i++) {
			this.dotQueue[i].active = false;
			this.dotQueue[i].refresh();
		}
		this.dotQueue = [];
		this.allowFlip = true;
	};

	//check if dot is the first in the queue
	dotGroup.prototype.checkQueueFirst = function(dot) {
		if (this.dotQueue[0] === dot) {
			return true;
		}
		return false;
	};

	//check if dot is already in the queue (but not the first)
	dotGroup.prototype.checkQueue = function(dot) {
		for (var i = 1; i < this.dotQueue.length; i++) {
			if (this.dotQueue[i] === dot) {
				return true;
			}
		}
		return false;
	};

	dotGroup.prototype.evaluateQueue = function() {
		//check if there is only one dot in the queue
		if (this.dotQueue.length == 1) {
			if (this.allowFlip) {
				this.dotQueue[0].flipColor();
			}
		}
		else {
			for (currDot = 0; currDot < this.dotQueue.length; currDot++) {
				this.dotQueue[currDot].eatDot();
			}
		}
	};
	
	//connect dots together
	dotGroup.prototype.doesConnect = function(start, end) {
		var col1 = start.outer;
		var col2 = end.outer;
		var x1 = start.xPos;
		var y1 = start.yPos;
		var x2 = end.xPos;
		var y2 = end.yPos;


		//check along single axis
		//axis = 1 means check along x-axis (y is fixed) (deadCheckX)
		//axis = 0 means check along y-axis (x is fixed) (deadCheckY)
		dotGroup.prototype.deadCheck = function(axis, smaller, larger, fixed) {
			var currDot;
			
			for(var pos = smaller+1; pos < larger; pos++){
				//check axis
				if (axis == 1) {
					currDot = this.get(pos,fixed);
				} else {
					currDot = this.get(fixed,pos);
				}
				//check if alive
				if (currDot.alive) {
					return false;
				} 
			}
			return true;
		};

		//make sure it's not the same dot twice
		if (x1 == x2 && y1 == y2) {
			return false;
		}
		
		//check if same color (and color is not 0 i.e. dead)
		if (col1 == col2 && col1 !== 0) {
			
			//check if on the same axis
			if (x1 == x2 || y1 == y2) {
				
				//check if adjacent
				if (Math.abs(x1 - x2) == 1 || Math.abs(y1 - y2) == 1) {
					return true;
				}
				
				//check if there are only dead dots between
				//find out which axis to use
				//then find out which is smaller along that axis
				//then report the coordinate with the smaller number then the bigger then the fixed axis coordinate
				else {
					if (x1 == x2) {
						if (y1 < y2) {
							var result = this.deadCheck(0, y1, y2, x1); //deadCheckY
							return result;
						} else {
							var result = this.deadCheck(0, y2, y1, x1); //deadCheckY
							return result;
						}
						
					} else {
						if (x1 < x2) {
							var result = this.deadCheck(1, x1, x2, y1); //deadCheckX
							return result;
						} else {
							var result = this.deadCheck(1, x2, x1, y1); //deadCheckX
							return result;
						}
					}
				}
			} else {
				return false; //different axis
			}
		} else {
			return false; //different outside color
		}
	};

		
	//-------------------------------
	//game class
	//-------------------------------


	//data object for the game
	function game() {
		this.gameDots = new dotGroup();
	}

	//resize dot area
	game.prototype.resizeGame = function() {

		//game container dimensions
		var Wc = gameContainer.width();
		var Hc = gameContainer.height();

		//initial dot area dimensions
		var Wa = dotArea.width();
		var Ha = dotArea.height();

		//final dot area dimensions
		var Wa2 = Wa;
		var Ha2 = Ha;

		var cRatio = Wc/Hc;
		var aRatio = Wa/Ha;

		if (cRatio > aRatio) {
			//Ha2 = Hc;
			//Wa2 = Wa*(Ha2/Ha);
			Wa2 = Wa*(Hc/Ha);
		} 
		else if (cRatio < aRatio) {
			Wa2 = Wc;
		}

		//disappearing condition
		if (Wa == 0) {
			Wa2 = 1;
		}

		dotArea.css({
			width: Wa2
		})
	};

	//shows all the dots
	game.prototype.generate = function(width, height, colors) {

		//hold y constant to make a row
		for (var y = 0; y < height; y++) {
			var currRow = $('<div class="row"></div>');
			currRow.appendTo(dotArea);
			
			
			for (var x = 0; x < width; x++) {
				//append holder for dots
				var outerHolder = $('<div class="outer-holder"></div>').appendTo(currRow);
				var innerHolder = $('<div class="inner-holder"></div>').appendTo(outerHolder);

				//generate a dot
				var newDot = new dot(x,y,undefined,undefined, colors);
				this.gameDots.add(newDot);

				//store the x,y position of the dot
				var X = newDot.xPos;
				var Y = newDot.yPos;

				//append the dot html
				// - (added dead class so it will become alive when refreshed)
				var htmlDot = $('<div class="dot dead"><div class="shadow"></div><div class="ring"></div><div class="outer-gap"></div><div class="flipper"><div class="outer"></div><div class="inner-gap"></div><div class="inner"></div></div></div>');
				htmlDot.appendTo(innerHolder);

				//set the data attributes to the x and y position
				htmlDot.attr("data-x", X);
				htmlDot.attr("data-y", Y);

				//refreshe the dot (with a delay)
				delayRefresh(newDot,y,x);

				// //refresh dot (without delay)
				// newDot.refresh();
			}
		}

		//set a delay on when the dots will refresh
		function delayRefresh(dot,y,x) {
			setTimeout(function() {
				dot.refresh();
			}, 50 * (y*1.5+x));
		}

		//set width of holders based on number of columns
		var holderWidth = 100 / width;
		$(".outer-holder").css({
			width: holderWidth +"%"
		});

		//resize the game to the page
		this.resizeGame();
	};

	//selected html dot to data dot
	game.prototype.selectDot = function(htmlDot) {
		var X = htmlDot.attr("data-x");
		var Y = htmlDot.attr("data-y");
		var thisDot = this.gameDots.get(X,Y);
		return thisDot;
	};

	
	//fills in more dots when timer runs out
	game.prototype.refill = function() {
		//for later
	};

	game.prototype.destroy = function() {
		dotArea.html("");
		this.gameDots.dotList = [];
	}


	//----------------------------
	//game actions
	//----------------------------
	

	//pointer down
	function pointerDown() {
		contact = true;
		newGame.gameDots.clearQueue();
	}

	//pointer up
	function pointerUp() {
		contact = false;
		newGame.gameDots.evaluateQueue();
		newGame.gameDots.clearQueue();
	}

	//pointer down
	function pointerDownDot(e,domDot) {
		e.stopPropagation();
		pointerDown();

		var thisDot = newGame.selectDot(domDot);
		newGame.gameDots.addQueue(thisDot);
	}

	function pointerLeaveDot() {
		newGame.gameDots.allowFlip = false;
	}

	function pointerEnterDot(domDot) {
		//if mouse is not down
		if (!contact) {
			return;
		}

		//select dot
		var thisDot = newGame.selectDot(domDot);

		//if dotQueue is empty, add the dot
		if (newGame.gameDots.dotQueue.length == 0) {
			newGame.gameDots.addQueue(thisDot);
		}
		else {
			//the queue
			var currQueue = newGame.gameDots.dotQueue;

			//check if trying to remove the last dot
			if (thisDot === currQueue[currQueue.length-2]) {
				newGame.gameDots.removeQueue();
				return;
			}

			//check if dot is the first in the queue
			if (newGame.gameDots.checkQueueFirst(thisDot) == true) {
				//make sure minimal loop is possible
				//(make sure not the only dot in queue)
				if (newGame.gameDots.dotQueue.length < 4) {
					return;
				}
				//check if the loop is completed
				
				//repeat of last code
				//get last dot in the queue
				var lastIndex = currQueue[currQueue.length-1];
				//check if the dots connect
				if (newGame.gameDots.doesConnect(lastIndex,thisDot) == true) {
					//newGame.gameDots.dotLoop();
					return;
				}
			}
			
			//dont allow flip
			newGame.gameDots.allowFlip = false;

			//check if dot is already in queue (but not the first), return if true
			if (newGame.gameDots.checkQueue(thisDot) == true) {
				return;
			}

			//get last dot in the queue
			var lastIndex = currQueue[currQueue.length-1];
			//check if the dots connect
			if (newGame.gameDots.doesConnect(lastIndex,thisDot) == true) {
				//add to queue
				newGame.gameDots.addQueue(thisDot);
			}
		}
	}



	//wrapper mousedown
	gameWrapper.on("mousedown", function() {
		pointerDown();
	});
	gameWrapper.on("touchstart", function(t) {
		t.preventDefault();
		pointerDown();
	});



	//wrapper mouseup
	page.on("mouseup touchend", function() {
		pointerUp();
	});
	
	// page.on("touchend", function(t) {
	//   //t.preventDefault();
	//   pointerUp();
	// });



	//dot mousedown
	dotArea.on("mousedown", ".dot", function(e) {
		pointerDownDot(e,$(this));
	});
	dotArea.on("touchstart", ".dot", function(t) {
		t.preventDefault();
		pointerDownDot(t,$(this));
	});



	//set don't flip if mouse leaves the dot
	dotArea.on("mouseleave", ".dot", function() {
		pointerLeaveDot();
	});
	// //this will never fire....
	// dotArea.on("touchleave", ".dot", function(t) {
	//   t.preventDefault();
	//   pointerLeaveDot();
	// });



	//dot mouseenter
	dotArea.on("mouseenter", ".dot", function(){
		pointerEnterDot($(this));
	});



	//make touchenter work...
	gameWrapper.on("touchmove", function(t){
		//prevent mouse events
		t.preventDefault();

		//get info from touchmove
		var t0 = t.originalEvent;
		var touch = t0.changedTouches[0];

		//get the element by its location
		var target = document.elementFromPoint(touch.clientX, touch.clientY);
		
		//check if it is a dot
		if($(target).closest(".dot")[0]) {
			var hoverDot = $($(target).closest(".dot")[0]);

			pointerEnterDot(hoverDot);
		}
		else {
			newGame.gameDots.allowFlip = false;
		}
	});


	//resize game window on page resize
	page.on("resize", function() {
		newGame.resizeGame();
	})

	//initialize game
	var newGame = new game;
	newGame.generate(5,5,5);
	//newGame.resizeGame();

	// //fix touch bug with inputs
	// $(".input").on("click touchstart", function(){
	//   $(this).focus();
	// });
	
	var shell = $("#shell");
	var menuBtn = $(".header-button");
	var shadowCover = $(".shadow-cover");

	var resetBtn = $("#settings-reset");
	var widthSet = $("#settings-width");
	var heightSet = $("#settings-height");
	var colorSet = $("#settings-colors");

	menuBtn.on("click touchend", function(t) {
		t.preventDefault();
		shell.toggleClass("menu-open");
	});

	shadowCover.on("click touchstart", function() {
		shell.removeClass("menu-open");
	});

	resetBtn.on("click touchend", function() {

		//close the menu
		shell.removeClass("menu-open");

		//destroy the old game
		newGame.destroy();

		//variables from inputs
		var w = widthSet.val();
		var h = heightSet.val();
		var c = colorSet.val();

		//make a new game
		newGame.generate(w,h,c);
		//alert("wee");
	});
});