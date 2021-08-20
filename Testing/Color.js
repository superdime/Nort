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