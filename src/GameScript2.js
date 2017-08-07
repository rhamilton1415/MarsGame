/**
 * Interactive Weather Demo
 * by Sam Frederick Collier
 * Copyright (c) 2011 
 * All rights reserved.
 * Resdistrubtion is allowed providing this Banner is kept. 
 */

/*** Game Context ***/
var canvas;
var ctx;
/*** Key Input ***/
var keys =[0,0,0];
var dateObject = new Date();
 
/*** img ***/
var image = [];
/*** TEMPS DELETE LATER ***/
const PI = 3.141592653589793;
const SKY_COLOUR_FADE = 2.5;
const SUN_ANGLE_RANGE_MIN = 0;
const SUN_ANGLE_RANGE_MAX = 6;
const HOUR_TO_ANGLE = 15;
const MIN_TO_ANGLE  = 0.25;
const SEC_TO_ANGLE  = 0.0041666666666667;

var dayNight;
var night;
var sunAngle = 0;
var isDawn = false;
var isDusk = false;

//var timah = 1;
//const HACK_TIME_INC = 50;
/*** TEMPS DELETE LATER ***/


function checkKeys()
{
	if(keys[0])alert("sunAngle is " + sunAngle)
}

function changeKey(key, flag){

	switch (key){
		case 65: case 37: keys[0]=flag; break; // left
	}
}
document.onkeydown=function(e){changeKey((e||window.event).keyCode, 1);}
document.onkeyup=function(e){changeKey((e||window.event).keyCode, 0);}

function thinker()
{
//Hack Date Update
	//Update Keys
	checkKeys();
	//Day or Night Time
	dateObject = new Date();//Update The Date
		if(dateObject.getHours() <= 12)dayNight =  (dateObject.getHours() / 12) - (dateObject.getMinutes() / 60 / 12);
		else dayNight = 1 - ( (dateObject.getHours() - 12) / 12) - (dateObject.getMinutes() / 60 / 12);
		
		if(dateObject.getHours() > 6 && dateObject.getHours() < 18)
		{
			//Day Time Logic
			sunAngle = (dateObject.getHours()   * HOUR_TO_ANGLE ) +
					   (dateObject.getMinutes() * MIN_TO_ANGLE)+
				       (dateObject.getSeconds() * SEC_TO_ANGLE);
				   
		}
		else
		{
		sunAngle = 0;//Delete
		}

;}
function painter()
{
	ctx.clearRect (0,0,800,300);
	ctx.save();

	drawBackground();
		var imageObj = new Image();
		imageObj.src = "http://rosietheband.com/samcollier/img/blogname.png"
		ctx.drawImage(imageObj, 0, 0);
	ctx.restore();
}

function drawBackground()
{
	ctx.save();	
			ctx.fillStyle = "rgba(0,0,0,1)";//MidDaySky
			ctx.fillRect(0,0,800,300);
	ctx.restore();
	//Draw Sky	
	
	//Draw Night Sky
	if(dateObject.getHours() > 16 || dateObject.getHours() < 8)
	{
		var imageObj = new Image();
		imageObj.src = "http://rosietheband.com/samcollier/img/stars.png"
		ctx.drawImage(imageObj, 0, 0);
	}
	for(var i = 0; i < 300; i += 5)
	{
		ctx.save();	
			ctx.translate(0,i);//"+dayNight+"
			ctx.fillStyle = "rgba(" + i / SKY_COLOUR_FADE + "," + i / SKY_COLOUR_FADE + ",220," + (dayNight * 2) + ")";//MidDaySky
			ctx.fillRect(0,0,800,5);
		ctx.restore();
	}

	//Draw The Moon
	if(dateObject.getHours() >= 17	|| dateObject.getHours() < 7)
	{
		var imageObj = new Image();
		imageObj.src = "http://rosietheband.com/samcollier/img/moon.jpg"
		ctx.save();	
			ctx.translate(-50,0);
		//Calculate Time
			if(dateObject.getHours() <= 23 && dateObject.getHours() > 12)
			{
				if( dateObject.getHours() < 17 )
				{
					ctx.translate( dateObject.getMinutes() / 60 * 50, 100);
				}
				else
				{
					ctx.translate( (0.5 - dayNight) * 800, 100);
				}
			}                                                         
			else                                                      
			{ 
				if( dateObject.getHours() >= 6 )
				{			
					ctx.translate( 800 + (dateObject.getMinutes() / 60 * 50), 100);
				}
				else
				{
					ctx.translate( (0.5 + dayNight) * 800, 100);
				}
				
			}
		//Moon
			ctx.drawImage(imageObj, 0, 0);
		ctx.restore();
	}

	if(dateObject.getHours() >= 17 && dateObject.getHours() < 19)
	{
		var dawnValue;
		if( dateObject.getHours() < 18 )
		{
			dawnValue = ( dateObject.getMinutes() / 120 );
		}
		else
		{
			dawnValue = ( 0.5 - dateObject.getMinutes() / 120 );
		}
		ctx.fillStyle = "rgba(220,0,0," + dawnValue + ")";//MidDaySky
		ctx.fillRect(0,0,800,300);
	}
	//Draw Sun
	ctx.save();	
		// //Calculate Time
			ctx.translate(400,300);
			//ctx.translate(400,400);
			ctx.translate(Math.sin(sunAngle * (PI/180)) * 350,
						  Math.cos(sunAngle * (PI/180)) * 200);
		ctx.translate(-50,-50);//Translate
		var imageObj = new Image();
		imageObj.src = "http://rosietheband.com/samcollier/img/sun.png"
		ctx.drawImage(imageObj, 0, 0);
	ctx.restore();  
}

function DrawCloud()
{
	ctx.save();	
		ctx.translate(0,600);
		ctx.fillStyle = "rgba(0,200,50,1)";	
		ctx.fillRect(0,0,800,200);
	ctx.restore();
}

/*** Game Initialisation ***/
window.onload=function(){
	//Init Variables
	dayNight = 1;
	var fps = 60;
	canvas = document.getElementById('game');
	ctx = canvas.getContext('2d');	
	thinker();//Init
	setInterval(thinker, 1000);
	setInterval(painter, 1000/fps);
}