class Game{
    constructor(element, width, height, playerCount){                   //Early Development - needs to be fixed according to diagram
        this.canvas = element;
        this.ctx = this.canvas.getContext("2d");
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.players = [];
        this.alive = [];
        this.grid = new Grid(width, height, playerCount);
        this.state = 0; //0 = Countdown, 1 = inGame, 2 = Winner Message (Reset)
        this.counter = 0;
    }

    Clear(){
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(0,0, this.width, this.height);
    }

    AddPlayer(player){
        this.players.push(player);
        this.alive.push(player);
    }

    Tick(){
        switch (this.state){
            case 0:     //Countdown
                this.counter++;
                this.Clear();
                //Draw Living player (if exists)
                
                for (let i of this.alive){
                    this.Draw(i.position.x, i.position.y, i.color);
                }

                //Draw Map
                for (let i = 0; i < this.grid.width; i++){
                    for (let j = 0; j < this.grid.height; j++){
                        let currentTile = this.grid.GetTile(i, j);
                        switch(currentTile){
                            case TileTypes.Barrier:
                                this.Draw(i, j, "#000000");
                                break;
                            case TileTypes.Line1:
                                this.Draw(i, j, "#FF0000");
                                break;
                            case TileTypes.Line2:
                                this.Draw(i, j, "#00FF00");
                        }
                    }
                }
                
                //Draw CountDown
                this.ctx.fillStyle = "#000000";
                if (this.counter < 15){
                    this.ctx.fillText("3", 10, 10, 10);
                }
                else if (this.counter < 30){
                    this.ctx.fillText("2", 10, 10, 10);
                }
                else if (this.counter < 45){
                    this.ctx.fillText("1", 10, 10, 10);
                }
                else{
                    this.state = 1;
                    console.log("Fight");
                }
                break;
            case 1:     //inGame
                this.Clear();   //Reset CTX
                let remove = [];
                for (let i of this.alive){      //
                    let oldPos = i.GetPos();
                    this.grid.SetTile(oldPos.x, oldPos.y, i.controllerState.id);
                    let newPos = i.Move();
                    let currentTile = this.grid.GetTile(newPos.x, newPos.y);
                    if (currentTile != 0){
                        i.Crash();
                        remove.push(i);
                    }
                    this.ctx.fillStyle = i.color;
                    this.ctx.fillRect(i.position.x, i.position.y, 1, 1);
                }

                //Check Collision
                for (let a of this.alive){
                    let posA = a.GetPos();
                    for (let b of this.alive){
                        let posB = b.GetPos();
                        if (a != b && posA.x == posB.x && posA.y == posB.y){
                            if (remove.indexOf(a) == -1){
                                remove.push(a);
                            }
                        }
                    }
                }

                //Remove Dead
                for (let rem of remove){
                    let index = this.alive.indexOf(rem);
                    this.alive.splice(index, 1);
                }

                //Draw Map
                for (let i = 0; i < this.grid.width; i++){
                    for (let j = 0; j < this.grid.height; j++){
                        let currentTile = this.grid.GetTile(i, j);
                        switch(currentTile){
                            case TileTypes.Barrier:
                                this.Draw(i, j, "#000000");
                                break;
                            case TileTypes.Line1:
                                this.Draw(i, j, "#FF0000");
                                break;
                            case TileTypes.Line2:
                                this.Draw(i, j, "#00FF00");
                        }
                    }
                }

                //Check for End Game
                if (this.alive.length < 2){
                    this.EndGame();
                    this.state = 2;
                    this.counter = 0;
                }
                break;

            case 2:
                this.Clear();
                //Draw Living player (if exists)
                
                for (let i of this.alive){
                    this.Draw(i.position.x, i.position.y, i.color);
                }

                //Draw Map
                for (let i = 0; i < this.grid.width; i++){
                    for (let j = 0; j < this.grid.height; j++){
                        let currentTile = this.grid.GetTile(i, j);
                        switch(currentTile){
                            case TileTypes.Barrier:
                                this.Draw(i, j, "#000000");
                                break;
                            case TileTypes.Line1:
                                this.Draw(i, j, "#FF0000");
                                break;
                            case TileTypes.Line2:
                                this.Draw(i, j, "#00FF00");
                        }
                    }
                }

                //Draw Winning Text
                if (this.alive.length == 1){
                    this.ctx.fillStyle = this.alive[0].color;
                    this.ctx.fillText(this.alive[0].name + " Wins!", 1, 10, 50);
                }else{
                    this.ctx.fillStyle = "#000000";
                    this.ctx.fillText("Draw", 1, 10, 75);
                }

                //Check reset
                for (let i of this.players){
                    if (i.GetPause()){
                        this.Reset();
                        break;
                    }
                }
        }
        
        
    }

    Draw(x, y, color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }

    EndGame(){
        if (this.alive.length == 1){
            console.log(this.alive[0].name + " Wins!");
        }else{
            console.log("Draw");
        }
    }

    Reset(){
        this.state = 0;
        this.counter = 0;
        this.alive = [];
        for (let i of this.players){
            this.alive.push(i);
            i.Resurrect();
        }
        this.grid.Clear();
        this.players[0].SetPositionDirection(new Point(5, 5), Direction.down);
        this.players[1].SetPositionDirection(new Point(44, 44), Direction.up);
    }
}

class Player{
    constructor(controllerState, name, id, pos, dir, color){
        this.controllerState = controllerState;
        this.name = name;
        this.id = id;
        this.position = pos;
        this.direction = dir;   //0 = up, 1 = down, 2 = left, 3 = right -- See Direction enum
        this.color = color;
        this.alive = true;
    }

    Move(){
        if (this.alive){
            //Get Current
            this.controllerState.Poll();
            //Change direction
            if (this.controllerState.buttons[0] && this.direction != Direction.down){
                this.direction = 0;
            }
            else if (this.controllerState.buttons[1] && this.direction != Direction.up){
                this.direction = 1;
            }
            else if (this.controllerState.buttons[2] && this.direction != Direction.right){
                this.direction = 2;
            }
            else if (this.controllerState.buttons[3] && this.direction != Direction.left){
                this.direction = 3;
            }
            //Update position
            switch (this.direction){
                case 0: //Up
                    this.position.y--;
                    break;
                case 1: // Down
                    this.position.y++;
                    break;
                case 2:
                    this.position.x--;
                    break;
                case 3:
                    this.position.x++;
                    break;
            }
        }
        return this.position;
    }

    Crash(){
        this.alive = false;
    }

    Resurrect(){
        this.alive = true;
    }

    GetPos(){
        return this.position;
    }

    GetColor(){
        return this.color;
    }

    Reset(pos){
        this.pos = pos;
    }

    GetPause(){
        if (this.controllerState.buttons[4]){
            return true;
        }
        return false;
    }

    SetPositionDirection(pos, dir){
        this.position = pos;
        this.direction = dir;
    }
}

class ControllerState{
    constructor(keyboardState, id, up, down, left, right, pause){
        this.keyboardState = keyboardState;
        this.id = id;
        this.buttons = [false, false, false, false, false];
        this.active = true;
        keyboardState.addData(new Triple(id, [up, down, left, right, pause], [false, false, false, false, false]));
    }

    Poll(){
        this.buttons = this.keyboardState.retrieveData(this.id);
    }
}

class KeyboardState{
    constructor(){
        this.data = [];
        document.addEventListener("keydown", event =>{
            for (let i = 0; i < this.data.length; i++){
                for (let j = 0; j < this.data[i].keys.length; j++){
                    if (event.which == this.data[i].keys[j]){
                        this.data[i].current[j] = true;
                        break;
                    }
                }
            }
        });
        document.addEventListener("keyup", event=>{
            for (let i = 0; i < this.data.length; i++){
                for (let j = 0; j < this.data[i].keys.length; j++){
                    if (event.which == this.data[i].keys[j]){
                        this.data[i].current[j] = false;
                        break;
                    }
                }
            }
        });
    }

    addData(data){
        this.data.push(data);
    }

    removeData(data){
        let toDel = -1;
        for (let i = 0; i < this.data.length; i++){
            if (data.id == this.data[i].id){
                toDel = i;
                break;
            }
        }
        if (toDel > -1){
            this.data.splice(toDel, 1);
        }        
    }

    retrieveData(id){
        for (let i = 0; i < this.data.length; i++){
            if (id == this.data[i].id){
                return this.data[i].current;
            }
        }
    }
}

class Grid{
    constructor(width, height, numplayers){
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.spawns = [];
        for (let i = 0; i < width; i++){    //Create Empty Tile Array
            let ar = [];
            for (let j = 0; j < height; j++){
                ar.push(new Tile());
                if (i == 0 || j == 0 || i == width-1 || j == height-1){
                    ar[j].SetTile(TileTypes.Barrier);
                }
            }
            this.tiles.push(ar);
        }       
        for (let i = 0; i < numplayers; i++){       //Create Spawns
            this.spawns.push(new Point(0,0));
        }
    }

    GetTile(x, y){
        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height){
            return this.tiles[x][y].type;
        }
        return -1;
    }

    SetTile(x, y, type){
        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height){
            this.tiles[x][y].type = type;
        }
    }

    Clear(){
        for (let i = 0; i < this.width; i++){
            for (let j = 0; j < this.height; j++){
                if (i == 0 || j == 0 || i == this.width-1 || j == this.height-1){
                    this.tiles[i][j].type = TileTypes.Barrier;
                }else{
                    this.tiles[i][j].type = TileTypes.Empty;
                }
                
            }
        }
    }

    RandomPoint(){
        return new Point(Math.floor(Math.random() * (this.width-4)) + 2, Math.random() * (this.height-4) + 2);
    }
}

class Tile{
    constructor(){
        this.type = TileTypes.Empty;
    }

    Clear(){
        this.type = TileTypes.Empty;
    }

    GetTile(){
        return this.type;
    }

    SetTile(tileType){
        this.type = tileType;
    }
}

const TileTypes = {
    "Empty": 0,
    "Barrier": 1,
    "Line1": 2,
    "Line2": 3
}

const Direction = {
    "up":0,
    "down":1,
    "left":2,
    "right":3
}

const KeyCode = {
    "a":65,
    "b":66,
    "c":67,
    "d":68,
    "e":69,
    "f":70,
    "g":71,
    "h":72,
    "i":73,
    "j":74,
    "k":75,
    "l":76,
    "m":77,
    "n":78,
    "o":79,
    "p":80,
    "q":81,
    "r":82,
    "s":83,
    "t":84,
    "u":85,
    "v":86,
    "w":87,
    "x":88,
    "y":89,
    "z":90,
    "enter":13,
    "Rshift":16,
    "ArrowLeft":37,
    "ArrowUp":38,
    "ArrowRight":39,
    "ArrowDown":40
}

class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Triple{
    constructor(id, keys, current = [false, false, false, false, false]){
        this.id = id;
        this.keys = keys;
        this.current = current;
    }
}

function Setup(){
    console.log("Starting up...");
    let game = new Game(document.getElementById("canvas"), 50, 50, 2);
    game.Clear();
    console.log("DONE!");
    let t = new Tile();
    t.type = TileTypes.Line1;
    let ks = new KeyboardState();
    let cs = new ControllerState(ks, TileTypes.Line1, KeyCode.w, KeyCode.s, KeyCode.a, KeyCode.d, KeyCode.enter);
    let p = new Player(cs, "Player1", TileTypes.Line1, new Point(5, 5), 1, "#CC0000");
    let cs2 = new ControllerState(ks, TileTypes.Line2, KeyCode.ArrowUp, KeyCode.ArrowDown, KeyCode.ArrowLeft, KeyCode.ArrowRight, KeyCode.Rshift);
    let p2 = new Player(cs2, "Player2", TileTypes.Line2, new Point(44, 44), Direction.up, "#00CC00");
    game.AddPlayer(p);
    game.AddPlayer(p2);
    let timer = setInterval(_=>{
        game.Tick();
    }, 70);
    game.grid.SetTile(1, 0, TileTypes.Barrier);
}

document.addEventListener("DOMContentLoaded", Setup);