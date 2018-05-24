import Blowfish from "egoroof-blowfish";
import fs from "fs";
import hexToArrayBuffer from "hex-to-array-buffer";
import config from "../config/config.js";

export class EncryptedRequest{
	constructor(){
		this.kslist = fs.readFileSync("client/config/tronks.ks","utf8").split("\n");
		this.blowfishEncrypt = new Blowfish(atob(this.kslist[0]), Blowfish.MODE.CBC, Blowfish.PADDING.PKCS5);
		this.blowfishEncrypt.setIv("abcdefgh");

		this.baseurl = `${config.COLD_API_URL}${atob(this.kslist[1])}/api/`;
		this.encrypt = this.encrypt.bind(this);
		this.decryptToJSON = this.decryptToJSON.bind(this);
		this.createPostURL = this.createPostURL.bind(this);
	}

	encrypt(message){
		let buffer = this.blowfishEncrypt.encode(message);
		let hexstr = Buffer.from(buffer).toString("hex");
		return btoa(hexstr);
	}

	decryptToJSON(data){
		data = this.blowfishEncrypt.decode(hexToArrayBuffer(atob(data)));
		console.log("decryptToJSON: " + data);
		try{
			data = JSON.parse(data);
		}catch(e){
			return {};
		}
		return data;
	}

	createPostURL(view, req_type, endpoint, data_dict){
		let isGET = req_type.toUpperCase() == "GET";
		let params = "";

		if (isGET){
			//should be only 1 param
			if (Object.keys(data_dict).length == 1){
				for(let item in data_dict){
					let encrypted_msg = this.encrypt(data_dict[item]);
					params = encrypted_msg;
				}
			}
		}else{
			let res_arr = [];
			for (let item in data_dict){
				let encrypted_msg = this.encrypt(data_dict[item]);
				res_arr.push(`${item}=${encrypted_msg}`);
			}
			params = res_arr.join("&");
		}


		if (view == config.views.COLDWALLET){
			return `${this.baseurl}${endpoint}${isGET ? "/" : "?"}${params}`;
		}else{
			return `${config.API_URL}/api/${endpoint}${isGET? "/" : "?"}${params}`;
		}
		
	}
}

var inst;

export let BlowfishSingleton = (()=>{
	function createInst(){
		return new EncryptedRequest();
	}

	if (!inst){
		inst = createInst();
	} 
	return inst;
})();