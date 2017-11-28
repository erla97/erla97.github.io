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
var bounce = new Audio('Sound/bounce.mp3');
var modal = document.getElementById('myModal');
var gameOver = false;

//Fylki sem inniheldur liti
var colors = ["#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#2ecc71", "#f39c12", "#1abc9c",];

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

document.addEventListener("Bounce", function() {
	if (!bounce.ended) {
		bounce.pause();
		bounce.currentTime = 0;
	}
	bounce.play();
});

window.onclick = function() {
    modal.style.display = "none";
    document.location.reload();
};

var bEvent = new CustomEvent("Bounce");

var Ball = {
	create: function (bdx,  bdy) {
		var newBall = Object.create(this);
		newBall.x = Math.floor(Math.random() * 450 + 25);
		newBall.y = Math.floor(Math.random() * 250 + 25);
		newBall.dx = bdx;
		newBall.dy = bdy;
		var i = Math.floor(Math.random() * 7);
		newBall.color = colors[i];
		return newBall;
	},

	collision: function () {
		if(this.x + this.dx > canvas.width-ballRadius || this.x + this.dx < ballRadius) {
	        this.dx = -this.dx;
	    }
	    if(this.y + this.dy < ballRadius) {
	        this.dy = -this.dy;
	    } 
		else if(this.y - 5 + this.dy > canvas.height-ballRadius) {
		    if(this.x > paddleX - 10 && this.x < paddleX + paddleWidth + 10) {
		        this.dy = -this.dy;
		        totalScore = totalScore + 5;
		        document.getElementById("score").innerHTML = "Score: " + totalScore;
		        document.dispatchEvent(bEvent);
		    }
		    else {
		        modal.style.display = "block";
		        gameOver = true;
		    }
		}

		this.x += this.dx;
    	this.y += this.dy;
	},

	drawBall: function () {
		ctx.beginPath();
	    ctx.arc(this.x, this.y, ballRadius, 0, Math.PI*2);
	    ctx.fillStyle = this.color;
	    ctx.fill();
	    ctx.closePath();
	    this.collision();
	}
};

var ball1 = Ball.create(2, -5);
var ball2 = Ball.create(3, 4);
var ball3 = Ball.create(-3, -3);
var ball4 = Ball.create(4, 2);

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#34495e";
    ctx.fill();
    ctx.closePath();
}

function draw() {
	if (gameOver === false) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	    ball1.drawBall();
	    ball2.drawBall();
	    if (totalScore >= 30) {
	    	ball3.drawBall();
	    }
	    if (totalScore >= 60) {
	    	ball4.drawBall();
	    }
	    drawPaddle();
	}
    
    if(rightPressed && paddleX < canvas.width-paddleWidth) {
    	paddleX += 15;
	}
	else if(leftPressed && paddleX > 0) {
	    paddleX -= 15;
	}
}

setInterval(draw, 20);