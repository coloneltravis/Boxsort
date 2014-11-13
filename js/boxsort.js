

var parcelList = new Array();

var mainline = new Array();
var backline = new Array();
var outfeeds = new Array();

var transfers = [150,400,600,800,950];
var loadpos = 10;
var exitpos = 990;

var halfsecs = 0;

var BELT_WIDTH = 50;

var MAINBELT_LENGTH = 1000;
var BACKBELT_LENGTH = 1000;

var OUTFEED_COUNT = 5;
var OUTFEED_LENGTH = 100;

var PARCEL_FREQUENCY = 10;

var PARCEL_SMALL = 1;
var PARCEL_MEDIUM = 2;
var PARCEL_LARGE = 3;

var LOOPTIME = 500;
var timer;

var HORIZONTAL = 1, VERTICAL = 2;

var ctx;


function onLoad() {
	for (var i = 0; i < MAINBELT_LENGTH; i++)
		mainline[i] = "0";

	for (var i = 0; i < BACKBELT_LENGTH; i++)
		backline[i] = "0";

	for (var i = 0; i < OUTFEED_COUNT; i++) {
		outfeeds[i] = new Array();
		for (var j = 0; j < OUTFEED_LENGTH; j++)
			outfeeds[j] = "0";
	}


	var outputwindow = document.getElementById('outputwindow');
	var gs = document.getElementById('gamescreen');
	ctx = gs.getContext('2d');

	alert(gs.scrollWidth);
	
	document.addEventListener("keyup", keyPressed, false);

	timer = setInterval(onTimer, LOOPTIME);
	
	drawLayout();
}


function drawBelt(x1, y1, x2, y2, colour) {


	ctx.strokeStyle = colour;

	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();

	ctx.moveTo(x1, y1+BELT_WIDTH);
	ctx.lineTo(x2, y2+BELT_WIDTH);
	ctx.stroke();
}


function drawLayout() {

	drawBelt(30, 10, 800, 10, '#f00', HORIZONTAL);
}


function keyPressed(e) {
	//alert(e.keyCode);

	switch (e.keyCode) {
		case 49 :
			//alert(mainline[transfers[0]]);
			if (mainline[transfers[0]] != 0) {
				moveParcel(mainline[transfers[0]], 'out1');
				mainline[transfers[0]] = 0;
			}
		break;

		case 50 : mainline[transfers[1]];
		if (mainline[transfers[1]] != 0) {
			moveParcel(mainline[transfers[1]], 'out2');
		}
		break;

		case 51 : mainline[transfers[2]];
		if (mainline[transfers[2]] != 0) {
			moveParcel(mainline[transfers[2]], 'out3');
		}
		break;
		
		case 52 : mainline[transfers[3]];
		if (mainline[transfers[3]] != 0) {
			moveParcel(mainline[transfers[3]], 'out4');
		}
		break;
		
		case 53 : mainline[transfers[4]];
		if (mainline[transfers[4]] != 0) {
			moveParcel(mainline[transfers[4]], 'out5');
		}
		break;
	}
}


function moveTransfers() {

	for (var i=0; i<transfers.length; i++) {
		transfers[i]--;
		if (transfers[i] < 0) transfers[i] = MAINBELT_LENGTH-1;
	}
}



function onTimer() {

	// move load/scan position
	loadpos--;
	if (loadpos < 0) loadpos = MAINBELT_LENGTH-1;

	// move exit position
	exitpos--;
	if (exitpos < 0) exitpos = MAINBELT_LENGTH-1;
	
	// move transfers
	moveTransfers();
	
	// generate new parcel after preset 'gap'
	if ((halfsecs % PARCEL_FREQUENCY) == 0) {
		mainline[loadpos] = newParcel(loadpos, 1, 'main');
		debug();
	}

	// when parcels reach end of main line, move them to the back line
	if (mainline[exitpos] != 0) {
		moveParcel(mainline[exitpos], 'back');
	}

	//outputwindow.innerHTML = mainline;
	halfsecs++;
}


function newParcel(loadpos, boxtype, belt) {
	var parcel = {id:parcelList.length+1, type:boxtype, loc:belt};
	return parcelList.push(parcel);
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