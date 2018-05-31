var path = require("path");
const remote = require("electron").remote;
const app = remote.app;

module.exports = {
	"views": {
		"MAINVIEW": "MAINVIEW",
		"MOBILEAUTH": "MOBILEAUTH",
		"COLDWALLET": "COLDWALLET",
		"COLDDASH": "COLDDASH",
		"WATCHONLY": "WATCHONLY",
		"WATCHDASH": "WATCHDASH",
		"HOTWALLET": "HOTWALLET",
		"HOTDASH": "HOTDASH"
	},
	"walletConfigFile": path.resolve(app.getPath("userData"),`./wallet.config.json`),
	"coldOfflineMenuItems": {
		"IMPORT": "IMPORT",
		"REGISTER": "REGISTER",
		"PAPERWALLET": "PAPERWALLET"
	}, 
	"watchOnlyMenuItems":{
		"RESTORE": "RESTORE"
	},
	"dockbar": {
		"nodes": "nodes",
		"backup": "backup"
	},
	constants : {
		SUCCESS: "success",
		FAILED: "failed"
	},
	"API_URL": "http://localhost:8088",
	"COLD_API_URL": "http://localhost:"
}