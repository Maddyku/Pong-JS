class Vec
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }
    get len()   //getter() to normalize velocity movement after start() is called
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set len(value)
    {
        const f = value / this.len;
        this.x *= f;
        this.y *= f;
    }
}

//Data Structure for Rectangle
class Rect {
    constructor(x = 0, y = 0)
    {
        this.pos = new Vec(0, 0);
        this.size = new Vec(x, y);
    }
    get left()
    {
        return this.pos.x - this.size.x / 2;
    }
    get right()
    {
        return this.pos.x + this.size.x / 2;
    }
    get top()
    {
        return this.pos.y - this.size.y / 2;
    }
    get bottom()
    {
        return this.pos.y + this.size.y / 2;
    }
}

class Ball extends Rect
{
    constructor()   //constructor method is a special method for creating and initializing an object created within a class
    {
        super(10, 10);  // Super() keyword in JavaScript used to call the methods of the parent class 
        this.vel = new Vec;
    }
}  

class Player extends Rect
{
    constructor()
    {
        super(20, 100);
        this.vel = new Vec;
        this.score = 0;

        this._lastPos = new Vec;
    }
    update(dt)
    {
        this.vel.y = (this.pos.y - this._lastPos.y) / dt;
        this._lastPos.y = this.pos.y;
    }
}

class Pong 

{
    constructor(canvas)
    {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        this.initialSpeed = 250;
        
        this.ball = new Ball;

        this.players = [
            new Player,
            new Player,
        ];

        //Initializing Players starting paddle positions
        this.players[0].pos.x = 40;
        this.players[1].pos.x = this._canvas.width - 40;
        this.players.forEach(player => {
            player.pos.y = this._canvas.height / 2;
        });

        let lastTime = null;
        this._frameCallback = (millis) => {
            if (lastTime !== null) {
                const diff = millis - lastTime;
                this.update(diff / 1000);
            }
            lastTime = millis;
            requestAnimationFrame(this._frameCallback);
        };


        //Scoreboard Points Numeral Characters
        this.CHAR_PIXEL = 10; 
        this.CHARS = [
            //Array of Numeral Characters for Scoreboard Points
            '111101101101111', //0
            '010010010010010', //1
            '111001111100111', //2
            '111001111001111', //3
            '101101111001001', //4
            '111100111001111', //5
            '111100111101111', //6
            '111001001001001', //7
            '111101111101111', //8
            '111101111001111', //9
        ].map(str => {
            const canvas = document.createElement('canvas');
            const s = this.CHAR_PIXEL;
            canvas.height = s * 5; //5 Pixels High/Char
            canvas.width = s * 3; //3 Pixels Wide/Char
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';
            str.split('').forEach((fill, i) => {
                if (fill === '1'){
                    context.fillRect((i % 3) * s, 
                    (i / 3 | 0) * s, s, s);
                }
            });
            return canvas;
        });

        this.reset();
    
    }
    clear()
    {
        this._context.fillStyle = '#000'; //black color of pong screen and canvas -> stays fixed
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
    collide(player, ball)
    {
        if (player.left < ball.right && player.right > ball.left &&
            player.top < ball.bottom && player.bottom > ball.top) {     
            ball.vel.x = -ball.vel.x * 1.05;
            const len = ball.vel.len;
            ball.vel.y += player.vel.y * .2;
            ball.vel.len = len;
        }
    }
    draw()
    {
        this.clear();
    
        this.drawRect(this.ball);
        this.players.forEach(player => this.drawRect(player));

        this.drawScore();
    }

    drawRect(rect)
    {
        this._context.fillStyle = '#fff'; //(White color of ball)
        this._context.fillRect(rect.left, rect.top,
                               rect.size.x, rect.size.y); //ball position is constantly changing
    }

    drawScore()
    {
        const align = this._canvas.width / 3;
        const cw = this.CHAR_PIXEL * 4;
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - 
                           (cw * chars.length / 2) +
                           this.CHAR_PIXEL / 2;
            chars.forEach((char, pos) => {
                this._context.drawImage(this.CHARS[char|0],
                                        offset + pos * cw, 20);
            });
        });
    }
    play()  //play method for starting ball velocity on mouse click 
    {
        const b = this.ball;
        if (b.vel.x === 0 && b.vel.y === 0) /* if condition to check 
              if ball reset() has been called or if page just loaded */
        {
            // then give ball random x-axis velocity to the left or right
            b.vel.x = 200 * (Math.random() > .5 ? 1 : - 1); 
            // then give ball random y-axis veolocity up or down
            b.vel.y = 200 * (Math.random() * 2 - 1);
            // normalize ball velocity randomization
            b.vel.len = this.initialSpeed;
        }
    }

    reset() /* reset method for resetting ball position and velocity
              every time after player scores a point */
    {
        const b = this.ball;
        //Resetting ball velocity to 0 to hold ball in center of canvas
        b.vel.x = 0;
        b.vel.y = 0;

        //Resetting ball position in center of canvas
        b.pos.x = this._canvas.width/2; 
        b.pos.y = this._canvas.height/2;
    }

    start() 
    { 
        requestAnimationFrame(this._frameCallback);
    }
    
    update(dt) 
    {  /* Delta Time -> Movement of the ball is 
        relative to the time difference of the update methods */
        const cvs = this._canvas;
        const ball = this.ball;
        ball.pos.x += ball.vel.x * dt;
        ball.pos.y += ball.vel.y * dt;

        //Scoreboard Mechanics
        if (ball.right < 0 || ball.left > cvs.width) { 
            ++this.players[ball.vel.x < 0 | 0].score;
            this.reset();
        }

        if (ball.vel.y < 0 && ball.top < 0 ||
            ball.vel.y > 0 && ball.bottom > cvs.height) { 
            ball.vel.y = -ball.vel.y;
        }

        // Player 2 follows the ball and appears like an ingame AI
        this.players[1].pos.y = ball.pos.y; 
        /* Player 2 position follows vertical 
        movement of ball's y-axis movement */
        this.players.forEach(player => {
            player.update(dt);            
            this.collide(player, ball);
        });
        
        this.draw();
        /* At the end of the update, we will redraw the canvas and 
        update the position of the ball */
    }  
}

const canvas = document.querySelector('#pong');
const pong = new Pong(canvas);

//Event Listeners

/* Event Listener for Player 1's click movement =>
triggers play() player has clicked on the screen
to restart ball motion */
canvas.addEventListener('click', () => pong.play());

/* Event Listener for Player 1's mouse movement =>
moves player 1's paddle on the y-axis according to mouse movement */
canvas.addEventListener('mousemove', event => {
    const scale = event.offsetY / event.target.getBoundingClientRect().height;
    pong.players[0].pos.y = canvas.height * scale; 
});

pong.start();