"use strict";
//Javascript

var canvas = document.getElementById("myCanvas"); //Sótt í canvas
var ctx = canvas.getContext("2d"); //Þetta notað til þess að teikna í canvasinn

//Breytur Skilgreindar
var paddleHeight = 10;
var paddleWidth = 90;
var paddleX = (canvas.width-paddleWidth)/2;
var rightPressed = false;
var leftPressed = false;
var ballRadius = 14;
var totalScore = 0;
var modal = document.getElementById('myModal');
var gameOver = false;
var powerX = Math.floor(Math.random() * 450 + 25);
var powerY = 0;
var power = false;
var totalSeconds = 0;

//Hljóð
var bounce = new Audio('Sound/bounce.mp3');
var voiceGameOver = new Audio('Sound/GameOver.mp3');
var sPowerUp = new Audio('Sound/PowerUp.wav');

//skilgreint hljóðstyrk
bounce.volume = 0.1;
voiceGameOver.volume = 0.1;
sPowerUp.volume = 0.1;

//Fylki sem inniheldur liti
var colors = ["#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#2ecc71", "#f39c12", "#1abc9c",];

//Event Listeners skilgreindir
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

//Fall sem segir til um ef ýtt er á hægri og vinstri örva takkana
function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}

//Fall sem segir til um ef sleppt er hægri og vinstri örva tökkunum
function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}

//Fall sem finnur staðsetningu músarinnar og færir paddle-inn eftir staðsetningu hennar
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

//Bý til Event Listener fyrir Bounce hljóðið
document.addEventListener("Bounce", function() {
	//Ef að bounce hljóðið hefur ekki endað þegar kallað er aftur á fallið er stoppað hljóðið og sett currentTime á byrjun hljóðsins
	if (!bounce.ended) {
		bounce.pause();
		bounce.currentTime = 0;
	}
	//hljóðið spilað
	bounce.play();
});

//Þegar ýtt er á einhvern takka(á lyklaborði) þegar GameOver modal-ið er uppi byrjar leikurinn upp á nýtt og GameOver modal-ið hverfur
document.onkeypress = function() {
	if (gameOver === true) {
		modal.style.display = "none";
    	document.location.reload();
	}
};

//Þegar ýtt er á vintri takkann á músinni þegar GameOver modal-ið er uppi byrjar leikurinn upp á nýtt og GameOver modal-ið hverfur
window.onclick = function() {
    if (gameOver === true) {
		modal.style.display = "none";
    	document.location.reload();
	}
};

//Skilgreint eventið sem ég bjó til ofar í kóðanum
var bEvent = new CustomEvent("Bounce");

//Object fyrir bolta
var Ball = {
	//Fall sem býr til bolta, tekur inn tvær færibreytur
	create: function (bdx,  bdy) {
		var newBall = Object.create(this); //býr til bolta(object)
		newBall.x = Math.floor(Math.random() * 450 + 25); //Random x gildi
		newBall.y = Math.floor(Math.random() * 250 + 25); //Random y gildi
		newBall.dx = bdx; //tekur inn færibreytu hér, bdx.
		newBall.dy = bdy; //tekur inn færibreytu hér, bdy.
		var i = Math.floor(Math.random() * 7); //i fær random gildi, 0-7
		newBall.color = colors[i]; //hver bolti fær random lit úr colors fylkinu
		return newBall; //Fallið skilar síðan frá sér boltanum sem það bjó til
	},
	//Fall sem finnur út hvort að bolti hafi hitt á vegg, rauðu línuna eða á paddle-inn
	collision: function () {
		//Ef að bolti hittir hægri eða vinstri hlið á canvas skýst hann til baka
		if(this.x + this.dx > canvas.width-ballRadius || this.x + this.dx < ballRadius) {
	        this.dx = -this.dx;
	    }
	    //Ef bolti hittir "loftið" á canvas skýst hann til baka
	    if(this.y + this.dy < ballRadius) {
	        this.dy = -this.dy;
	    }
	    //Ef bolti fer að hitta botn/hittir botn..
		else if(this.y - 5 + this.dy > canvas.height-ballRadius) {
			//Ef bolti hittir paddle-inn rétt áður en hann hittir botninn skýst hann til baka
		    if(this.x > paddleX - 10 && this.x < paddleX + paddleWidth + 10) {
		        this.dy = -this.dy;
		        totalScore = totalScore + 5; //Í hver skipti sem notandi bjargar bolta bætast 5 stig við heildarstigin
		        document.getElementById("score").innerHTML = "Score: " + totalScore; //Hérna er skrifað stigin svo að notandi getur séð þau
		        document.dispatchEvent(bEvent); //Þegar bolti hittir á paddle-inn spilast bounce hljóð
		    }
		    //annars ef bolti hittir ekki paddle-inn er leiknum lokið
		    else {
		        modal.style.display = "block"; //GameOver modal birtist þegar bolti hittir rauðu línuna
		        gameOver = true;
		        voiceGameOver.play(); //Rödd sem segir Game Over spilast
		    }
		}

		//x og y bætir við sig gildum dx og dy
		this.x += this.dx;
    	this.y += this.dy;
	},
	//Fall sem teiknar bolta, teiknaður á 20ms, eins og hann sé að hreyfast því x og y gildi breytast
	drawBall: function () {
		ctx.beginPath();
	    ctx.arc(this.x, this.y, ballRadius, 0, Math.PI*2); //Teiknar hring(bolta), staðsetning eftir x og y gildinu
	    ctx.fillStyle = this.color;
	    ctx.fill();
	    ctx.closePath();
	    this.collision(); //Kallað á collision fallið í hvert skipti sem boltinn er teiknaður
	}
};

//Búið til bolta útfrá Ball objectinu
var ball1 = Ball.create(2, -5);
var ball2 = Ball.create(3, 4);
var ball3 = Ball.create(-3, -3);
var ball4 = Ball.create(4, 2);
var ball5 = Ball.create(2, 2);

//Fall sem teiknar PowerUp
function drawPowerUp() {
	ctx.beginPath();
	ctx.rect(powerX, powerY, 20, 20); //Teiknar ferhyrning, staðsetning eftir x og y gildinu
	ctx.fillStyle = "#FF00CC";
	ctx.fill();
	ctx.closePath();
}

//Fall sem teiknar paddle-inn
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight); //Teiknar ferhyrning, staðsetning eftir x og y gildinu
    ctx.fillStyle = "#34495e";
    ctx.fill();
    ctx.closePath();
}

setInterval(setTime, 1000); //setTime gerist á hverri 1000ms.

function setTime()
{
    ++totalSeconds; //totalSeconds bætir við einum á hverri sek.
    //Ef að totalSeconds verður 7, breytist breiddin á paddle í venjulega stærð
    if (totalSeconds == 7) {
    	paddleWidth = 90;
    }
}

//Fall sem teiknar inn í canvasinn 
function draw() {
	//Ef að leik er ekki lokið
	if (gameOver === false) {
		ctx.clearRect(0, 0, canvas.width, canvas.height); //Hreinsað er canvasinn áður en allt er teiknað aftur
	    ball1.drawBall(); //Teiknað fyrsta boltann
	    ball2.drawBall(); //Teiknað annan bolta
	    //Ef að totalScore er deilt með 50 hefur engan afgang eða totalScore er ekki 0
	    if (totalScore % 50 === 0 && totalScore !== 0) {
	    	powerY = 0;
	    	power = true;
	    }
	    if (power === true) {
	    	drawPowerUp(); //Teiknað PowerUp
	    	powerY += 5; //Til þess að PowerUp færist, bætist við Y gildið 5 í hvert skipti
		}
		//Teikað er þriðja boltann ef að stigin er 30+
	    if (totalScore >= 30) {
	    	ball3.drawBall();
	    }
	    //Teikað er fjórða boltann ef að stigin er 70+
	    if (totalScore >= 70) {
	    	ball4.drawBall();
	    }
	    //Teikað er fimmta boltann ef að stigin er 100+
	    if (totalScore >= 100) {
	    	ball5.drawBall();
	    }
	    drawPaddle(); //teiknað paddle-inn
	}
    
    //Hér er fært paddle-inn efir því hvaða takka notandi ýtir á (hægri/vinstri örva takka)
    if(rightPressed && paddleX < canvas.width-paddleWidth) {
    	paddleX += 15;
	}
	else if(leftPressed && paddleX > 0) {
	    paddleX -= 15;
	}

	//Ef að PowerUp er komið út fyrir canvas hverfur það
	if (powerY > 505) {
		power = false;
	}
	//Ef að PowerUp fer að hitta botn/hittir botn
	else if(powerY > canvas.height - paddleHeight && power === true) {
		//Annars ef að PowerUp hittir á paddle-inn..
		if(powerX > paddleX - 10 && powerX < paddleX + paddleWidth + 10) {
	        sPowerUp.play(); //Spilast PowerUp hljóð
	        paddleWidth = 130; //Breiddin á paddle stækkar
	        totalSeconds = 0; //Tíminn byrjar upp á nýtt
	        power = false; //PoerUp kassinn hverfur
	        powerX = Math.floor(Math.random() * 450 + 25); //Random x-gildi fyrir næsta PowerUp fundið
	    }
	}
}

//draw fallið fer í gang á hverjum 20ms
setInterval(draw, 20);