var context, width, height, player;
var ins = {}, keys = {}, enemies = [];

window.addEventListener('keydown', function(e) {
    if (!(e.keyCode in keys)) ins[e.keyCode] = true;
    key[e.keyCode] = true;
    e.preventDefault();
});

window.addEventListener('keyup', function(e) {
    delete ins[e.keyCode];
    delete keys[e.keyCode];
});

function init() {
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth; //document.width is obsolete
    canvas.height = window.innerHeight;

    context.font = "10px Arial";
    context.textAlign = "center"; 

    width = canvas.width;
    height = canvas.height;
    console.log(width, height);
    player = new Player(width / 2, height / 2);
    kills = 0;

    setInterval(draw, 10);
}

function draw_board() {
    for (var x = 0; x <= width; x += 40) {
        context.moveTo(0.5 + x, 0);
        context.lineTo(0.5 + x, height);
    }

    for (var x = 0; x <= height; x += 40) {
        context.moveTo(0, 0.5 + x);
        context.lineTo(width, 0.5 + x);
    }

    context.strokeStyle = "#d3d3d3";
    context.stroke();
}

function distance(x, y) {
    return Math.sqrt((x.x - y.x) * (x.x - y.x) + (x.y - y.y) * (x.y - y.y));
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.level = 1;
        this.health = this.level * 100;
    }
    upgrade() {
        this.level++;
        console.log("upgraded")
        document.getElementById("level").textContent = this.level;
    }
    render() {
        // render the player
        context.beginPath();
        context.fillStyle = "green";
        context.arc(this.x, this.y, 20, 0, Math.PI*2, true);
        context.closePath();
        context.fill();

        // movement and bounds checking
        if (37 in keys && this.x > 20) this.x--;
        if (38 in keys && this.y > 20) this.y--;
        if (39 in keys && this.x < width - 20) this.x++;
        if (40 in keys && this.y < height - 20) this.y++;

        // health regen
        this.health = Math.min(this.level * 100, this.health + 0.1);
        context.strokeText(Math.round(this.health), this.x, this.y);
    }
}

class Enemy {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.health = 100;
    }
    render() {
        // render enemy
        context.beginPath();
        context.fillStyle = "brown";
        context.arc(this.x, this.y, 20, 0, Math.PI*2, true);
        context.closePath();
        context.fill();

        // movement and collision checking
        var dx = (width / 2 - this.x) / Math.abs(width / 2 - this.x);
        var dy = (height / 2 - this.y) / Math.abs(height / 2 - this.y);

        var move = true, touch_player = false;
        for (var i = 0; i < enemies.length; i++) {
            var dist = distance(this, enemies[i]);
            if (dist < 40 && dist != 0) {
                var dxt = (this.x - enemies[i].x) / Math.abs(this.x - enemies[i].x);
                var dyt = (this.y - enemies[i].y) / Math.abs(this.y - enemies[i].y);
                this.x += dxt;
                this.y += dyt;
                move = false;
            }
        }
        if (player != undefined) {
        var dist = distance(this, player);
            if (dist < 40 && dist != 0) {
                touch_player = true;
                var dxt = (this.x - player.x) / Math.abs(this.x - player.x);
                var dyt = (this.y - player.y) / Math.abs(this.y - player.y);
                this.x += dxt;
                this.y += dyt;
                move = false;
                this.health -= 0.1;
                player.health -= 0.2;
            }
        }

        if (move && !touch_player) {
            this.x += dx * Math.random();
            this.y += dy * Math.random();
        }
        context.strokeText(Math.round(this.health), this.x, this.y);
    }
}

function draw() {
    context.clearRect(0, 0, width, height);
    draw_board();
    context.strokeStyle = "white";
    if (player != undefined) {
        player.render();
        if (88 in ins) player.upgrade();
    }
    for (key in ins) keys[key] = true;
    ins = {};

    if (Math.random() < 0.1 && enemies.length < 5) {
        var enemy = new Enemy(Math.random() * width, Math.random() * height);
        enemies.push(enemy);
    }

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].render();
        if (enemies[i].health <= 0) {
            enemies.splice(i, 1);
            i--;
        }
    }

    if (player.health <= 0) {
        player = undefined;
    }
}