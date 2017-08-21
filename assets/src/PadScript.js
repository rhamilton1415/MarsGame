/**
 * Rosie The Band Logo Game(v.1.0)
 * by Sam Frederick Collier
 * Copyright (c) 2011 
 * All rights reserved.
 * Resdistrubtion is allowed providing this Banner is kept. 
 */
 
var twk_dampeningValue = 6;
var twk_triggerValue = 15;

var canvasPad;
var ctxPAD;
var fps = 30;
var keys = [false,false,false,false,false];

var dampeningValue;
var dt;
 
var XAxis = 0;
var YAxis = 0;

function UpdatePad()
{
	if( keys[0] ) XAxis -= (twk_triggerValue * dt);// left
	if( keys[1] ) XAxis += (twk_triggerValue * dt);// up
	if( keys[2] ) YAxis -= (twk_triggerValue * dt);// right
	if( keys[3] ) YAxis += (twk_triggerValue * dt);// down
	
	//Dampening 
	if( XAxis > 0 )
	{
		XAxis -= ( XAxis * dampeningValue);
	}
	else if( XAxis < 0 )
	{
		XAxis -= ( XAxis * dampeningValue);
	}
	if( YAxis > 0 )
	{
		YAxis -= ( YAxis * dampeningValue);
	}
	else if( YAxis < 0 )
	{
		YAxis -= ( YAxis * dampeningValue);
	}
	
	//CheckMax
	if( XAxis > 1 )
	{
		XAxis = 1;
	}
	else if( XAxis < -1 )
	{
		XAxis = -1;
	}
	if( YAxis > 1 )
	{
		YAxis = 1;
	}
	else if( YAxis < -1 )
	{
		YAxis = -1;
	}
}

function DrawPad()
{
	//Draw Early Warning	
	ctxPAD.fillStyle = "#000000";
	ctxPAD.fillRect(100, 100, 100, 100);
	
	var initpos = 100 + (50 - 10);
	//var xPosd = 
	var xPos = initpos + ( XAxis == 0 ? 0 : (XAxis < 0 ? (XAxis * 40) : (XAxis * 40)) );
	var yPos = initpos + ( YAxis == 0 ? 0 : (YAxis < 0 ? (YAxis * 40) : (YAxis * 40)) );
	
	ctxPAD.fillStyle = "#FF0000";
	ctxPAD.fillRect(xPos, yPos, 20, 20);
	
	ctxPAD.fillStyle = keys[4] ? "#AF0000" : "#FF0000";
	ctxPAD.fillRect(400, 150, 20, 20);
}

function Init()
{
	dt = (1/fps);
	dampeningValue = ( dt * twk_dampeningValue);
}

function engineUpdate()
{
	UpdatePad();	
	painter();
}

function changeKey(key, flag)
{
	switch (key)
	{
		case 65: case 37: keys[0] = flag; break; // left
		case 87: case 38: keys[2] = flag; break; // up
		case 68: case 39: keys[1] = flag; break; // right
		case 83: case 40: keys[3] = flag; break; // down
		case 32: 		  keys[4] = flag; break;  // space
	}
}

function painter()
{
	ctxPAD.fillStyle = 'rgba(0,0,0,0)';
	ctxPAD.clearRect(0,0,300,800);
	ctxPAD.save();
		DrawPad();
	ctxPAD.restore();
}

window.onload=function()
{
	canvasPad = document.getElementById('joypad');
	ctxPAD = canvasPad.getContext('2d');
	setInterval(engineUpdate, 1000/fps);

	Init();
}