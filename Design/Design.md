# Design
The purpose of this file is to explain diagrams and design decisions. This is done by revision step.

## Overview
- Old Nort Class Diagram (based on Unity)
    - Design Decisions
        - Game
        - Grid
        - ControllerState
        - Player
        - TileType
- Nort Class Diagram (based on HTML Canvas)
    - Design Decisions
        - Game
        - GameSettings
        - TileType
        - Direction
        - ControllerState
        - KeyCode
        - KeyboardState
        - Triple
- ...


## Old Nort Class Diagram
This is a basic setup for the Nort game. Although variable types are Unity specific like Vector2, Keyboard, or Gamepad, it can easily be replaced by another comparable engine specific type. I don't think this will be the final version, but it is a good starting point at the least.

### Design Decisions
#### Game
This will be the backbone of the whole system. A lot of the functionality will be hidden within its implementation.

#### Grid
I wanted to use a grid because data can easily be stored and retrieved within a map-like structure. This may cause problems for very large maps though.

#### ControllerState
I wanted an easy way to handle player inputs. Having a super-sub hierarchy will hopefully fulfill this goal. The player will react according to the ControllerState.

#### Player
The player may need to be changed in order to store the current animation-state. As of right now, I don't see that as very necessary because they can be considered a point in data until the player needs to account for more tiles. Color can be changed to sprite type if sprites rather than "pixels" are in use.

#### TileType
I figure an enumerator would best cover the different types of tiles. Having different player tiles will allow for player-killed-player messages if applicable in the future (also coloring properties).


## Nort Class Diagram
I had serious issues using Unity to make this game. The major problem was the assumption that a Tick-based system would work in Unity. Someone else may be able to manage that, but I found it far too difficult. There it was very necessary switch to a different game-making platform. I decided on html canvas (specifically 2D context). Although (again) the diagram is made with respect to HTML Canvas, the diagram should be applicable in other environments as well.

### Design Decisions
#### Game
There are necessary componenets that needed to be added because of the platform (ctx and canvas). Also playersLeft is not that necessary if you can view the size of the alive and players arrays.

#### GameSettings
This was an obvious miss on the first Class Diagram. How do you set up the game? In HTML in will probably look like a form. 

#### TileType
Although the game should handle 2+ players, I'm just keeping it simple at first.

#### Direction
This may not be very necessary just because there are only 4 values in the enumeration, but it will make the program more readable if used.

#### ControllerState
Big change. Instead of a hierarchal structure (since I don't know how to implement controller support in HTML Canvas), I decided to go with a polling-service-like class. This should send keys-of-importance to the KeyboardState and retrieve the state of those keys when Polled. For HTML Canvas, this should be simple, but may cause the game to slow if enough keys are given.

#### KeyCode
Since KeyboardState requires keys in the form of integers, a KeyCode enumeration will help with testing and manual setup. It is obviously simplified in the diagram, but each necessary key should receive a spot in the enumeration.

#### KeyboardState
This is a highly event driven class. It will check keys given and pass their bool states back when requested.

#### Triple
This class was made for KeyboardState. I wanted a simple container that holds an id, keys to be checked, and their current values. This is what helps the ControllerState and KeyboardState communicate effectively.

## ...