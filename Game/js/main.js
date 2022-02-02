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