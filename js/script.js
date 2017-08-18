var pcList={};
var pcNum = 0;
var caught=false;
var pcMax = 10;
var pcCaught = 0;
var missed = 0;
var missedMax = 3;
var level = 1;
var score = 0;

var xstart = 300;
var pcSpeed = 150;

var isPaused = true;

var falling = {
	speed: 150,
	x: 300,
	y: 0,
	width: 64,
	height: 16
};

$(document).ready(function() {
	// Create the canvas
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = 700;
	canvas.height = 500;
	$('#game').append(canvas);
	
	var img_bg = new Image();
	var img_chara = new Image();
	var img_chara2 = new Image();
	var img_plate = new Image();
	var img_pancake = new Image();
	
	
	var chara = {
		speed: 300,
		x: canvas.width/2,
		y: canvas.height-128,
		width: 96
	};
	
	var plate = {
		x: chara.x-45,
		y: chara.y+72,
		width: 80,
		height: 12
	};
	

	img_bg.onload = function() {
    
	};
	img_bg.src = 'img/bg2.jpg';
	
	img_chara.onload = function() {
    
	};
	img_chara.src = 'img/goro1.png';
	img_chara2.src = 'img/goro2.png';
	
	img_plate.onload = function() {
		ctx.drawImage(img_bg, 0, 0 );
		ctx.drawImage(img_chara, chara.x , chara.y);
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
	
	addEventListener("keyup", function(e) {
		if (e.keyCode == 32) {  //pause with space
			isPaused = !isPaused;
		}
	}, false);
	
	$("#game").click(function() {
		isPaused = !isPaused;
	});
	
	$(".popup").click(function() {
		isPaused = !isPaused;
	});
	

	var newPancake = function() {
		falling.x = Math.floor(Math.random() * (canvas.width - falling.width-40));
		falling.y=0;
		falling.speed = pcSpeed;
		caught = false;
	};
	
	// Update game objects
	var onEdge = false;
	var step = false;
	var stepcount = 0;
	var update = function (modifier) {
		$(".popup").toggle(false);
		
		if (37 in keysDown) { // Player holding left
			chara.x -= chara.speed * modifier;
			plate.x -= chara.speed * modifier;
			if (plate.x < 0) {
				plate.x=0;
				chara.x=45;
				onEdge = true;
			}
			else {onEdge = false;}
			if (!onEdge) {
				for (var i=0;i<Object.keys(pcList).length;i++) {
					pcList[i].x -=chara.speed * modifier;
				}
			}
			stepcount++;
			
		}
		if (39 in keysDown) { // Player holding right
			chara.x += chara.speed * modifier;
			plate.x += chara.speed * modifier;
			if (chara.x + chara.width >= canvas.width) {
				plate.x=canvas.width - chara.width - 45;
				chara.x=canvas.width - chara.width;
				onEdge = true;
			}
			else {onEdge = false;}
			if (!onEdge) {
				for (var i=0;i<Object.keys(pcList).length;i++) {
					pcList[i].x +=chara.speed * modifier;
				}
			}
			stepcount++;
		}
		
		//for animation
		if (stepcount==10) {
			stepcount = 0;
			step = !step;
		}
		
		//collision check
		var plateLeft = plate.x;
		var plateRight = plate.x + plate.width;
		var fallLeft = falling.x;
		var fallRight = falling.x + falling.width;
		if ((plate.y +3 <= falling.y + falling.height) && (plate.y +plate.height >= falling.y + falling.height) && ( (plateRight >= fallRight && plateLeft < fallRight) || (plateRight >= fallLeft && plateLeft < fallLeft) )) {
			falling.speed=0;
			pcList[pcNum] = {x: falling.x, y: falling.y};
			caught = true;
			pcNum++;
		}

		for (var i=0;i<Object.keys(pcList).length;i++) {
			var pcLeft = pcList[i].x;
			var pcRight = pcList[i].x + falling.width;
			if ((pcList[i].y <= falling.y + falling.height) && (pcList[i].y + falling.height >= falling.y + falling.height) &&( (pcRight >= fallRight && pcLeft < fallRight) || (pcRight >= fallLeft && pcLeft < fallLeft) )) {
				falling.speed=0;
				pcList[pcNum] = {x: falling.x, y: falling.y};
				caught = true;
				pcNum++;
				break;
			}
		}
		
		//pancake on ground
		if (falling.y > canvas.width) {
			newPancake();
			missed++;
		}
		
		//game over
		if (missed >= missedMax) {
			isPaused = true;
			$("#finalscore").html(score);
			var tweettext = "I scored " + score + " in Akechi's Pancake Panic!";
			
			//remove old tweet button + create new one
			$("#tweetbtn").html("");
			var link = document.createElement('a');
			link.setAttribute('href', 'https://twitter.com/share');
			link.setAttribute('class', 'twitter-share-button');
			link.setAttribute('style', 'margin-top:5px;');
			link.setAttribute("data-text" , tweettext);
			link.setAttribute("data-url" ,"https://frostpebble.github.io/Pancake-Panic/");
			link.setAttribute("data-hashtags" ,"PancakePanic");
			link.setAttribute("data-show-count" ,"false");
			link.setAttribute("data-size" ,"large") ;
			$("#tweetbtn").append(link);
			twttr.widgets.load();  //very important

			$("#gameover").toggle();
		}

		
		if(caught==false) {
			falling.y += falling.speed * modifier;
		}
		else {
			pcCaught++;
			score += pcSpeed;
			if (pcCaught < pcMax) {
				newPancake();
			}
			else {
				level++;
				pcSpeed += 50;
				isPaused = true;
				newLevel();
				newPancake();
			}
		}
		updateStats();
	};
	
	var newLevel = function() {
		//calculate bonus
		var maxheight = pcList[0].y;  //max is top of stack=lower number
		var minwidth = 1000;
		var maxwidth = 0;
		for (var i=0;i<pcMax;i++) {
			if(pcList[i].x < minwidth) {  //furthest left
				minwidth = pcList[i].x;
			}
			if(pcList[i].x + falling.width > maxwidth) {  //furthest right
				maxwidth = pcList[i].x;
			}
			if(pcList[i].y < maxheight) {  //highest
				maxheight = pcList[i].y;
			}
		}
		var heightbonus = Math.round(pcList[0].y - maxheight)*2;
		var neatbonus = Math.round(500 - (maxwidth - minwidth));
		
		score += heightbonus + neatbonus;
		pcCaught = 0;
		pcNum = 0;
		pcList = {};
		
		$("#heightbonus").html(heightbonus);
		$("#neatbonus").html(neatbonus);
		$("#score").html(score);
		$("#newlevel").toggle();
	};
	
	var updateStats = function() {
		$("#lv").html(level);
		$("#caught").html(pcCaught);
		$("#max").html(pcMax);
		$("#missed").html(missed);
		$("#missmax").html(missedMax);
		$("#score").html(score);
	};
	
	var render = function () {
		ctx.drawImage(img_bg, 0 , 0);
		//walk animation
		if(!step) {
			ctx.drawImage(img_chara, chara.x , chara.y);
		}
		else {
			ctx.drawImage(img_chara2, chara.x , chara.y);
		}
		
		ctx.drawImage(img_plate, plate.x , plate.y);
		ctx.drawImage(img_pancake, falling.x, falling.y);
		for (var i=0;i<Object.keys(pcList).length;i++) {
			ctx.drawImage(img_pancake, pcList[i].x, pcList[i].y);
		}
	};
	
	var main = function () {
		var now = Date.now();
		var delta = now - then;

		if(!isPaused) {
			update(delta / 1000);
		render();
		}
		
		then = now;

		// Request to do this again ASAP
		requestAnimationFrame(main);
	};
	
	var then = Date.now();
	
	main();
});

var resetGame = function() {
	pcList={};
	pcNum = 0;
	caught=false;
	pcMax = 10;
	pcCaught = 0;
	missed = 0;
	missedMax = 3;
	level = 1;
	score = 0;
	pcSpeed = 150;
	
	falling.x=300;
	falling.y=0;
	falling.speed=150;
	
	$("#gameover").toggle();
	isPaused = false;

};

var showHowto = function() {
	$("#howto").toggle();
};