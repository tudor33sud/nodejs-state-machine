# Nodejs State Machine

Simple state machine management in Node JS without any external dependency.

V2 moved to async transitions using promises.


## Prerequisites

Works only on node >=6.1.4

## Signature

`StateMachine(initialState,options)`
* **initialState** - initial state to be used when instantiating state machine
* **options** - options object (refer below for details)
## Installing

npm install nodejs-state-machine

## Usage



```javascript
const StateMachine = require('nodejs-state-machine');
const { StateMachineError, errorCodes } = require('nodejs-state-machine/errors');
//trying to instantiate a state machine with a non existing initial state across transitions will throw error
const radio = new StateMachine('off', {
    transitions: [
        { name: "play song", from: "on", to: "playing" },
        { name: "turnOff", from: ["playing", "on", "paused"], to: "off" },
        { name: "turnOn", from: "off", to: "on" },
        { name: "pause", from: "playing", to: "paused" }
    ],
    handlers: {
        onPlaySong: (param) => {
            console.log('playing song');
        },
        onTurnOff: () => {
            console.log('turned off');
            return true;
        },
        onTurnOn: async (parameter) => {
            console.log('turned on');
            //returned parameter here will be the resolved value on radio.turnOn promise
            return task;
        },
        onPause: () => {
            console.log('paused')
        }
    }
});


try {
    await radio.playSong(); // notice how library automatically camel cases transition names for methods
} catch (err) {
    //will throw error invalid transition cannot play song when radio is in stopped initial state
    console.log(err);
    }
try {
    console.log(radio.can('playSong')); //false
    console.log(radio.availableTransitions());
    console.log(radio.can('turnOn')); //true
    console.log(await radio.turnOn('parameter')); // returns target state, "on"
    console.log(radio.availableTransitions());
    console.log(radio.is('on')); //check if radio is in on state, returns true
    console.log(await radio.turnOff()); // returns target state, "off"
    console.log(radio.reset('playing')); // helper method if one wants to reuse same state machine object, although not really recommended
    console.log(await radio.turnOn()); // will throw exception

} catch (err) {
    //catch turn on error
    if (err instanceof StateMachineError) {
        //you can also distinguish for StateMachineError if you only have a single error handler
        //State Machine Error contains an errorCode in addition to the core Error message and stack peroperties
        //Error codes can be accessed via errors module using errors.errorCodes 
        console.log(err);
    }
}


```

## Available options parameters

* **transitions** - transitions array definition ([ { name:<name>, from:<fromState>, to:<toState> }])
* **handlers** - handler functions definition

## API

* **camel cased methods for transition names** - Methods to change internal state defined by transition names : returns **changed state** or throws **error**
* **is(state)** - Method to check if state machine is in a certain state : **boolean**
* **can(transitionName)** - Check if a given transition can occur on the current state : **boolean**
* **reset(state)** - Method to reset state machine to a given state : returns **current state** or throws **error**
* **availableTransitions()** - Method to return a list of all available transition names from the current state  : list of **transitions**

All states and transitions of the StateMachine can be retrieved by using stateMachineInstance.states or stateMachineInstance.transitions ( will return a ES6 SET ).

## Events

State machine extends node's event emitter, so you can listen to events from it:

* **stateChanged(from, to, transitionName)** - Triggered when a transition method was executed successfully. Can be useful for logging for example.


## State Management Overview

For better description about managing the state, note that we use 2 main concepts: **transition** and **state**. 
   * **Transition** is defined by a name, source state and target state.
   * **State** is defining the state in which the state machine can be at some point.
    
StateMachine will be crawling through all the transition states and create a unique set of them, in order to gather all the possible states. Transition names should be unique as well, and note that for managing a transition where the target state can occur from multiple sources, you can either define multiple transitions using the SAME name, or specify from property as array.
    
## Considerations

 * Current implementation of the state machine is synchronous, so any async processing before or after changing the state should be done outside of the framework. If you need some more features, please feel free to file a feature request
## Authors

* **Tudor Suditu** - *Initial work* - (https://github.com/tudor33sud)

## Want to contribute?

You can send me an e-mail at tudor33sud@yahoo.com

## License

This project is licensed under the MIT License 

