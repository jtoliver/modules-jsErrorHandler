/**
 * This module contains some modified code from Ply v0.4.8:
 * https://github.com/createthegroup/ply/blob/master/src/core.js
 * 
 * ErrorHandler handles styling error and log messages in Chrome. 
 * Also it handle error states for certain situations. If a defined 
 * state is found in the state_manager. This class will add
 * that state to the current array of active error states, run
 * that code, and remove the state when resolved.
 * @class ErrorHandler
 * @constructor
 * error handler should 
	return {
	msg: msg
	code: code
	lvl: lvl
	module: module
	state: current errors state
	}
 */

function ErrorHandler(initOpts) {
	/**
	 * SINGLETON
	 */

	if ( ErrorHandler.prototype._singletonInstance ) {
		return ErrorHandler.prototype._singletonInstance;
	}

	var self = this;

	if (typeof self === 'undefined') {
		self = new ErrorHandler();
	}

	ErrorHandler.prototype._singletonInstance = self;

	/**
	 * Config and Defaults
	 */
	var defaults = {
		styling: {
			warn: {
				bgclr: '#F09000'
			},
			error: {
				bgclr: '#DB1626'
			},
			info: {
				bgclr: '#1697DB'
			},
			log: {
				bgclr: '#999'
			},
			settings: {
				txtclr: '#F2E2DC'
			},
			modules: {
				Error: '#000000'
			}
		},
		debug: 4,
	},
		debug,
		isChrome = window.chrome, // check if browser is Google Chrome
		id = 0,
		listeners = {}, // `listeners` is an associative array holding arrays of
						// notification listeners keyed on the notification name.
		outputLevel = [],
		state = {};


	this.addModuleStyle = function(moduleName, bgcolor) {
		defaults.styling.modules[moduleName] = bgcolor;
	};
    /**
	 * Check if current state active.
	 * @type {Function}
	 * @private
	 * @returns true or false if the the error state is active.
	 */
	this.checkState = function(stateCode) {
		return (state[stateCode].status) ? true : false;
	};

	/**
	 * Calls lookup_state function
	 * @public
	 * @param {string} error_message - error message.
	 * @param {string} module - module or url from origin of log.
	 * @param {object} data - optional object to pass to console.
	 */
	this.error = function(errorMessage, module, data, errorCode) {
		if(errorCode) {
			data.errorCode = errorCode;
		}
		this.output(errorMessage, module, 'error', data);
		this.publish(errorCode, module, errorMessage);
	};

	/**
	 * Adds a information log to the console by triggering console_log().
	 * @public
	 * @param {string} information - information message
	 * @param {string} module - module or url from origin of log.
	 * @param {object} data - optional object to pass to console
	 */
	this.info = function(msg, module, data) {
		this.output(msg, module, 'info', data);
	};

	/**
	 * List avaialble defined states in state_manager in the console.
	 * @public
	 */
	this.list = function() {
		var i, output = ['\n Error Handling (Code : #ofListeners) \n', '______________________________________ \n \n'];
		for(i in listeners) {
			if(listeners.hasOwnProperty(i)) {
				output.push(i + ' : ' + listeners[i].length + '\n');
			}
		}
		console.log(String(output).replace(/,/g,''));
	};
	
	/**
	 * Adds a log to the console by triggering console_log().
	 * @public
	 * @param {string} log - log message
	 * @param {string} module - module or url from origin of log.
	 * @param {object} data - optional object to pass to console
	 */
	this.log = function(msg, module, data) {
		this.output(msg, module, 'log', data);
	};

	/**
	 * Console styling for Chrome. If not Chrome, console warnings, logs,
	 * and error will revert to normal.
	 * @type {function}
	 * @private
	 * @param string msg - message to console
	 * @param string module - module or url from origin
	 * @param string lvl - level of log ie warn, error, log, info
	 *
	 * @optional
	 * @param object data - any optional data from origin
	 */
	this.output = function(msg, module, lvl, data) {
		var modules = defaults.styling.modules[module] || '#486069',
			msgCSS = 'background:' + defaults.styling[lvl].bgclr + ';' +
						'color:' + defaults.styling.settings.txtclr + ';' +
						'padding:1px 5px; border-radius:0px 10px 10px 0px;',
			moduleCSS = 'background:' + modules + ';' +
						'color:' + defaults.styling.settings.txtclr + ';' +
						'padding:1px 5px; border-radius:10px 0px 0px 10px;',
			logContents = '%c' + module + '::' + '%c' + msg;

		if(outputLevel.indexOf(lvl) !== -1) {
			if(isChrome) {
				if(data) {
					console.group(logContents, moduleCSS, msgCSS);
					console[lvl](data);
					console.groupEnd();
				} else {
					console[lvl](logContents, moduleCSS, msgCSS);
				}
			} else {
				console.log('no chrome');
			}
		}
	};

    /**
     * Notify
     * Notifies listeners of an event. Notifiers should send themselves 
     * and optional data as arguments.
     */
    this.publish = function(note, sender, data) {

        // Cache listeners array or create a new array, assign, and cache it.
        // #2 Make sure cached array is a clone and not passed by reference
        // using `Array.prototype.slice`
        var list = listeners[note] ? listeners[note].slice(0) : (listeners[note] = []),
            // Create loop variables.
            i = 0,
            len = list.length;

        // Loop over listeners and notify each.
        for (; i < len; i++) {
            list[i].handler.call(list[i].listener, note, sender, data);
        }

        return;
    };

    function mergeRecursive(obj1, obj2) {
		for (var p in obj2) {
			if (obj2.hasOwnProperty(p)) {
				try {
					// Property in destination object set; update its value.
					if ( typeof obj2[p]==='object' ) {
						obj1[p] = mergeRecursive(obj1[p], obj2[p]);
					} else {
						obj1[p] = obj2[p];
					}
				} catch(e) {
					// Property in destination object not set; create it and set its value.
					obj1[p] = obj2[p];
				}
			}
		}
		return obj1;
	}

	/**
	* Switching log levels. Level comes from an init to ErrorHandler, or defaults to 4
	* @type {function}
	* @private
	* 0 = all logs off
	* 1 = logs/info
	* 2 = log/info/warn
	* 3 = errors/warn,
	* 4 = errors
	* 5 = all logs on
	*/
	function setLevels() {
		switch(debug) {
		case 5:
			outputLevel = ['error', 'warn', 'info', 'log'];
			break;
		case 4:
			outputLevel = ['error'];
			break;
		case 3:
			outputLevel = ['error','warn'];
			break;
		case 2:
			outputLevel = ['warn', 'info', 'log'];
			break;
		case 1:
			outputLevel = ['info','log'];
			break;
		default:
			outputLevel = [];
		}
	}

	this.status = function() {
		var i, output = ['\n Active States \n', '________________________ \n \n'];
		for(i in state) {
			if(state.hasOwnProperty(i) && state[i].status) {
				output.push(i + '\n');
			}
		}
		console.log(String(output).replace(/,/g,''));
	};

	/**
	 * Listen
	 * Listens for a particular notification or set of notifications.
	 * Clients should pass in a handler function and themselves as arguments.
	 * When the handler function is called, it will be applied to the `listener`'s
	 * scope, ensuring that `this` refers to what the client expects.
	 */
    this.subscribe = function(notification, handler, listener) {
        if (!handler) {
			throw new E('UNDEFINED_HANDLER', 'ErrorHandler');
        }
        // Cache the notification's listeners if it exists or create and cache
        // a new array otherwise.
        var list = listeners[notification] || (listeners[notification] = []);

        // Add the listener and handler function to the notifications array.
        list.push({
            id: id += 1,
            handler: handler,
            listener: listener
        });

        // return handle used to ignore.
        return [notification, id];
    };

    /**
     * Ignore
     * Removes a particular notification from listeners object
     */
	this.unsubscribe = function(handle) {
        
        var note = handle[0],
            len = listeners[note] ? listeners[note].length : 0,
            i = 0;

        // loop through handlers and remove if id matches.
        for (; i < len; i++) {
            if (listeners[note][i].id === handle[1]) {
                listeners[note].splice(i, 1);
                break;
            }
        }

        return;
    };

	/**
	 * Adds a warn log to the console by triggering console_log().
	 * @public
	 * @param {string} warning - warning message
	 * @param {string} module - module or url from origin of log.
	 * @param {object} data - optional object to pass to console
	 */
	this.warn = function(msg, module, data) {
		this.output(msg, module, 'warn', data);
	};


    /**
	 * Controls the addition and removal or any other actions dealing with the
	 * array of current states. If a state has been resolved it will be removed
	 * @private
	 * @param {string} action - add, remove from @current_error_state
	 * @param {string} state - state from state manager i.e 'MMDB_TIMEOUT'
	 */
	this.addState = function(stateCode) {
		if (!state[stateCode]) {
			state[stateCode] = {
				name: stateCode,
				status: true,
				callbacks: {
					fn: [],
					args: []
				}
			};
		}
	};

	this.subscribeState = function(stateCode, cb) {
		this.addState(stateCode);
		state[stateCode].callbacks.fn.push(cb);
		state[stateCode].callbacks.args.push(arguments.slice(2));
		return true;
	};

	this.removeState = function(stateCode) {
		if (state[stateCode] && state[stateCode].status) {
			for (var fn in state[stateCode].callbacks.fn) {
				fn.call(this, state[stateCode].callbacks.args);
			}
			state[stateCode].status = false;
			return true;
		}
		else {
			return false;
		}
	};

	// INIT

	function init(initOpts) {
		mergeRecursive(defaults,initOpts);
		debug = defaults.debug;
		setLevels();

	}
	init(initOpts);
}

function E(errorCode, module, data, errorMessage) {
	var e = new	ErrorHandler();
	e.error(errorCode, module, data, errorMessage);
	if (errorMessage) {
		data.errorMessage = errorMessage;
	}
	e.publish(errorCode, module, data);
}

E.prototype = new Error();
E.prototype.constructor = E;
E.prototype.name = 'ErrorHandler Error';