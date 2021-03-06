"use strict";
var board;

var draw_array = [];
var draw_pos = [];
var CHESS_WIDTH = 60;
var CHESS_HEIGHT = 33;
var player_color = { 0:"blue", 1:"red"}
var current_player = 0;
//Prepare stage
//Mouse related
var mouse_down = false;
var selected_pos;
//timer
var timer_value = 0;
var game_started = false;
var current_game_player = 0;
//State machine
var chess_changed = true;
// Enum type for Chess status
var GemStatus = {"Destroying":1, "Ongoing":2, "Moving":3, "Destroyed":4}
Object.freeze(GemStatus);		//Enum syntax for Javascript

var SS=false;
var Move = 3;
class Gem {
	constructor(color, gemStatus) {
		this.color = color;
		this.gemStatus = gemStatus;
		this.counter = 0;
	}
	move(src_x, src_y, dst_x, dst_y) {
		this.src_x = src_x;
		this.src_y = src_y;
		this.dst_x = dst_x;
		this.dst_y = dst_y;
		if(this.gemStatus==GemStatus.Ongoing)
			this.gemStatus = GemStatus.Moving;
		this.draw_pos = calLocation(src_x, src_y);
		this.draw_pos_dst = calLocation(dst_x, dst_y);
	}
	destroy() {
		this.gemStatus = GemStatus.Destroying;
	}
	draw() {
		if(this.gemStatus == GemStatus.Destroyed) 
			return;
		if(!(this.draw_pos[0] == this.draw_pos_dst[0] && this.draw_pos[1] == this.draw_pos_dst[1])) {
			var w = (canvas.width-8)/size_x-4;
			var h = (canvas.height-8)/size_y-4;
			if(this.draw_pos[0] > this.draw_pos_dst[0])
				this.draw_pos[0] -= Move;
			if(this.draw_pos[0] < this.draw_pos_dst[0])
				this.draw_pos[0] += Move;
			if(this.draw_pos[1] > this.draw_pos_dst[1])
				this.draw_pos[1] -= Move;
			if(this.draw_pos[1] < this.draw_pos_dst[1])
				this.draw_pos[1] += Move;
			if(Math.abs(this.draw_pos[0] - this.draw_pos_dst[0]) < 3)
				this.draw_pos[0] = this.draw_pos_dst[0];
			if(Math.abs(this.draw_pos[1] - this.draw_pos_dst[1]) < 3)
				this.draw_pos[1] = this.draw_pos_dst[1];
			if(SS==true)
			console.log(this.draw_pos[0] , this.draw_pos_dst[0] , this.draw_pos[1] , this.draw_pos_dst[1]);
			ctx.drawImage(img, colorImg[this.color][0], colorImg[this.color][1], 60, 60, this.draw_pos[0], this.draw_pos[1], w, h);
			return;
		} else if(this.gemStatus == GemStatus.Destroying) {
			this.counter += 1;
			if(this.counter>=7) {
				this.counter=0;
				this.gemStatus = GemStatus.Destroyed;
				return;
			}
			var w = (canvas.width-8)/size_x-4;
			var h = (canvas.height-8)/size_y-4;
			w = w/7*this.counter;
			h = h/7*this.counter;
			ctx.drawImage(img, colorImg[this.color][0], colorImg[this.color][1], 60, 60, this.draw_pos[0], this.draw_pos[1], w, h);
			return;
		} 
		this.gemStatus = GemStatus.Ongoing;
		var w = (canvas.width-8)/size_x-4;
		var h = (canvas.height-8)/size_y-4;
		ctx.drawImage(img, colorImg[this.color][0], colorImg[this.color][1], 60, 60, this.draw_pos[0], this.draw_pos[1], w, h);
	}
}

var img = new Image();
img.src="img/gem.png";
function calLocation(x, y) {
	var w = (canvas.width-8)/size_x;
	var h = (canvas.height-8)/size_y;
	return [w*x+6,h*y+3];
}
function mytimer() {
	if(game_started==true)
	{
		var i = document.getElementById("timer").value;
		if(i>0)
			document.getElementById("timer").value = i - 1;
		else
		{
			alert("Time's up!");
			game_started = false;
		}
	}
}
function timer_next_player() {
	document.getElementById("timer").value = timer_value;
}
function GameStart() {
	size=document.getElementById("board_size").value;
	if(size==0) {
		canvas.width=450;
		canvas.height=550;
		size_x = 10;
		size_y = 15;
	} else if(size==1) {
		canvas.width=950;
		canvas.height=550;
		size_x = 40;
		size_y = 20;
	}

	board = new Board(size_x, size_y);
	timer_value = document.getElementById("timer").value;
	document.getElementById("timer").disabled = true;
	document.getElementById("difficulty").disabled = true;
	document.getElementById("board_size").disabled = true;
	document.getElementById("start_button").style.visibility = "hidden";
	document.getElementById("stop_button").style.visibility = "visible";
	game_started = true;
}
function difficulty() {
	console.log("A");
	console.log(document.getElementById("difficulty").value+1);
	document.getElementById("timer").value = (document.getElementById("difficulty").value)*60
}


function GameStop() {
	document.getElementById("timer").disabled = false;
	document.getElementById("difficulty").disabled = false;
	document.getElementById("board_size").disabled = false;
	document.getElementById("start_button").style.visibility = "visible";
	document.getElementById("stop_button").style.visibility = "hidden";
	game_started = false;
}

//set the positions to an array.
function init() {
	var x_arr = [7, 370];
	x_arr.forEach( (k) => {
		for(var i=0; i<6; i++) {
			draw_pos.push({x: 7, y: k});
			draw_pos.push({x: 102, y: k});
			draw_pos.push({x: 204, y: k});
			draw_pos.push({x: 307, y: k});
			draw_pos.push({x: 400, y: k});
			k += 48;
		}
	});
	document.getElementById("start_button").addEventListener("click", GameStart);
	document.getElementById("stop_button").addEventListener("click", GameStop);
	setInterval(mytimer, 1000);
}

function get_draw_pos(x, y) {	//-> draw_pos[x]
	return draw_pos[x+y*5];
}

function get_draw_pos_index(obj) { // draw_pos[x] => x,y
	index = draw_pos.indexOf(obj);
	if(index==-1)
		return;
	else
		return {x:index%5, y:Math.floor(index/5)};
}

function canvas_down(e) {
	selected_pos = board.getLogicPos(e.offsetX, e.offsetY)
}

function canvas_up(e) {
	var target_pos = board.getLogicPos(e.offsetX, e.offsetY);
	board.swap(selected_pos[0], selected_pos[1], target_pos[0], target_pos[1]);
} 
var canvas;
var ctx;
var p1;

function all_init() {
	canvas = document.getElementById("Board");
	ctx = canvas.getContext("2d");
	resetChess();
	init();
	canvas.addEventListener('mousedown', canvas_down);
	canvas.addEventListener('mouseup', canvas_up);
	setInterval( () => { draw(ctx);});
	update_draw_array();
}

function is_chess_visible(chess) {
	if(chess.display==true)
		return true;
	if(chess.player == current_player)
		return true;
	else
		return false;
}

function update_draw_array() {
}

//[[5,5], [88,5], [175,5], [263,5], [345,5],
//

function resetChess() {
	draw_array=[];
}
function drawChess(txt, x, y, color, txt_visible) {
	draw_array.push({txt:txt, x:x, y:y, color:color, txt_visible: txt_visible});
}


//==============================================================================
// Render function
//==============================================================================
var dash_count=0;
var loop_count=0;
var size_x;
var size_y;
var size;
var GameStatus = {"Ongoing":1, "Moving":2, "Destroying":3}
var gameStatus = GameStatus.Ongoing;

var pause_timer = 100;
function draw(ctx) {
	if(board) {
		gameStatus = GameStatus.Ongoing;
		board.arr.forEach( (i) => {
			if(i.gemStatus == GemStatus.Moving)
				gameStatus = GameStatus.Moving;
		});
		if(gameStatus == GameStatus.Ongoing) {
			for(var i=0; i<size_x; i++)
				board.fillCol(i);
			for(var i=0; i<size_y; i++)
				board.fillRow(i);
			//finished moving
			if(pause_timer>0)
				pause_timer--;
			else {
				board.clearCollision();
				pause_timer = 100;
			}
		}
	}

	size=document.getElementById("board_size").value;
	if(size==0) {
		canvas.width=450;
		canvas.height=550;
		size_x = 10;
		size_y = 15;
	} else if(size==1) {
		canvas.width=950;
		canvas.height=550;
		size_x = 40;
		size_y = 20;
	}
	//rect
	ctx.clearRect(0,0, canvas.width, canvas.height);
	ctx.lineWidth=8;
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fillRect(0,0,canvas.width, canvas.height);
	ctx.strokeRect(0,0,canvas.width,canvas.height);
	//line
	ctx.strokeStyle="gray";
	ctx.lineWidth=1;
	for(var i=0; i<size_x; i++) {
		ctx.beginPath();
		var x = (canvas.width-8)/size_x;
		ctx.moveTo(x*i+4,4);
		ctx.lineTo(x*i+4,canvas.height-4);
		ctx.stroke();
	}
	for(var i=0; i<size_y; i++) {
		ctx.beginPath();
		var y = (canvas.height-8)/size_y;
		ctx.moveTo(4, y*i+2);
		ctx.lineTo(canvas.width-2, y*i+2);
		ctx.stroke();
	}
	if(game_started == true)
	board.arr.forEach( (i) => i.draw());
}
var colorImg = {
	yellow: [556, 54],
	blue: [556, 179],
	green: [556, 304],
	red: [556, 429],
	purple: [556, 678]
}
function getRandomInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var colorList = ["yellow","blue","green","red","purple"]

class Board {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.arr = [];
		for(var i=0; i<x; i++) {
			for(var j=0; j<y; j++) {
				while(1) {
					//ensure start => no continue color
					var rand = getRandomInt(0,4);
					var c = colorList[rand];
					var t1 = this.getGem(i-1,j);
					var t2 = this.getGem(i-2,j);
					if(t1 && t2 && t1.color==t2.color && t2.color==c)
						continue;
					t1 = this.getGem(i,j-1);
					t2 = this.getGem(i,j-2);
					if(t1 && t2 && t1.color==t2.color && t2.color==c)
						continue;
					break;
				}
				var g = new Gem(colorList[rand], GemStatus.Ongoing);
				g.move(i,j-size_y,i,j);
				this.arr.push(g);
			}
		}
	}
	//return a list if collision occur
	returnCollision(x,y) {
		var ret = []
		var A = [[-2,-1,0],
				[-1,0,1],
				[0,1,2]];
		A.forEach( (i) => {
			var B = [];
			B.push(this.getGem(x+i[0], y));
			B.push(this.getGem(x+i[1], y));
			B.push(this.getGem(x+i[2], y));
			if(B[0] && B[1] && B[2] &&
				B[0].gemStatus==GemStatus.Ongoing &&
				B[1].gemStatus==GemStatus.Ongoing &&
				B[2].gemStatus==GemStatus.Ongoing &&
				B[0].color == B[1].color &&
				B[1].color == B[2].color) {
				//add horizontal list
				ret.push(this.getGem(x,y));
				var k=1;
				do {
					var temp = this.getGem(x+k,y);
					if(temp && temp.color==this.getGem(x,y).color)
						ret.push(temp);
					else
						break;
					k+=1;
				}while(1);
				var k=-1;
				do {
					var temp = this.getGem(x+k,y);
					if(temp && temp.color==this.getGem(x,y).color)
						ret.push(temp);
					else
						break;
					k-=1;
				}while(1);
			}
		});
		A.forEach( (i) => {
			var B = [];
			B.push(this.getGem(x, y+i[0]));
			B.push(this.getGem(x, y+i[1]));
			B.push(this.getGem(x, y+i[2]));
			if(B[0] && B[1] && B[2] &&
				B[0].color == B[1].color &&
				B[1].color == B[2].color) {
				//add horizontal list
				ret.push(this.getGem(x,y));
				var k=1;
				do {
					var temp = this.getGem(x,y+k);
					if(temp && temp.color==this.getGem(x,y).color)
						ret.push(temp);
					else
						break;
					k+=1;
				}while(1);
				var k=-1;
				do {
					var temp = this.getGem(x,y+k);
					if(temp && temp.color==this.getGem(x,y).color)
						ret.push(temp);
					else
						break;
					k-=1;
				}while(1);
			}
		});

		var uniqueArray = ret.filter(function(item, pos, self) {
			    return self.indexOf(item) == pos;
		})
		return uniqueArray;
	}
	getGem(x,y) {
		if(x>=0 && x<size_x && y>=0 && y<size_y)
			return this.arr[x*size_y+y];
		return;
	}
	getLogicPos(mouseX, mouseY) {
		var x = (canvas.width-8)/size_x;
		var y = (canvas.height-8)/size_y;
		return [Math.floor((mouseX-4)/x), Math.floor((mouseY-4)/y)];
	}
	clearCollision() {
		var total = []
		for(var i=0; i<size_x; i++)
			for(var j=0; j<size_y; j++)
				this.returnCollision(i,j).forEach( (x) => total.push(x));
		var uniqueArray = total.filter(function(item, pos, self) {
			    return self.indexOf(item) == pos;
		})
		uniqueArray.forEach( (i) => {
			if(i.gemStatus != GemStatus.Destroying && i.gemStatus != GemStatus.Destroyed)
				i.destroy();
		});
	}
	
	fillCol(x) {
		var ptr1 = size_y-1;
		var ptr2 = size_y-1;
		var newPos=[];
		while(ptr1>=0 && ptr2>=0) {
			var gem1 = this.getGem(x, ptr1);
			var gem2 = this.getGem(x, ptr2);
			if(gem1.gemStatus==GemStatus.Destroyed){
				do {
					if(ptr2<0) {
						break;
					}
					if(this.getGem(x,ptr2).gemStatus!=GemStatus.Destroyed) {
						newPos.push([ptr1,ptr2]);
						break;
					}
					ptr2--;
				} while(1)
			} else if(ptr1!=ptr2) {
				newPos.push([ptr1,ptr2]);
			}
			ptr1--;
			ptr2--;
		}
		newPos.forEach( (i) => {
			this.forceSwap(x,i[0],x,i[1]);
		});
	}
	fillRow(x) {
		var ptr1 = size_x-1;
		var ptr2 = size_x-1;
		var newPos=[];
		while(ptr1>=0 && ptr2>=0) {
			var gem1 = this.getGem(ptr1,x);
			var gem2 = this.getGem(ptr2,x);
			if(gem1.gemStatus==GemStatus.Destroyed){
				do {
					if(ptr2<0) {
						break;
					}
					if(this.getGem(ptr2,x).gemStatus!=GemStatus.Destroyed) {
						newPos.push([ptr1,ptr2]);
						break;
					}
					ptr2--;
				} while(1)
			} else if(ptr1!=ptr2) {
				newPos.push([ptr1,ptr2]);
			}
			ptr1--;
			ptr2--;
		}
		newPos.forEach( (i) => {
			this.forceSwap(i[0],x,i[1],x);
		});
	}
	forceSwap(ori_x,ori_y,dst_x,dst_y) {
		var tmp = this.arr[ori_x*size_y+ori_y];
		this.arr[ori_x*size_y+ori_y] = this.arr[dst_x*size_y+dst_y];
		this.arr[dst_x*size_y+dst_y] = tmp;
		board.getGem(ori_x, ori_y).move(dst_x, dst_y, ori_x, ori_y);
		board.getGem(dst_x, dst_y).move(ori_x, ori_y, dst_x, dst_y);
	}
	swap(ori_x,ori_y,dst_x,dst_y) {
		var cond1 = Math.abs(ori_x - dst_x);
		var cond2 = Math.abs(ori_y - dst_y);
		if(!((cond1==1 && cond2==0) || (cond1==0&&cond2==1)))
			return;
		//swap
		var tmp = this.arr[ori_x*size_y+ori_y];
		this.arr[ori_x*size_y+ori_y] = this.arr[dst_x*size_y+dst_y];
		this.arr[dst_x*size_y+dst_y] = tmp;
		if(this.returnCollision(ori_x, ori_y).length>0 || this.returnCollision(dst_x, dst_y).length>0) {
			board.getGem(ori_x, ori_y).move(dst_x, dst_y, ori_x, ori_y);
			board.getGem(dst_x, dst_y).move(ori_x, ori_y, dst_x, dst_y);
		} else {
			var tmp = this.arr[ori_x*size_y+ori_y];
			this.arr[ori_x*size_y+ori_y] = this.arr[dst_x*size_y+dst_y];
			this.arr[dst_x*size_y+dst_y] = tmp;
		}
	}
}
