class Game{
    constructor(element){                   //Early Development - needs to be fixed according to diagram
        //this.img = new Image(1, 1);
        //this.img.src = "./a.png";
        this.canvas = element;
        this.ctx = this.canvas.getContext("2d");
        //dthis.ctx.imageSmoothingEnabled = false;
        this.canvas.width = 100;
        this.canvas.height = 100;
        this.players = [];
    }

    Clear(){
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(0,0, 100, 100);
    }

    AddPlayer(player){
        this.players.push(player);
    }

    Tick(){
        this.Clear();
        for (let i of this.players){
            i.Move();
            this.ctx.fillStyle = i.color;
            //this.ctx.drawImage(this.img, i.position.x, i.position.y);
            this.ctx.fillRect(i.position.x, i.position.y, 1, 1);
        }
        
    }
}

class Player{
    constructor(controllerState, pos, dir, color){
        this.controllerState = controllerState;
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
    }

    Crash(){
        this.alive = false;
    }

    GetPos(){
        return this.pos;
    }

    GetColor(){
        return this.color;
    }

    Reset(pos){
        this.pos = pos;
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
                        return;
                    }
                }
            }
        });
        document.addEventListener("keyup", event=>{
            for (let i = 0; i < this.data.length; i++){
                for (let j = 0; j < this.data[i].keys.length; j++){
                    if (event.which == this.data[i].keys[j]){
                        this.data[i].current[j] = false;
                        return;
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
        this.tiles = new Tile[width][height];
        this.spawns = new Point[numplayers];
        for (let i = 0; i < numplayers; i++){
            this.spawns[i] = new Point(i*5, i*5);
        }
    }

    GetTile(x, y){
        if (x > 0 && x < this.width && y > 0 && y < this.height){
            return this.tiles[x][y].type;
        }
        throw new Error("Out of range - " + x + ", " + y);
    }

    SetTile(x, y, type){
        if (x > 0 && x < width && y > 0 && y < this.height){
            this.tiles[x][y].type = type;
        }
    }

    Clear(){
        for (let i = 0; i < this.width; i++){
            for (let j = 0; j < this.height; j++){
                this.tiles[i][j].type = TileTypes.Empty;
            }
        }
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
    let game = new Game(document.getElementById("canvas"));
    game.Clear();
    console.log("DONE!");
    let t = new Tile();
    t.type = TileTypes.Line1;
    let ks = new KeyboardState();
    let cs = new ControllerState(ks, "player1", KeyCode.w, KeyCode.s, KeyCode.a, KeyCode.d, KeyCode.enter);
    let p = new Player(cs, new Point(25, 25), 0, "red");
    game.AddPlayer(p);
    let timer = setInterval(_=>{
        game.Tick();
    }, 50);
}

document.addEventListener("DOMContentLoaded", Setup);