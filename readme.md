# Nodejs State Machine

Simple state machine management in Node JS without any external dependency


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
    ]
});

const stateChangedHandler = (from, to, transitionName) => {
    console.log(`Applied transition ${transitionName} and changed state from ${from} to ${to}`);
}

radio.on('stateChanged', stateChangedHandler);
try {
    radio.playSong(); // notice how library automatically camel cases transition names for methods
} catch (err) {
    //will throw error invalid transition cannot play song when radio is in stopped initial state
    console.log(err);
}

try {
    console.log(radio.can('playSong')); //false
    console.log(radio.can('turnOn')); //true
    console.log(radio.turnOn()); // returns target state, "on"
    //you can now apply your business logic to turn on the radio
    console.log(radio.is('on')); //check if radio is in on state, returns true
    console.log(radio.turnOff()); // returns target state, "off"
    console.log(radio.reset('playing')); // helper method if one wants to reuse same state machine object, although not really recommended
    console.log(radio.turnOn()); // will throw exception

} catch (err) {
    //catch turn on error
    if (err instanceof StateMachineError) {
        //you can also distinguish for StateMachineError if you only have a single error handler
        //State Machine Error contains an errorCode in addition to the core Error message and stack peroperties
        //Error codes can be accessed via errors module using errors.errorCodes 
        console.log(err);
    }
}

radio.removeListener('stateChanged', stateChangedHandler);

```

## Available options parameters

* **transitions** - transitions array definition ([ { name:<name>, from:<fromState>, to:<toState> }])

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

