"use strict";
/**
 * @typedef {Object} Transition
 * @property {String} name Transition name
 * @property {String|Array} from Initial state(s) from which transition may occur 
 * @property {String} to Target state of the tranistion
 * @typedef {Object} StateMachineOptions
 * @property {Array.<Transition>} transitions
 */
const EventEmitter = require('events');
const required = (requiredParamName) => { throw new Error(`Missing required parameter ${requiredParamName}`) };
const { StateMachineError, errorCodes } = require('./errors');
/**
 * Camelize strings -> Foo Bar = fooBar
 * @param {String} str 
 */
const camelize = (str) => {
    let string = str.replace(/[^A-Za-z0-9]/g, ' ').split(' ')
        .reduce((result, word) => result + capitalize(word));
    return string.charAt(0).toLowerCase() + string.slice(1);
};

/**
 * Capitalizes first letter of a string and lowercases the rest.
 * @param {String} str 
 */
const capitalize = str => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);

module.exports = class StateMachine extends EventEmitter {
    /**
     * 
     * @param {String} initialState Initial state of the state machine
     * @param {StateMachineOptions} options State machine options object
     */
    constructor(initialState = required('initialState'), options = required('options')) {
        super();
        this._currentState = initialState;
        this._transitionsMap = {};
        this.states = new Set();
        this.transitions = new Set();
        options.transitions.forEach(transition => {
            this._mapTransition(transition);
        }, this);

        if (!this.states.has(initialState)) {
            throw new StateMachineError(`Initial state cannot be found in list of states`, errorCodes.INITIAL_STATE_NOT_FOUND);
        }

    }

    /**
     * Returns true or false. Checks whether a transition with the specified name can occur.
     * @param {String} transition 
     */
    can(transition) {
        return this._transitionCheck(transition);
    }

    /**
     * Check if the state machine is currently in a certain state.
     * @param {String} state 
     */
    is(state) {
        return this._currentState === state;
    }

    /**
     * Reset the same state machine object to a certain state. State should be one of the registered states for this state machine.
     * @param {String} state 
     */
    reset(state) {
        if (!this.states.has(state)) {
            throw new StateMachineError(`State ${state} doesn't exist in state machine`, errorCodes.RESET_STATE_NOT_FOUND);
        }
        this._currentState = state;
        return this._currentState;
    }



    /**
     * Takes care of mapping transition states, and creating internal transitions dictionary
     * @param {} transition 
     */
    _mapTransition(transition) {
        this._addState(transition.to);
        const camelizedTransitionName = camelize(transition.name);
        this.transitions.add(camelizedTransitionName);
        if (Array.isArray(transition.from)) {
            transition.from.forEach(state => {
                this._addState(state);
                this._transitionsMap[state][camelizedTransitionName] = transition;
            }, this);
        } else {
            this._addState(transition.from);
            this._transitionsMap[transition.from][camelizedTransitionName] = transition;
        }


        this[camelizedTransitionName] = () => this._transition(camelizedTransitionName);

    }

    /**
     * Adds a state to the object states set. Also defines value for transitionsMap[state] if that is undefined
     * @param {String} state 
     */
    _addState(state) {
        this.states.add(state);
        if (typeof this._transitionsMap[state] === 'undefined') {
            //create empty object if state is first time defined
            this._transitionsMap[state] = {};
        }
    }

    /**
     * Transition the state using a given transition name.
     * Throws error if transition cannot be made from the current state to the target one.
     * @param {String} transition 
     */
    _transition(transition) {
        const canTransition = this._transitionCheck(transition);
        if (!canTransition) {
            throw new StateMachineError(`Invalid transition ${transition} from the current state: ${this._currentState}`, errorCodes.INVALID_TRANSITION);
        }
        const targetState = this._transitionsMap[this._currentState][transition].to;
        const currentState = this._currentState;
        this._currentState = targetState;
        this.emit('stateChanged', currentState, targetState, transition);
        return this._currentState;
    }

    /**
     * Check if given transition can occur. Returns true or false.
     * @param {*} transition 
     */
    _transitionCheck(transition) {
        const currentState = this._currentState;
        const foundTransition = this._transitionsMap[currentState][transition];
        if (!foundTransition) {
            return false;
        }
        return true;
    }

};