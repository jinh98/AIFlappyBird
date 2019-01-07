//flappy bird with neural evolution


//function that handles time out and irrelevant stuff
(function() {
	var timeouts = [];
	var messageName = "zero-timeout-message";

	function setZeroTimeout(fn) {
		timeouts.push(fn);
		window.postMessage(messageName, "*");
	}

	function handleMessage(event) {
		if (event.source == window && event.data == messageName) {
			event.stopPropagation();
			if (timeouts.length > 0) {
				var fn = timeouts.shift();
				fn();
			}
		}
	}

	window.addEventListener("message", handleMessage, true);

	window.setZeroTimeout = setZeroTimeout;
})();



// var Neuvol;


var game;
var player;
//normal speed
var FPS = 60;
var maxScore=0;

var images = {};

//controlls the speed of the game
var speed = function(fps){
	FPS = parseInt(fps);
}

var flappp = function(){
	this.player.flap();
}


//use images
var loadImages = function(sources, callback){
	var nb = 0;
	var loaded = 0;
	var imgs = {};
	for(var i in sources){
		nb++;
		imgs[i] = new Image();
		imgs[i].src = sources[i];
		imgs[i].onload = function(){
			loaded++;
			if(loaded == nb){
				callback(imgs);
			}
		}
	}
}

//Initialize bird json object

var Bird = function(json){
	this.x = 80; //set position
	this.y = 250; //set position
	this.width = 40; //bounding box
	this.height = 30; //bounding box

	this.alive = true; //set status
	this.gravity = 0; //make bird move down
	this.velocity = 0.3; //bird velocity
	this.jump = -6; //jump subtracts gravity by 6

	this.init(json);
}

//each bird is a prototype
Bird.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Bird.prototype.flap = function(){
	this.gravity = this.jump;  //negative 
}

Bird.prototype.update = function(){
	this.gravity += this.velocity;
	this.y += this.gravity;
}


//if a bird touches ground or touches pipe
//death
Bird.prototype.isDead = function(height, pipes){
	//hit ground
	if(this.y >= height || this.y + this.height <= 0){
		return true;
	}
	//hit pipe
	for(var i in pipes){
		if(!(
			this.x > pipes[i].x + pipes[i].width ||
			this.x + this.width < pipes[i].x || 
			this.y > pipes[i].y + pipes[i].height ||
			this.y + this.height < pipes[i].y
			)){
			return true;
	}
}
}


//make the pipes
var Pipe = function(json){
	this.x = 0;
	this.y = 0;
	this.width = 50;
	this.height = 40;
	this.speed = 3;

	this.init(json);
}


Pipe.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Pipe.prototype.update = function(){
	this.x -= this.speed;
}

//out of sight
Pipe.prototype.isOut = function(){
	if(this.x + this.width < 0){
		return true;
	}
}

//main game
var Game = function(){
	//List of objects
	this.pipes = [];
	this.player = new Bird();
	// this.birds = [];

	this.score = 0;

	//draw on canvas file
	//this is a png named flappy.png
	this.canvas = document.querySelector("#flappy");


	this.ctx = this.canvas.getContext("2d");

	//subject to change 
	this.width = this.canvas.width;
	this.height = this.canvas.height;

	//how fast each generation spawns
	this.spawnInterval = 90;
	this.interval = 0;
	this.gen = [];
	this.alives = 0;
	this.generation = 0;

	
	this.backgroundSpeed = 0.5;
	this.backgroundx = 0;
	this.maxScore = 0;

}

//on start
Game.prototype.start = function(){
	this.interval = 0;
	this.score = 0;
	this.pipes = [];
	this.player = new Bird();
	this.player.flap();

	// this.birds = [];
	// this.gen = Neuvol.nextGeneration();
	// for(var i in this.gen){
	
	// 	this.birds.push(b)
	// }
	// this.generation++;
	// this.alives = this.birds.length;
}


//main game loop
//updates game


document.getElementById("stop").addEventListener("click", function(){ alert("Paused"); });
big = this;
document.getElementById("flappy").addEventListener("click", function(){ 
	big.onClicking=true; 
	if (big.onClicking==true){
		//alert("Hello World!");
	}

});
	
Game.prototype.update = function(){
	
	//scroll background
	this.backgroundx += this.backgroundSpeed;

	var nextHole = 0;
	//update player
	//if player clicked

	
	this.player.update();
	if (this.player.isDead(this.height, this.pipes)){
		//end

		this.start();
	}

	for(var i = 0; i < this.pipes.length; i++){
		this.pipes[i].update();
		if(this.pipes[i].isOut()){
			this.pipes.splice(i, 1);
			i--;
		}
	}

	if(this.interval == 0){
		var deltaBord = 50;
		var pipeHole = 120;
		var holePosition = Math.round(Math.random() * (this.height - deltaBord * 2 - pipeHole)) +  deltaBord;
		this.pipes.push(new Pipe({x:this.width, y:0, height:holePosition}));
		this.pipes.push(new Pipe({x:this.width, y:holePosition+pipeHole, height:this.height}));
	}

	this.interval++;
	if(this.interval == this.spawnInterval){
		this.interval = 0;
	}

	this.score++;
	this.maxScore = (this.score > this.maxScore) ? this.score : this.maxScore;
	var self = this;

	if(FPS == 0){
		setZeroTimeout(function(){
			self.update();
		});
	}else{
		setTimeout(function(){
			self.update();

			if (big.onClicking==true){
				self.player.flap();
				//alert("Hello World!");
			}
			big.onClicking=false;
		}, 1000/FPS);
	
}

}

//ending
Game.prototype.isItEnd = function(){

	return true;
}


//display
Game.prototype.display = function(){
	this.ctx.clearRect(0, 0, this.width, this.height);
	for(var i = 0; i < Math.ceil(this.width / images.background.width) + 1; i++){
		this.ctx.drawImage(images.background, i * images.background.width - Math.floor(this.backgroundx%images.background.width), 0)
	}

	for(var i in this.pipes){
		if(i%2 == 0){
			this.ctx.drawImage(images.pipetop, this.pipes[i].x, this.pipes[i].y + this.pipes[i].height - images.pipetop.height, this.pipes[i].width, images.pipetop.height);
		}else{
			this.ctx.drawImage(images.pipebottom, this.pipes[i].x, this.pipes[i].y, this.pipes[i].width, images.pipetop.height);
		}
	}

	this.ctx.fillStyle = "#FFC600";
	this.ctx.strokeStyle = "#CE9E00";
	
	this.ctx.save(); 
	this.ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
	this.ctx.rotate(Math.PI/2 * this.player.gravity/20);
	this.ctx.drawImage(images.bird, -this.player.width/2, -this.player.height/2, this.player.width, this.player.height);
	this.ctx.restore();

	this.ctx.fillStyle = "black";
	this.ctx.font="20px Oswald, sans-serif";
	this.ctx.fillText("Score : "+ this.score, 10, 25);
	this.ctx.fillText("Max Score : "+this.maxScore, 10, 50);
	// this.ctx.fillText("Gen : "+this.generation, 10, 75);
	// this.ctx.fillText("Birds Alive : "+this.alives+" / "+Neuvol.options.population, 10, 100);

	var self = this;
	requestAnimationFrame(function(){
		self.display();
	});
}




window.onload = function(){
	var sprites = {
		bird:"./img/bird.png",
		background:"./img/background.png",
		pipetop:"./img/pipetop.png",
		pipebottom:"./img/pipebottom.png"
	}

	var start = function(){
		Neuvol = new Neuroevolution({
			population:60,
			network:[2, [2], 1],
		});
		game = new Game();
		game.start();
        
		var x = 0;

			game.update();
			game.display();
		
	}


	loadImages(sprites, function(imgs){
		images = imgs;
		start();
	})

}