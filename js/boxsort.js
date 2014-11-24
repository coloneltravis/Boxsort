

function Transfer(id, slot, state, speed) {
	this.id = id;
	this.slot = slot;
	this.state = state;
	this.speed = speed;
}

var TRANSFER_NORMAL = 0;
var TRANSFER_MOVE = 1;


var parcelList = new Array();

var mainline = new Array();
var backline = new Array();
var outfeeds = new Array();

//var transfers = [12,16,20,24,28];
var transfers = new Array();

var loadpos = 0;
var exitpos = 29;

var halfsecs = 0;

var MAINBELT_SLOTS = 30;
var OUTFEED_SLOTS = 12;

var SLOT_SIZE = 30;
var BELT_WIDTH = 30;

var MAINBELT_LENGTH = MAINBELT_SLOTS * SLOT_SIZE;
var BACKBELT_LENGTH = MAINBELT_SLOTS * SLOT_SIZE; 

var OUTFEED_COUNT = 5;
var OUTFEED_LENGTH = 100;

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

	for (var i = 0; i < OUTFEED_COUNT; i++) {
		outfeeds[i] = new Array();
		for (var j = 0; j < OUTFEED_SLOTS; j++)
			outfeeds[j] = 0;
	}

	transfers[0] = new Transfer(1, 12, 0, 3);
	transfers[1] = new Transfer(2, 16, 0, 3);
	transfers[2] = new Transfer(3, 20, 0, 3);
	transfers[3] = new Transfer(4, 24, 0, 3);
	transfers[4] = new Transfer(5, 28, 0, 3);

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

	
	SLOT_SIZE = layoutWidth/30;
	BELT_WIDTH = layoutWidth/24;

	//alert(SLOT_SIZE);

	MAINBELT_LENGTH = SLOT_SIZE*30;
	BACKBELT_LENGTH = SLOT_SIZE*30;


	OUTFEED_LENGTH = SLOT_SIZE * OUTFEED_SLOTS;

	//alert(gs.scrollWidth);

	document.addEventListener("keyup", keyPressed, false);

	timer = setInterval(onTimer, LOOPTIME);

	drawLayout(bgctx);
}


function drawBelt(ctx, x1, y1, x2, y2, colour, orient) {

	ctx.strokeStyle = colour;

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


function drawTransfer(ctx, num) {

	var wheels = BELT_WIDTH/6;
	var x = (SLOT_SIZE*transfers[num].slot);

	ctx.strokeStyle = '#fff';
	ctx.fillStyle = '#000';

	ctx.clearRect(x, (BELT_WIDTH*6), SLOT_SIZE, BELT_WIDTH);

	for (j=0; j<BELT_WIDTH; j+=wheels) {

		var y = (BELT_WIDTH*6)+j;

		ctx.moveTo(x, y);

		if (transfers[num].state == TRANSFER_MOVE) y = (BELT_WIDTH*6)+j+wheels;
		ctx.lineTo(x+SLOT_SIZE, y);
		ctx.stroke();
	}
}


function drawLayout(ctx) {

	var origin = {x:SLOT_SIZE*2, y:BELT_WIDTH*3};

	// back belt
	drawBelt(ctx, origin.x, origin.y, origin.x+MAINBELT_LENGTH, origin.y, '#fff', HORIZONTAL);

	// main belt
	drawBelt(ctx, origin.x, origin.y+(BELT_WIDTH*3), origin.x+MAINBELT_LENGTH, origin.y+(BELT_WIDTH*3), '#fff', HORIZONTAL);
	
	// outfeeds
	for (var i=0; i<transfers.length; i++)
	  drawBelt(ctx, transfers[i].slot*SLOT_SIZE, origin.y+(BELT_WIDTH*4), transfers[i].slot*SLOT_SIZE, origin.y+(BELT_WIDTH*4)+OUTFEED_LENGTH, '#fff', VERTICAL);

	for (i=0; i<transfers.length; i++)
		drawTransfer(ctx, i);
}


function drawParcels(ctx, belt) {

	var beltwidth14 = BELT_WIDTH/4;
	var beltwidth34 = (BELT_WIDTH/4)*3;
	var beltwidth12 = BELT_WIDTH/2;

	var startpos = {x:SLOT_SIZE*2, y:(BELT_WIDTH*6)+3};
	
	for (var i=0; i<MAINBELT_SLOTS; i++) {
		
		var parcel = getParcel(mainline[i]);
		
		if (parcel != -1) {
		
		//if (mainline[i] != 0 && mainline[i] != '') {
			ctx.fillStyle = parcel.colour;
			ctx.strokeStyle = parcel.colour;
			ctx.beginPath();

			if (parcel.type == 1) { // rectangle
				ctx.rect(startpos.x+(i*SLOT_SIZE), startpos.y, (SLOT_SIZE/3)*2, (BELT_WIDTH/3)*2);
			}
			else if (parcel.type == 2) { // circle
				ctx.arc( startpos.x+(i*SLOT_SIZE)+(SLOT_SIZE/2), startpos.y+(SLOT_SIZE/2), SLOT_SIZE/3, 0, 2*Math.PI);
			}
			else if (parcel.type == 3) { // triangle
				ctx.moveTo(startpos.x+(i*SLOT_SIZE)+(SLOT_SIZE/2), startpos.y);
				ctx.lineTo(startpos.x+(i*SLOT_SIZE), startpos.y+beltwidth34);
				ctx.lineTo(startpos.x+(i*SLOT_SIZE)+SLOT_SIZE, startpos.y+beltwidth34);
				ctx.lineTo(startpos.x+(i*SLOT_SIZE)+(SLOT_SIZE/2), startpos.y);
			}

			ctx.fill();
		}
		else {
			ctx.clearRect(startpos.x+(i*SLOT_SIZE), startpos.y, SLOT_SIZE, BELT_WIDTH-4);
		}
	}
}



function keyPressed(e) {
	//alert(e.keyCode);

	switch (e.keyCode) {
		case 49 :
			transfers[0].state = TRANSFER_MOVE;
			if (mainline[transfers[0].slot] != 0) {
				moveParcel(mainline[transfers[0].slot], 'out1');
				mainline[transfers[0].slot] = 0;
			}
		break;

		case 50 :
		  transfers[1].state = TRANSFER_MOVE;
		  if (mainline[transfers[1].slot] != 0) {
		    moveParcel(mainline[transfers[1].slot], 'out2');
		  }
		break;

		case 51 :
			transfers[2].state = TRANSFER_MOVE;
		if (mainline[transfers[2].slot] != 0) {
			moveParcel(mainline[transfers[2].slot], 'out3');
		}
		break;
		
		case 52 :
			transfers[3].state = TRANSFER_MOVE;
		if (mainline[transfers[3].slot] != 0) {
			moveParcel(mainline[transfers[3].slot], 'out4');
		}
		break;
		
		case 53 :
			transfers[4].state = TRANSFER_MOVE;
		    if (mainline[transfers[4].slot] != 0) {
			  moveParcel(mainline[transfers[4].slot], 'out5');
		    }
		break;
	}
}


function moveBelts() {

	for (var i=MAINBELT_SLOTS-1; i>=0; i--) {
		if (i == MAINBELT_SLOTS-1) {
			backline[0] = mainline[i];
			mainline[i] = 0;
		}
		else {
		  var temp = mainline[i];
		  mainline[i] = mainline[i-1];
		  mainline[i-1] = temp;
		}
	}


	//for (var i=0; i<=MAINBELT_SLOTS; i++) {
	//  backline[i] = backline[i+1];
	//}


}



function onTimer() {

	// move belts
	//drawParcels('main');
	moveBelts();	
	drawParcels(gsctx, 'main');

	// generate new parcel after preset 'gap'
	if ((halfsecs % PARCEL_FREQUENCY) == 0) {
		//if (firstloop) {
		  mainline[loadpos] = newParcel(loadpos, (Math.floor(Math.random()*3)+1), pickColour(), 'main');
		  firstloop = false;
		//}
		debug();
	}

	
	// when parcels reach end of main line, move them to the back line
	if (mainline[exitpos] != 0) {
		moveParcel(mainline[exitpos], 'back');
	}

	
	for (i=0; i<transfers.length; i++) {
		if (halfsecs % transfers[i].speed) {
			drawTransfer(bgctx, i);
			transfers[i].state = TRANSFER_NORMAL;
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
				case 'back' : backline[0] = parcelid; break;
			}
		}
	}
}


function debug() {
	console.log('main: ' + mainline);
	//console.log('back: ' + backline);
	//console.log('outfeeds: ' + outfeeds);
	console.log(transfers);
	console.log(outfeeds[0]);
	console.log(parcelList);

}
