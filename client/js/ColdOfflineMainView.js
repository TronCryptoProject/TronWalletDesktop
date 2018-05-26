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
import ConfModal from "./ConfModal.js";

export default class ColdOfflineMainView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			startCamera: false,
			listSelectedItem: "",
			regInputText: "",
			importInputText: "",
			errorMessage: "",
			importMainData: {}
		};
		this.last_menu_click = config.coldOfflineMenuItems.IMPORT;

		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.renderHeader = this.renderHeader.bind(this);
		this.renderMenu = this.renderMenu.bind(this);
		this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
		this.onRegCodeChangeHandler = this.onRegCodeChangeHandler.bind(this);
		this.onImportCodeChangeHandler = this.onImportCodeChangeHandler.bind(this);
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
		this.handlePasscodeConfModal = this.handlePasscodeConfModal.bind(this);
		
		this.walletlock = false;
		this.passcode_modal_lock = false;

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

	handlePasscodeConfModal(e){
		e.persist();
		let button_id = "#wallet_passcode_modal_accept";

		let showError = (message)=>{
			if (message == undefined || message == null || message == ""){
				message = "Validation Failed!";
			}
			$(button_id).addClass("red deny bg_red");
			$(button_id).removeClass("loading right labeled green positive");
			$(button_id).text(message);
			$(button_id).transition("shake");
			setTimeout(()=>{
				$(button_id).removeClass("red deny bg_red");
				$(button_id).addClass("right labeled green positive");
				$(button_id).text("Validate Passcode");
				$(button_id).prepend("<i class='checkmark icon'/>");
				this.passcode_modal_lock = false;
			},2000);
		}

		let showSuccess = ()=>{
			$(button_id).addClass("green positive bg_green");
			$(button_id).removeClass("loading right labeled red deny");
			$(button_id).text("Passcode Validated!");
			$(button_id).transition("pulse");
			setTimeout(()=>{
				$(button_id).removeClass("bg_green");
				$(button_id).addClass("right labeled");
				$(button_id).text("Validate Passcode!");
				$(button_id).prepend("<i class='checkmark icon'/>");
				
				this.passcode_modal_lock = false;
				$("#wallet_passcode_modal").modal("hide");
				this.props.handleWalletGatewaySuccess(this.props.view,this.state.importMainData);
			},1000);
		}

		

		if (!this.passcode_modal_lock){
			this.passcode_modal_lock = true;
			$(button_id).addClass("loading");

			if (this.state.importInputText != ""){
				let url = BlowfishSingleton.createPostURL(this.props.view, "POST","validatePass",{
					password: this.state.importInputText,
					store: "true"
				});

				axios.post(url)
				.then((res)=>{
					let data = res.data;
					data = BlowfishSingleton.decryptToJSON(data);

					if (data.result == config.constants.SUCCESS){
						showSuccess();
					}else{
						if ("reason" in data){
							showError(data.reason);
						}else{
							showError();
						}
					}
				})
				.catch((error)=>{
					showError("Request failed :(");
				});
			}else{
				showError("Input is empty!");
			}
		}
	}

	handleImportBtnClick(e){
		e.persist();
		let target_id = "#import_error_div";

		if (!this.walletlock){
			this.handleProcessState(e,true);

			let pkey = $("#privkey_input").val().trim();

			if (pkey != ""){
				//encrypt all data
				console.log("privkey: " + pkey);
				let url = BlowfishSingleton.createPostURL(this.props.view, "POST","importWallet",{
					password: "******",
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
						this.closeErrorMessage(target_id);

						let prop_data = {
							accountName: data.accountName,
							pubAddress: data.pubAddress,
							pdirty: ("pdirty" in data && data.pdirty)
						};
						this.setState({importMainData: prop_data});

						if ("pdirty" in data && data.pdirty){
							$("#wallet_passcode_modal")
							.modal({
								closable: false,
								blurring: true,
								centered: true,
								transition: "scale",
								allowMultiple: true,
								onApprove:()=>{
									return false;
								}
							})
							.modal("show");
						}else{
							this.props.handleWalletGatewaySuccess(this.props.view,prop_data);
						}
						

					}else{
						if ("reason" in data){
							this.showErrorMessage(target_id, data.reason);
						}else{
							this.showErrorMessage(target_id, "Failed to fetch account details");
						}
					}
					
					this.handleProcessState(e,false);
				})
				.catch((error)=>{
					this.handleProcessState(e,false);
					this.showErrorMessage(target_id, "Request failed :(");
				});
			}else{
				this.handleProcessState(e,false);
				this.showErrorMessage(target_id, "Input field is empty");
			}
		}


	}

	handleRegisterBtnClick(e){
		e.persist();
		let target_id = "#reg_error_div";

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
						this.closeErrorMessage(target_id);

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
						if ("reason" in data){
							this.showErrorMessage(target_id, data.reason);
						}else{
							this.showErrorMessage(target_id, "Failed to register!");
						}
					}
					
					this.handleProcessState(e,false);
				})
				.catch((error)=>{
					this.handleProcessState(e,false);
					this.showErrorMessage(target_id, "Request failed :(");
				});
			}else{
				this.handleProcessState(e,false);
				this.showErrorMessage(target_id, "Input field is empty");
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
		let target_id = "#paper_error_div";

		if (!this.walletlock){
			this.handleProcessState(e,true);

			//encrypt all data
			let url = BlowfishSingleton.createPostURL(this.props.view, "POST","createPaperWallet",{});

			axios.post(url)
			.then((res)=>{
				let data = res.data;
				data = BlowfishSingleton.decryptToJSON(data);
				if (data.result == config.constants.SUCCESS){
					this.closeErrorMessage(target_id);
					this.renderPaperWalletCard(data.pubAddress,data.privAddress,
						data.passcode);
					$("#coldofflinemenushape")
						.shape("set next side", $("#paperwalletgeneratedside"))
						.shape("flip up");
				}else{
					if ("reason" in data){
						this.showErrorMessage(target_id, data.reason);
					}else{
						this.showErrorMessage(target_id, "Failed to generate address");
					}
				}
				
				this.handleProcessState(e,false);
			})
			.catch((error)=>{
				this.handleProcessState(e,false);
				this.showErrorMessage(target_id, "Request Failed");
			});
		}

	}

	getRegisterModalProps(){
		return{
			pubAddress: this.state.pubAddress,
			privAddress: this.state.privAddress,
			passcode: this.state.passcode
		};
	}

	closeErrorMessage(id){
		if ($(id).hasClass("visible")){
			$(id).transition("slide left");
			$(id).addClass("hidden");
			$(id).removeClass("visible");
			this.setState({errorMessage: ""});
		}
	}

	showErrorMessage(id, message, error_state){
		if ($(id).hasClass("hidden")){
			$(id).transition("slide right");
			$(id).addClass("visible");
			$(id).removeClass("hidden");
			if (error_state && error_state == "info"){
				$(id).removeClass("error");
				$(id).addClass("info");
			}else{
				$(id).removeClass("info");
				$(id).addClass("error");
			}
			this.setState({errorMessage: message},()=>{
				setTimeout(()=>{
					this.closeErrorMessage(id);
				},2500);
			});
		}
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
						
				<div className="ui hidden error message width_100 naked_div" id="import_error_div">
			    	<i className="close icon" onClick={(e)=>{this.closeErrorMessage("#import_error_div")}}></i>
			      	<div className="header">Error</div>
			      	<p>{this.state.errorMessage}</p>
			    </div>

				<div className="center aligned content border-top-0">
					
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
					<div className="content py-3">
						<div className="meta">
							To validate your identity, you may be asked to provide your 
							wallet passcode along with your private key. 
						</div>
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
				<div className="ui hidden error naked_div message width_100" id="reg_error_div">
			    	<i className="close icon" onClick={(e)=>{this.closeErrorMessage("#reg_error_div")}}></i>
			      	<div className="header">Error</div>
			      	<p>{this.state.errorMessage}</p>
			    </div>

				<div className="center aligned content border-top-0">
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
					<div className="py-3 meta">
						Your passcode is used to secure access to your backup keys. You will need
						it next time you import your wallet, so don't lose it.
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
		canvas.height = 1200;
		canvas.style.width = "350px";
		canvas.style.height = "600px";

		let ctx = canvas.getContext("2d");
		ctx.scale(2,2);
		

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
				}
			})
			.catch(err =>{
				let image = new Image;
				image.src = "client/images/blankqrcode.png";
				image.onload = function(){
					createRect(image, canvas, y + margin, this.width, this.height, 20);
				}
			});
    	}


    	
		QRCode.toDataURL(pub_address)
		.then(url =>{
			let image = new Image();
			image.src = url;
			image.onload = function(){
				createRect(image, canvas, margin * 4, this.width, this.height, 20);
				createPrivImage(this.height + (margin * 8));
			}
		})
		.catch(err =>{
			let image = new Image();
			image.src = "client/images/blankqrcode.png";
			image.onload = function(){
				createRect(image, canvas, margin * 4, this.width, this.height, 20);
				createPrivImage(this.height + (margin * 8));
			}
		});
		
	}

	renderMainPaperWalletSide(){
		return(
			<div className="ui raised card cold_offline_import_card">
				<div className="ui hidden error message naked_div width_100" id="paper_error_div">
			    	<i className="close icon" onClick={(e)=>{this.closeErrorMessage("#paper_error_div")}}></i>
			      	<div className="header">Error</div>
			      	<p>{this.state.errorMessage}</p>
			    </div>

				<div className="center aligned content border-top-0">
					<div className="ui header">Tron Paper Wallet</div>
					<div className="py-3">
						Create paper wallet completely off the grid. You will need to import your
						private key if you decide to make any transactions later.
					</div>
					<div className="py-3">
						<img src="client/images/sampleqrimage.png" width="200" height="200"/>
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
						requests can be sent for your wallet protection and all data is 
						128 bit encrypted.
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
				<ConfModal headerText="Please Enter Wallet Passcode"
					actions={["deny", "accept"]}
					actionsText={["Cancel", "Validate Passcode"]} id={"wallet_passcode_modal"}
					handleAcceptConfModal={this.handlePasscodeConfModal}>
					<div className="content">
						<div className="center_button my-4">
							<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
								onChange={this.onImportCodeChangeHandler}/>
						</div>
					</div>
				</ConfModal>
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
