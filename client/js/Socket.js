import config from "../config/config.js";
import Stomp from "stompjs";

var stomp;

function createSocket(){
	if (!stomp){
		let socket = new SockJS(`${config.API_URL}/walletws`);
		stomp = Stomp.over(socket);
		stomp.debug = null
		console.log("stomp init");
	}
	return stomp;
}

module.exports = createSocket();