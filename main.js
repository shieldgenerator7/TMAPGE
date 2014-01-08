 //main.js

var width = 800,
height = 500,
maxPonies = 10,//the amount of ponies in the ponyArray
newPony,//the latest "unlocked" pony
mouseX, mouseY,//stored mouse coordinates
gLoop,
c = document.getElementById('c'),
ctx = c.getContext('2d');
ctx.textAlign = "center";
DIR = "Resources\\";
PONY_DIR = DIR+"Ponies\\";

var modeTime = 0;//counts the amount of time in any one gameMode
var gameMode = "title_screen";
//title_screen: showing the title and the game dev marathon logo
//chest_inactive: the chest is closed and inactive
//chest_opening: the chest lid opening animation is playing
//chest_pony_up: the pony is rising out of the chest
//chest_pony_out: the pony is out and enlarging itself on the screen (is this going to be used?)
//chest_info: the pony's name, rarity, and picture are dispalyed on the screen until a mouse click
//chest_slide: the current chest (and pony and accompanying sprites) slide off the screen to make way for a new chest
//pony_info: state showing the ponies' info
//credits: the state showing the credits (I imagine it'll have to auto scroll through the long list)

c.width = window.innerWidth;//800
c.height = window.innerHeight;//500
var desiredHeight = 1000, desiredWidth = 800;//the desired dimensions, which will be scaled down
var areaHeight = desiredHeight, areaWidth = desiredWidth;//the dimensions of the part of the canvas where the game will be drawn
var tcx = (c.width - desiredWidth)/2;//"true canvas x": the left most position of the part of the canvas we want to draw on
var canvasRatio = 1;//the ratio of desired to actual so you can scale all other images easily.

var setupCanvas = function(){//sets up the canvas dimensions 
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	areaHeight = c.height;
	areaWidth = (desiredWidth*areaHeight)/desiredHeight;//make the width proportional
	tcx = (c.width - areaWidth)/2;//set the true canvas x variable
	canvasRatio = areaHeight / desiredHeight;
}
setupCanvas();

window.onresize = setupCanvas;
document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.body.scroll = "no"; // ie only

// var centerx = function(image){//returns the x value that will draw this image in the center of the canvas (does not use tcx, uses scalex)
	// return (areaWidth - scalex(image))/2;
// }

// var centery = function(image){//returns the y value that will draw this image in the center of the canvas (does not use tcx, uses scaley)
	// return (areaHeight - scaley(image))/2;
// }

var centerX = function(width){//returns the x value that will draw this image in the center of the canvas (does not use tcx, uses scalex)
	return (desiredWidth - width)/2;
}

var centerY = function(height){//returns the y value that will draw this image in the center of the canvas (does not use tcx, uses scaley)
	return (desiredHeight - height)/2;
}

// var scalex = function(image){//returns the width that will scale this image down to fit on the canvas proportionally
	// return image.width*canvasRatio;
// }
var convertWidth = function(width){//returns the width that will scale this image down to fit on the canvas proportionally
	return width*canvasRatio;
}

var convertHeight = function(height){//returns the width that will scale this image down to fit on the canvas proportionally
	return height*canvasRatio;
}

// var scaley = function(image){//returns the height that will scale this image down to fit on the canvas proportionally
	// return image.height*canvasRatio;
// }

var scaleImage = function(image, newWidth, newHeight){
	if (newWidth != 0 || newHeight != 0){
		if (newHeight == 0){//scale the image to the new width
			newHeight = newWidth/image.width*image.height;
			//image.width = newWidth;
		}
		else if (newWidth == 0){//scale the image to the new height
			newWidth = newHeight/image.height*image.width;
			//image.height = newHeight;
		}
		//else just set the new dimensions
			image.width = newWidth;
			image.height = newHeight;
		
	}
	//else if both are zero do nothing
}

var convertXPos = function(x){
	return x * canvasRatio + tcx;
}

var convertYPos = function(y){
	return y * canvasRatio;
}

var backGroundImg = new Image();
backGroundImg.src = DIR+"background.png";
var clear = function(){
	var img = new Image();
	img.src = DIR+"background.png";

	ctx.clearRect(0, 0, c.width, c.height);
	ctx.beginPath();
	ctx.rect(tcx, 0, areaWidth, areaHeight);
	ctx.closePath();
	//ctx.drawImage(img,0,0);
	ctx.drawImage(backGroundImg,tcx,0,areaWidth, areaHeight);

	// ctx.fillStyle = 'black';
	// ctx.font="20px Arial";
	// ctx.fillText("Score: " + score,0,480);
}
var ctxfillstyle, ctxfont;
var ctxBackup = function(){
	ctxfillstyle = ctx.fillStyle;
	ctxfont = ctx.font;
}

var ctxRestore = function(){
	ctx.fillStyle = ctxfillstyle;
	ctx.font = ctxfont;
}

var drawForeGround = function(){
	var prevFillStyle = ctx.fillStyle;
	ctx.fillStyle = 'BAF1FA';
	ctx.beginPath();
	ctx.fillRect(0, 0, tcx, c.height);	
	ctx.closePath();
	ctx.beginPath();
	ctx.fillRect(tcx + areaWidth, 0, tcx, c.height);
	ctx.closePath();
	ctx.fillStyle = prevFillStyle;
}

var switchGameMode = function(mode){
	gameMode = mode;
	modeTime = 0;
	if (!playerFiring){
		playerFired = false;
	}
}
//
// This section for loading an image with the image's original width and height
//
var imgHeight;
var imgWidth;
function findHHandWW() {
	imgHeight = this.height;imgWidth = this.width;
	if (this.width > desiredWidth){
		scaleImage(this, desiredWidth-10, 0);
	}
	return true;
}

function showImage(imgPath) {
    var myImage = new Image();
    myImage.name = imgPath;
    myImage.onload = findHHandWW;
    myImage.src = imgPath;
	return myImage;
}
  /////

//makes a button that switches gameModes when clicked
function Button(text, x, y, modeTo){
	var that = this;
	that.img = new Image();
	// that.img.src = DIR+text+".png";
	// that.width = 10;//text.length + 20;
	// that.height = 5;//30;
	
	that.img = showImage(DIR+text+".png");
	that.width = imgWidth;
	that.height = imgHeight; 
	
	that.X = x;
	that.Y = y;
	that.text = text;
	that.modeTo = modeTo;
	that.mouseOver = false;
	
	//checks to see if it's been clicked
	that.checkClick = function(x, y, click){
		that.mouseOver = false;
		that.img.src = DIR+text+".png";
			if (x > convertXPos(that.X)){//mouse-button collision detection
				if (x < convertXPos(that.X + that.img.width)){
					if (y > convertYPos(that.Y)){
						if (y < convertYPos(that.Y + that.img.height)){
							if (click){
								return that.onClick();
							}
							else
								that.onMouseOver();
						}
					}
				}
			}
		return false;
	}
	//activates the button when clicked
	that.onClick = function(){
		if (that.modeTo){
			switchGameMode(that.modeTo);
		}
		return true;
	}
	//paints the button differently when moused over
	that.onMouseOver = function(){
		that.mouseOver = true;
		that.img.src = DIR+text+"_over.png";
	}
	//draws the button
	that.draw = function(){
		ctx.drawImage(that.img, convertXPos(that.X), convertYPos(that.Y), convertWidth(that.img.width), convertHeight(that.img.height));
		// ctx.strokeRect(that.X, that.Y, that.X + that.width, that.Y + that.height);
		// ctx.fillText(text, that.X + 10, that.Y + 5);
	}
}

//
// Pony
//

// function Pony(templatePony){
	// return new Pony(templatePony.name, templatePony.rarity, templatePony.description);
// }

function Pony(name,rarity,description){//Name of pony, also used for getting image
	var that = this;
	
	that.name = name;
	that.rarity = rarity;
	that.description = description;
	
	that.image = new Image();
	that.markForDeletion = false;
	
	that.index = 0;//the index number that it is in the array
	that.setIndex = function(index){
		that.index = index;
	}

	that.image = showImage(PONY_DIR+name+".png");
	that.width = imgWidth;
	that.height = imgHeight; 
	that.frames = 0;
	that.actualFrame = 0;
	that.X = 0;//Math.floor(Math.random() * (max - min + 1)) + min;
	that.Y = desiredHeight - that.image.height;//Math.floor(Math.random() * (max - min + 1)) + min;//randomize y value on initialization
	that.velX = 0;//used for moving
	that.velY = 0;
			
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	//returns the pony's index number + 1
	that.getNumber = function(){
		return that.index + 1;
	}
	// this method checks to see if this pony has been clicked on
	that.checkClick = function(x, y){
		if (!that.markForDeletion){//if pony is still alive
			if (x > that.X){//mouse-pony collision detection
				if (x < that.X + that.width){
					if (y > that.Y){
						if (y < that.Y + that.height){
								return that.onClick();//it has been clicked on, and activated
						}
					}
				}
			}
		}
		return false;//pony is not clicked on
	}
	//Carry out onClick operations, depending on game state
	that.onClick = function(){
	//returns true as default unless otherwise specified
		switch (gameMode){
			case "play": 
				that.hit(); 
				break;
			case "chooseSave": that.capture(); break;
		}
		return true;
	}
	that.getBottom = function(){//returns the bottom y value
		return that.Y + that.image.height;
	}
	// this makes the pony move based on its direction
	that.move = function(){
		that.X += that.velX;
		that.Y += that.velY;
	}
	that.slideOff = function(){
		that.velX = -10;
		that.velY = 0;
		that.move();
	}
	that.isOffScreen = function(){//only determines if off left edge
		return that.X + that.image.width < 0;
	}
	
	//Function called when hit with magic blast
	that.remove = function(){
		that.markForDeletion = true;
	}

	//that.interval = 0;
	that.draw = function(){
		if (!that.markForDeletion){
			if (that.velX == 0){
				that.X = centerX(that.image.width);
			}
			try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(that.X), convertYPos(that.Y), convertWidth(that.image.width), convertHeight(that.image.height));
				// ctx.fillStyle = 'black';
				// ctx.font="20px Arial";
				// ctx.fillText(that.getNumber(), that.X, that.Y + that.height);
			}
			catch (e) {
			};

			// if (that.interval == 4 ) {
				// if (that.actualFrame == that.frames) { 
					// that.actualFrame = 0;
				// }
				// else {
					// that.actualFrame++;
				// }
				// that.interval = 0;
			// }
			// that.interval++;	
		}
	}
	that.drawScale = function(nW, nH){//"new width", "new height"
		var newWidth = nW,
		newHeight = nH;
		if (newWidth != 0 || newHeight != 0){
			if (newHeight == 0){//scale the image to the new width
				newHeight = newWidth/that.image.width*that.image.height;
				//image.width = newWidth;
			}
			else if (newWidth == 0){//scale the image to the new height
				newWidth = newHeight/that.image.height*that.image.width;
				//image.height = newHeight;
			}
			//else just set the new dimensions
				// image.width = newWidth;
				// image.height = newHeight;
			
		}
		else {
			newWidth = that.image.width;
			newHeight = that.image.height;
		}
		if (!that.markForDeletion){
			// try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(centerX(newWidth)), convertYPos(that.Y), convertWidth(newWidth), convertHeight(newHeight));
			// }
			// catch (e) {
			// };		
		}
	}
		
	//ponyArray.push(that);
	// howManyPinkies += 1;
}


//SAVE: Adding to array
//ponyArray: the pony template array
var ponyArray = [
	new Pony("Twilight Sparkle","Rare","Ah, Twilight Sparkle... What can I say about you? Except that you are a magnificent purple unicorn with a magical cutiemark. I should probably let you get back to your homework before you start freaking out about deadlines."),
	new Pony("Pinkie Pie","Rare","Pink earth pony with balloon cutiemark"),
	new Pony("Applejack","Rare","Orange earth pony with apple cutiemark"),
	new Pony("Rainbow Dash","Rare","[description]"),
	new Pony("Rarity","Rare","[description]"),
	new Pony("Fluttershy","Rare","[description]"),
	new Pony("Apple Bloom","Rare","[description]"),
	new Pony("Sweetie Belle","Rare","[description]"),
	new Pony("Scootaloo","Rare","[description]"),
	new Pony("Babs Seed","Rare","[description]")
];
maxPonies = ponyArray.length;
for (var i = 0; i < maxPonies; i++){
	var pony = ponyArray[i];//new Pony("pinkies");//this makes new pinkies and handles adding it to the array
	pony.setIndex(i);
}
var ponyCollection = [];//the array that stores which ponies the player has obtained

var pickRandomPony = function(){
	var ri = Math.floor(Math.random() * ((maxPonies) - 0 + 1)) + 0;//"random index"
	if (ri == maxPonies){ri = Math.floor(Math.random() * ((maxPonies) - 0 + 1)) + 0; }//window.alert("ri = maxPonies!");}
	if (ponyArray[ri]){
		return new Pony(ponyArray[ri].name, ponyArray[ri].rarity, ponyArray[ri].description);
	}
	else{
		return new Pony("Unknown","Not possible","You're not supposed to be able to get this pony!");
	}
}

// var layoutPinkies = function(){
	// var maxColumns = 5;//the max amount of columns
	// var cx = 0,
	// cy = 0;//the counter variables for rows and columns
	// var padding = 10;//pading between rows and columns
	// var rowHeight = pinkieArray[0].height + padding,
	// columnWidth = pinkieArray[0].width + padding;//the dimensions of each individual row/column
	// var offsetX = (width - (maxColumns * columnWidth - padding)) / 2;
	// var offsetY = padding;
	// for (var i = 0; i < howManyPinkies; i++){
		// if (pinkieArray[i] != savedPinkie){// || howManyPinkiesAlive == 2)//don't want to reposition the saved pinkie
			// pinkieArray[i].setPosition(cx * columnWidth + offsetX, cy * rowHeight + offsetY);
		// }
		// else {//if (pinkieArray[i].X != 10){
			// pinkieArray[i].X = 10;
			// pinkieArray[i].Y = height - pinkieArray[i].height - 10;
			//ctx.fillText((height), 0, 60);
		// }
		// cx++;
		// if (cx == maxColumns){
			// cx = 0;
			// cy++;
		// }
	// }
// }

function Chest(){//Chest class
	//copied from Pony() 2013-12-22
	var that = this;
	
	that.image = new Image();
	that.frontImage = new Image();
	that.markForDeletion = false;
	
	that.image = showImage(DIR+"chest.png");
	that.width = imgWidth;
	that.height = imgHeight;
	that.frontImage = showImage(DIR+"chest.png");
	that.frames = 0;
	that.actualFrame = 0;
	that.X = 0;
	that.Y = desiredHeight/2;//position of top of front
	that.velX = 0;//used for moving
	that.velY = 0;
	that.animateOpening = false;
			
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	that.getFrontTop = function(){
		return that.Y;// + (that.width/2);//FUTURE CODE: implement this better
	}
	that.playAnimation = function(){
		that.animateOpening = true;//FUTURE CODE: use animateOpening in draw routine
	}
	that.atLastFrame = function(){
		return that.frames == that.actualFrame;
	}
	that.move = function(){
		that.X += that.velX;
		that.Y += that.velY;
	}
	that.slideOff = function(){
		that.velX = -10;
		that.velY = 0;
		that.move();
	}
	that.isOffScreen = function(){//only determines if off left edge
		return that.X + that.image.width < 0;
	}

	that.interval = 0;
	that.draw = function(){//draws the whole thing
		if (that.velX == 0){
			that.X = centerX(that.image.width);
		}
		try {
			ctx.drawImage(that.image, 
			//0, that.height * that.actualFrame, that.width, that.height, 
			convertXPos(that.X), convertYPos(that.Y - (that.image.height - that.frontImage.height)), convertWidth(that.image.width), convertHeight(that.image.height));
			// ctx.fillStyle = 'black';
			// ctx.font="20px Arial";
			// ctx.fillText(that.getNumber(), that.X, that.Y + that.height);
		}
		catch (e) {
		};
		if (that.animateOpening){
			if (that.interval == 4 ) {
				if (that.actualFrame == that.frames) { 
					// that.actualFrame = 0;
					that.animateOpening == false;
				}
				else {
					that.actualFrame++;
				}
				that.interval = 0;
			}
			that.interval++;
		}			
	}
	that.drawFront = function(){//only draws the front
		if (that.velX == 0){
			that.X = centerX(that.image.width);
		}
		try {
			ctx.drawImage(that.frontImage, 
			convertXPos(that.X), convertYPos(that.Y), convertWidth(that.frontImage.width), convertHeight(that.frontImage.height));
			}
			catch (e) {
			};
	}
}

function TextFrame(text, filename, x, y){//the class that contains the text for the pony's name, rarity, and description (but not all at once)
	var that = this;
	
	that.text = text;
	that.filename = filename;
	
	that.image = new Image();
	that.markForDeletion = false;
	
	that.image = showImage(DIR+filename+".png");
	that.width = imgWidth;
	that.height = imgHeight; 
	that.frames = 0;
	that.actualFrame = 0;
	that.X = x;//Math.floor(Math.random() * (max - min + 1)) + min;
	that.Y = y;//desiredHeight - that.image.height;//Math.floor(Math.random() * (max - min + 1)) + min;//randomize y value on initialization
	that.velX = 0;//used for moving
	that.velY = 0;
	that.centerable = true;//whether or not to allow automatic centering: true = allow, false = don't allow
	that.centerText = true;//whether or not it should align its text center
			
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	//returns the pony's index number + 1
	that.getNumber = function(){
		return that.index + 1;
	}
	// this method checks to see if this pony has been clicked on
	that.checkClick = function(x, y){
		if (!that.markForDeletion){//if pony is still alive
			if (x > that.X){//mouse-pony collision detection
				if (x < that.X + that.width){
					if (y > that.Y){
						if (y < that.Y + that.height){
								return that.onClick();//it has been clicked on, and activated
						}
					}
				}
			}
		}
		return false;//pony is not clicked on
	}
	//Carry out onClick operations, depending on game state
	that.onClick = function(){
	//returns true as default unless otherwise specified
		switch (gameMode){
			case "play": 
				that.hit(); 
				break;
			case "chooseSave": that.capture(); break;
		}
		return true;
	}
	// that.getBottom = function(){//returns the bottom y value
		// return that.Y + that.image.height;
	// }
	// this makes the pony move based on its direction
	// that.move = function(){
		// that.X += that.velX;
		// that.Y += that.velY;
	// }
	// that.slideOff = function(){
		// that.velX = -10;
		// that.velY = 0;
		// that.move();
	// }
	// that.isOffScreen = function(){//only determines if off left edge
		// return that.X + that.image.width < 0;
	// }
	
	//Function called when hit with magic blast
	// that.remove = function(){
		// that.markForDeletion = true;
	// }

	//that.interval = 0;
	that.draw = function(){
		if (!that.markForDeletion){
			if (that.centerable){
				that.X = centerX(that.image.width);
			}
			try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(that.X), convertYPos(that.Y), convertWidth(that.image.width), convertHeight(that.image.height));
				ctxBackup();
				ctx.fillStyle = 'black';
				ctx.font="40px Arial";
				//ctx.fillText(that.text, convertXPos(that.X + 20), convertYPos(that.Y + 20), convertWidth(that.image.width*2),convertHeight(40));//that.text
				wrapText(ctx, that.text, that.X + 20, that.Y + 60 + 10, that.image.width-40, 80, that.centerText);
				ctxRestore();
			}
			catch (e) {
			};

			// if (that.interval == 4 ) {
				// if (that.actualFrame == that.frames) { 
					// that.actualFrame = 0;
				// }
				// else {
					// that.actualFrame++;
				// }
				// that.interval = 0;
			// }
			// that.interval++;	
		}
	}
	that.drawScale = function(nW, nH){//"new width", "new height"
		var newWidth = nW,
		newHeight = nH;
		if (newWidth != 0 || newHeight != 0){
			if (newHeight == 0){//scale the image to the new width
				newHeight = newWidth/that.image.width*that.image.height;
				//image.width = newWidth;
			}
			else if (newWidth == 0){//scale the image to the new height
				newWidth = newHeight/that.image.height*that.image.width;
				//image.height = newHeight;
			}
			//else just set the new dimensions
				// image.width = newWidth;
				// image.height = newHeight;
			
		}
		else {
			newWidth = that.image.width;
			newHeight = that.image.height;
		}
		if (!that.markForDeletion){
			// try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				convertXPos(centerX(newWidth)), convertYPos(that.Y), convertWidth(newWidth), convertHeight(newHeight));
			// }
			// catch (e) {
			// };		
		}
	}
		
	//ponyArray.push(that);
	// howManyPinkies += 1;
}

function wrapText(context, text, x, y, maxWidth, lineHeight, centerText) {
		//copied from Colin Wiseman (http://stackoverflow.com/questions/5026961/html5-canvas-ctx-filltext-wont-do-line-breaks) on 1-6-2013
		//modified 1-6-2013
        var cars = text.split("\n");

        for (var ii = 0; ii < cars.length; ii++) {

            var line = "";
            var words = cars[ii].split(" ");

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;

                if (testWidth > convertWidth(maxWidth-10)) {
					if (!centerText){context.fillText(line.trim(), convertXPos(x), convertYPos(y));}
                    else{context.fillText(line.trim(), convertXPos(x+ ((maxWidth - (testWidth/canvasRatio)) / 2)), convertYPos(y));}
                    line = words[n] + " ";
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }

			if (!centerText){context.fillText(line.trim(), convertXPos(x), convertYPos(y));}
			else{context.fillText(line.trim(), convertXPos(x+ ((maxWidth - (testWidth/canvasRatio)) / 2)), convertYPos(y));}
            // context.fillText(line.trim(), convertXPos(x), convertYPos(y));//TEST CODE
            // context.fillText(line.trim(), convertXPos(centerX(testWidth/canvasRatio)), convertYPos(y));//x+ ((maxWidth - (testWidth/canvasRatio)) / 2)), convertYPos(y));
            y += lineHeight;
        }
     }


/*
	that.draw = function(){
			try {
				ctx.strokeStyle = "#E1004D";
				ctx.lineWidth = 10;
				ctx.moveTo(that.X, that.Y);
				ctx.lineTo(that.destX, that.destY);
				ctx.stroke();
				ctx.strokeStyle = "#F792FD";//E1004D
				ctx.lineWidth = 7;
				ctx.moveTo(that.X, that.Y);
				ctx.lineTo(that.destX, that.destY);
				ctx.stroke();
				//ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
			}
			catch (e) {
			};	
	}

}
var laser = new Laser();*/

//Brad: begin code for firing sound, taken from http://www.javascriptkit.com/script/script2/soundlink.shtml
// var html5_audiotypes={
// "wav": "audio/wav"
// }

// function createsoundbite(sound){
// var html5audio=document.createElement('audio')
// if (html5audio.canPlayType){ //check support for HTML5 audio
// for (var i=0; i<arguments.length; i++){
// var sourceel=document.createElement('source')
// sourceel.setAttribute('src', arguments[i])
// if (arguments[i].match(/\.(\w+)$/i))
// sourceel.setAttribute('type', html5_audiotypes[RegExp.$1])
// html5audio.appendChild(sourceel)
// }
// html5audio.load()
// html5audio.playclip=function(){
// html5audio.pause()
// html5audio.currentTime=0
// html5audio.play()
// }
// return html5audio
// }
// else{
// return {playclip:function(){throw new Error("Your browser doesn't support HTML5 audio. Try using Google Chrome!")}}
// }
// }
// var railgunsound=createsoundbite("railgun_sound.wav");
//Brad: end code for railgun sound

// document.addEventListener('keydown', function(event) {
    // if(event.keyCode == 40) {
		// Movin' on up...
		// yPos = yPos + 5;
        // player.setPosition(15, yPos);
    // }
    // else if(event.keyCode == 38) {
		// Goin' down...
		// yPos = yPos - 5;
        // player.setPosition(15, yPos);
    // }
// });

c.addEventListener('mousemove', function(e){
		mouseX = e.pageX;
		mouseY = e.pageY;
});

//making the payer shoot
var playerFiring = false;//this says whether or not the player is firing
var playerFired = false;//if the player has taken a shot already, is meant to keep one click from taking out multiple pinkies
document.addEventListener('mousedown', function(e){
		playerFiring = true;
		// player.fire();
		// railgunsound.playclip(); //Brad: code to play railgun sound
});

document.addEventListener('mouseup', function(e){
		playerFiring = false;
		playerFired = false;
		// player.fire();
		// railgunsound.playclip(); //Brad: code to play railgun sound
});
c.addEventListener('touchmove', function(e){		
		e.preventDefault();
		mouseX = e.changedTouches[0].pageX;
		mouseY = e.changedTouches[0].pageY;
		playerFiring = true;
}, false);
c.addEventListener('touchstart', function(e){
		e.preventDefault();
		playerFiring = true;
		mouseX = e.changedTouches[0].pageX;
		mouseY = e.changedTouches[0].pageY;
		if (gameMode == "play"){
			hitsAttempted += 1;
		}	
}, false);

c.addEventListener('touchend', function(e){
		e.preventDefault();
		playerFiring = false;
		playerFired = false;
}, false);

//sets all the necessary variables to their initial values
function setUp(){
	//Ponies
	for (var i = 0; i < maxPonies; i++){
		var pony = ponyArray[i];//new Pinkie();//this makes new pinkies and handles adding it to the array
		pony.markForDeletion = false;
		pony.index = i;
	}
	numberText = 0;
	//Player
	playerFiring = false;
	playerFired = false;
}

var GameLoop = function(){
	// var play = true;
	// if (gameMode == "results")play = false;
	clear();
	switch(gameMode){
		case "title_screen": title_screen(); break;
		case "chest_inactive": chest_inactive(); break;
		case "chest_opening": chest_opening(); break;
		case "chest_pony_up": chest_pony_up(); break;
		case "chest_pony_out": chest_pony_out(); break;
		case "chest_info": chest_info(); break;
		case "chest_slide": chest_slide(); break;
		case "pony_info": pony_info(); break;
		case "credits": credits(); break;
	}
	modeTime += 1;
	gLoop = setTimeout(GameLoop, 1000 / 500);
	ctx.fillText("("+mouseX+", "+mouseY+") "+playerFiring,areaWidth-100+tcx,20);
	ctx.fillText(gameMode,areaWidth-100+tcx,40);
	ctx.fillText((cpi+1)+" / "+ponyCollection.length,areaWidth-100+tcx,60);
	drawForeGround();
}

	//SAVE: scrolling background
	// var pinkies = new Image();
	// pinkies.src = DIR+"pinkies.png";
	// var psScrollY = 0;//used for scrolling the background
	var ponp = new Image();
	ponp.src = DIR+"tmapge.png";//w:398 //Math.random(width - 100 + 100 + 1) + 100, Math.random(height - 100 + 100 + 1) + 100
	var logo = new Image();
	logo.src = DIR+"logo.png";
	logo.onload = function(){scaleImage(logo, desiredWidth-10, 0);};
function title_screen(){//title screen
	ctx.drawImage(ponp, convertXPos(centerX(ponp.width)), 0, convertWidth(ponp.width),convertHeight(ponp.height));
	ctx.drawImage(logo, convertXPos(centerX(logo.width)), convertYPos(desiredHeight - logo.height - 10), convertWidth(logo.width), convertHeight(logo.height));
	var btnPlay = new Button("button_clear", 0, 0, "chest_inactive");
	// var btnCredits = new Button("credits", width/2, height/2 + 50, "credits");
	// var btnInfo = new Button("howToPlay", 200, 200, "info");
	if (btnPlay.checkClick(mouseX, mouseY, playerFiring)){
		setUp();
	}
	// else if (btnCredits.checkClick(mouseX, mouseY, playerFiring)){
	// }
	// else if (btnInfo.checkClick(mouseX, mouseY, playerFiring)){
	// }
	
	btnPlay.draw();
	// btnCredits.draw();
	// btnInfo.draw();
	ctx.fillText("#MLGDMarathon December 2013", 10 + tcx, areaHeight - 10);
}
var chest = new Chest();
function chest_inactive(){
	btnOpen = new Button ("button_clear",chest.X,chest.Y,"chest_opening");
	btnPony = new Button ("button_pony",0,0,"pony_info");
	if (btnOpen.checkClick(mouseX, mouseY, playerFiring)){
		chest.playAnimation();//tells the chest to start playing the animation
	}
	else if (btnPony.checkClick(mouseX, mouseY, playerFiring) && !playerFired){
		playerFired = true;
		setUpPonyInfo();
	}
	btnOpen.draw();//this button doesn't appear on screen, it's just an overlay
	btnPony.draw();
	chest.draw();//draw the whole chest
};
function chest_opening(){
	if (modeTime == 50){//chest.atLastFrame()){
		switchGameMode("chest_pony_up");
		newPony = pickRandomPony();//sets newPony to a new instance of a randomly chosen pony
		newPony.velY = -5;
	}
	chest.draw();
};
function chest_pony_up(){//he pony moving up out of the chest
	newPony.velY -= 0.25;
	newPony.move();
	if (newPony.getBottom() <= chest.getFrontTop()){
		newPony.velY = 0;
		pw = 500;
		pwv = 1;
		switchGameMode("chest_pony_out");
	}
	chest.draw();
	newPony.draw();
	chest.drawFront();
};
// var pimg = new Image();
// pimg.src = PONY_DIR+ponyArray[1].name+".png";
// pimg.onload = function(){scaleImage(pimg, desiredWidth-10, 0);};
var pw = 500,
pwv = 1;//how much to increment pw by
function chest_pony_out(){
	chest.draw();
	//newPony.X = 0;
	//newPony.Y = 0;
	if (newPony.Y < 0){//centerY(newPony.image.height)){
		newPony.velY = 5;
		newPony.move();
	}
	newPony.drawScale(pw,0);
	pw += pwv;
	pwv += 0.125;
	//scaleImage(newPony.image, pw, 0);
	if (pw >= desiredWidth - 50){
		scaleImage(newPony.image,pw,0);
		ponyCollection.push(newPony);
		titleFrame = new TextFrame(newPony.name, "titleFrame", 0, 0);
		descFrame = new TextFrame(newPony.description, "descFrame", 0, desiredHeight/2);
		descFrame.centerText = false;
		rareFrame = new TextFrame(newPony.rarity, "titleFrame", 0, 150);
		switchGameMode("chest_info");
	}
	//pimg = newPony.image;
	//ctx.drawImage(pimg, tcx+centerx(pimg), areaHeight - scaley(pimg) - 10, scalex(pimg), scaley(pimg));
};
var titleFrame, descFrame, rareFrame;
function chest_info(){
	chest.draw();
	btnNext = new Button ("button_clear",chest.X,chest.Y,"chest_slide");
	if (btnNext.checkClick(mouseX, mouseY, playerFiring)){
		newChest = new Chest();
		newChest.X = desiredWidth + 10;//start it off screen
	}
	if (newPony.Y < 0){//centerY(newPony.image.height)){
		newPony.velY = 1;
		newPony.move();
	}
	btnNext.draw();
	newPony.draw();
	titleFrame.draw();
	descFrame.draw();
	rareFrame.draw();
};
var newChest = new Chest();
function chest_slide(){
	chest.slideOff();
	newPony.slideOff();
	newChest.slideOff();
	if (chest.isOffScreen() && newPony.isOffScreen()){
		setUp();
		chest = newChest;
		chest.velX = 0;
		switchGameMode("chest_inactive");
	}
	chest.draw();
	newPony.draw();
	newChest.draw();
};
function setUpPonyInfo(){
	cpi = ponyCollection.length - 1;
}
var cpi = 0;//"current pony index"
function pony_info(){
	var currentPony = ponyCollection[cpi];
	currentPony.X = centerX(currentPony.image.width);
	currentPony.draw();
	btnLeft = new Button ("button_clear",0,desiredHeight/2,0);
	btnRight = new Button ("button_clear",desiredWidth - 50,desiredHeight/2,0);
	//the following two controls may seem switched, but that's just to create the illusion that the newest pony is the first in the list (when internally it's the last)
	if (btnLeft.checkClick(mouseX, mouseY, playerFiring) && !playerFired){
		cpi += 1;
		playerFired = true;
	}
	else if (btnRight.checkClick(mouseX, mouseY, playerFiring) && !playerFired){
		cpi -= 1;
		playerFired = true;
	}
	if (cpi < 0){
		cpi = 0;
	}
	if (cpi > ponyCollection.length - 1){
		cpi = ponyCollection.length - 1;
	}
	btnLeft.draw();
	btnRight.draw();
	btnChest = new Button("button_clear",0,0,"chest_inactive");
	if (btnChest.checkClick(mouseX,mouseY,playerFiring) && !playerFired){
		playerFired = true;
	}
	btnChest.draw();
};
// var creditsImg = new Image();
// creditsImg.src = DIR+"creditPage.png";
var logoImg = new Image();
logoImg.src = DIR+"logo.png";
function credits(){//FUTURE CODE: need to make this text instead of image and have it scroll
	// ctx.fillText("\"PINKIE OR NOT PINKIE\"\nshieldgenerator7\n\nWith vectors from\n\n"
	// +"Based on\nMy Little Pony: Friendship is Magic\nSeason 3 Episode 3: \"Too Many Pinkies\"",100,100);
	// ctx.drawImage(creditsImg, 10, 10, width - 20, height - 70);
	ctx.drawImage(logoImg, 442, 37, 317, 160);
	var mainMenu = new Button("main_menu", 10, height-50-9, "title_screen");
	if (mainMenu.checkClick(mouseX, mouseY, playerFiring)){
		//switchGame
	}
	mainMenu.draw();
	ctx.font = "30px";
	ctx.fillStyle = "#EE4F91";
	ctx.fillText("Praise the Lord!  /)",width/2 - 50, 19);
}

////
//// OLD PONP STATE METHODS
////

// var infoImage = new Image();
// infoImage.src = DIR+"instructions.png";
// function info(){
	// ctx.drawImage(infoImage, 0,0, width, height);
	// var btnOpen = new Button("main_menu", width/2 - 50, height - 50 - 10, "open");
	// if (btnOpen.checkClick(mouseX, mouseY, playerFiring)){
	// }
	// btnOpen.draw();
// }

// var distracted = -1;
// function play(){
		// if (hitPinkies - hitPinkieCheckPoint >= hitPinkieAllowedGap){// || howManyPinkiesAlive <= 2){
			// switchGameMode("transToSave");
			// hitPinkieCheckPoint = hitPinkies;
			// //alert("going into chooseSAVE");//TEST CODE
		// }
		// if (gameMode == "chooseSave" || howManyPinkiesAlive == 2){
			// layoutPinkies();
			// if (distracted < 0){//if distract button has not been clicked yet
				// var btnDistract = new Button("distract", 10, 200, 0);
				// btnDistract.draw();
				// if (btnDistract.checkClick(mouseX, mouseY, playerFiring)){
					// playerFired = true;//in chooseSave, you can only distract once for 5 seconds
					// distracted = 50;
					// for (var i = 0; i < howManyPinkies; i++){
						// if (!pinkieArray[i].markForDeletion){
								// pinkieArray[i].setDistracted();
						// }
					// }
					// // distracted = true;
				// }
			// }
			// else if (distracted > 0){//else if Pinkies are still distracted
				// for (var i = 0; i < howManyPinkies; i++){
						// if (!pinkieArray[i].markForDeletion){
								// pinkieArray[i].distract();
						// }
				// }
				// distracted -= 1;
			// }
			// //else if not distracted
		// }
		
		// if (howManyPinkiesAlive == 2)savedPinkie = 0;
		
		// if (playerFiring){
			// if (!playerFired){
				// player.fire();
				// playerFired = true;
			// }
			// if (gameMode=="play")laser.draw();
		// }
		// else {
			// playerFired = false;
		// }	
		
		
		// for (var i = 0; i < howManyPinkies; i++){
			// if (howManyPinkiesAlive > 2)pinkieArray[i].move();//TEMPORARY OMISSION
			// pinkieArray[i].draw();			
			 // // if (pinkieArray[i].markForDeletion){
				// // pinkieArray.splice(i,1);
				// // howManyPinkies -= 1;
			 // // }
		// }
		
		// player.draw();
		
		// crossHair.setPosition(mouseX, mouseY);
		// crossHair.draw();
		
		// //ctx.fillText(howManyPinkies, 0, 20);//TEST CODE
		// ctx.fillText("Hits: "+hits, 0, 20);
		// ctx.fillText("Clicks: "+hitsAttempted, 0, 40);
		
		// if (savedPinkie){
			// var shieldImg = new Image();
			// shieldImg.src = DIR+"shield.png";
			// ctx.drawImage(shieldImg, 0, height-shieldImg.height);
		// }
// }

// var transToSaveImage = new Image();
// transToSaveImage.src = DIR+"order!_original.png";
// var sitDownImg = new Image();
// sitDownImg.src = DIR+"sitDown.png";
// function transToSave(){
	// ctx.drawImage(transToSaveImage, 0,0, width, height);
	// if (modeTime >= 50){
		// switchGameMode("chooseSave");
	// }
	// var rx = Math.random()*(5)-2;
	// ctx.drawImage(sitDownImg, 10+rx, 10+rx, 300, 200);
// }

// var lastTwoImage = new Image();
// lastTwoImage.src = DIR+"lastTwo.png";
// var lastTwoTextImg = new Image();
// lastTwoTextImg.src = DIR+"lastTwoText.png";
// function lastTwo(){
	// ctx.drawImage(lastTwoImage, 0,0, width, height);
	// if (modeTime >= 100){
		// switchGameMode("play");
	// }
	// var rx = Math.random()*(5)-2;
	// ctx.drawImage(lastTwoTextImg, 270+rx, 50+rx, 300, 200);
// }

// //gameOver function to be fleshed out later
// var numberText = 0;
// function results(){
	// // var go = new Image();
	// // go.src = "gameoverman_gameover.png"
	// // ctx.drawImage(go,0,0);
	// //clear();//already called in GameLoop()
	// var cx = 200,
		// cy = 200,
		// cw = 333,
		// ch = 100;
	
	// ctx.fillStyle = "#FFFFFF";
	// ctx.fillRect(cx-10,cy-10,cw+20,ch+20);
	// ctx.fillStyle = "#EE4F91";
	// ctx.fillRect(cx-1,cy,cw+2,ch+2);
	
	// ctx.fillStyle = "#F7B8CB";
	// var percentage = Math.floor((hits * 80) / hitsAttempted);
	// ctx.fillText("Hits: "+hits, cx, cy+20);
	// ctx.fillText("Clicks: "+hitsAttempted, cx, cy+40);
	// ctx.fillText("Accuracy: "+percentage+"%", cx, cy+60);
	// var guessingSkills = 0;
	// if (realPinkieDeath){
		// //ctx.fillText("You killed Pinkie on the ?01 hit",0,80);
		// if (!numberText){
			// // var numberText = "th";
			// switch(realPinkieDeath){
				// case 21:
				// case 1: numberText = "st"; break;
				// case 22:
				// case 2: numberText = "nd"; break;
				// case 23:
				// case 3: numberText = "rd"; break;
				// default: numberText = "th";
			// }
		// }
		// ctx.fillText("You killed Pinkie (#"+realPinkie.getNumber()+") on the "+realPinkieDeath+numberText+" hit",cx,cy+80);
		// guessingSkills = (realPinkieDeath * 100)/maxPinkies;
		// //ctx.fillText("You killed Pinkie on the ?02 hit",0,80);
	// }
	// else{
		// ctx.fillText("You saved Pinkie! (#"+realPinkie.getNumber()+")",cx,cy+80);
		// ctx.fillText("#PinkieSecretService",cx,cy+130);
		// guessingSkills = 100;
	// }
	// ctx.fillText("Guessing Skills: "+guessingSkills+"%",cx,cy+100);
	
	// var mainMenu = new Button("main_menu", 10, height/2, "open");//width/2
	// var btnCredits = new Button("credits", 10, height/2 + 50, "credits");//,width/2
	// if (mainMenu.checkClick(mouseX, mouseY, playerFiring)){
		// //switchGame
	// }
	// else if (btnCredits.checkClick(mouseX, mouseY, playerFiring)){
	// }
	// mainMenu.draw();
	// btnCredits.draw();
// }

////
//// End of old ponp state methods
////

//setUp();

GameLoop();