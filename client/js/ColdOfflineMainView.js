import React from "react";
import config from "../config/config.js";
import jetpack from "fs-jetpack";
import ReactCodeInput from "react-code-input";
import domtoimage from 'dom-to-image';
import FileSaver from "file-saver";
import RegisterWalletModal from "./RegisterWalletModal.js";
import QRCode from "qrcode";
import QRScanModal from "./QRScanModal.js";
import speakeasy from "speakeasy";
import axios from "axios";
import {BlowfishSingleton} from "Utils.js";

export default class ColdOfflineMainView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			startCamera: false,
			listSelectedItem: "",
			regInputText: "",
			importInputText: "",
			paperInputText: ""
		};
		this.last_menu_click = config.coldOfflineMenuItems.IMPORT;

		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.renderHeader = this.renderHeader.bind(this);
		this.renderMenu = this.renderMenu.bind(this);
		this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
		this.onRegCodeChangeHandler = this.onRegCodeChangeHandler.bind(this);
		this.onImportCodeChangeHandler = this.onImportCodeChangeHandler.bind(this);
		this.onPaperCodeChangeHandler = this.onPaperCodeChangeHandler.bind(this);
		this.renderImportCard = this.renderImportCard.bind(this);
		this.renderRegisterCard = this.renderRegisterCard.bind(this);
		this.renderPaperWalletCard = this.renderPaperWalletCard.bind(this);
		this.renderGenPaperWalletSide = this.renderGenPaperWalletSide.bind(this);
		this.renderMainPaperWalletSide = this.renderMainPaperWalletSide.bind(this);
		this.getCodeInputConfig = this.getCodeInputConfig.bind(this);
		this.generatePaperWallet = this.generatePaperWallet.bind(this);
		this.handleImportBtnClick = this.handleImportBtnClick.bind(this);
		this.handleRegisterBtnClick = this.handleRegisterBtnClick.bind(this);
		this.handlePaperWalletDismiss = this.handlePaperWalletDismiss.bind(this);
		this.savePaperWallet = this.savePaperWallet.bind(this);
		this.startQRScan = this.startQRScan.bind(this);
		this.handleQRCallback = this.handleQRCallback.bind(this);
		this.showSecret = this.showSecret.bind(this);
		this.getRegisterModalProps = this.getRegisterModalProps.bind(this);
		this.handleProcessState = this.handleProcessState.bind(this);

		
		this.walletlock = false;

	}

	componentDidMount(){
		 $("#" + config.coldOfflineMenuItems.IMPORT).addClass("menu_item_active"); 
		 $("#coldofflinemenushape").shape();
		
	}

	handleBackButtonClick(){
		this.props.handleBackButtonClick();
	}

	handlePaperWalletDismiss(){
		$("#coldofflinemenushape")
			.shape("set next side", $("#paperwalletside"))
			.shape("flip down");
	}

	handleMenuItemClick(e){
		let precendence = {
			[config.coldOfflineMenuItems.IMPORT]: 0,
			[config.coldOfflineMenuItems.REGISTER]: 1,
			[config.coldOfflineMenuItems.PAPERWALLET]: 2
		};

		let menu_side_map = {
			[config.coldOfflineMenuItems.IMPORT]: "importside",
			[config.coldOfflineMenuItems.REGISTER]: "registerside",
			[config.coldOfflineMenuItems.PAPERWALLET]: "paperwalletside"
		};

		if (e.target.id != this.last_menu_click){
			for (let id in config.coldOfflineMenuItems){
				if (id == e.target.id){
					$("#" + id).addClass("menu_item_active");
					let transition = ""
					if (precendence[id] > precendence[this.last_menu_click]){
						transition = "flip back";	
					}else{
						transition = "flip over";
					}

					$("#coldofflinemenushape")
						.shape("set next side", $("#" + menu_side_map[id]))
						.shape(transition);

					this.last_menu_click = id;

				}else{
					$("#" + id).removeClass("menu_item_active");
				}

				
			}
		}
	}

	handleProcessState(e, toLoad){
		if (toLoad){
			$(e.target).addClass("loading");
			this.walletlock = true;
		}else{
			$(e.target).removeClass("loading");
			this.walletlock = false;
		}
	}

	handleImportBtnClick(e){
		e.persist();

		if (!this.walletlock){
			this.handleProcessState(e,true);

			let pkey = $("#privkey_input").val().trim();
			let code = this.state.importInputText

			if (pkey != "" && code != ""){
				//encrypt all data
				console.log("privkey: " + pkey);
				let url = BlowfishSingleton.createPostURL(this.props.view, "POST","importWallet",{
					password: code,
					privKey: pkey
				});

				axios.post(url)
				.then((res)=>{
					let data = res.data;
					data = BlowfishSingleton.decryptToJSON(data);
					console.log("Import data: " + JSON.stringify(data));
					console.log("data result: " + data.result);
					console.log("s: " + config.constants.SUCCESS);
					if (data.result == config.constants.SUCCESS){
						//TODO success processing
						console.log("result in");
						let prop_data = {
							accountName: data.accountName,
							pubAddress: data.pubAddress
						};
						this.props.handleWalletGatewaySuccess(this.props.view,prop_data);
					}else{
						//TODO error processing
						console.log("error");
					}
					
					this.handleProcessState(e,false);
				})
				.catch((error)=>{
					this.handleProcessState(e,false);
				});
			}else{
				this.handleProcessState(e,false);
			}
		}


	}

	handleRegisterBtnClick(e){
		e.persist();

		if (!this.walletlock){
			this.handleProcessState(e,true);

			let acc_name = $("#register_accname_input").val();
			let code = this.state.regInputText

			if (acc_name != "" && code != ""){
				//encrypt all data
				let url = BlowfishSingleton.createPostURL(this.props.view, "POST","registerWallet",{
					password: code,
					accountName: acc_name
				});

				axios.post(url)
				.then((res)=>{
					let data = res.data;
					data = BlowfishSingleton.decryptToJSON(data);

					if (data.result == config.constants.SUCCESS){
						this.setState(data,()=>{
							$("#registerwalletmodal").modal({
								blurring: true,
								centered: false,
								transition: "scale",
								closable: false,
								onApprove:()=>{
									let prop_data = {
										accountName: data.accountName,
										pubAddress: data.pubAddress
									};
									this.props.handleWalletGatewaySuccess(this.props.view,prop_data);
								}
							})
							.modal("show");
						});
					}else{
						//TODO error processing
					}
					
					this.handleProcessState(e,false);
				})
				.catch((error)=>{
					this.handleProcessState(e,false);
				});
			}else{
				this.handleProcessState(e,false);
			}
		}

		
	}


	handleQRCallback(data){
		setTimeout(()=>{
			$("#qrscan_modal").modal("hide");
		}, 1000);
		$("#privkey_input").val(data);
		
	}


	showSecret(e){
		let inp_target = "#privkey_input";
		let input_type = $(inp_target).attr('type');

		if (input_type == "password"){
			$(inp_target).clone().attr("type","text").insertAfter(inp_target).prev().remove();
			$(e.target).addClass("slash");
		}else{
			$(inp_target).clone().attr("type","password").insertAfter(inp_target).prev().remove();
			$(e.target).removeClass("slash");
		}
	}

	onRegCodeChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({regInputText: val});
		}else{
			this.setState({regInputText: ""});
		}
	}

	onImportCodeChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({importInputText: val});
		}else{
			this.setState({importInputText: ""});
		}
	}

	onPaperCodeChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({paperInputText: val});
		}else{
			this.setState({paperInputText: ""});
		}
	}

	startQRScan(){
		this.setState({startCamera: true}, ()=>{
			$("#qrscan_modal")
			.modal({
				blurring: true,
				closable: false,
				onHidden: ()=>{
					this.setState({startCamera: false});
				},
			})
			.modal("show");
		})
		
	}

	savePaperWallet(){
		domtoimage.toBlob(document.getElementById("paperwalletcanvas"))
	    .then(function (blob) {
	        FileSaver.saveAs(blob, 'TronPaperWallet.jpg');
	    });
	}

	generatePaperWallet(e){
		e.persist();

		if (!this.walletlock){
			this.handleProcessState(e,true);

			let code = this.state.paperInputText

			if (code != ""){
				//encrypt all data
				let url = BlowfishSingleton.createPostURL(this.props.view, "POST","registerWallet",{
					password: code,
					accountName: ""
				});

				axios.post(url)
				.then((res)=>{
					let data = res.data;
					data = BlowfishSingleton.decryptToJSON(data);
					console.log("paper data: " + JSON.stringify(data));
					console.log("paper datatype: " + typeof data);
					console.log("data result: " + data.result);
					if (data.result == config.constants.SUCCESS){
						console.log("result in ");
						this.renderPaperWalletCard(data.pubAddress,data.privAddress,
							data.passcode);
						$("#coldofflinemenushape")
							.shape("set next side", $("#paperwalletgeneratedside"))
							.shape("flip up");
					}else{
						console.log("no result");
						//TODO error processing
					}
					
					this.handleProcessState(e,false);
				})
				.catch((error)=>{
					this.handleProcessState(e,false);
				});
			}else{
				this.handleProcessState(e,false);
			}
		}

	}

	getRegisterModalProps(){
		return{
			pubAddress: this.state.pubAddress,
			privAddress: this.state.privAddress,
			passcode: this.state.passcode
		};
	}

	renderHeader(){
		return(
			<div className="three column row">
				<div className="one wide column">
					<button className="circular medium ui icon button" onClick={this.handleBackButtonClick}>
						<i className="arrow left icon"/>
					</button>
				</div>

				<div className="fourteen wide column">
					<div className="ui one column page centered padded grid">
						<div className="two column title_column">
							<div>
								<img className="ui vertical_center image" src="client/images/tronbluefat.png"
									width="80" height="80"/>
							</div>
							<div className="column">
								<div className= "ui label header_label_div">
									<div className="cold_offline_header_title">COLD OFFLINE</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="one wide column"/>
			</div>
		);
	}

	getCodeInputConfig(){
		let code_input_props = {
			inputStyle: {
				fontFamily: "monospace",
			    borderRadius: "50px",
			    border: "3px solid rgba(53, 86, 212, 0.74)",
			    boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 10px 0px",
			    margin: "4px",
			    width: "50px",
			    height: "50px",
			    fontSize: "32px",
			    boxSizing: "border-box",
			    color: "#3316c5",
			    fontWeight: "bolder",
			    textAlign: "center",
			    backgroundColor: "transparent"
			}
		};
		return code_input_props;
	}

	renderImportCard(){
		return(
			<div className="ui raised card height_fit_content
											cold_offline_import_card" id="importcard">
						
				<div className="center aligned content">
					
					<div className="ui header vertical_center mt-3 mb-1">Private Key</div>
					
					<div className="circular ui icon animated compact right floated button qrcode_scan_btn"
						onClick={this.startQRScan}>
						<div className="center aligned hidden content">Scan</div>
					  	<div className="visible content m-auto pl-2">
					    	<i className="qrcode large icon m-auto"></i>
					  	</div>
					</div>
						
					<div className="content py-3">
						<div className="ui icon input privatekey_input_txt mt-4">
							<input type="password" className="rounded_corners"
								placeholder="Key" id="privkey_input"/>
							<i className="circular eye link icon my-auto cursor_pointer"
								onClick={(e)=>{this.showSecret(e)}}/>
						</div>
					</div>
					<div className="ui header">Wallet Passcode</div>
					<div className="py-3">
						<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
							onChange={this.onImportCodeChangeHandler}/>
					</div>
				</div>
				<div className="ui bottom attached button cold_offline_import_btn"
					onClick={(e)=>{this.handleImportBtnClick(e)}}>
			    	IMPORT
			    </div>
			</div>
		);
	}

	renderRegisterCard(){
		return(
			<div className="ui raised card height_fit_content
											cold_offline_import_card" id="registercard">
				<div className="center aligned content">
					<div className="ui header">Account Name</div>
					<div className="ui large transparent input">
						<input type="text" className="account_name_input" placeholder="JakeWallet"
							id="register_accname_input"/>
					</div>

					<div className="ui header">Wallet Passcode</div>
					<div className="py-3">
						<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
							onChange={this.onRegCodeChangeHandler}/>
					</div>
				</div>
				<div className="ui bottom attached button cold_offline_import_btn"
					onClick={(e)=>{this.handleRegisterBtnClick(e)}}>
			    	REGISTER
			    </div>
			</div>
		);
	}

	renderPaperWalletCard(pubAddress, privAddress, passcode){

		let margin = 20;
		let qrimagewh = 50;
		let c_width = 350;
		let c_height = 750;
		let pub_address = pubAddress;
		let priv_address = privAddress;

		let canvas = $("#paperwalletcanvas")[0];
		canvas.width = 700;
		canvas.height = 1500;
		canvas.style.width = "350px";
		canvas.style.height = "750px";

		let ctx = canvas.getContext("2d");
		ctx.scale(2,2);
		
		/*ctx.save();
		ctx.fillStyle = "#e5ecfb";
  		ctx.fillRect (0, 0, c_width, c_height);
  		ctx.restore();*/

  		let image = new Image;
		image.src = "client/images/tronbluetransparent.png";
		image.onload = function(){
			createRect(image, canvas, margin, this.width, this.height, 20);
		}

		ctx.font = "bolder 16px Avenir";
		ctx.textAlign = "center";
		ctx.fillText("PUBLIC ADDRESS", c_width/2, margin * 2);

		ctx.font = "15px Avenir";
		ctx.textAlign = "center";
		ctx.fillText(pub_address, c_width/2, margin * 3);

		let getRoundedImage = (x,y,w,h,r) =>{
		    ctx.beginPath();
		    ctx.moveTo(x + r, y);
		    ctx.lineTo(x+w-r, y);
		    ctx.quadraticCurveTo(x + w,y, x + w,y + r);
		    ctx.lineTo(x +w, y + h-r);
		    ctx.quadraticCurveTo(x + w, y + h,x + w -r, y +h);
		    ctx.lineTo(x +r, y + h);
		    ctx.quadraticCurveTo(x, y + h, x, y +h - r);
		    ctx.lineTo(x,y+ r);
		    ctx.quadraticCurveTo(x, y,x+r,y);
		    ctx.closePath();
    	}


    	let createRect = (image, canvas,y, width, height, border_rad)=>{
    		ctx.save();
			let x = (canvas.width/2 - width) * 0.5;
			getRoundedImage(x, y, width, height, border_rad);
			ctx.clip();
		    ctx.drawImage(image, x, y);
		    ctx.restore();
    	}

    	let createPrivImage = (y)=>{
    		ctx.font = "bolder 16px Avenir";
			ctx.textAlign = "center";
			ctx.fillText("PRIVATE ADDRESS", c_width/2, y);

			ctx.font = "15px Avenir";
			ctx.textAlign = "center";
			let lines = 2;
			let ch_break_len = Math.floor(priv_address.length / lines);
			
			for (let i = 1; i <= lines; i++){
				ctx.fillText(priv_address.substring((i-1) * ch_break_len, i==lines ? priv_address.length: ch_break_len * i),
					c_width/2, y + (margin * i));
			}
			

			QRCode.toDataURL(priv_address)
			.then(url =>{
				let image = new Image;
				image.src = url;
				image.onload = function(){
					createRect(image, canvas, y + (margin * 3), this.width, this.height, 20);
					createPasscodeImage(y + (margin * (lines + 3)) + this.height);
				}
			})
			.catch(err =>{
				let image = new Image;
				image.src = "client/images/blankqrcode.png";
				image.onload = function(){
					createRect(image, canvas, y + margin, this.width, this.height, 20);
					createPasscodeImage(y + (margin * (lines + 3)) + this.height);
				}
			});
    	}


    	let createPasscodeImage = (y) =>{
    		ctx.font = "bolder 16px Avenir";
			ctx.textAlign = "center";
			ctx.fillText("PASSCODE", c_width/2, y);

			ctx.font = "15px Avenir";
			ctx.textAlign = "center";
			ctx.fillText(passcode, c_width/2, y + margin);

			QRCode.toDataURL(passcode)
			.then(url =>{
				let image = new Image;
				image.src = url;
				image.onload = function(){
					createRect(image, canvas, y + margin * 2, this.width, this.height, 20);

				}
			})
			.catch(err =>{
				let image = new Image;
				image.src = "client/images/blankqrcode.png";
				image.onload = function(){
					createRect(image, canvas, y + margin * 2, this.width, this.height, 20);
				}
			});
    	}

		QRCode.toDataURL(pub_address)
		.then(url =>{
			let image = new Image();
			image.src = url;
			image.onload = function(){
				createRect(image, canvas, margin * 4, this.width, this.height, 20);
				createPrivImage(this.height + (margin * 6));
			}
		})
		.catch(err =>{
			let image = new Image();
			image.src = "client/images/blankqrcode.png";
			image.onload = function(){
				createRect(image, canvas, margin * 4, this.width, this.height, 20);
				createPrivImage(this.height + (margin * 6));
			}
		});
		
	}

	renderMainPaperWalletSide(){
		return(
			<div className="ui raised card cold_offline_import_card">
				<div className="center aligned content">
					<div className="ui header">Wallet Passcode</div>
					<div className="py-3">
						<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
							onChange={this.onPaperCodeChangeHandler}/>
					</div>
				</div>
				<div className="ui bottom attached button cold_offline_import_btn"
					onClick={(e)=>{this.generatePaperWallet(e)}}>
			    	Generate
			    </div>
			</div>
		);
	}

	renderGenPaperWalletSide(){
		return(
			<div className="ui raised card cold_offline_paper_wallet_card over_margins">
				<div className="ui centered grid p-0 m-0 over_margins">	
					<div className="two column row p-0 m-0">
						<div className="column p-0">
							<div className="ui button cold_offline_import_btn border_radius_0 
								top_left_border boxless"
								onClick={this.handlePaperWalletDismiss}>
						    	Dismiss
							</div>
						</div>
						<div className="column p-0">
							<div className="ui button cold_offline_import_btn border_radius_0
								top_right_border boxless"
								onClick={this.savePaperWallet}>
						    	Save
							</div>
						</div>
						
					</div>
				</div>
				<div>
					<canvas id="paperwalletcanvas" className="paperwalletcanvas"/>
				</div>
			</div>
		);
	}

	renderMenu(){
		return(
			<div className="ui one column page centered padded grid">
				<div className="row">
					<div className="ten wide column">
						<div className="ui fluid three item secondary menu">
							<a className="item" id={config.coldOfflineMenuItems.IMPORT}
								onClick={(e)=>{this.handleMenuItemClick(e)}}>
								Import
							</a>
							<a className="item" id={config.coldOfflineMenuItems.REGISTER} 
								onClick={(e)=>{this.handleMenuItemClick(e)}}>
								Register
							</a>
							<a className="item" id={config.coldOfflineMenuItems.PAPERWALLET}
								onClick={(e)=>{this.handleMenuItemClick(e)}}>
								Paper Wallet
							</a>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="twelve wide center aligned column">
						<div className="ui m-auto people shape pink" id="coldofflinemenushape">
							<div className="centered sides">
								<div className="side active" id="importside">
									{this.renderImportCard()}
								</div>
								<div className="side" id="registerside">
									{this.renderRegisterCard()}
								</div>
								<div className="side" id="paperwalletside">
									{this.renderMainPaperWalletSide()}
								</div>

								<div className="side" id="paperwalletgeneratedside">
									{this.renderGenPaperWalletSide()}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	render(){
		let getDescriptionText = ()=>{
			if (this.props.view == config.views.COLDWALLET){
				return(
					<div className="content text_align_center width_50 mb-4 mx-auto">
						Private key generation is done locally on your machine. No network
						requests can be sent for your wallet protection.
					</div>
				);
			}else{
				return(
					<div className="content text_align_center width_80 mb-4 mx-auto">
						Hot Wallet is connected to the internet and offers more features
						and built-in signing of transactions. It provides convenience and speed
						at the little expense of security.
					</div>
				);
			}
		}


		return(
			<div>
				<div className="draggable blue_gradient_background" id="coldofflinemainview">
					<div className="ui grid">
						{this.renderHeader()}
						{getDescriptionText()}
						<div className="row px-5">
							{this.renderMenu()}
						</div>
					</div>
				</div>
				<RegisterWalletModal {...this.getRegisterModalProps()}/>
				<QRScanModal startCamera={this.state.startCamera} handleQRCallback={this.handleQRCallback}/>
			</div>

				
		);
	
	}
}

ColdOfflineMainView.defaultProps = {
	handleBackButtonClick: (function(){}),
	view: config.views.COLDWALLET,
	handleWalletGatewaySuccess: (function(){})
}
