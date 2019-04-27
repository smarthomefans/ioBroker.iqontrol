"use strict";

/*
 * Created with @iobroker/create-adapter v1.11.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");
var createdObjects = [];
var udef = 'undefined';

		
class Iqontrol extends utils.Adapter {

	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "iqontrol",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	//----------------------------------------------------------------------------
	async createToolbar(index){
		if(typeof index == 'undefined'){
			index = 0;
		}
		this.log.debug("createToolbar(" + index + ")");
		if(typeof this.config.toolbar != 'undefined' && index < this.config.toolbar.length){
			var objName = this.config.toolbar[index].commonName;
			var obj = {
				"type": "device",
				"common": {
					"name": objName,
					"desc": "created by iQontrol",
					"role": "iQontrolToolbar",
					"icon": ""
				},
				"native": {
					"sortPrefix": ('000' + index).slice(-4),
					"linkedView": this.namespace + ".Views." + this.config.toolbar[index].nativeLinkedView,
					"icon": (typeof this.config.toolbar[index].nativeIcon != udef && this.config.toolbar[index].nativeIcon || "")
				}
			};
			this.log.debug(">>>createToolbar " + index + ": " + objName);
			createdObjects.push("Toolbar." + objName);
			await this.setObjectAsync("Toolbar." + objName, obj, this.createToolbar(index + 1)); //Iterating
		}
	}

	async createViews(index){
		if(typeof index == 'undefined'){
			index = 0;
		}
		this.log.debug("createViews(" + index + ")");
		if(typeof this.config.views != 'undefined' && index < this.config.views.length){
			var objName = this.config.views[index].commonName;
			var nativeBackgroundImage = this.config.views[index].nativeBackgroundImage.replace(/\\/g, "/") || "";
			var obj = {
				"type": "device",
				"common": {
					"name": objName,
					"desc": "created by iQontrol",
					"role": "iQontrolView",
					"icon": ""
				},
				"native": {
					"sortPrefix": ('000' + index).slice(-4),
					"backgroundImage": (typeof this.config.views[index].nativeBackgroundImage != udef && this.config.views[index].nativeBackgroundImage || "").replace(/\\/g, "/")
				}
			};
			await this.createDevices(index);
			this.log.debug(">>>createView " + index + ": " + objName);
			createdObjects.push("Views." + objName);
			await this.setObjectAsync("Views." + objName, obj, this.createViews(index + 1)); //Iterating
		}
	}
	
	async createDevices(viewIndex, index){
		if(typeof index == 'undefined'){
			index = 0;
		}
		this.log.debug("createDevices(" + viewIndex + ", " + index + ")");
		if(typeof this.config.views[viewIndex].devices != 'undefined' && index < this.config.views[viewIndex].devices.length){
			var objName = this.config.views[viewIndex].devices[index].commonName;
			var obj = {
				"type": "channel",
				"common": {
					"name": objName,
					"desc": "created by iQontrol",
					"role": (typeof this.config.views[viewIndex].devices[index].commonRole != udef && this.config.views[viewIndex].devices[index].commonRole || ""),
					"icon": ""
				},
				"native": {
					"sortPrefix": ('000' + index).slice(-4),
					"heading": (typeof this.config.views[viewIndex].devices[index].nativeHeading != udef && this.config.views[viewIndex].devices[index].nativeHeading || ""),
					"linkedView": (typeof this.config.views[viewIndex].devices[index].nativeLinkedView != udef && (this.namespace + ".Views." + this.config.views[viewIndex].devices[index].nativeLinkedView) || ""),
					"backgroundImage": (typeof this.config.views[viewIndex].devices[index].nativeBackgroundImage != udef && this.config.views[viewIndex].devices[index].nativeBackgroundImage || "").replace(/\\/g, "/")
				}
			};
			await this.createStates(viewIndex, index);
			this.log.debug(">>>>>>createDevice " + viewIndex + ", " + index + ": " + objName);
			createdObjects.push("Views." + this.config.views[viewIndex].commonName + "." + objName);
			await this.setObjectAsync("Views." + this.config.views[viewIndex].commonName + "." + objName, obj, this.createDevices(viewIndex, index + 1)); //Iterating
		}
	}

	async createStates(viewIndex, deviceIndex, index){
		if(typeof index == 'undefined'){
			index = 0;
		}
		this.log.debug("createStates(" + viewIndex + ", " + deviceIndex + ", " + index + ")");
		if(typeof this.config.views[viewIndex].devices[deviceIndex].states != 'undefined' && index < this.config.views[viewIndex].devices[deviceIndex].states.length){
			var objName = this.config.views[viewIndex].devices[deviceIndex].states[index].state;
			var obj = {
				"type": "state",
				"common": {
					"name": objName,
					"desc": "created by iQontrol",
					"role": "iQontrolLinkedState",
					"type": "string",
					"icon": "",
					"read": true,
					"write": false,
					"def": ""
				},
				"native": {}
			};
			this.log.debug(">>>>>>>>>createState " + viewIndex + ", " + deviceIndex + ", " + index + ": " + objName);
			createdObjects.push("Views." + this.config.views[viewIndex].commonName + "." + this.config.views[viewIndex].devices[deviceIndex].commonName + "." + objName);
			this.setObjectAsync("Views." + this.config.views[viewIndex].commonName + "." + this.config.views[viewIndex].devices[deviceIndex].commonName + "." + objName, obj, this.setStateValue(viewIndex, deviceIndex, index));
		}
	}

	async setStateValue(viewIndex, deviceIndex, index){
		this.log.debug("setState(" + viewIndex + ", " + deviceIndex + ", " + index + ")");
		if(typeof this.config.views[viewIndex].devices[deviceIndex].states != 'undefined' && index < this.config.views[viewIndex].devices[deviceIndex].states.length){
			var objName = this.config.views[viewIndex].devices[deviceIndex].states[index].state;
			var objValue = this.config.views[viewIndex].devices[deviceIndex].states[index].value;
			this.log.debug(">>>>>>>>>>>>setState " + viewIndex + ", " + deviceIndex + ", " + index + ": " + objName + " -> " + objValue);
			this.setStateAsync("Views." + this.config.views[viewIndex].commonName + "." + this.config.views[viewIndex].devices[deviceIndex].commonName + "." + objName, objValue, this.createStates(viewIndex, deviceIndex, index + 1)); //Iterating
		}
	}

	async deleteUnusedObjects(){
		this.log.debug("deleteUnusedObjects()");
		var that = this;
		this.getAdapterObjectsAsync(function(obj, err){
			that.log.debug("Got Objects");
			var ids = []
			for (var key in obj) {
				if (!obj.hasOwnProperty(key)) continue;
				ids.push(key);
			}
			that.log.debug("These are all Objects: " + ids.toString());
			for(var i = 0; i < ids.length; i++){
				var filter = ["Images"];
				var name = ids[i].substr(that.namespace.length + 1);
				if(createdObjects.indexOf(name) >= 0 || filter.indexOf(name) >= 0){
					that.log.debug("DeviceObject " + name + " ist still in use - not deleting.")
				} else {
					that.log.debug("<<<deleteObject " + name);
					that.delObjectAsync(name, function(err){
						if(err) that.log.debug("Error while deleting: " + err); else that.log.debug("...deleted.");
					});
				}
			}
		});
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.log.info("Creating Toolbar...");
		await this.createToolbar();
		
		this.log.info("Creating Views...");
		await this.createViews();
		
		this.log.info("Created Devices: " + createdObjects.length + " (" + createdObjects.toString() + ")");

		this.log.info("Deleting unused Objects...");
		await this.deleteUnusedObjects();
		
		
		//--------------------------------- HELP ------------------------------------
		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		//this.log.info("config option1: " + this.config.option1);
		//this.log.info("config option2: " + this.config.option2);
		//
		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		//await this.setObjectAsync("testVariable", {
		//	type: "state",
		//	common: {
		//		name: "testVariable",
		//		type: "boolean",
		//		role: "indicator",
		//		read: true,
		//		write: true,
		//	},
		//	native: {},
		//});
		//
		// in this template all states changes inside the adapters namespace are subscribed
		//this.subscribeStates("*");
		//
		/*
		setState examples
		you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		//await this.setStateAsync("testVariable", true);
		//
		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		//await this.setStateAsync("testVariable", { val: true, ack: true });
		//
		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
		//
		// examples for the checkPassword/checkGroup functions
		//let result = await this.checkPasswordAsync("admin", "iobroker");
		//this.log.info("check user admin pw ioboker: " + result);
		//
		//result = await this.checkGroupAsync("admin", "admin");
		//this.log.info("check group user admin group admin: " + result);
		//---------------------------------------------------------------------------
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.log.info("cleaned everything up...");
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}
		 
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Iqontrol(options);
} else {
	// otherwise start the instance directly
	new Iqontrol();
}







