---
## Purpose
Error handler is used to respond to defined errors. For example, error handler has a state manager with a defined states for if mmdb is down. If any modules throw that error, error handler will respond to the error by trying mmdb a certain number of times until it is back up. It will also update a global array called current_error_states that other module can check to see if that state is still active. If error handler can contact mmdb, that state is removed from that global array. Also error handler provides some visual elements in Chrome's console and log level control. This allows for easier debugging for the developer.

## API

### current_error_states

**Returns**

-  Array of currently active error states

### throw new ErrorHandler(`error_message`, `module`, `data`)

**Parameters** 
   
- `string` **(error_message)**
   
    Accepts a string containing the desired error message. The string is also searched in the error handler, and if found, will process that error.

- `module` **(module - optional)**

Accepts a string containing the name of the module or tag name you desire.

- `string`, `object` , `function`, or `integer` **(data - optional)**

Accepts a string, object,  integer, or function. Data is any information that you want to be displayed in the console along with the message. If data is a function, a custom error state will be added to the error handler and the function will be fired. To check the status of this custom state, user `current_error_states` and to resolve with in the function use `returned_obj.resolve_state()` ie

```
throw new ErrorHandler('ERROR_EXAMPLE', 'Users', function(o) {
	if(1 === 1) {
		o.resolve_state();
	} else {
		//  Rerun code that initiated error
	}
});
```

Along with ErrorHandler(), the error handler also contains
- _console.log()
- _console.warn()
- _console.info()
-_console.error()

All behave the same way as ErrorHandler(), accepting a message, module, and data.

### console.list()

**Returns**

List of defined states in the error handler






