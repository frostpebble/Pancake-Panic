$(document).ready(function() {
	// Create the canvas
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = 700;
	canvas.height = 500;
	document.body.appendChild(canvas);
	
	var img_bg = new Image();
	var img_chara = new Image();
	var img_plate = new Image();
	var img_pancake = new Image();
	
	
	var chara = {
		speed: 300,
		x: canvas.width/2,
		y: canvas.height-128,
		width: 96
	};
	
	var plate = {
		x: chara.x-32,
		y: chara.y+64,
		width: 96
	};
	
	var falling = {
		speed: 150,
		x: 300,
		y: 0,
		width: 64,
		height: 16
	};
	
	img_plate.onload = function() {
    ctx.drawImage(img_bg, 0, 0 );
	};
	img_bg.src = 'img/bg.png';
	
	img_chara.onload = function() {
    ctx.drawImage(img_chara, chara.x , chara.y);
	};
	img_chara.src = 'img/char.png';
	
	img_plate.onload = function() {
    ctx.drawImage(img_plate, plate.x, plate.y );
	};
	img_plate.src = 'img/plate.png';
	
	img_pancake.onload = function() {
	};
	img_pancake.src = 'img/pancake.png';
	
	// Handle keyboard controls
	var keysDown = {};

	addEventListener("keydown", function (e) {
		keysDown[e.keyCode] = true;
	}, false);

	addEventListener("keyup", function (e) {
		delete keysDown[e.keyCode];
	}, false);
	
	var pcList={};
	var pcImg = [];
	var pcNum = 0;
	var caught=true;
	
	var xstart = 300;
	var pcSpeed = 150;
	var newPancake = function() {
		falling.x = xstart;
		falling.y=0;
		falling.speed = pcSpeed;
		caught = false;
	};
	
	// Update game objects
	var onEdge = false;
	var update = function (modifier) {
		if (37 in keysDown) { // Player holding left
			chara.x -= chara.speed * modifier;
			plate.x -= chara.speed * modifier;
			if (plate.x < 0) {
				plate.x=0;
				chara.x=32;
				onEdge = true;
			}
			else {onEdge = false;}
			if (!onEdge) {
				for (var i=0;i<Object.keys(pcList).length;i++) {
					pcList[i].x -=chara.speed * modifier;
				}
			}
			
		}
		if (39 in keysDown) { // Player holding right
			chara.x += chara.speed * modifier;
			plate.x += chara.speed * modifier;
			if (chara.x + chara.width >= canvas.width) {
				plate.x=canvas.width - chara.width - 32;
				chara.x=canvas.width - chara.width;
				onEdge = true;
			}
			else {onEdge = false;}
			if (!onEdge) {
				for (var i=0;i<Object.keys(pcList).length;i++) {
					pcList[i].x +=chara.speed * modifier;
				}
			}
		}
		
		//collision check
		var plateLeft = plate.x;
		var plateRight = plate.x + plate.width;
		var fallLeft = falling.x;
		var fallRight = falling.x + falling.width;
		if (plate.y <= falling.y + falling.height && ( (plateRight >= fallRight && plateLeft < fallRight) || (plateRight >= fallLeft && plateLeft < fallLeft) )) {
			falling.speed=0;
			pcList[pcNum] = {x: falling.x, y: falling.y};
			caught = true;
			pcNum++;
		}

		for (var i=0;i<Object.keys(pcList).length;i++) {
			var pcLeft = pcList[i].x;
			var pcRight = pcList[i].x + falling.width;
			if (pcList[i].y <= falling.y + falling.height && ( (pcRight >= fallRight && pcLeft < fallRight) || (pcRight >= fallLeft && pcLeft < fallLeft) )) {
				falling.speed=0;
				pcList[pcNum] = {x: falling.x, y: falling.y};
				caught = true;
				pcNum++;
				break;
			}
		}

		
		if(caught==false) {
			falling.y += falling.speed * modifier;
		}
		else {
			newPancake();
		}

	};
	
	var render = function () {
		ctx.drawImage(img_bg, 0 , 0);
		ctx.drawImage(img_chara, chara.x , chara.y);
		ctx.drawImage(img_plate, plate.x , plate.y);
		ctx.drawImage(img_pancake, falling.x, falling.y);
		for (var i=0;i<Object.keys(pcList).length;i++) {
			ctx.drawImage(img_pancake, pcList[i].x, pcList[i].y);
		}
	};
	
	var main = function () {
		var now = Date.now();
		var delta = now - then;

		update(delta / 1000);
		render();

		then = now;

		// Request to do this again ASAP
		requestAnimationFrame(main);
	};
	
	var then = Date.now();
	//reset();
	
	main();
});