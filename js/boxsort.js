

var parcelList = new Array();

var mainline = new Array();
var backline = new Array();
var outfeeds = new Array();

var transfers = [27,400,600,800,950];

var loadpos = 10;
var halfsecs = 0;

var MAINBELT_LENGTH = 1000;
var BACKBELT_LENGTH = 1000;

var OUTFEED_COUNT = 5;
var OUTFEED_LENGTH = 100;

var PARCEL_FREQUENCY = 4;

var PARCEL_SMALL = 1;
var PARCEL_MEDIUM = 2;
var PARCEL_LARGE = 3;

var LOOPTIME = 500;
var timer;


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
	document.addEventListener("keyup", keyPressed, false);

	timer = setInterval(onTimer, LOOPTIME);
}1


function keyPressed(e) {
	//alert(e.keyCode);

	switch (e.keyCode) {
		case 49 :
			alert(mainline[transfers[0]]);
			if (mainline[transfers[0]] != 0) {
				moveParcel(mainline[transfers[0]], 'out1');
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


function onTimer() {
	loadpos++;
	if (loadpos >= MAINBELT_LENGTH)
		loadpos = 0;


	if ((halfsecs % PARCEL_FREQUENCY) == 0) {

		mainline[loadpos] = newParcel(loadpos, 1, 'main');

		debug();
	}

	//outputwindow.innerHTML = mainline;

	halfsecs++;
}


function newParcel(loadpos, boxtype, belt) {
	var parcel = {pos:loadpos, type:boxtype, loc:belt};
	return parcelList.push(parcel);
}


function moveParcel(parcelid, belt) {
	
	for (i=0; i < parcelList.length; i++) {
		if (parcelList[i].pos == parcelid) {
			//alert(parcelList[i].pos);
			parcelList[i].loc = belt;

			switch (belt) {
				case 'out1' : outfeeds[0][0] = parcelid; break;
				case 'out2' : outfeeds[1][0] = parcelid; break;
				case 'out3' : outfeeds[2][0] = parcelid; break;
				case 'out4' : outfeeds[3][0] = parcelid; break;
				case 'out5' : outfeeds[4][0] = parcelid; break;
				case 'back' : backline[0] = id; break;
			}
		}
	}
}


function debug() {
	console.log('main: ' + mainline);
	//console.log('back: ' + backline);
	//console.log('outfeeds: ' + outfeeds);
	console.log(outfeeds[0]);
	console.log(parcelList);

}