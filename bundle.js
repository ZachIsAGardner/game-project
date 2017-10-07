/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const Square = __webpack_require__(2);
const Input = __webpack_require__(1);

const ground = new Square(0, 450, 500, 20, 'black');
const square = new Square(50, 150, 25, 50, 'pink', [ground]);

const input = new Input(square);

Game = function (xDim, yDim) {
  this.xDim = xDim;
  this.yDim = yDim;
};

Game.prototype.render = function(ctx) {
  ctx.clearRect(0, 0, this.xDim, this.yDim);
};

Game.prototype.start = function (canvasEl) {
  const ctx = canvasEl.getContext("2d");

  const animateCallback = () => {
    square.movePos();
    square.raycast();

    //clear canvas then render objects
    this.render(ctx);
    square.render(ctx);
    square.renderRaycast(ctx);
    ground.render(ctx);

    requestAnimationFrame(animateCallback);
  };

  animateCallback();
};

module.exports = Game;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

Input = function (player) {
  this.player = player;
  that = this;
};


document.addEventListener('keydown', function(event) {

  let moveX = 0;

  if(event.keyCode == 38) {
    that.player.jump();
  }
  if(event.keyCode == 37) {
    moveX = -1;
  } else if(event.keyCode == 39) {
    moveX = 1;
  }

  that.player.calcVelX(moveX);
});

document.addEventListener('keyup', function(event) {

  if (event.keyCode == 37 || event.keyCode == 39) {
    that.player.calcVelX(0);
  }
  if (event.keyCode == 38) {
    that.player.minJump();
  }

});

module.exports = Input;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

Square = function (centerX, centerY, width, height, color, colliders) {

  this.centerX = centerX;
  this.centerY = centerY;
  this.width = width;
  this.height = height;
  this.color = color;

  this.colliders = colliders;

  this.velX = 0;
  this.velY = 0;

  this.minJumpVel = -2;
  this.maxJumpVel = -6;

  this.grav = 0.2;
};

Square.prototype.update = function() {

};

Square.prototype.calcVelX = function(moveX) {
  this.velX = moveX;
};

Square.prototype.calcVelY = function() {
  this.velY += this.grav;
};


Square.prototype.checkCollision = function (point) {
  //vertical collisions

  if (point[1] > this.colliders[0].calcCenter()[1] - (this.colliders[0].height / 2) && point[1] < this.colliders[0].calcCenter()[1] + (this.colliders[0].height / 2)) {
    if (point[0] > this.colliders[0].calcCenter()[0] - (this.colliders[0].width / 2) && point[0] < this.colliders[0].calcCenter()[0] + (this.colliders[0].width / 2)) {
      this.centerY = (this.colliders[0].calcCenter()[1] - this.colliders[0].height / 2) - this.height;
      this.velY = 0;
    }
  }

};

//this is called on jump key lift
Square.prototype.minJump = function() {
  this.velY = this.minJumpVel;
};

Square.prototype.jump = function() {
  this.velY = this.maxJumpVel;
};

Square.prototype.movePos = function() {
  this.centerX += (this.velX * 3);

  this.calcVelY();
  this.centerY += this.velY;

  // this is bad because for a frame it will enter the collision
  // this.checkCollision([0, this.calcCenter()[1] + (this.height / 2)]);
};

Square.prototype.render = function(ctx) {
  ctx.fillStyle = this.color;
  ctx.fillRect(this.centerX, this.centerY, this.width, this.height);
};

Square.prototype.calcCenter = function() {
  return [this.centerX + (this.width / 2), this.centerY + (this.height / 2)];
};

//--- raycast, seperate into another file later if you feel like it i dont know

Square.prototype.raycast = function() {
  const start = [this.calcCenter()[0], this.calcCenter()[1] + (this.height / 2)];
  const end = [this.calcCenter()[0], this.calcCenter()[1] + (this.height / 2) + Math.abs(this.velY)];
  this.checkCollision(end);
};

Square.prototype.renderRaycast = function(ctx, start, end, color) {
  ctx.beginPath();
  ctx.moveTo(this.calcCenter()[0], this.calcCenter()[1] + (this.height / 2));
  ctx.lineTo(this.calcCenter()[0], this.calcCenter()[1] + (this.height / 2) + Math.abs(this.velY));
  ctx.stroke();
};

module.exports = Square;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(0);

const canvasEl = document.getElementsByTagName("canvas")[0];
canvasEl.height = window.innerHeight;
canvasEl.width = window.innerWidth;

new Game(canvasEl.width, canvasEl.height).start(canvasEl);


/***/ })
/******/ ]);