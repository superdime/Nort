class UnitTesting{
    //Basic Unit Testing class to help in JS Unit Testing
    static #visual = true;  //true = ->console, false = ->element
    static #element = document.body;
    static #pass = 0;
    static #fail = 0;

    static AssertAreEqual(name, expected, result){
        //Checks if 2 values are equal
        let color;
        let message = name;
        if (expected == result){
            color = "#aaffaa";      //Faded Green
            message += " Passed";
            this.#pass++;
        }else{
            color = "#ffaaaa";      //Faded Red
            message += " Failed | Expected: " + expected + "  | Result: " + result;
            this.#fail++;
        }
        if (this.#visual){
            this.#createResult(message, color);
        }else{
            console.log(message);
        }
    }

    static AssertAreEqualObject(name, expected, result){
        //Checks if two objects are value identical
        let color;
        let message = name;
        let ok = true;
        let expectedKeys = Object.keys(expected);
        for (let i of expectedKeys){
            if (expected[i] != result[i]){
                ok = false;
            }
        }
        if (ok){
            color = "#aaffaa";      //Faded Green
            message += " Passed";
            this.#pass++;
        }else{
            color = "#ffaaaa";      //Faded Red
            message += " Failed | Expected: " + Object.entries(expected) + "  | Result: " + Object.entries(result);
            this.#fail++;
        }
        if (this.#visual){
            this.#createResult(message, color);
        }else{
            console.log(message);
        }
    }

    static AssertTrue(name, result){
        //Checks if result is true
        let color;
        let message = name;
        if (result){
            color = "#aaffaa";      //Faded Green
            message += " Passed";
            this.#pass++;
        }else{
            color = "#ffaaaa";      //Faded Red
            message += " Failed | Expected: true  | Result: " + result;
            this.#fail++;
        }
        if (this.#visual){
            this.#createResult(message, color);
        }else{
            console.log(message);
        }
    }

    static OutputToConsole(){
        //Changes output mode to ->console
        this.#visual = false;
    }

    static OutputToBody(){
        //Changes output mode to ->element
        this.#visual = true;
    }

    static ChangeElement(element){
        //Changes which element to write to
        this.#element = element;
    }

    static OutputResults(){
        //Outputs Pass/Fail amount
        let color = this.#fail == 0 ? "#aaffaa" : "#ffaaaa";
        let message = "Pass: " + this.#pass + "  | Fail: " + this.#fail;
        if (this.#visual){
            this.#createResult(message, color);
        }
        else{
            console.log(message);
        }
    }
    
    static #createResult(text, color){
        //Writes result to element
        let a = document.createElement("div");
        a.style.backgroundColor = color;
        a.style.width = "100%";
        a.style.height = "4%";
        a.innerHTML = text;
        this.#element.appendChild(a);
    }
    
}