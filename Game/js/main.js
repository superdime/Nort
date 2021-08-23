class Game{
    #canvas;
    #ctx;
    #players;
    #alive;
    #grid;
    #state;
    #counter;
    //Controls flow of game
    constructor(canvas, width, height, playerCount){
        this.#canvas = canvas;
        this.#ctx = this.#canvas.getContext("2d");
        this.#canvas.width = width;          //canvas setup
        this.#canvas.height = height;        //canvas setup
        this.#players = [];
        this.#alive = [];
        this.#grid = new Grid(width, height, playerCount);
        this.#state = 0;     //0 = Countdown, 1 = inGame, 2 = Winner Message (Reset)
        this.#counter = 0;   //Used for time-based rendering
    }

    #Clear(){
        //Clears Screen
        this.#ctx.fillStyle = "#FFFFFF";
        this.#ctx.fillRect(0,0, this.#grid.width, this.#grid.height);
    }

    AddPlayer(player){
        //Adds player to existing players
        player.SetPosition(this.#grid.spawns[this.#players.length]);
        this.#players.push(player);
        this.#alive.push(player);
    }

    RemovePlayers(){
        //Resets player information
        this.#players = [];
        this.#alive = [];
    }

    Tick(){
        //Updates current state to next frame
        switch (this.#state){
            case 0:             //Countdown Phase
                this.#counter++;
                this.#Clear();
                //Draw Living player (if exists)
                for (let i of this.#alive){
                    this.#DrawPixel(i.position.x, i.position.y, i.color.ToString());
                }

                //Draw Map
                this.#DrawMap();

                //Draw CountDown
                this.#ctx.fillStyle = "#000000";
                if (this.#counter < 15){
                    this.#ctx.fillText("3", 10, 10, 10);
                }
                else if (this.#counter < 30){
                    this.#ctx.fillText("2", 10, 10, 10);
                }
                else if (this.#counter < 45){
                    this.#ctx.fillText("1", 10, 10, 10);
                }
                else{
                    this.#state = 1;
                    console.log("Fight");
                }
                break;

            case 1:                     //inGame Phase
                this.#Clear();               //Reset CTX
                let remove = [];            //Temp variable to hold crashed players
                //Handle player movement
                for (let i of this.#alive){
                    let oldPos = i.position;
                    this.#grid.SetTile(oldPos.x, oldPos.y, i.altColor.ToString());
                    i.Move();
                }

                for (let i of this.#alive){
                    let newPos = i.position;
                    let currentTile = this.#grid.GetTile(newPos.x, newPos.y);
                    if (currentTile != 0){
                        //Checks if player is on crashable tile
                        remove.push(i);
                    }
                    //Draw player to screen
                    this.#DrawPixel(i.position.x, i.position.y, i.color.ToString());
                }

                //Check Collision
                let collision = new Collision();
                for (let a of this.#alive){
                    for (let b of this.#alive){
                        if (a != b && a.position.x == b.position.x && a.position.y == b.position.y){    //Checks each player by player comparison
                            if (remove.indexOf(a) == -1){
                                remove.push(a);
                                collision.AddPair(a.position, a.altColor);
                            }
                        }
                    }
                }

                //If collision
                if (collision.Collided()){
                    let collisionResults = collision.GetResults();
                    for (let i of collisionResults){
                        this.#grid.SetTile(i[0].x, i[0].y, i[1].ToString());
                    }
                }
                //Remove Dead
                for (let rem of remove){
                    let index = this.#alive.indexOf(rem);
                    this.#alive.splice(index, 1);
                }

                //Draw Map
                this.#DrawMap();

                //Check for End Game
                if (this.#alive.length < 2){
                    this.#EndGame();
                }
                break;

            case 2:
                this.#Clear();
                //Draw Living player (if exists)
                for (let i of this.#alive){
                    this.#DrawPixel(i.position.x, i.position.y, i.color.ToString());
                }

                //Draw Map
                this.#DrawMap();

                //Draw Winning Text
                if (this.#alive.length == 1){
                    this.#ctx.fillStyle = this.#alive[0].color.ToString();
                    this.#ctx.fillText(this.#alive[0].name + " Wins!", 1, 10, 50);
                }else{
                    this.#ctx.fillStyle = "#000000";
                    this.#ctx.fillText("Draw", 1, 10, 75);
                }

                //Check reset
                for (let i of this.#players){
                    if (i.GetPause()){
                        this.#Reset();
                        break;
                    }
                }
        }
        
        
    }

    #DrawMap(){
        for (let i = 0; i < this.#grid.width; i++){
            for (let j = 0; j < this.#grid.height; j++){
                let currentTile = this.#grid.GetTile(i, j);
                switch(currentTile){
                    case TileTypes.Barrier:
                        this.#DrawPixel(i, j, "#000000");
                        break;
                    case TileTypes.Line1:
                        this.#DrawPixel(i, j, "#FF0000");
                        break;
                    case TileTypes.Line2:
                        this.#DrawPixel(i, j, "#00FF00");
                        break;
                    case TileTypes.Empty:
                        break;
                    default:
                        this.#DrawPixel(i, j, currentTile);
                        break;
                }
            }
        }
    }

    #DrawPixel(x, y, color){
        //Draws single pixel given location and color
        this.#ctx.fillStyle = color;
        this.#ctx.fillRect(x, y, 1, 1);
    }

    #EndGame(){
        //Sets Game into a End Game state (also logs it to console)
        this.#state = 2;
        if (this.#alive.length == 1){
            console.log(this.#alive[0].name + " Wins!");
        }else{
            console.log("Draw");
        }
    }

    #Reset(){
        //Resets game
        this.#state = 0;
        this.#counter = 0;
        this.#alive = [];
        for (let i of this.#players){
            this.#alive.push(i);
        }
        this.#grid.Clear();
        for (let i = 0; i < this.#players.length; i++){
            this.#players[i].SetDirection(Direction.none);
            this.#players[i].SetPosition(this.#grid.spawns[i]);
        }
    }
}

class Player{
    //Controls movement
    constructor(controllerState, name, altColor, pos, color){
        this.controllerState = controllerState;
        this.name = name;       //Actual player name
        this.altColor = altColor;           //Holds TileType information
        this.position = pos;
        this.direction = Direction.none;   //-1 = none, 0 = up, 1 = down, 2 = left, 3 = right -- See Direction enum
        this.color = color;
    }

    Move(){
        //Changes player location based on direction and ControllerState
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
        }else if (this.direction == Direction.none){
            this.direction = Direction.up       //Initial state + no input
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
        return this.position;
    }

    GetPause(){
        //Checks if pause is pressed (for reset)
        if (this.controllerState.buttons[4]){
            return true;
        }
        return false;
    }

    SetPosition(pos){
        this.position = pos;
    }

    SetDirection(dir){
        this.direction = dir;
    }
}

class ControllerState{
    //Holds important information about certain keys on a keyboard
    constructor(keyboardState, id, up, down, left, right, pause){
        this.keyboardState = keyboardState;
        this.id = id;
        this.buttons = [false, false, false, false, false];
        keyboardState.AddData(new Triple(id, [up, down, left, right, pause]));
    }

    Poll(){
        //Requests important button data from KeyboardState
        this.buttons = this.keyboardState.RetrieveData(this.id);
    }

    ChangeButtons(up, down, left, right, pause){
        this.keyboardState.RemoveData(this.id);
        this.keyboardState.AddData(new Triple(this.id, [up, down, left, right, pause]));
    }
}

class KeyboardState{
    //Interfaces with hardware keyboard. Given certain keys, it will track those keys' changes
    constructor(){
        this.data = [];
        document.addEventListener("keydown", event =>{      //When key is pressed
            for (let i = 0; i < this.data.length; i++){
                for (let j = 0; j < this.data[i].keys.length; j++){
                    if (event.which == this.data[i].keys[j]){           //Fix depreciated e.which !!
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

    AddData(data){
        //Adds key data to data array
        this.data.push(data);
    }

    RemoveData(id){
        //Removes key data from data array
        let toDel = -1;
        for (let i = 0; i < this.data.length; i++){
            if (id == this.data[i].id){
                toDel = i;
                break;
            }
        }
        if (toDel > -1){
            this.data.splice(toDel, 1);
        }        
    }

    RetrieveData(id){
        //Gives current key states
        for (let i = 0; i < this.data.length; i++){
            if (id == this.data[i].id){
                return this.data[i].current;
            }
        }
    }

    ResetData(){
        //Resets all data
        this.data = [];
    }
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
        for (let i = 0; i < numplayers; i++){
            this.spawns.push(this.RandomPoint());
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

        //Set new spawns
        let numPlayers = this.spawns.length;
        this.spawns = [];
        for (let i = 0; i < numPlayers; i++){
            this.spawns.push(this.RandomPoint());
        }
    }

    RandomPoint(){
        //Gets random point in "safe" area
        return new Point(Math.floor(Math.random() * (this.width-6)) + 3, Math.floor(Math.random() * (this.height-6)) + 3);
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

class Color{
    //Holds and manipulates color information for easy edits and outputs
    constructor(r = 0, g = 0, b = 0, a = 255){
        this.r = this.#Clamp(r, 0, 255);
        this.g = this.#Clamp(g, 0, 255);
        this.b = this.#Clamp(b, 0, 255);
        this.a = this.#Clamp(a, 0, 255);
    }

    #Clamp(actual, min, max){
        //Clamps value between min and max
        if (actual > max){
            return max;
        }
        if (actual < min){
            return min;
        }
        return actual;
    }

    static Red(){
        //Returns Red color
        return new Color(255);
    }

    static Green(){
        //Return Green color
        return new Color(0, 255);
    }

    static Blue(){
        //Returns Blue color
        return new Color(0, 0, 255);
    }

    static Empty(){
        //Return zeroed out color
        return new Color(0,0,0,0);
    }

    static Max(){
        //Return maxed out color (255)
        return new Color(255, 255, 255, 255);
    }

    static FromColor(color){
        //Copy constructor for color
        return new Color(color.r, color.g, color.b, color.a);
    }

    static Compare(color1, color2){
        //Compares color values of two colors
        if (color1.r != color2.r){
            return false;
        }
        if (color1.b != color2.b){
            return false;
        }
        if (color1.g != color2.g){
            return false;
        }
        if (color1.a != color2.a){
            return false;
        }
        return true;
    }

    static Fade(color, degree){
        //Darkens a color by given degree
        let result = Color.FromColor(color);
        result.r -= degree;
        if (result.r < 0){
            result.r = 0;
        }
        result.g -= degree;
        if (result.g < 0){
            result.g = 0;
        }
        result.b -= degree;
        if (result.b < 0){
            result.b = 0;
        }
        return result;
    }

    static Brighten(color, degree){
        //Brightens a color by a given degree
        let result = Color.FromColor(color);
        result.r += degree;
        if (result.r > 255){
            result.r = 255;
        }
        result.g += degree;
        if (result.g > 255){
            result.g = 255;
        }
        result.b += degree;
        if (result.b > 255){
            result.b = 255;
        }
        return result;
    }

    static Combine(...colors){
        //Averages X amount of colors
        let result = Color.Empty();
        //Get total within results
        for (let i = 0; i < colors.length; i++){
            result.r += colors[i].r;
            result.g += colors[i].g;
            result.b += colors[i].b;
            result.a += colors[i].a;
        }
        //Get actual average
        result.r = Math.floor(result.r / colors.length);
        result.g = Math.floor(result.g / colors.length);
        result.b = Math.floor(result.b / colors.length);
        result.a = Math.floor(result.a / colors.length);
        return result;
    }

    ChangeR(num){
        //Changes red value by given number
        this.r = this.#Clamp(num, 0, 255);
    }

    ChangeG(num){
        //Changes green value by given number
        this.g = this.#Clamp(num, 0, 255);
    }

    ChangeB(num){
        //Changes blue value by given number
        this.b = this.#Clamp(num, 0, 255);
    }

    ChangeAlpha(num){
        //Changes alpha value by given number
        this.a = this.#Clamp(num, 0, 255);
    }

    ToString(){
        //Gives usable hex string from color data
        return "#" + this.r.toString(16).padStart(2, "0") + this.g.toString(16).padStart(2, "0") + this.b.toString(16).padStart(2, "0") + this.a.toString(16).padStart(2, "0");
    }
}

class Collision{
    #collided;
    constructor(){
        this.points = [];
        this.colors = [];
        this.#collided = false;
    }

    AddPair(point, color){
        //console.log(point, color);
        if (this.points.length == 0){
            this.points.push(point);
            this.colors.push([color]);
            this.#collided = true;
            return;
        }else{
            for (let i = 0; i < this.points.length; i++){
                if (Point.Compare(this.points[i], point)){
                    this.colors[i].push(color);
                    return;
                }
            }
        }
        this.points.push(point);
        this.colors.push([color]);
    }

    GetResults(){
        let collisions = [];
        for (let i = 0; i < this.points.length; i++){
            let color = Color.Combine(...this.colors[i]);
            collisions.push([this.points[i], color]);
        }
        return collisions;
    }

    Collided(){
        return this.#collided;
    }
}

const TileTypes = {     //Enum to hold types of tiles
    "Empty": 0,
    "Barrier": 1,
    "Line1": 2,
    "Line2": 3
}

const Direction = {     //Enum to hold direction information
    "none":-1,
    "up":0,
    "down":1,
    "left":2,
    "right":3
}

const KeyCode = {       //Enum to hold keycode and key associations (make bigger later - FIX !!)
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

    static Compare(p1, p2){
        if (p1.x != p2.x){
            return false;
        }
        if (p1.y != p2.y){
            return false;
        }
        return true;
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
    console.log("DONE!");
    let t = new Tile();
    t.type = TileTypes.Line1;
    let ks = new KeyboardState();
    let cs = new ControllerState(ks, TileTypes.Line1, KeyCode.w, KeyCode.s, KeyCode.a, KeyCode.d, KeyCode.enter);
    let p = new Player(cs, "Player1", Color.Red(), new Point(5, 5), Color.Fade(Color.Red(), 25));
    let cs2 = new ControllerState(ks, TileTypes.Line2, KeyCode.ArrowUp, KeyCode.ArrowDown, KeyCode.ArrowLeft, KeyCode.ArrowRight, KeyCode.Rshift);
    let p2 = new Player(cs2, "Player2", Color.Green(), new Point(44, 44), Color.Fade(Color.Green(), 25));
    game.AddPlayer(p);
    game.AddPlayer(p2);
    let timer = setInterval(_=>{
        game.Tick();
    }, 60);
    console.log(Color.Red());
}

//Event listener to start on page loaded (main function)
document.addEventListener("DOMContentLoaded", Setup);