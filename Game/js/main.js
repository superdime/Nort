class Game{
    //Controls flow of game
    constructor(canvas, width, height, playerCount){                   //Early Development - needs to be fixed according to diagram
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.width = width;
        this.height = height;
        this.canvas.width = width;          //canvas setup
        this.canvas.height = height;        //canvas setup
        this.players = [];
        this.alive = [];
        this.grid = new Grid(width, height, playerCount);
        //Need to set spawns !!!!
        this.state = 0;     //0 = Countdown, 1 = inGame, 2 = Winner Message (Reset)
        this.counter = 0;   //Used for time-based rendering
    }

    Clear(){
        //Clears Screen
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(0,0, this.width, this.height);
    }

    AddPlayer(player){
        //Adds player to existing players
        this.players.push(player);
        this.alive.push(player);
    }

    //Add ResetPlayers()

    Tick(){
        //Updates current state to next frame
        switch (this.state){
            case 0:             //Countdown Phase
                this.counter++;
                this.Clear();
                //Draw Living player (if exists)
                for (let i of this.alive){
                    this.DrawPixel(i.position.x, i.position.y, i.color);
                }

                //Draw Map
                for (let i = 0; i < this.grid.width; i++){
                    for (let j = 0; j < this.grid.height; j++){
                        let currentTile = this.grid.GetTile(i, j);
                        switch(currentTile){
                            case TileTypes.Barrier:
                                this.DrawPixel(i, j, "#000000");
                                break;
                            case TileTypes.Line1:
                                this.DrawPixel(i, j, "#FF0000");
                                break;
                            case TileTypes.Line2:
                                this.DrawPixel(i, j, "#00FF00");
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

            case 1:                     //inGame Phase
                this.Clear();               //Reset CTX
                let remove = [];            //Temp variable to hold crashed players
                //Handle player movement
                for (let i of this.alive){
                    let oldPos = i.GetPos();
                    this.grid.SetTile(oldPos.x, oldPos.y, i.controllerState.id);    //i.controllerState.id needs fix (use name w/ struct) !!!!!!!
                    let newPos = i.Move();
                    let currentTile = this.grid.GetTile(newPos.x, newPos.y);
                    if (currentTile != 0){
                        //Checks if player is on crashable tile
                        i.Crash();
                        remove.push(i);
                    }
                    //Draw player to screen
                    this.DrawPixel(i.position.x, i.position.y, i.color);
                }

                //Check Collision
                for (let a of this.alive){
                    for (let b of this.alive){
                        if (a != b && a.position.x == b.position.x && a.position.y == b.position.y){    //Checks each player by player comparison
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
                                this.DrawPixel(i, j, "#000000");
                                break;
                            case TileTypes.Line1:
                                this.DrawPixel(i, j, "#FF0000");
                                break;
                            case TileTypes.Line2:
                                this.DrawPixel(i, j, "#00FF00");
                        }
                    }
                }

                //Check for End Game
                if (this.alive.length < 2){
                    this.EndGame();
                }
                break;

            case 2:
                this.Clear();
                //Draw Living player (if exists)
                for (let i of this.alive){
                    this.DrawPixel(i.position.x, i.position.y, i.color);
                }

                //Draw Map
                for (let i = 0; i < this.grid.width; i++){
                    for (let j = 0; j < this.grid.height; j++){
                        let currentTile = this.grid.GetTile(i, j);
                        switch(currentTile){                            //Could use better implementation -> color is stored within TileTypes instead of numbers !!!!!!
                            case TileTypes.Barrier:
                                this.DrawPixel(i, j, "#000000");
                                break;
                            case TileTypes.Line1:
                                this.DrawPixel(i, j, "#FF0000");
                                break;
                            case TileTypes.Line2:
                                this.DrawPixel(i, j, "#00FF00");
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

    DrawPixel(x, y, color){
        //Draws single pixel given location and color
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }

    EndGame(){
        //Sets Game into a End Game state (also logs it to console)
        this.state = 2;
        if (this.alive.length == 1){
            console.log(this.alive[0].name + " Wins!");
        }else{
            console.log("Draw");
        }
    }

    Reset(){
        //Resets game
        this.state = 0;
        this.counter = 0;
        this.alive = [];
        for (let i of this.players){
            this.alive.push(i);
            i.Resurrect();                  //May not need Resurrect and Crash for Player (information already stored in Game.alive[]) !!!!! 
        }
        this.grid.Clear();
        this.players[0].SetPositionDirection(new Point(5, 5), Direction.down);  //Need to Fix Spawns !!!!
        this.players[1].SetPositionDirection(new Point(44, 44), Direction.up);
    }
}

class Player{
    //Controls movement
    constructor(controllerState, name, id, pos, dir, color){
        this.controllerState = controllerState;
        this.name = name;       //Actual player name
        this.id = id;           //Used for searches -- Not necessary -- FIX !!!!
        this.position = pos;
        this.direction = dir;   //0 = up, 1 = down, 2 = left, 3 = right -- See Direction enum
        this.color = color;
        this.alive = true;
    }

    Move(){
        //Changes player location based on direction and ControllerState
        if (this.alive){
            //Get current ControllerState
            this.controllerState.Poll();

            //Change direction
            if (this.controllerState.buttons[Direction.up] && this.direction != Direction.down){    //Want up, can't be going down
                this.direction = Direction.up;
            }
            else if (this.controllerState.buttons[Direction.down] && this.direction != Direction.up){            //Want down, can't be going uo
                this.direction = Direction.down;
            }
            else if (this.controllerState.buttons[Direction.left] && this.direction != Direction.right){         //Want left, can't be going right
                this.direction = Direction.left;
            }
            else if (this.controllerState.buttons[Direction.right] && this.direction != Direction.left){          //Want right, can't be going left
                this.direction = Direction.right;
            }

            //Update position
            switch (this.direction){
                case Direction.up:
                    this.position.y--;  //Go up 1 - note y is inverted in this case
                    break;
                case Direction.down:
                    this.position.y++;  //Go down 1
                    break;
                case Direction.left:
                    this.position.x--;  //Go left 1
                    break;
                case Direction.right:
                    this.position.x++;  //Go right 1
                    break;
            }
        }
        return this.position;
    }

    Crash(){
        //Not necessary -- FIX !!!!
        this.alive = false;
    }

    Resurrect(){
        //Not necessary -- FIX !!!!
        this.alive = true;
    }

    GetPos(){
        //Not necessary since position is public -- FIX !!!!
        return this.position;
    }

    GetColor(){
        //Not necessary since color is public -- FIX !!!!
        return this.color;
    }

    Reset(pos){
        //Resets position
        this.pos = pos;
    }

    GetPause(){
        //Checks if pause is pressed (for reset) -- may not be necessary -- FIX !!!!
        if (this.controllerState.buttons[4]){
            return true;
        }
        return false;
    }

    SetPositionDirection(pos, dir){
        //Quick position and direction set
        this.position = pos;
        this.direction = dir;
    }
}

class ControllerState{
    //Holds important information about certain keys on a keyboard
    constructor(keyboardState, id, up, down, left, right, pause){
        this.keyboardState = keyboardState;
        this.id = id;
        this.buttons = [false, false, false, false, false];
        this.active = true;
        keyboardState.addData(new Triple(id, [up, down, left, right, pause], [false, false, false, false, false]));
    }

    Poll(){
        //Requests important button data from KeyboardState
        this.buttons = this.keyboardState.retrieveData(this.id);
    }

    //Add ChangeButtons method -- FIX !!!!
}

class KeyboardState{
    //Interfaces with hardware keyboard. Given certain keys, it will track those keys' changes
    constructor(){
        this.data = [];
        document.addEventListener("keydown", event =>{      //When key is pressed
            for (let i = 0; i < this.data.length; i++){
                for (let j = 0; j < this.data[i].keys.length; j++){
                    if (event.which == this.data[i].keys[j]){
                        this.data[i].current[j] = true;
                        break;
                    }
                }
            }
        });
        document.addEventListener("keyup", event=>{         //When key is released
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
        //Adds key data to data array
        this.data.push(data);
    }

    removeData(data){
        //Removes key data from data array
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
        //Gives current key states
        for (let i = 0; i < this.data.length; i++){
            if (id == this.data[i].id){
                return this.data[i].current;
            }
        }
    }

    //Add resetData()
}

class Grid{
    //Holds tile data for game in a 2D array
    constructor(width, height, numplayers){
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.spawns = [];
        //Create tile array
        for (let i = 0; i < width; i++){
            let ar = [];
            for (let j = 0; j < height; j++){
                ar.push(new Tile());
                if (i == 0 || j == 0 || i == width-1 || j == height-1){     //If a barrier - set to be a barrier tile
                    ar[j].SetTile(TileTypes.Barrier);
                }
            }
            this.tiles.push(ar);
        }
        
        //Create spawns
        for (let i = 0; i < numplayers; i++){   //FIX !!!!
            this.spawns.push(new Point(0,0));
        }
    }

    GetTile(x, y){
        //Given x and y, gives tile. If out of range -> returns -1
        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height){
            return this.tiles[x][y].type;
        }
        return -1;
    }

    SetTile(x, y, type){
        //Given x, y, and type, sets a tile to that type
        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height){
            this.tiles[x][y].type = type;
        }
    }

    Clear(){
        //Resets map data
        for (let i = 0; i < this.width; i++){
            for (let j = 0; j < this.height; j++){
                if (i == 0 || j == 0 || i == this.width-1 || j == this.height-1){   //If a barrier - set to be a barrier tile
                    this.tiles[i][j].type = TileTypes.Barrier;
                }else{
                    this.tiles[i][j].type = TileTypes.Empty;                        //Else - set to be an empty tile
                }
                
            }
        }
    }

    RandomPoint(){
        //Not implemented -- fix !!!!
        return new Point(Math.floor(Math.random() * (this.width-4)) + 2, Math.random() * (this.height-4) + 2);
    }
}

class Tile{
    //Data that holds tile information
    constructor(){
        this.type = TileTypes.Empty;
    }

    Clear(){
        //Sets tile to clear
        this.type = TileTypes.Empty;
    }

    GetTile(){
        //Returns tile type
        return this.type;
    }

    SetTile(tileType){
        //Sets tile to given type
        this.type = tileType;
    }
}

const TileTypes = {     //Enum to hold types of tiles
    "Empty": 0,
    "Barrier": 1,
    "Line1": 2,
    "Line2": 3
}

const Direction = {     //Enum to hold direction information
    "up":0,
    "down":1,
    "left":2,
    "right":3
}

const KeyCode = {       //Enum to hold keycode and key associations (make bigger later - FIX !)
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
    //Data structure to hold 2D coordinate
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Triple{
    //Data structure to hold KeyboardState information
    constructor(id, keys, current = [false, false, false, false, false]){
        this.id = id;
        this.keys = keys;
        this.current = current;
    }
}

function Setup(){
    //Simple set up function (To be changed when GameSettings interface is implemented)
    //Just makes a simple 2 player game
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

//Event listener to start on page loaded (main function)
document.addEventListener("DOMContentLoaded", Setup);