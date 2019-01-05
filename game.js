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



var Neuvol;


var game;
var FPS = 60;
var maxScore=0;

var images = {};

var speed = function(fps){
	FPS = parseInt(fps);
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
	this.jump = -6; 

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