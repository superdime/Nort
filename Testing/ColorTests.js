//Requires UnitTesting.js

class ColorTests{
    //Holds tests for Color
    RunAll(){
        //For convenience
        this.CTorAbove();
        this.CTorBelow();
        this.Compare();
    }

    CTorAbove(){
        //Check all values above
        let result = new Color(500, 2000, 2000000, 300);
        let expected = Color.Max();
        UnitTesting.AssertAreEqualObject("Color CTorAbove", expected, result);
    }

    CTorBelow(){
        //Check all values above
        let result = new Color(-555, -2, 0, -5000);
        let expected = Color.Empty();
        UnitTesting.AssertAreEqualObject("Color CTorBelow", expected, result);
    }

    Compare(){
        //Check basic compare
        let result = Color.Red();
        let expected = new Color(255, 0, 0, 0);
        UnitTesting.AssertTrue("Color Compare", result, expected);
    }
    
}