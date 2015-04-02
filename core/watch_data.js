/**
* @file Constructer to Stores prop and value pairs and alerts listeners on change 
*/

/**
* Stores prop and value pairs and alerts listeners on change 
* @constructer
*/
WatchData = function () {
	/**
	* Data is stored here.  data[prop] = {value: value, listeners[array of functions]}
	*/
	this.data = {};
	/**
	* Notifies listeners of a change
	* @param {string} prop - name of property that changed
	* @param {*} oldValue - old value of property
	* @param {*} currentValue - new value of property
	*/
	var notify = function (prop, oldValue, currentValue) {
		var listeners = this.data[prop].listeners;
		if(listeners.length === 0){
			return;
		}
		for(var i = 0; listeners < i; ++i) {
			listeners[i](prop, oldValue, currentValue);
		}
	}.bind(this);

	/**
	* Sets data and alerts listeners
	*/
	this.set = function (prop, value) {
		if(prop in this.data) {
			var oldValue = this.data[prop].value;
			this.data[prop].value = value;
			notify(prop, oldValue, value);
		} else {
			this.data[prop] = {
				value: value,
				listeners: []
			};
			// don't call notify since there are no listeners.
		}
	}.bind(this);

	/**
	* Returns the value for prop
	* @param {string} prop - name of property to return value for
	*/
	this.get = function (prop) {
		return this.data[prop].value;
	}.bind(this);

	/**
	* Adds a listener to prop to be notified of changes to prop's value
	* @param {string} prop - property to watch
	* @param {function} cb - callback
	*/
	this.watch = function (prop, cb) {
		if(!(prop in this.data)){
			return;
		}
		this.data[prop].listeners.push(cb);
	}.bind(this);
};

module.exports = WatchData;