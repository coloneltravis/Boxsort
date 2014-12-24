

function Transfer(id, slot, state, speed, dest) {
	this.id = id;
	this.slot = slot;
	this.state = state;
	this.speed = speed;
	this.dest = dest;
	this.redraw = 0;
	
	this.draw = function(ctx, x, y) {
		var wheels = BELT_WIDTH/6;
		var x = (SLOT_SIZE*this.slot);
	
		ctx.beginPath();

		ctx.strokeStyle = '#fff';
		ctx.clearRect(x, this.y, SLOT_SIZE-2, BELT_WIDTH-2);


		for (j=0; j<BELT_WIDTH; j+=wheels) {
			var y = this.y+j;

			ctx.moveTo(x, y);

			if (this.state == TRANSFER_MOVE) y = this.y+j+wheels;

			ctx.lineTo(x+SLOT_SIZE, y);
			ctx.stroke(); 

			this.redraw = 0;
		}
	}
}


var TRANSFER_NORMAL = 0;
var TRANSFER_MOVE = 1;


function Parcel(p) {
	this.id = p.id;
	this.type = p.type;
	this.colour = p.colour;
	this.loc = p.loc;

	this.draw = function(ctx, x, y, slotsize) {
		var slotsize23 = (slotsize/3)*2;
		var slotsize34 = (slotsize/4)*3;
		
		ctx.fillStyle = this.colour;
		ctx.strokeStyle = this.colour;
		ctx.beginPath();

		if (this.type == 1) { // rectangle
			ctx.rect(x, y, slotsize23, slotsize23);
		}
		else if (this.type == 2) { // circle
			ctx.arc(x+(slotsize/2), y+(slotsize/2), slotsize/3, 0, 2*Math.PI);
		}
		else if (this.type == 3) { // triangle
			ctx.moveTo(x+(slotsize/2), y);
			ctx.lineTo(x, y+slotsize34);
			ctx.lineTo(x+slotsize, y+slotsize34);
			ctx.lineTo(x+(slotsize/2), y);
		}

		ctx.fill();
	}
}



var parcelList = new Array();

var mainline = new Array();
var backline = new Array();
var outfeeds = new Array();
var rejectbend = new Array();
var returnbend = new Array();


//var transfers = [12,16,20,24,28];
var transfers = new Array();

var loadpos = 0;
var exitpos = 29;

var halfsecs = 0;

var MAINBELT_SLOTS = 30;
var OUTFEED_SLOTS = 12;
var BEND_SLOTS = 5;

var OUTFEED_COUNT = 5;

var PARCEL_FREQUENCY = 4;

var PARCEL_SMALL = 1;
var PARCEL_MEDIUM = 2;
var PARCEL_LARGE = 3;

var LOOPTIME = 500;
var timer;
var firstloop = 1;

var HORIZONTAL = 1, VERTICAL = 2;

var bgctx, gsctx;


function onLoad() {
	for (var i = 0; i < MAINBELT_SLOTS; i++)
		mainline[i] = 0;

	for (var i = 0; i < MAINBELT_SLOTS; i++)
		backline[i] = 0;

	for (var i = 0; i < BEND_SLOTS; i++)
		rejectbend[i] = 0;
	
	for (var i = 0; i < BEND_SLOTS; i++)
		returnbend[i] = 0;

	for (var i = 0; i < OUTFEED_COUNT; i++) {
		outfeeds[i] = new Array();
		for (var j = 0; j < OUTFEED_SLOTS; j++)
			outfeeds[i][j] = 0;
	}

	transfers[0] = new Transfer(1, 12, 0, 3, 'out1');
	transfers[1] = new Transfer(2, 16, 0, 3, 'out2');
	transfers[2] = new Transfer(3, 20, 0, 3, 'out3');
	transfers[3] = new Transfer(4, 24, 0, 3, 'out4');
	transfers[4] = new Transfer(5, 28, 0, 3, 'out5');

	var outputwindow = document.getElementById('outputwindow');
	var bg = document.getElementById('background');
	var gs = document.getElementById('gamescreen');

	bgctx = bg.getContext('2d');
	gsctx = gs.getContext('2d');

	var screenWidth = Math.floor(outputwindow.clientWidth/100)*100;

	var layoutWidth = 900;
	if (screenWidth < 900) layoutWidth = 750;

	bgctx.canvas.width = layoutWidth;
	bgctx.canvas.height = layoutWidth;
	gsctx.canvas.width = layoutWidth;
	gsctx.canvas.height = layoutWidth;

	
	SLOT_SIZE = Math.round(layoutWidth/36);
	BELT_WIDTH = Math.round(layoutWidth/30);

	//alert(SLOT_SIZE);

	MAINBELT_LENGTH = SLOT_SIZE*MAINBELT_SLOTS;
	BACKBELT_LENGTH = SLOT_SIZE*MAINBELT_SLOTS;
	OUTFEED_LENGTH = SLOT_SIZE*OUTFEED_SLOTS;

	//alert(gs.scrollWidth);

	document.addEventListener("keyup", keyPressed, false);
	document.addEventListener("click", mouseClicked, false);

	timer = setInterval(onTimer, LOOPTIME);

	drawLayout(bgctx);
}


function drawBelt(ctx, x1, y1, x2, y2, colour, orient) {

	ctx.strokeStyle = colour;
	ctx.lineWidth = 2;

	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();

	if (orient == HORIZONTAL) {
		ctx.moveTo(x1, y1+BELT_WIDTH);
		ctx.lineTo(x2, y2+BELT_WIDTH);
	}
	else {
		ctx.moveTo(x1+BELT_WIDTH, y1);
		ctx.lineTo(x2+BELT_WIDTH, y2);		
	}
		
	ctx.stroke();
}


function drawBend(ctx, x, y, width, dir) {

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
 
  ctx.beginPath();
  ctx.arc(x, y, width*2, 0.5*Math.PI, 1.5*Math.PI, dir);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(x, y, width, 0.5*Math.PI, 1.5*Math.PI, dir);
  ctx.stroke();
}


function drawTransfer(ctx, num) {

	var origin = {x:SLOT_SIZE*3, y:BELT_WIDTH*6};
	
	var wheels = BELT_WIDTH/6;
	var x = (SLOT_SIZE*transfers[num].slot);

	ctx.beginPath();

	ctx.strokeStyle = '#fff';
	ctx.clearRect(x, (BELT_WIDTH*6), SLOT_SIZE-2, BELT_WIDTH-2);


	for (j=0; j<BELT_WIDTH; j+=wheels) {

		var y = origin.y+j;

		ctx.moveTo(x, y);

		if (transfers[num].state == TRANSFER_MOVE) y = origin.y+j+wheels;

		ctx.lineTo(x+SLOT_SIZE, y);
		ctx.stroke(); 

		transfers[num].redraw = 0;
	}
}


function drawLayout(ctx) {

	var origin = {x:SLOT_SIZE*3, y:BELT_WIDTH*3};

	// back belt
	drawBelt(ctx, origin.x, origin.y, origin.x+MAINBELT_LENGTH, origin.y, '#fff', HORIZONTAL);

	// main belt
	drawBelt(ctx, origin.x, origin.y+(BELT_WIDTH*3), origin.x+MAINBELT_LENGTH, origin.y+(BELT_WIDTH*3), '#fff', HORIZONTAL);

	
	drawBend(ctx, origin.x+MAINBELT_LENGTH, origin.y+(BELT_WIDTH*2), BELT_WIDTH, 1);
	drawBend(ctx, origin.x, origin.y+(BELT_WIDTH*2), BELT_WIDTH, 0);

	// outfeeds
	for (var i=0; i<transfers.length; i++)
	  drawBelt(ctx, transfers[i].slot*SLOT_SIZE, origin.y+(BELT_WIDTH*4), transfers[i].slot*SLOT_SIZE, origin.y+(BELT_WIDTH*4)+OUTFEED_LENGTH, '#fff', VERTICAL);

	for (i=0; i<transfers.length; i++)
		//transfers[i].draw(ctx, SLOT_SIZE*3, BELT_WIDTH*6);
		drawTransfer(ctx, i);
}


function drawParcels(ctx, belt) {

	var beltwidth14 = BELT_WIDTH/4;
	var beltwidth34 = (BELT_WIDTH/4)*3;
	var beltwidth12 = BELT_WIDTH/2;
	var slotcount = MAINBELT_SLOTS;
	
	var bendPath = [{x:MAINBELT_LENGTH+(SLOT_SIZE*3),y:(BELT_WIDTH*6)},
	                {x:MAINBELT_LENGTH+(SLOT_SIZE*4)-beltwidth12,y:(BELT_WIDTH*6)},
	                {x:MAINBELT_LENGTH+(SLOT_SIZE*5)-beltwidth12,y:(BELT_WIDTH*5)},
	                {x:MAINBELT_LENGTH+(SLOT_SIZE*4),y:(BELT_WIDTH*4)},
	                {x:MAINBELT_LENGTH+(SLOT_SIZE*3),y:(BELT_WIDTH*3)}];
	
	if (belt == 'main') var startpos = {x:SLOT_SIZE*2, y:(BELT_WIDTH*6)+3};
	if (belt == 'back') var startpos = {x:SLOT_SIZE*2, y:(BELT_WIDTH*3)+3};
	if (belt == 'out1') var startpos = {x:SLOT_SIZE*transfers[0].slot, y:(BELT_WIDTH*7)+3};
	if (belt == 'out2') var startpos = {x:SLOT_SIZE*transfers[1].slot, y:(BELT_WIDTH*7)+3};
	if (belt == 'out3') var startpos = {x:SLOT_SIZE*transfers[2].slot, y:(BELT_WIDTH*7)+3};
	if (belt == 'out4') var startpos = {x:SLOT_SIZE*transfers[3].slot, y:(BELT_WIDTH*7)+3};
	if (belt == 'out5') var startpos = {x:SLOT_SIZE*transfers[4].slot, y:(BELT_WIDTH*7)+3};
	if (belt == 'rejectbend') var startpos = {x:bendPath[0].x, y:bendPath[0].y};

	if (belt.substr(0,3) == 'out')
		slotcount = OUTFEED_SLOTS;
	else if (belt == 'rejectbend')
		slotcount = BEND_SLOTS;

	for (var i=0; i<slotcount; i++) {
		if (belt == 'main') var parcel = getParcel(mainline[i]);
		if (belt == 'back') var parcel = getParcel(backline[i]);
		if (belt == 'out1') var parcel = getParcel(outfeeds[0][i]);
		if (belt == 'out2') var parcel = getParcel(outfeeds[1][i]);
		if (belt == 'out3') var parcel = getParcel(outfeeds[2][i]);
		if (belt == 'out4') var parcel = getParcel(outfeeds[3][i]);
		if (belt == 'out5') var parcel = getParcel(outfeeds[4][i]);
		if (belt == 'rejectbend') var parcel = getParcel(rejectbend[i]);
		
		if (parcel != -1) {
			var p = new Parcel(parcel);
			
			if (belt.substr(0,3) == 'out')
				p.draw(ctx, startpos.x, startpos.y+(SLOT_SIZE*i), SLOT_SIZE);
			else if (belt == 'rejectbend')
				p.draw(ctx, bendPath[i].x, bendPath[i].y, SLOT_SIZE);
			else p.draw(ctx, startpos.x+(i*SLOT_SIZE), startpos.y, SLOT_SIZE);
		}
		else {
			if (belt == 'main' || belt == 'back')
				ctx.clearRect(startpos.x+(i*SLOT_SIZE), startpos.y, SLOT_SIZE, BELT_WIDTH);
			else if (belt == 'rejectbend')
				ctx.clearRect(bendPath[i].x, bendPath[i].y, SLOT_SIZE, BELT_WIDTH);
			else ctx.clearRect(startpos.x, startpos.y+(i*SLOT_SIZE), BELT_WIDTH, SLOT_SIZE);
		}
	}
}



function keyPressed(e) {
	//alert(e.keyCode);

	switch (e.keyCode) {
		case 49 :
			transfers[0].state = TRANSFER_MOVE;
			transfers[0].redraw = 1;
		break;

		case 50 :
		  transfers[1].state = TRANSFER_MOVE;
		  transfers[1].redraw = 1;
		break;

		case 51 :
			transfers[2].state = TRANSFER_MOVE;
			transfers[2].redraw = 1;
		break;
		
		case 52 :
			transfers[3].state = TRANSFER_MOVE;
			transfers[3].redraw = 1;
		break;
		
		case 53 :
			transfers[4].state = TRANSFER_MOVE;
			transfers[4].redraw = 1;
		break;
	}
}


function mouseClicked(e) {
	console.log('mouse clicked at: ' + e.clientX + ',' + e.clientY);
}



function moveBelts() {

	// main line
	for (var i=MAINBELT_SLOTS-1; i>=0; i--) {
		if (i == MAINBELT_SLOTS-1 && mainline[i] != 0) {
			rejectbend[0] = mainline[i];
			mainline[i] = 0;
		}
		else {
		  mainline[i] = mainline[i-1];
		  mainline[i-1] = 0;
		}
	}

	
	// reject bend
	for (var i=BEND_SLOTS-1; i>=0; i--) {
		if (i == BEND_SLOTS-1 && rejectbend[i] != 0) {
			if (backline[MAINBELT_SLOTS-1] != 0) endGame();
			backline[MAINBELT_SLOTS-1] = rejectbend[i];
			rejectbend[i] = 0;
		}
		else {
 		  rejectbend[i] = rejectbend[i-1];
		  rejectbend[i-1] = 0;
		}
	}


	// back line
	for (var i=1; i<MAINBELT_SLOTS; i++) {
		if (backline[i-1] == 0 && backline[i] != 0) {
		  backline[i-1] = backline[i];
		  backline[i] = 0;
		}
	}


	// outfeeds
	for (var i=0; i<outfeeds.length; i++) {
  	  for (var j=OUTFEED_SLOTS-1; j >=0; j--) {
		if (outfeeds[i][j] == 0) {
	        outfeeds[i][j] = outfeeds[i][j-1];
	        outfeeds[i][j-1] = 0;
		}
  	  }
	}
}



function onTimer() {

	// move belts
	//drawParcels('main');
	moveBelts();	
	drawParcels(gsctx, 'main');
	drawParcels(gsctx, 'back');
	drawParcels(gsctx, 'out1');
	drawParcels(gsctx, 'out1');
	drawParcels(gsctx, 'out2');
	drawParcels(gsctx, 'out3');
	drawParcels(gsctx, 'out4');
	drawParcels(gsctx, 'out5');
	drawParcels(gsctx, 'rejectbend');

	// generate new parcel after preset 'gap'
	if ((halfsecs % PARCEL_FREQUENCY) == 0) {
		//if (firstloop) {
		  mainline[loadpos] = newParcel(loadpos, (Math.floor(Math.random()*3)+1), pickColour(), 'main');
		  firstloop = false;
		//}
		debug();
	}

	
	for (var i=0; i<transfers.length; i++) {
		if (mainline[transfers[i].slot-1] != 0 && transfers[i].state == TRANSFER_MOVE) {
			moveParcel(mainline[transfers[i].slot-1], transfers[i].dest);
			mainline[transfers[i].slot-1] = 0;
		}

		if (transfers[i].redraw) { 
			drawTransfer(bgctx, i);

			if (halfsecs % transfers[i].speed) {
			  if (transfers[i].state == TRANSFER_MOVE) {
			    transfers[i].redraw = 1;
			    transfers[i].state = TRANSFER_NORMAL;
			  }
		  }
		} 
	}

	
	//outputwindow.innerHTML = mainline;
	halfsecs++;
}


function pickColour() {
	
	switch (Math.floor(Math.random()*6)+1) {
		case 1 : return '#f00';
		case 2 : return '#0f0';
		case 3 : return '#00f';
		case 4 : return '#ff0';
		case 5 : return '#0ff';
		case 6 : return '#f0f';
		default : return '#fff';
	}
	
	return '#fff';
}



function newParcel(loadpos, boxtype, colour, belt) {
	var parcel = {id:parcelList.length+1, type:boxtype, colour:colour, loc:belt};
	return parcelList.push(parcel);
}


function getParcel(parcelid) {
	for (var i=0; i<parcelList.length; i++)
		if (parcelList[i].id == parcelid)
			return parcelList[i];

	return -1;
}


function moveParcel(parcelid, belt) {
	
	for (i=0; i < parcelList.length; i++) {
		if (parcelList[i].id == parcelid) {
			//alert(parcelList[i].id);
			parcelList[i].loc = belt;

			switch (belt) {
				case 'out1' : outfeeds[0][0] = parcelid; break;
				case 'out2' : outfeeds[1][0] = parcelid; break;
				case 'out3' : outfeeds[2][0] = parcelid; break;
				case 'out4' : outfeeds[3][0] = parcelid; break;
				case 'out5' : outfeeds[4][0] = parcelid; break;
				case 'back' : backline[MAINBELT_SLOTS-1] = parcelid; break;
			}
		}
	}
}


function endGame() {
	clearInterval(timer);
}


function debug() {
	console.log('main: ' + mainline);
	console.log('back: ' + backline);
	console.log('outfeed 1: ' + outfeeds[0]);
	console.log('outfeed 2: ' + outfeeds[1]);
	console.log('outfeed 3: ' + outfeeds[2]);
	console.log('outfeed 4: ' + outfeeds[3]);
	console.log('outfeed 5: ' + outfeeds[4]);
	console.log(transfers);
	//console.log(outfeeds333[1]);
	//console.log(parcelList);

}
