/*global window, document, console, _console, localStorage, _M, current_error_states, $, isCurrentState */
(function(window, document, console) {
/**
 * ErrorHandler handles styling error and log messages in Chrome. 
 * Also it handle error states for certain situations. If a defined 
 * state is found in the state_manager. This class will add
 * that state to the current array of active error states, run
 * that code, and remove the state when resolved.
 * @class ErrorHandler
 * @constructor
 */
	function EHandler() {
		/**
		 * Global var for modules to get current error handler states.
		 * @global {array} current_error_states - array of current error states in process
		 */
		window.current_error_states = [];
		var current_process, // current running process
			is_chrome = window.chrome, // check if browser is Google Chrome
			log_style = { // styling for Chrome console "tags"
				warn: {
					bgclr: "#F09000"
				},
				error: {
					bgclr: "#DB1626"
				},
				info: {
					bgclr: "#1697DB"
				},
				log: {
					bgclr: "#999"
				},
				settings: {
					txtclr: "#F2E2DC"
				},
				modules: {
					Transport: "#382830",
					Cookie: "#BF4E63",
					Flow: "#532572",
					User: "#1F5B73",
					Dialog: "#C1BE13",
					Validator: "#000000",
					Header_bootstrap: "#E34439"
				}
			},
			state,
			state_manager,
			clear_func = function(){},

		/**
		 * Sets console log levels.
		 * @private
		 * @var {integer} debug - 0 = all logs off, 1 = logs/info, 2 = log/info/warn, 3 = errors/warn,
		 * 4 = errors, 5 = all logs on
		 */
		// TEMP - NEEDS TO MOVE OUT OF HERE
		// THIS IS THE PROBELM
		debug = 5;

		/**
		 * Switching log levels. Level comes from Config class or 
		 * defaults to 5. 
		 * @type {function}
		 * @private
		 * 0 = all logs off
		 * 1 = logs/info
		 * 2 = log/info/warn
		 * 3 = errors/warn,
		 * 4 = errors
		 * 5 = all logs on
		 */
		function log_levels() {

			function levels(a) {
				if(a instanceof Array) {
					for(var i = 0; i < a.length; i++) {
						console[a[i]] = clear_func;
					}
				}
			}

			switch(debug) {
			case 5:
				levels();
				break;
			case 4:
				levels(["warn", "info", "log"]);
				break;
			case 3:
				levels(["info", "log"]);
				break;
			case 2:
				levels(["error"]);
				break;
			case 1:
				levels(["error", "warn"]);
				break;
			default:
				levels(["error", "warn", "info", "log"]);
			}
		}

		log_levels();

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
		function console_log(msg, module, lvl, data) {

			var modules = log_style.modules[module] || "#486069",
				msg_css = "background:" + log_style[lvl].bgclr + ";color:" + log_style.settings.txtclr +
						";padding:1px 5px;border-radius:0px 10px 10px 0px;",
				module_css = "background:" + modules + ";color:" +
							log_style.settings.txtclr + ";padding:1px 5px;border-radius:10px 0px 0px 10px;",
				log_contents = "%c" + module + " ::" + "%c" + msg;

			if(is_chrome) {
				if(data) {
					console.group(log_contents, module_css, msg_css);
					console[lvl](data);
					console.groupEnd();
				} else {
					console[lvl](log_contents, module_css, msg_css);
				}
			} else {
				console[lvl](msg);
			}
		}

		/**
		 * @todo: Will send select errors to an api.
		 
		
		function inform_natgeo(message, url) {
			var timstamp = new Date(),
				send = { message: message, url: url, timestamp: timestamp };
			$.ajax({
				url: "",
				method: "POST",
				data: JSON.stringify(send),
				dataType: "json",
				success: function() {
					_logger.log("Natgeo informed about error(" + message + ")", "info", "NatGeo");
				}
			});

		}
		*/

		/**
		 * Controls the addition and removal or any other actions dealing with the
		 * the array of current states. If a states has been resolve the state for 
		 * the error should be removed
		 * @private
		 * @param {string} action - add, remove from @current_error_state
		 * @param {string} state - state from state manager i.e "MMDB_TIMEOUT"
		 */
		state = function(action, state) {
			switch(action) {
			case "add":
				current_process = state;
				current_error_states.push(state);
				break;
			case "remove":
				current_error_states.splice(current_error_states.indexOf(state), 1);
				break;
			}
		};
		
		/**
		 * Check if current state active.
		 * @type {Function}
		 * @private
		 * @param {string} state - state from state manager i.e "MMDB_TIMEOUT"
		 * @returns true or false if the the error state is active.
		 */
		window.isCurrentState = function(state) {
			return $.inArray(state, current_error_states) >= 0 ? true : false;
		};
		
		/**
		 * Tries to find the requested state in the state manager. If it finds it
		 * it will run that state"s process. If not it will throw an style or unstyled
		 * error. Also if data is a function a defined state cannot be found, This function
		 * will log into console, add a custom state to @current_error_states, and return a
		 * callback function for the other class/module to use. 
		 * @type {function}
		 * @private
		 * @param {string} error_message - error message.
		 * @param {string} module - module or url from origin of log.
		 * @param {object} data - optional object to pass to console.
		 * @returns {callback} 
		 * 
		 * If data is a function 
		 * _console.error("Custom error message", "Transport", function(returned_obj, state_name) {
		 * 
		 *	isCurrentState(state_name); // check if state is active
		 *	returned_obj.resolve_state() // remove state from current_error_states
		 * });
		 */
		function lookup_state(error_message, module, data) {
			if (data instanceof Function && !state_manager[error_message]) {
				var custom_state = error_message.replace(/ /g,"_").toUpperCase(),
					callback_obj = {
					resolve_state: function(custom_state) {
						current_error_states.splice(current_error_states.indexOf(custom_state), 1);
					}
				};

				if(!isCurrentState(custom_state)) {
					state("add", custom_state);
				}

				console_log(error_message, module, "error");
				return data(callback_obj, custom_state);
			} else {
				if (state_manager[error_message]) {
					if (!isCurrentState(error_message)) {
						state("add", error_message);
					}
					console_log(state_manager[error_message].message, module, "error", data);
					return state_manager[error_message].process("error", module, data);
				} else {
					return console_log(error_message, module, "error", data);
				}
			}
		}

		/**
		 * Calls lookup_state function
		 * @public
		 * @param {string} error_message - error message.
		 * @param {string} module - module or url from origin of log.
		 * @param {object} data - optional object to pass to console.
		 */
		this.error = function(error_message, module, data) {
			lookup_state(error_message, module, data);
		};

		/**
		 * Adds a information log to the console by triggering console_log().
		 * @public
		 * @param {string} information - information message
		 * @param {string} module - module or url from origin of log.
		 * @param {object} data - optional object to pass to console
		 */
		this.info = function(information, module, data) {
			return console_log(information, module, "info", data);
		};

		/**
		 * Adds a log to the console by triggering console_log().
		 * @public
		 * @param {string} log - log message
		 * @param {string} module - module or url from origin of log.
		 * @param {object} data - optional object to pass to console
		 */
		this.log = function(log, module, data) {
			return console_log(log, module, "log", data);
		};

		/**
		 * Adds a warn log to the console by triggering console_log().
		 * @public
		 * @param {string} warning - warning message
		 * @param {string} module - module or url from origin of log.
		 * @param {object} data - optional object to pass to console
		 */
		this.warn = function(warning, module, data) {
			return console_log(warning, module, "warn", data);
		};

		/**
		 * List avaialble defined states in state_manager in the console.
		 * @public
		 */
		this.list = function() {
			var list = ["\n Error Handling (Code : Message) \n", "______________________________________ \n \n"];
			$.each(state_manager, function(key) {
				list.push(key + " : " + this.message + "\n");
			});
			console.log(String(list).replace(/,/g,""));
		};

		/**
		 * Object of defined states. Each state should have a message and a process.
		 * @type {Object} 
		 * @private
		 * @property message - user friendly message.
		 * @property process - what to do this this error is throw. If is resolved use @state
		 * to remove the state from  @current_error_states i.e state("remove", "MMDB_TIMEOUT")
		 */
		state_manager = {
			MMDB_TIMEOUT: {
				message: "We are experiencing some problems. Sit back and we will try again for you.",
				process: function(lvl, module, data) {
					if (isCurrentState(current_process)) {
						var tries = 0,
							interval = 10000,
							that = this;

						localStorage.setItem("id", 1); // Just for testing
						_M.$.ajax({ // TEMP dependancy on _M and jquery -- if you need jquery for the errorHandler, you should make a check for it, and/or load it independantly
							url: "http://mmdb.natgeo.vm:8000/user/1",
							type: "GET",
							dataType: "iframe",
							target: "mmdb",
							xhrFields: {
								withCredentials: true
							},
							success: function() {
								state("remove", this);
								tries = 0;
							},
							error: function(e) {
								if (e.status === 408 && tries < 3) {
									$("#login-native-button, #login-facebook-button").hide(); // TEMP a dependancy on jQuery (shouldn"t happen for this module)
									setTimeout(function() {
										console_log("Trying mmdb again...", module, "info");
										that.process(lvl, module, data);
										tries++;
									}, interval);
								}
							}
						});
					}
				}
			},
			TARGET_NOT_ALLOWED: {
				message: "Target not allowed or doesn\"t have a path.",
				process: function() {
				}
			},
			ORIGIN_NOT_ALLOWED: {
				message: "Origin not allowed.",
				process: function() {
				}
			},
			CORS_IFRAME_TIMEOUT: {
				message: "Cross-domain iframe failed to load: Timeout (408)",
				process: function() {
				}
			},
			COOKIES_NOT_ENABLED: {
				message: "Browser cookies are not enabled",
				process: function() {
					if(_M.Util.browser.isCookiesEnabled) { // TEMP this is a dependancy on _M which shouldn"t continue
						state("remove", this);
					}
				}
			}
		};
	}

	/**
	 * Namespacing class to _console and instantiate class
	 * @namespace window._console
	 * @public
	 */
	// TODO: Reenable hijacking of console once issues have been sorted out
	window._console = new EHandler();

})(window, document, console);

/**
 * Allows for new ErrorHandler()
 * @public
 * @param {string} error_message - error message.
 * @param {string} module - module or url from origin of log.
 * @param {object} data - optional object to pass to console.
 */
function ErrorHandler(error_message, module, data) {
	_console.error(error_message, module, data);
}

ErrorHandler.prototype = new Error();
ErrorHandler.prototype.constructor = ErrorHandler;
ErrorHandler.prototype.name = "ErrorHandler";