let playerNum = 2;
let elementListen;

class PageSetup{
    constructor(){
        this.players = [];
        this.keyboardState = new KeyboardState();
    }

    GrabData(){
        return -1;
    }

}

function Setup(){
    //Color Setup
    let ca1 = Color.Red();
    let c1 = Color.Fade(ca1, 25);
    let ca2 = Color.Blue();
    let c2 = Color.Fade(ca2, 25);
    document.getElementById("0-MainColor").value = c1.ToHex();
    document.getElementById("0-AltColor").value = ca1.ToHex();
    document.getElementById("1-MainColor").value = c2.ToHex();
    document.getElementById("1-AltColor").value = ca2.ToHex();
    //Event Listeners
    document.getElementById("0-MainColor").addEventListener("change", _=>{AutoAlt("0")});
    document.getElementById("1-MainColor").addEventListener("change", _=>{AutoAlt("1")});

    controlsListener("0");
    controlsListener("1");

    document.getElementById("addPlayer").addEventListener("click", addDiv);

    document.getElementById("create").addEventListener("click", createGame);

    
}

function controlsListener(id){
    quickAddEventListener(id + "-Up", "click", requestKey);
    quickAddEventListener(id + "-Left", "click", requestKey);
    quickAddEventListener(id + "-Down", "click", requestKey);
    quickAddEventListener(id + "-Right", "click", requestKey);
}

function quickAddEventListener(id, action, func){
    console.log(id);
    let el = document.getElementById(id);
    el.addEventListener(action, _=>{func(el)});
}

function AutoAlt(num){
    let c = Color.FromHex(document.getElementById(num + "-MainColor").value);
    document.getElementById(num + "-AltColor").value = Color.Fade(c, 25).ToHex();
}

function createGame(){
    let players = [];
    let keyState = new KeyboardState();
    let children = document.getElementById("playerList").children;
    for (let i = 0; i < playerNum; i++){
        let controls = getControls(i);
        if (i == 0){
            players.push(new Player(new ControllerState(keyState, i, controls[0], controls[1], controls[2], controls[3], KeyCode.enter), document.getElementById((i) + "-Name").value, Color.FromHex(document.getElementById(i + "-AltColor").value), new Point(0,0), Color.FromHex(document.getElementById(i + "-MainColor").value)));
        }else{
            players.push(new Player(new ControllerState(keyState, i, controls[0], controls[1], controls[2], controls[3]), document.getElementById((i) + "-Name").value, Color.FromHex(document.getElementById(i + "-AltColor").value), new Point(0,0), Color.FromHex(document.getElementById(i + "-MainColor").value)));
        }
    }
    let xDim = document.getElementById("x").value;
    let yDim = document.getElementById("y").value;
    document.body.removeChild(document.body.children[0]);
    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);


    let game = new Game(canvas, xDim, yDim, playerNum);

    for (let i of players){
        game.AddPlayer(i);
    }
    game.Tick();
    setInterval(_=>{
        game.Tick();
    }, 50);
}

function getControls(id){
    let result = [];
    console.log(id+"-Up");
    result.push(document.getElementById(id + "-Up").value);
    result.push(document.getElementById(id + "-Down").value);
    result.push(document.getElementById(id + "-Left").value);
    result.push(document.getElementById(id + "-Right").value);
    console.log(result);
    return result;
}

function addDiv(){
    let playerList = document.getElementsByClassName("playerList")[0];
    //Create Player Container
    let mainContainer = document.createElement("div");
    mainContainer.className = "player";
    mainContainer.id = "Player" + playerNum;
    //Create name field
    let nameContainer = document.createElement("div");
    nameContainer.className = "item";
    nameContainer.innerHTML = "Name: ";
    let nameInput = document.createElement("input");
    nameInput.id = playerNum + "-Name";
    nameInput.type = "text";
    nameInput.maxLength = "8";
    nameInput.value = "P" + playerNum;
    nameContainer.appendChild(nameInput);
    mainContainer.appendChild(nameContainer);
    //Color setup
    let mainColor = Color.Random();
    let altColor = Color.Fade(mainColor, 20);
    //Create main color field
    let mainColorContainer = document.createElement("div");
    mainColorContainer.innerHTML = "Main Color: ";
    mainColorContainer.className = "item";
    let mainColorInput = document.createElement("input");
    mainColorInput.id = playerNum + "-MainColor";
    mainColorInput.value = mainColor.ToHex();
    mainColorInput.className = "color";
    mainColorInput.type = "color";
    let temp = playerNum;
    mainColorInput.addEventListener("change", _=>{AutoAlt(temp)});
    mainColorContainer.appendChild(mainColorInput);
    mainContainer.appendChild(mainColorContainer);
    //Create alt color field
    let altColorContainer = document.createElement("div");
    altColorContainer.innerHTML = "Alt Color: ";
    altColorContainer.className = "item";
    let altColorInput = document.createElement("input");
    altColorInput.className = "color";
    altColorInput.type = "color";
    altColorInput.value = altColor.ToHex();
    altColorInput.id = playerNum + "-AltColor";
    altColorContainer.appendChild(altColorInput);
    mainContainer.appendChild(altColorContainer);
    //Create controls field
    let controlsContainer = document.createElement("div");
    controlsContainer.innerHTML = "Controls: ";
    controlsContainer.className = "item"
    let tableHolder = document.createElement("div");
    tableHolder.className = "table";
    let up = document.createElement("button");
    up.id = playerNum + "-Up";
    up.className = "grid-2 grid-button";
    up.innerHTML = "^";
    up.value = 73;
    up.addEventListener("click", _=>{requestKey(up)});
    tableHolder.appendChild(up);
    let left = document.createElement("button");
    left.id = playerNum + "-Left";
    left.className = "grid-4 grid-button";
    left.innerHTML = "<-";
    left.value = 74;
    left.addEventListener("click", _=>{requestKey(left)});
    tableHolder.appendChild(left);
    let down = document.createElement("button");
    down.id = playerNum + "-Down";
    down.className = "grid-5 grid-button";
    down.innerHTML = "V";
    down.value = 75;
    down.addEventListener("click", _=>{requestKey(down)});
    tableHolder.appendChild(down);
    let right = document.createElement("button");
    right.id = playerNum + "-Right";
    right.className = "grid-6 grid-button";
    right.innerHTML = "->";
    right.value = 76;
    right.addEventListener("click", _=>{requestKey(right)});
    tableHolder.appendChild(right);
    controlsContainer.appendChild(tableHolder);
    mainContainer.appendChild(controlsContainer);
    //Add it
    playerList.insertBefore(mainContainer, document.getElementById("addPlayer"));
    //Update player id
    playerNum++;
}

function requestKey(el){
    let pop = document.getElementById("popup");
    pop.style.display = "block";
    elementListen = el;
    document.addEventListener("keydown", returnKey);
}

function returnKey(e){
    let pop = document.getElementById("popup");
    pop.style.display = "none";
    elementListen.value = e.which;
    document.removeEventListener("keydown", returnKey);
}

document.addEventListener("DOMContentLoaded", Setup);