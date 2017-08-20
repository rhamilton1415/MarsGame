/**
 * Rosie The Band Logo Game(v.1.0)
 * by Sam Frederick Collier and Robert Hamilton
 * Copyright (c) 2011 
 * All rights reserved.
 * Resdistrubtion is allowed providing this Banner is kept. 
 */

 //// THREAD GRAPHICS AND UPDATE /////
/**********************************************************************************************************************************************
/************* Graphics Variables *************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
//Graphics
var canvas;
var ctx;
var fps = 60;
var clickables =[];
//Background Variables
var gfx_splashImg = new Image();
var gfx_backgroundImg = new Image();
var gfx_backgroundImgParallax = new Image();
var gfx_backgroundImgParallaxForeground = new Image();

var gfx_background_YLocation = 0;
var gfx_backgroundParallax_YLocation = 0;
var gfx_backgroundImgParallaxForeground_YLocation = 0;
var twk_gfx_background_ScrollSpeed = 5;
var gfx_background_start_ScrollSpeed = 5;

//Input Keys : [Left, Right, Up, Down, Space, Enter]
var keys = [false, false, false, false, false, false];
/**********************************************************************************************************************************************
/************* Audio Variables ****************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
	var gfx_sfx_toggleOnImg = new Image();
	var gfx_sfx_toggleOffImg = new Image();
	var sfx_toggleButtonBox = [30,30];
	var gfx_sfx_togglePosition = [0,0]
	var sfx_On = true; //use as volume meter
	var sfx_Volume = 1; //keep normalised
	
	var music_On = true;
	var music_Volume = 1;
	
	var music_splash = new Howl({src:["./audio/music_splash.wav"],
	buffer: true,
	loop: true
	});
	music_splash.on('pause',function(){music_splash.stop();});
	var music_inGame = new Howl({src:["./audio/music_inGame.wav"],
	buffer: true,
	loop: true
	});
	var music_endGame = new Howl({src:["./audio/music_endGame.wav"],
	buffer:true,
	loop: true
	});
	var sfx_shot = new Howl({src:["./audio/sfx_shot.wav","./audio/sfx_shot.mp3"]});
	var sfx_asteroidExplode = new Howl({src:["./audio/sfx_asteroidExplode.wav","./audio/sfx_asteroidExplode.mp3"]});
	var sfx_powerupGet = new Howl({src:["./audio/sfx_powerupGet.wav","./audio/sfx_powerupGet.mp3"],
	buffer: true});
	var sfx_shipCrash = new Howl({src:["./audio/sfx_shipCrash.wav"]});
/**********************************************************************************************************************************************
/************* Character Section **************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/

//Starship Variables
var twk_char_hitBox = [57, 88];
var twk_char_drawBox = [57,176]; //Drawbox is bigger as it contains rocket exhaust
var char_animTimer = 0;
var twk_char_maxSpeed = [10, 10];
var twk_char_dampeningValue = 20;


var char_playerImpulse = [0, 0];
var char_currentSpeed = [0, 0];
var char_position = [0, 0];
var char_health = 0;
var gfx_char_health = new Image();
var gfx_char_health_box = [34,50];

var char_gfx_characterSprite = new Image();//Make this a Sprite

//Starship Bullet Variables
var twk_char_spaceshipMass = 1;
var twk_char_bullets_Active    = [false,false,false,false,false,false,false,false,false,false];
var twk_bullet_Speed = 10;
var twk_char_bullet_hitBox = [30, 60];

var twk_char_bullet_cooldown  = 1;
var char_bullet_cooldown_timer = 0;
var twk_char_bullet_FrameSwitch = 0.5;
var char_rapidfire_powerup_timer = 0;

var twk_char_bullets_position = [];  
twk_char_bullets_position[0] = [0,0,0,0,0,0,0,0,0,0];//REMOVE TWK
twk_char_bullets_position[1] = [0,0,0,0,0,0,0,0,0,0];//REMOVE TWK

var char_bullets_animTimer = 0;
var char_bullets_Currentanim = 0;

var char_bullets_gfx_bulletImage = new Image();

function Char_Init()
{
	//Reset Char
	char_playerImpulse = [0, 0];
	char_currentSpeed = [0, 0];
	char_position[0] = (canvas.width/2);
	char_position[1] = (canvas.height - twk_char_bullet_hitBox[1] - 10);
	char_health = 0;
	char_animTimer = 0;
	char_rapidfire_powerup_timer = 0;
	twk_char_bullet_cooldown  = 1;
	//Reset Bullets
	twk_char_bullets_Active = [false,false,false,false,false,false,false,false,false,false];	
}

function Char_AddImpulse( x, y )
{
	char_playerImpulse[0] += x;
	char_playerImpulse[1] += y;
}
function Char_Damage()
{ 
	char_health--;
	if(char_health<0)
	{
		sfx_shipCrash.play();
		State_Game_ToEndGame();
	}
}
/**
*@param {!AI_powerups} the type of powerup to be applied
*/
function Char_applyPowerup(p)
{
	switch(p)
	{
		case 0:
		for(var i = 0; i<AI_asteroid_active.length;i++)
		{
			if(AI_asteroid_active[i])
			{
				AI_OnAsteroidDestroyed(i);
			}
		}
		break;
		case 1:if(char_health<9)char_health++;break; //extra life
		case 2:char_rapidfire_powerup_timer=5;twk_char_bullet_cooldown = 0.2;break; //for five seconds rapid fire
	}
}

function Char_RequestFireBullet()
{
	//Cooldown Off 
	if( char_bullet_cooldown_timer < 0 )
	{
		//10 is Max bullet Value
		var indexFound = -1;
		for( var index = 0; index < 10; ++index )
		{
			if( !twk_char_bullets_Active[index] )
			{
				indexFound = index;
			}
		}
		
		//Fire Bullet
		if( indexFound != -1 )
		{
			sfx_shot.play();
			twk_char_bullets_Active[indexFound]	= true;
			twk_char_bullets_position[0][indexFound] = (char_position[0] + (twk_char_bullet_hitBox[0]/2) + 5);
			twk_char_bullets_position[1][indexFound] = (char_position[1] + (twk_char_bullet_hitBox[1]/2) + 5);
			char_bullet_cooldown_timer = twk_char_bullet_cooldown;
		}
	}
	
	
	//keys[4] = false;
}

function Char_UpdateMovement()
{
	//Update Velocity
	char_currentSpeed[0] += char_playerImpulse[0] * twk_char_spaceshipMass;
	char_currentSpeed[1] += char_playerImpulse[1] * twk_char_spaceshipMass;

	if( char_currentSpeed[0] >= twk_char_maxSpeed[0] )
	{
		char_currentSpeed[0] = twk_char_maxSpeed[0];
	}
	else if( char_currentSpeed[0] <= (0 - twk_char_maxSpeed[0]) )
	{
		char_currentSpeed[0] = 0 - twk_char_maxSpeed[0];
	}
	if( char_currentSpeed[1] >= twk_char_maxSpeed[1] )
	{
		char_currentSpeed[1] = twk_char_maxSpeed[1];
	}
	else if( char_currentSpeed[1] <= (0 - twk_char_maxSpeed[1]) )
	{
		char_currentSpeed[1] = 0 - twk_char_maxSpeed[1];
	}
	
	//Add Dampening Value
	char_currentSpeed[0] += (-(char_currentSpeed[0] / twk_char_dampeningValue));
	char_currentSpeed[1] += (-(char_currentSpeed[1] / twk_char_dampeningValue));
	
	//Update Value
	char_position[0] += char_currentSpeed[0];
	char_position[1] += char_currentSpeed[1];
	
	//Check Value in Range
	//Upper Limit X 
	if( (char_position[0] + twk_char_hitBox[0]) > canvas.width )
	{
		char_position[0] = (canvas.width - twk_char_hitBox[0]);
	}
	else if( char_position[0] < 0)
	{
		char_position[0] = 0;
	}
	//Upper Limit Y
	if( (char_position[1] + twk_char_hitBox[1]) > canvas.height )
	{
		char_position[1] = (canvas.height - twk_char_hitBox[1]);
	}
	else if( char_position[1] < 0)
	{
		char_position[1] = 0;
	}
	//Reset Impulse
	char_playerImpulse = [0, 0];
}

function Char_UpdateBullets()
{
	char_bullets_animTimer += 1;
	if( char_bullets_animTimer >= (fps * 2) )
	{
		char_bullets_animTimer = 0;
	}
	
	if((char_bullets_animTimer / fps ) > ((char_bullets_Currentanim) * twk_char_bullet_FrameSwitch) )
	{
		++char_bullets_Currentanim;
	}
	if( char_bullets_Currentanim > 3 ) char_bullets_Currentanim = 0;
	//Update Cooldowns
	if( char_bullet_cooldown_timer >= 0 )
	{
		char_bullet_cooldown_timer -= ( 1/fps ); 
	}
	//Update Bullets
	for( var index = 0; index < 10; ++index )
	{
		if( twk_char_bullets_Active[index] )
		{
			twk_char_bullets_position[1][index] -= twk_bullet_Speed;	
			if( twk_char_bullets_position[1][index] < 0 )
			{
				twk_char_bullets_Active[index] = false;
			}
		}
	}
}

function Char_Update()
{
	if(char_rapidfire_powerup_timer>0)
	{
		Char_RequestFireBullet(); //So that when the rapid fire powerup is on, you are always firing
		char_rapidfire_powerup_timer -= (1/fps);
	}
	else
	{
		char_rapidfire_powerup_timer = 0;
		twk_char_bullet_cooldown = 1;
	}
	Char_UpdateMovement();
	Char_UpdateBullets();
}

function Char_DrawCharacter()
{
	//Modify The Sample position Based upon Which Keys are Pressed
	var spriteIteratorX = twk_char_drawBox[0];
	var spriteIteratorY = twk_char_drawBox[1];
	var sourceX = 0;
	var sourceY = spriteIteratorY;
	char_animTimer += (2/fps);
	if(keys[2]) //go faster button changes the sprites to the go faster ones
	{
		sourceX += (3*spriteIteratorX);
		char_animTimer += (2/fps);
	}
	if( keys[0] ) 
	{ 
		if( !keys[1] )
		{
			sourceY = 0;
		}
	}
	else 
	{
		if( keys[1] )
		{
			sourceY += spriteIteratorY;
		}
	}
	//Cycle through the three ship animation sprites
	if(char_animTimer<1)
	{
		if(char_animTimer<0.33)
		{
		}
		else if(char_animTimer<0.66)
		{
			sourceX += (spriteIteratorX);
		}
		else
		{
			sourceX += (spriteIteratorX*2);
		}
	}
	else
	{
		char_animTimer = 0;
	}

	ctx.drawImage( char_gfx_characterSprite,
				   sourceX,sourceY,
				   twk_char_drawBox[0], twk_char_drawBox[1],				   
				   char_position[0], char_position[1], 
				   twk_char_drawBox[0], twk_char_drawBox[1]);	
}

function Char_DrawBullets()
{
	var sampleSize = [50, 153];
	for( var index = 0; index < 10; ++index )
	{
		if( twk_char_bullets_Active[index] )
		{
			ctx.drawImage( 	char_bullets_gfx_bulletImage,
							char_bullets_Currentanim * sampleSize[0], 0,
							sampleSize[0],	sampleSize[1],				   
							twk_char_bullets_position[0][index], twk_char_bullets_position[1][index], 
							twk_char_bullet_hitBox[0], twk_char_bullet_hitBox[1]);
		}
	}	
}
/**********************************************************************************************************************************************
/************* AI/Enemy Section ***************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
var twk_AI_asteroid_updateSpeed = 7.5;
var twk_AI_asteroid_minimumSpawnTime = 0.5;//3;
var twk_AI_asteroid_asteroidInitialSpawnTimer = 10; // Do this on Init 
var twk_AI_asteroid_hitBox = [50, 50];
var twk_AI_asteroid_explosionAnimTimer = 0.075;
var twk_AI_asteroid_MinMaxScales = [0.75,2];

var AI_asteroid_animTimer = 0;
var AI_asteroid_active = [0,0,0,0,0];//0-Inactive,1-Active,2-Dead
var AI_asteroid_activeCount = 0;
var AI_asteroid_spawnCounter = 0;
var AI_asteroid_positions = [];
AI_asteroid_positions[0] = [0,0,0,0,0];
AI_asteroid_positions[1] = [0,0,0,0,0];
var AI_astroid_Scales = [0,0,0,0,0];

//powerups - from a GD perspective having more than one at any time would be chaotic so for the moment it's only coded for one at a time
var AI_powerup_SUPERPHYSICS = true; //real trajectories have curves but may be performance intensive
var AI_powerup_updateSpeed = 7.5;
var AI_powerup_minimumSpawnTime = 1000;
var AI_powerup_initialSpawnTimer = 10;
var AI_powerup_hitBox = [50, 50];
var AI_powerup_position = [0,0];
var AI_powerup_vector = [0,0];
var AI_powerup_animationTimer = 0.1;
var AI_powerup_exists = false;
var AI_powerup = 1;
var AI_powerups = 
{
	CLEAR_SCREEN: 0,
	EXTRA_LIFE: 1,
	EXTRA_SHOT: 2
}

var AI_asteroid_AnimationValue = [];
AI_asteroid_AnimationValue[0] = [0,0,0,0,0];
AI_asteroid_AnimationValue[1] = [0,0,0,0,0];

var AI_asteroid_gfx_asteroidImage = new Image();
var AI_powerup_gfx_ShieldPowerupImage = new Image();
var AI_powerup_gfx_RapidFirePowerupImage = new Image();
var AI_powerup_gfx_ClearScreenPowerupImage = new Image();
var AI_timer = 0;


function AI_Init()
{
	AI_powerup_exists = false;
	twk_AI_asteroid_updateSpeed = 7.5;
	AI_powerup_updateSpeed = 7.5;
	AI_asteroid_active = [0,0,0,0,0];
	twk_AI_asteroid_minimumSpawnTime = 0.5;
	AI_asteroid_spawnCounter = twk_AI_asteroid_minimumSpawnTime;
	AI_powerup_initialSpawnTimer=10;
	AI_timer = 0;
}
/**
 * This function will spawn a powerup on a random side of the canvas and point it at a random point on the opposite side of the canvas
 * The type of powerup selected is equally weighted between the available options. 
 */
function AI_SpawnPowerup()
{
	var powerupSelect = Math.random();
	if(powerupSelect>0.33)
	{
		if(powerupSelect>0.66)
		{
			AI_powerup = 2;
		}
		else
		{
			AI_powerup = 1;
		}
	}
	else
	{
		AI_powerup = 0;
	}
	//Determine which side and where the powerup will spawn from
	var spawnPosition = [0,0];
	var seedSpawnBorder = (Math.random() * 2)
	if(seedSpawnBorder <1) //Spawn right
	{
		spawnPosition[0] = canvas.width;
		spawnPosition[1] = AI_getRandomCoordinate(canvas.height-AI_powerup_hitBox[1]);
		AI_powerup_vector[0] = -AI_powerup_hitBox[0]-spawnPosition[0];
		AI_powerup_vector[1] = -AI_getRandomCoordinate(canvas.height-AI_powerup_hitBox[1])-spawnPosition[1];
	}
	else if(seedSpawnBorder <=2) //spawn left
	{
		spawnPosition[0] = -AI_powerup_hitBox[0];
		spawnPosition[1] = AI_getRandomCoordinate(canvas.height-AI_powerup_hitBox[1]);
		AI_powerup_vector[0] = canvas.width-spawnPosition[0];
		AI_powerup_vector[1] = AI_getRandomCoordinate(canvas.height-AI_powerup_hitBox[1])-spawnPosition[1];
	}
	//convert the vector into a normalized value 
	var vector = Math.sqrt((Math.pow(AI_powerup_vector[0],2)) + (Math.pow(AI_powerup_vector[1],2)));
	AI_powerup_vector[0] = AI_powerup_vector[0]/vector;
	AI_powerup_vector[1] = AI_powerup_vector[1]/vector;
	AI_powerup_position = spawnPosition;
	AI_powerup_exists = true;
}
/**
 * This function takes a cap and returns a random value within that range. 
 * While this function doesn't really do much it'll make it easier to add weightings in future
 * @param {!Number} the maximum return value
 * @return {!Number} a value between 0 and the given parameter
 */
function AI_getRandomCoordinate(fromZeroTo)
{
	return fromZeroTo * Math.random();
}
/**
 * If the powerup is active and within the bounds of the canvas this function will move it along its vector.
 * If the powerup leaves the bounds of the game, it will despawn
 * if the SUPERPHYSICS flag is on, the trajectory will curve into the -Y axis.
 */
function AI_powerup_update()
{
	if(AI_powerup_exists)
	{
		//Check will only fail when considerably outside the canvas to avoid instantly failing this check on spawn
		//TODO make this less fucking stupid
		if((AI_powerup_position[1] < canvas.height + AI_powerup_hitBox[1]) &&
		(AI_powerup_position[1] > -(2*AI_powerup_hitBox[1])) &&
		(AI_powerup_position[0] < canvas.width + AI_powerup_hitBox[0]) &&
		(AI_powerup_position[0] > -(2*AI_powerup_hitBox[0])))
		{
			AI_powerup_position[0] += (AI_powerup_vector[0]*AI_powerup_updateSpeed);
			AI_powerup_position[1] += (AI_powerup_vector[1]*AI_powerup_updateSpeed);
			if(AI_powerup_SUPERPHYSICS)
			{
				//curves the trajectory into the standard asteroid path
				AI_powerup_vector[1] += twk_AI_asteroid_updateSpeed/1000;
				var vector = Math.sqrt((Math.pow(AI_powerup_vector[0],2)) + (Math.pow(AI_powerup_vector[1],2)));
				AI_powerup_vector[0] = AI_powerup_vector[0]/vector;
				AI_powerup_vector[1] = AI_powerup_vector[1]/vector;
			}
		}
		else
		{
			AI_powerup_initialSpawnTimer = AI_powerup_minimumSpawnTime;
			AI_powerup_exists = false;
		}
	}
	else
	{
		AI_powerup_initialSpawnTimer--;
		if(AI_powerup_initialSpawnTimer <0)
		{
			AI_SpawnPowerup();
		}
	}
}
/**
* Plays the sfx for the powerup, despawns the powerup and applies the powerup to the player
*/
function AI_onPowerupGet()
{
	sfx_powerupGet.play();
	AI_powerup_initialSpawnTimer = AI_powerup_minimumSpawnTime;
	AI_powerup_exists = false;
	Char_applyPowerup(AI_powerup);
}
/**
* This function spawns the asteroid for the given index at a random position along the X-axis at the top of the screen.
* @param {!index} the index of the asteroid to be spawned
*/
function AI_SpawnAsteroid( index )
{
	// make the init values tweakable
	var seedVal = Math.random();
	var keepOnScreenVal = 0;
	//The keepOnScreenVal ensures that asteroids which would otherwise spawn off the edge of the screen are capped.
	//This soloution does mean that 6% of asteroids will spawn at this cap as opposed to the ideal 1% so TODO GCSE maths
	var rawSpawnVal = (seedVal*canvas.width);
	if( rawSpawnVal > 750 ) //750 = canvas width - asteroid hitbox
	{
		keepOnScreenVal = canvas.width - (rawSpawnVal)
	}
	AI_asteroid_positions[0][index] = (rawSpawnVal) + keepOnScreenVal;
	AI_asteroid_positions[1][index] = -50;
	
	AI_asteroid_active[index] = 1;
	AI_asteroid_AnimationValue[0][index] = 0;
	AI_asteroid_AnimationValue[1][index] = 0;
	AI_asteroid_spawnCounter = twk_AI_asteroid_minimumSpawnTime;

	//Random Scale
	seedVal = Math.random() * [0.75,1.5];
	AI_astroid_Scales[index] = Math.random() * (twk_AI_asteroid_MinMaxScales[1] - twk_AI_asteroid_MinMaxScales[0]) + twk_AI_asteroid_MinMaxScales[0];
}          

/**
* This function moves the asteroids down the game space and despawns them when they are out of bounds
* @param {!index} the index of the asteroid to be updated
*/
function AI_UpdateSingleAsteroid( index )
{
	if( AI_asteroid_positions[1][index] < canvas.height + 50 )
	{
		AI_asteroid_positions[1][index] += twk_AI_asteroid_updateSpeed;
	}
	else
	{
		AI_asteroid_active[index] = 0;
	}
}
/**
* On Asteroid death, this function is called to play the SFX and to set the asteroid state to start its death animation
*/
function AI_OnAsteroidDestroyed( index ) 
{
	sfx_asteroidExplode.play();
	AI_asteroid_active[index] = 2;
	AI_asteroid_AnimationValue[0][index] = 1;
	AI_asteroid_AnimationValue[1][index] = 0;
}
/**
* I have no idea
*/
function AI_AsteroidUpdate()
{
	//Update Positions
	var canSpawnNewAsteroid = -1;	
	var canSpawnNewAsteroid2 = -1;
	for( var index = 0; index < 5; ++index )
	{
		//TODO remove This
		if( AI_asteroid_active[index] >= 1 && AI_asteroid_positions[1] < 0)
		{
			//alert( "Broken Asteroid " + index );
		}
		if( AI_asteroid_active[index] >= 1 )
		{
			AI_UpdateSingleAsteroid(index);
		}
		else if( canSpawnNewAsteroid == -1 )
		{
			canSpawnNewAsteroid = index;
		}
		else if( canSpawnNewAsteroid2 )
		{
			canSpawnNewAsteroid2 = index;
		}
	}
	//update timer
	if( canSpawnNewAsteroid > -1 )
	{
		//add a Random coefficient for spawn time
		if( AI_asteroid_spawnCounter <= 0 )
		{
			AI_SpawnAsteroid(canSpawnNewAsteroid);
		}
		else
		{
			AI_asteroid_spawnCounter -= 1/fps;
		}
	}
}

function AI_Update()
{
	AI_AsteroidUpdate();
	AI_powerup_update();
}
/**
* When a powerup is on screen, this function draws the respective image for it
*/
function AI_powerup_DrawPowerup()
{
	if(AI_powerup_exists)
	{
		switch(AI_powerup)
		{
			case 0:ctx.drawImage(AI_powerup_gfx_ClearScreenPowerupImage,AI_powerup_position[0],AI_powerup_position[1],AI_powerup_hitBox[0],AI_powerup_hitBox[1]);break;
			case 1:ctx.drawImage(AI_powerup_gfx_ShieldPowerupImage,AI_powerup_position[0],AI_powerup_position[1],AI_powerup_hitBox[0],AI_powerup_hitBox[1]);break;
			case 2:ctx.drawImage(AI_powerup_gfx_RapidFirePowerupImage,AI_powerup_position[0],AI_powerup_position[1],AI_powerup_hitBox[0],AI_powerup_hitBox[1]);break;
		}
	}
}
function AI_Asteroid_DrawAsteroid()
{
	for( var index = 0; index < 5; ++index )
	{
		if( AI_asteroid_active[index] != 0 )
		{
			AI_Asteroid_DrawSingle_Asteroid(index);
		}
	}	
}
/**
* This function draws an individual asteroid. If the asteroid has been destroyed (if AI_asteroid active[index] = 2), it will iterate through the death animation sprite.
*/
function AI_Asteroid_DrawSingle_Asteroid( index )
{
	if( AI_asteroid_active[index] == 2 )
	{
		if( AI_asteroid_AnimationValue[0][index] < 7 )
		{
			AI_asteroid_AnimationValue[1][index] += 1;
			if((AI_asteroid_AnimationValue[1][index] / fps) > (AI_asteroid_AnimationValue[0][index] * twk_AI_asteroid_explosionAnimTimer) )
			{
				++AI_asteroid_AnimationValue[0][index];
			}
		}
	}
	var SpriteSize = [410 , 492]
	var newHitBox = [0,0];
	newHitBox[0] = twk_AI_asteroid_hitBox[0] * AI_astroid_Scales[index]; 
	newHitBox[1] = twk_AI_asteroid_hitBox[1] * AI_astroid_Scales[index];

	var SpritePos = [ 2 * newHitBox[0], 4 * newHitBox[1]];	
	var SourceX = SpriteSize[0] * AI_asteroid_AnimationValue[0][index];
	
	//Draw Image
	ctx.drawImage( AI_asteroid_gfx_asteroidImage,
				   SourceX,0,
				   SpriteSize[0], SpriteSize[1],				   
				   AI_asteroid_positions[0][index] - SpritePos[0], AI_asteroid_positions[1][index] - SpritePos[1], 
				   newHitBox[0] * 5, newHitBox[1] * 6);
}
/**********************************************************************************************************************************************
/************* SCORE METHODS ******************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
var score_currentScore = 0;

var twk_score_scorePerFrame = 2;
var twk_score_asteroidKilled = 50;

function score_Init()
{
	score_currentScore = 0;
}

function score_UpdateScore()
{
	score_currentScore += twk_score_scorePerFrame;
}

/**********************************************************************************************************************************************
/************* Game Systems ******************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
var twk_levelTimeLength = 5;
var gameTimer = 0;
var trigger = false;
var past = false;
var levelTimer = 0;

function InitGame()
{
	gameTimer = 0;
	levelTimer = 0;
	Char_Init();
	AI_Init();
	score_Init();
}
/**
* This function is responsible for gradually increasing the difficulty level of the game over time.
* It does this by increasing the spawn rate and speed of asteroids.
*/
function UpdateLevelTimer()
{
	//Every 10 seconds, the asteroids start moving faster
	gameTimer += (1/fps);
	levelTimer += (1/fps);
	if( levelTimer > twk_levelTimeLength)
	{
		twk_AI_asteroid_updateSpeed += 0.5;
		levelTimer = 0;
	    if(twk_AI_asteroid_minimumSpawnTime>0)twk_AI_asteroid_minimumSpawnTime -= 0.05;
		//State_Game_ToEndGame();
	}
	
}

function updateInputs()
{
	if( keys[0] ) //Left Pressed 
	{
		Char_AddImpulse( -1, 0 );
	}
	if( keys[1] ) //Right Pressed 
	{
		Char_AddImpulse( 1, 0 );
	}
	if( keys[2] ) //Up Pressed 
	{
		Char_AddImpulse( 0, -1 );
	}
	if( keys[3] ) //Down Pressed 
	{
		Char_AddImpulse( 0, 1 );
	}
	if( keys[4] ) //Space Pressed 
	{
		Char_RequestFireBullet();
	}
}

function CheckCollisions()
{
	//Check Asteroid collisions
	for( var index = 0; index < 5; ++index )
	{
		if( AI_asteroid_active[index] == 1 && AI_asteroid_active[index] != 2)
		{
			var newHitBox = [0,0];
			newHitBox[0] = twk_AI_asteroid_hitBox[0] * AI_astroid_Scales[index]; 
			newHitBox[1] = twk_AI_asteroid_hitBox[1] * AI_astroid_Scales[index];
			//Check Collision with Ship - on true goto end state // maybe add fidelity Tweaks /AABB
			if(	char_position[0] 					  < AI_asteroid_positions[0][index] + newHitBox[0] &&
				char_position[0] + twk_char_hitBox[0] > AI_asteroid_positions[0][index] 			  				&&
				char_position[1] 					  < AI_asteroid_positions[1][index] + newHitBox[1] &&
				char_position[1] + twk_char_hitBox[1] > AI_asteroid_positions[1][index]							  			 ) 
			{
				//State_Game_ToPreGame();	
				//State_Game_ToEndGame();
				AI_OnAsteroidDestroyed( index ); //otherwise both die
				Char_Damage();
			}
			
			
			//Check Collision with Bullets // maybe add fidelity Tweaks //AABB
			for( var bulletIndex = 0; bulletIndex < 10; ++bulletIndex )
			{
				if( twk_char_bullets_Active[bulletIndex]  )
				{
					if(	twk_char_bullets_position[0][bulletIndex] 					  		  < AI_asteroid_positions[0][index] + newHitBox[0] 	&&
						twk_char_bullets_position[0][bulletIndex] + twk_char_bullet_hitBox[0] > AI_asteroid_positions[0][index] 			  					&&
						twk_char_bullets_position[1][bulletIndex] 					  		  < AI_asteroid_positions[1][index] + newHitBox[1] 	&&
						twk_char_bullets_position[1][bulletIndex] + twk_char_bullet_hitBox[1] > AI_asteroid_positions[1][index]							  	 ) 
					{					
						AI_OnAsteroidDestroyed( index );
						score_currentScore += twk_score_asteroidKilled;
						twk_char_bullets_Active[bulletIndex] = false;
					}
				}
			}
		}
	}
	//Check Powerup collisions
	if(AI_powerup_exists)
	{
		var newHitBox=[AI_powerup_hitBox[0],AI_powerup_hitBox[1]];//soz laziness TODO not this
		
		if(	char_position[0] < AI_powerup_position[0] + newHitBox[0] &&
				char_position[0] + twk_char_hitBox[0] > AI_powerup_position[0] &&
				char_position[1] < AI_powerup_position[1] + newHitBox[1] &&
				char_position[1] + twk_char_hitBox[1] > AI_powerup_position[1]) 
			{
				AI_onPowerupGet();
			}
	}
	//if( trigger == true ) { trigger = false; }
}

function gameUpdate()
{
	
	updateInputs();
	Char_Update();
	AI_Update();
	CheckCollisions();
	
	score_UpdateScore();
	UpdateLevelTimer();
}

/**********************************************************************************************************************************************
/************* PRE Game State *****************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/

var twk_preGame_CountDownTimeSecs = 3;
var twk_preGame_READYMESSAGE = 1;
var twk_preGame_GOMESSAGE = 0.5;

var preGame_CountDownTimer;

function InitPreGame()
{
	music_inGame.stop();
	music_inGame.play();
	preGame_CountDownTimer = twk_preGame_CountDownTimeSecs;
	if( twk_preGame_READYMESSAGE <= twk_preGame_GOMESSAGE ) alert("INIT PREGAME BROKEN");
	CutScene_Storm_ResetScene();
}

function UpdatePreGameCountDown()
{
	if(twk_gfx_background_ScrollSpeed<gfx_background_start_ScrollSpeed)
	{
		twk_gfx_background_ScrollSpeed += (gfx_background_start_ScrollSpeed/fps); //back to full speed in one second
	}
	else
	{
		twk_gfx_background_ScrollSpeed = gfx_background_start_ScrollSpeed;
	}
	preGame_CountDownTimer -= (1/fps);
	if( preGame_CountDownTimer <= 0 )
	{
		State_PreGame_ToGame();
	}
}

function DrawPreGame()
{
	var OutPutString;
	var Xpos = (canvas.width/2);
	if( preGame_CountDownTimer > twk_preGame_READYMESSAGE )
	{
		OutPutString = Math.round(preGame_CountDownTimer);
		Xpos -= 30;
	}
	else if( preGame_CountDownTimer > twk_preGame_GOMESSAGE )
	{
		OutPutString = "Ready";
		Xpos -= 75;
	}
	else
	{
		Xpos -= 30;
		OutPutString = "GO";
	}
	
	//Draw
	ctx.fillStyle = "#DAF7A6";
	ctx.font="60px nasalizationF";
	ctx.fillText(OutPutString, Xpos, (canvas.height/2));
	
}
/**********************************************************************************************************************************************
/************* CUT SCENE STORM ****************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
var cutscene_gfx_stormImage = new Image();

var twk_cutscene_storm_timeBeforeEndStormAppears = 5;
var twk_cutscene_storm_speed = 5;
var twk_cutscene_storm_maxDistanceInGame = 50;

var cutscene_storm_shouldDrawStorm = false;
var cutscene_storm_Yposition = 0;

function CutScene_Storm_PlayScene()
{
	cutscene_storm_Yposition = (0 - canvas.height);
	cutscene_storm_shouldDrawStorm = true;
}

function CutScene_Storm_ResetScene()
{
	cutscene_storm_shouldDrawStorm = false;
}

function CutScene_Storm_GameStateUpdate()
{
	if( cutscene_storm_Yposition < (twk_cutscene_storm_maxDistanceInGame - canvas.height ) )
	{
		cutscene_storm_Yposition += twk_cutscene_storm_speed;
	}
}

function CutScene_Storm_EndGameStateUpdate()
{
	if( cutscene_storm_Yposition < 0 )
	{
		cutscene_storm_Yposition +=  twk_cutscene_storm_speed;
	}
	else
	{
		cutscene_storm_Yposition = 0;
	}
}
/**********************************************************************************************************************************************
/************* Start Game State ***************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
var Start_textFlickerRate = 0.2;
var Start_textFlicker = false;
var Start_timer = 0;
function InitStart()
{
	//music_splash.volume(1);
	if(music_On)
	{
		music_splash.play();
	}
	var Start_textFlicker = false;
	var Start_timer = 0;
}
function UpdateStart()
{
	Start_timer += (1/fps);
	if(Start_timer>Start_textFlickerRate)
	{
		(Start_textFlicker ? Start_textFlicker = false : Start_textFlicker = true);
		Start_timer = 0;
	}
	if( keys[5]) //Enter Pressed
	{
		State_Game_ToPreGame();
	}
}
function DrawStart()
{
	ctx.drawImage(gfx_splashImg, 0, 0, canvas.width, canvas.height);
	OutPutString = "PRESS ENTER TO START";
	XPos = canvas.width/2;
	ctx.fillStyle = ((Start_textFlicker) ? "#C20E00" : "#DAF7A6");
	ctx.font="40px nasalizationF";
	XPos -= (ctx.measureText(OutPutString).width/2);
	ctx.fillText(OutPutString, XPos, (canvas.height/2)+280)
}
/**********************************************************************************************************************************************
/************* End Game State *****************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
var twk_EndGame_LightningFlashes = 3;
var twk_EndGame_navSpeed = 5;

var EndGame_lightningFlashAnimAlpha = 1;
var EndGame_lightningFlashCount = 0;
var EndGame_playOutroClip = false;
var EndGame_outroEnd = false;
//Menu animation variables
var EndGame_scoreAnimationIncrement = 0;
var EndGame_scoreAnimationSubScore = 0;
var EndGame_timer = 0;
var EndGame_menuSubState = 0;
var EndGame_menuSubStates = 
{
	START_OVER : 0,
	POST_SCORE : 1
}
var EndGame_optionFlicker = false;
var EndGame_optionFlickerRate = 1.2;
var EndGame_menuAvailable = false;
function InitEndGame()
{
	music_endGame.play();
	music_endGame.volume(music_Volume);
	music_endGame.fade(0,music_Volume,3);
	EndGame_outroEnd = false;
	EndGame_playOutroClip = false;
	EndGame_timer = 0;
	EndGame_ScoreAnimationIncrement = (((score_currentScore/10)/fps) * Math.log(score_currentScore)); //NLogN used to make higher scores last longer but not overly so
    EndGame_scoreAnimationSubScore = 0;
	EndGame_optionFlicker = false;
	EndGame_menuAvailable = false;
}

function UpdateEndGame()
{
	if(twk_gfx_background_ScrollSpeed>0)
	{
		twk_gfx_background_ScrollSpeed -= (1/fps);
	}
	else
		
	{
		twk_gfx_background_ScrollSpeed = 0;
	}
	//Is Ship ready
	if( !EndGame_playOutroClip )
	{
		//Navigate
		var xFound = false;
		var yFound = false;
		var canvasXcenter = (canvas.width/2); 
		var canvasYcenter = (canvas.height/2);
		
		if( char_position[0] != canvasXcenter  )
		{
			//Update XPos> twk_EndGame_navSpeed
			if( char_position[0] > canvasXcenter )
			{
				if( (char_position[0] - canvasXcenter) > twk_EndGame_navSpeed )
				{
					char_position[0] -= twk_EndGame_navSpeed;
					xFound = true;
				}
				else
				{
					char_position[0] = canvasXcenter;
				}
			}
			else
			{
				if( (canvasXcenter - char_position[0]) > twk_EndGame_navSpeed )
				{
					char_position[0] += twk_EndGame_navSpeed;
				}
				else
				{
					char_position[0] = canvasXcenter;
					xFound = true;
				}
			}
		}
		else
		{
			xFound = true;
		}
		if( char_position[1] != canvasYcenter  )
		{
			//Update XPos> twk_EndGame_navSpeed
			if( char_position[1] > canvasYcenter )
			{
				if( (char_position[1] - canvasYcenter) > twk_EndGame_navSpeed )
				{
					char_position[1] -= twk_EndGame_navSpeed;
					yFound = true;
				}
				else
				{
					char_position[1] = canvasYcenter;
					yFound = true;
				}
			}
			else
			{
				if( (canvasYcenter - char_position[1]) > twk_EndGame_navSpeed )
				{
					char_position[1] += twk_EndGame_navSpeed;
				}
				else
				{
					char_position[1] = canvasYcenter;
					yFound = true;
				}
			}
		}
		else
		{
			yFound = true;
		}
		EndGame_playOutroClip = xFound && yFound;
	}
	//Has clip Finished
	CutScene_Storm_EndGameStateUpdate()
	if(EndGame_menuAvailable)
	{
		if( keys[5]) //Enter Pressed
		{
			switch(EndGame_menuSubState)
			{
				case EndGame_menuSubStates.START_OVER: State_Game_ToPreGame(); break;
				case EndGame_menuSubStates.POST_SCORE: /*todo*/; break;
			}
		}
		else if(keys[2]) //up
		{
			if(EndGame_menuSubState > 0) 
			{
				EndGame_menuSubState--;
			}
		}
		else if(keys[3]) //down
		{
			if(EndGame_menuSubState < Object.keys(EndGame_menuSubStates).length/2)
			{
				EndGame_menuSubState++;
			}
		}
	}
}

function DrawEndGame()
{
	//Char_DrawCharacter();
	//Flash once then draw text
	if(!EndGame_outroEnd)
	{
	    EndGame_lightningFlashAnimAlpha -= (0.9 * (1/fps)); 
	    //Draw Flash
	    ctx.fillStyle = 'rgba(255,255,255,' + EndGame_lightningFlashAnimAlpha + ')';
	    ctx.fillRect(0,0,canvas.width,canvas.height);
	    if( EndGame_lightningFlashAnimAlpha < 0 )
	    {
	    	EndGame_lightningFlashAnimAlpha = 1;
	    	EndGame_outroEnd = true;
	    }
	}
	else //Start drawing the menu
	{
	    var XPos = canvas.width/2;
		var OutPutString = "GAME OVER";
	    ctx.fillStyle = "#DAF7A6";
	    ctx.font="60px nasalizationF";
	    XPos -= (ctx.measureText(OutPutString).width/2); //The offset is set to half the size of the string in pixels, centering it
	    ctx.fillText(OutPutString, XPos, (canvas.height/2)-50);
		//add a little artistic flair - "Score" display delayed by a second
		if(EndGame_timer < 1)
		{
		    EndGame_timer += (1/fps);
		}
		else if((EndGame_scoreAnimationSubScore) < score_currentScore) //Score Animation
		{
			//Print a counting score
			EndGame_scoreAnimationSubScore += EndGame_ScoreAnimationIncrement;
			OutPutString = "SCORE: " + Math.round(EndGame_scoreAnimationSubScore);
			XPos = canvas.width/2;
			ctx.fillStyle = "#DAF7A6";
			ctx.font="40px nasalizationF";
			XPos -= (ctx.measureText(OutPutString).width/2);
			ctx.fillText(OutPutString, XPos, (canvas.height/2)+250);
		}
		else //Menu
		{
			EndGame_menuAvailable = true;
			//yeah kinda hacky 
		    EndGame_timer += (1/fps);
			if(EndGame_timer>EndGame_optionFlickerRate)
			{
				EndGame_timer = 1;
				EndGame_optionFlicker = (EndGame_optionFlicker ? false : true);
			}
			//print a counting score
			OutPutString = "SCORE: " + score_currentScore;
			XPos = canvas.width/2;
			ctx.fillStyle = "#DAF7A6";
			ctx.font="40px nasalizationF";
			XPos -= (ctx.measureText(OutPutString).width/2);
			ctx.fillText(OutPutString, XPos, (canvas.height/2)+250)
			
			//Print Option one
			OutPutString = "PRESS ENTER TO PLAY AGAIN";
			XPos = canvas.width/2;
			ctx.fillStyle = ((EndGame_menuSubState == EndGame_menuSubStates.START_OVER && EndGame_optionFlicker) ? "#C20E00" : "#DAF7A6");
			//ctx.fillStyle = "#DAF7A6";
			ctx.font="40px nasalizationF";
			XPos -= (ctx.measureText(OutPutString).width/2);
			ctx.fillText(OutPutString, XPos, (canvas.height/2));
		}
	}
	
	
}
/**********************************************************************************************************************************************
/************* Global Input *******************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
//input handling outside of game logic
function UI_init()
{
	//Clickable format = [box[minx,miny,maxx,maxy],function onBoxClick()] hacky and shit sorry i didn't want it to be this way
	clickables = 
	[
		[[gfx_sfx_togglePosition[0], gfx_sfx_togglePosition[1], gfx_sfx_togglePosition[0]+sfx_toggleButtonBox[0], gfx_sfx_togglePosition[1]+sfx_toggleButtonBox[1]],function(){ToggleSFX();}] //sfx toggle box
	];
}
function UI_Update()
{
}
function UI_LeftClick(e)
{
	var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
	for( var index = 0; index < clickables.length; ++index ) //clickables box is topx, topy, bottomx, bottomy, function
	{
		var currentObj=clickables[index][0];
		if(x > currentObj[0] && x < currentObj[2] && y > currentObj[1] && y < currentObj[3])
		   {
			   clickables[index][1]();
		   }
	}
}

/**********************************************************************************************************************************************
/************* State Machine ******************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
//0 PreGame, 1 InGame, 2 End Game
var State_gameState = 3;
var State_gameStates = 
{
	PREGAME : 0,
	GAME : 1,
	ENDGAME : 2,
	START : 3
}
function State_Update()
{
	switch( State_gameState )
	{
	case State_gameStates.PREGAME : State_PreGame_Update(); break;
	case State_gameStates.GAME : State_Game_Update(); break;
	case State_gameStates.ENDGAME : State_EndGame_Update(); break;
	case State_gameStates.START : State_Start_Update(); break;
	};
}

//Update states
function State_Game_Update()
{
	gameUpdate();
}

function State_PreGame_Update()
{
	UpdatePreGameCountDown();
}

function State_EndGame_Update()
{
	UpdateEndGame();
}

function State_Start_Update()
{
	UpdateStart();
}

//Switch States

//PREGAME
function State_PreGame_ToGame()
{
	State_gameState = State_gameStates.GAME;
}

//GAME
function State_Game_ToPreGame()
{
	// Modify this Later
	//music_splash.fade(music_Volume,0,1);
	music_splash.stop();
	//music_endGame.fade(music_Volume,0,1);
	music_endGame.stop();
	InitPreGame();
	InitGame();
	State_gameState = State_gameStates.PREGAME;
}

function State_Game_ToEndGame()
{
	//music_inGame.fade(music_Volume,0,0.5)
	music_inGame.stop();
	InitEndGame();
	State_gameState = State_gameStates.ENDGAME;	
}
/**********************************************************************************************************************************************
/************* AUDIO METHODS  *****************************************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/

function InitSFX()
{
}
function ToggleSFX()
{
	if(sfx_On)
	{
		sfx_On = false;
		sfx_Volume = 0;
		InitSFX();
		sfx_asteroidExplode.volume(sfx_Volume);
		sfx_shot.volume(sfx_Volume);
		sfx_powerupGet.volume(sfx_Volume);
		sfx_shipCrash.volume(sfx_Volume);
		
		music_On = false;
		music_Volume = 0;
		music_inGame.volume(music_Volume);
		music_endGame.volume(music_Volume);
		music_splash.volume(music_Volume);
	}
	else
	{
		sfx_On = true;
		sfx_Volume = 1;
		InitSFX();
		sfx_asteroidExplode.volume(sfx_Volume);
		sfx_shot.volume(sfx_Volume);
		sfx_powerupGet.volume(sfx_Volume);
		sfx_shipCrash.volume(sfx_Volume);
		
		music_On = true;
		music_Volume = 1;
		music_inGame.volume(music_Volume); 
		music_endGame.volume(music_Volume);
		music_splash.volume(music_Volume);
	}
}
/**********************************************************************************************************************************************
/************* GRAPHICS METHODS (Must be at Bottom )  *****************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/

function InitGraphics()
{
	gfx_sfx_toggleOnImg.src = "./img/Image_SFXToggleOn.png";
	gfx_sfx_toggleOffImg.src = "./img/Image_SFXToggleOff.png";
	
	gfx_splashImg.src = "./img/bgImage_splash.png";
	gfx_backgroundImg.src = "./img/bgImage_space.png"; //does this cache can we speed this up
	gfx_backgroundImgParallax.src = "./img/bgImage_StarsParallax.png"; //does this cache can we speed this up
	gfx_backgroundImgParallaxForeground.src = "./img/bgImage_StarsParallaxForeground.png"; //does this cache can we speed this up
	char_gfx_characterSprite.src = "./img/Sprite_spaceship.png";//"./img/Image_spaceship.png";
	char_bullets_gfx_bulletImage.src = "./img/Image_spaceshipBullet.png";
	AI_asteroid_gfx_asteroidImage.src = "./img/Sprite_asteroid.png";
	AI_powerup_gfx_ShieldPowerupImage.src = "./img/Image_powerup_shield.png";
	AI_powerup_gfx_RapidFirePowerupImage.src = "./img/Image_powerup_rapidfire.png";
	AI_powerup_gfx_ClearScreenPowerupImage.src = "./img/Image_powerup_clearscreen.png";
	cutscene_gfx_stormImage.src = "./img/bgImage_Storm.png";
	gfx_char_health.src="./img/Image_charHealth.png";
	
	gfx_sfx_togglePosition = [10, (canvas.height - sfx_toggleButtonBox[1]) - 10];
	
}

function DrawLightningStorm()
{
	ctx.drawImage(cutscene_gfx_stormImage, 0, cutscene_storm_Yposition, canvas.width, canvas.height);
}

function DrawBackground()
{
	//Update Y Scrolling Speed
	gfx_background_YLocation += twk_gfx_background_ScrollSpeed;
	if( gfx_background_YLocation > canvas.height )
	{
		gfx_background_YLocation -= canvas.height;
	}
	gfx_backgroundParallax_YLocation += twk_gfx_background_ScrollSpeed;
	if( gfx_backgroundParallax_YLocation > canvas.height )
	{
		gfx_backgroundParallax_YLocation -= canvas.height;
	}
	gfx_backgroundImgParallaxForeground_YLocation += twk_gfx_background_ScrollSpeed*4;
	if( gfx_backgroundImgParallaxForeground_YLocation > canvas.height )
	{
		gfx_backgroundImgParallaxForeground_YLocation -= canvas.height;
	}
	
	ctx.drawImage(gfx_backgroundImg, 0, gfx_background_YLocation, canvas.width, canvas.height);
	ctx.drawImage(gfx_backgroundImg, 0, gfx_background_YLocation - canvas.height, canvas.width, canvas.height);
	
	ctx.drawImage(gfx_backgroundImgParallax, 0, gfx_backgroundParallax_YLocation, canvas.width, canvas.height);
	ctx.drawImage(gfx_backgroundImgParallax, 0, gfx_backgroundParallax_YLocation - canvas.height, canvas.width, canvas.height);
	
	ctx.drawImage(gfx_backgroundImgParallaxForeground, 0, gfx_backgroundImgParallaxForeground_YLocation, canvas.width, canvas.height);
	ctx.drawImage(gfx_backgroundImgParallaxForeground, 0, gfx_backgroundImgParallaxForeground_YLocation - canvas.height, canvas.width, canvas.height);
}

function DrawActors()
{
	Char_DrawCharacter();
}

function DrawSFXToggle()
{
	if(sfx_On)
	{
		ctx.drawImage(gfx_sfx_toggleOnImg,gfx_sfx_togglePosition[0],gfx_sfx_togglePosition[1],sfx_toggleButtonBox[0],sfx_toggleButtonBox[1]);
	}
	else
	{
		ctx.drawImage(gfx_sfx_toggleOffImg,gfx_sfx_togglePosition[0],gfx_sfx_togglePosition[1],sfx_toggleButtonBox[0],sfx_toggleButtonBox[1]);
	}
}
function DrawUI()
{
	//Can Fire 	ctx.fillStyle = 'rgba(0,0,0,0)';
	ctx.fillStyle = char_bullet_cooldown_timer >= 0 ? "#FF0000" : "#4BFF00";
    ctx.fillRect(50, (canvas.height - 50),25,25);
	
	ctx.fillStyle = "#DAF7A6";
	ctx.font = "20px nasalizationF";
	ctx.fillText("Weapon Ready",20, (canvas.height - 65));
	ctx.font = "20px nasalizationF";
	ctx.fillText("Score :", canvas.width - 120, (canvas.height - 65));
	ctx.fillText(score_currentScore, canvas.width - 100, (canvas.height - 40));
	if(char_health>0)
	{
		ctx.drawImage(gfx_char_health,canvas.width-160, (canvas.height-80),gfx_char_health_box[0],gfx_char_health_box[1]);
		OutPutString = char_health;
		XPos = (canvas.width-160)+(gfx_char_health_box[0]/2); //the centre of the health box
		YPos = (canvas.height-80)+(gfx_char_health_box[1]/1.8);
		ctx.font="20px nasalizationF";
		
		XPos -= (ctx.measureText(OutPutString).width/2);
		ctx.fillText(OutPutString, XPos, YPos);
	}
}

function DrawScene()
{
	//Add This to State
	// if( cutscene_storm_shouldDrawStorm )
	// {
		// DrawLightningStorm();
	// }
	
	if(State_gameState == State_gameStates.START) //Splash - don't draw everything else in this state
	{
		DrawStart();
	}
	else
	{
		DrawBackground();
		if( State_gameState == State_gameStates.GAME) //playing
		{
			DrawActors();
			Char_DrawBullets();
			AI_Asteroid_DrawAsteroid();
			AI_powerup_DrawPowerup();
			DrawUI();
		}
		else if( State_gameState == State_gameStates.PREGAME ) //pre game
		{
			DrawPreGame();
		}
		else if( State_gameState == State_gameStates.ENDGAME ) //dead
		{
			DrawEndGame();
		}
	}
	DrawSFXToggle(); //always present
}
/**********************************************************************************************************************************************
/************* ENGINE METHODS (Must be at Bottom )  *******************************************************************************************
/****																																	   ****
/*********************************************************************************************************************************************/
function engineUpdate()
{
	State_Update();
	DrawScene();
	UI_Update();
	if( trigger == true ) { trigger = false; }
}

function changeKey(e, flag)
{
	switch (e.keyCode)
	{
		//0, 2, 1, 3, 4 god fucking dammit sam
		case 65: case 37: keys[0] = flag; break; // left
		case 87: case 38: keys[2] = flag; break; // up
		case 68: case 39: keys[1] = flag; break; // right
		case 83: case 40: keys[3] = flag; break; // down
		case 32: 		  keys[4] = flag;break;//if( flag == 1 && past != flag ){trigger = true;} break;  // space TODO work out what tf sam was on about here
		case 13:          keys[5] = flag; break; //enter
		case 1:           UI_LeftClick(e); break; //left click
	}
}

function painter()
{
	ctx.fillStyle = 'rgba(0,0,0,0)';
	ctx.clearRect(0,0,600,800);
	ctx.save();
		DrawScene();
	ctx.restore();
}

/*** Game Initialisation ***/
//Register Call Backs
document.onkeydown=function(e){changeKey((e||window.event), 1);}
document.onkeyup=function(e){changeKey((e||window.event), 0);}
document.onmousedown=function(e){UI_LeftClick(e);}

window.onload=function()
{
	canvas = document.getElementById('game');
	ctx = canvas.getContext('2d');
	setInterval(engineUpdate, 1000/fps);
	
	InitGraphics();
	InitSFX();
	UI_init();
	InitStart();
	//State_Game_ToPreGame();
}
