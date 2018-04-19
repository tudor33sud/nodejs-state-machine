/**
 * @typedef {Object} Transition
 * @property {String} name Transition name
 * @property {String|Array} from Initial state(s) from which transition may occur 
 * @property {String} to Target state of the tranistion
 * @typedef {Object} StateMachineOptions
 * @property {Array.<Transition>} transitions
 */
const EventEmitter = require('events');
const _ = require('lodash');
const required = (requiredParamName) => { throw new Error(`Missing required parameter ${requiredParamName}`) };

const camelize = (str) => {
    let string = str.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
        .reduce((result, word) => result + capitalize(word.toLowerCase()));
    return string.charAt(0).toLowerCase() + string.slice(1);
};

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
            throw new Error(`Initial state cannot be found in list of states`);
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
            throw new Error(`State ${state} doesn't exist in state machine`);
        }
        this._currentState = state;
    }



    /**
     * Internal method. Takes care of mapping transition states, and creating internal transitions dictionary
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


        this[camelizedTransitionName] = () => {
            this._transition(camelizedTransitionName);

        }
    }

    _addState(state) {
        this.states.add(state);
        this.states.add(state);
        if (typeof this._transitionsMap[state] === 'undefined') {
            //create empty object if state is first time defined
            this._transitionsMap[state] = {};
        }
    }

    _transition(transition) {
        const canTransition = this._transitionCheck(transition);
        if (!canTransition) {
            throw new Error(`Invalid transition ${transition} from the current state: ${this._currentState}`);
        }
        const targetState = this._transitionsMap[this._currentState][transition].to;
        const currentState = this._currentState;
        this._currentState = targetState;
        this.emit('stateChanged', currentState, targetState, transition);
        return this._currentState;
    }

    _transitionCheck(transition) {
        const currentState = this._currentState;
        const foundTransition = this._transitionsMap[currentState][transition];
        if (!foundTransition) {
            return false;
        }
        return true;
    }

};