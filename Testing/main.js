//Basic setup for Unit Testing
function main(){
    //  UnitTesting Options
    //UnitTesting.OutputToConsole();    //Remove // to switch to console
    UnitTesting.ChangeElement(document.body.children[0]);
    let ct = new ColorTests();
    ct.RunAll();
    UnitTesting.OutputResults();
}

document.addEventListener("DOMContentLoaded", main);