import React from "react";
import config from "../config/config.js";
import jetpack from "fs-jetpack";
import ReactCodeInput from "react-code-input";
import domtoimage from 'dom-to-image';
import FileSaver from "file-saver";
import RegisterWalletModal from "./RegisterWalletModal.js";
import QRCode from "qrcode";
import QRScanModal from "./QRScanModal.js";

export default class ColdOfflineMainView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			startCamera: false,
			listSelectedItem: ""
		};
		this.last_menu_click = config.coldOfflineMenuItems.IMPORT;

		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.renderHeader = this.renderHeader.bind(this);
		this.renderMenu = this.renderMenu.bind(this);
		this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
		this.getAllAccounts = this.getAllAccounts.bind(this);
		this.onCodeChangeHandler = this.onCodeChangeHandler.bind(this);
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
		this.accListItemSelect = this.accListItemSelect.bind(this);
		this.handleQRCallback = this.handleQRCallback.bind(this);
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

	handleImportBtnClick(){

	}

	handleRegisterBtnClick(){
		$("#registerwalletmodal").modal({
			blurring: true,
			centered: false,
			transition: "scale",
			closable: false,
			onVisible: () =>{
				
			},
			onHidden: ()=>{
				
			},
			onDeny: () => {},
			onApprove:()=>{
				
			}
		})
		.modal("show");
	}


	handleQRCallback(data){
		setTimeout(()=>{
			$("#qrscan_modal").modal("hide");
		}, 1000);
		
	}

	onCodeChangeHandler(){

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

	generatePaperWallet(){
		this.renderPaperWalletCard();
		$("#coldofflinemenushape")
			.shape("set next side", $("#paperwalletgeneratedside"))
			.shape("flip up");
	}

	accListItemSelect(e, pub_address){
		if (this.state.listSelectedItem == pub_address){
			//toggle
			this.setState({listSelectedItem: ""});
		}else{
			this.setState({listSelectedItem: pub_address});
		}
		
	}

	getAllAccounts(){
		let read_data = jetpack.read(config.walletConfigFile, "json");
		if (!read_data || !("accounts" in read_data) || read_data.accounts.length == 0){
			return(
				<div className="item">
					<div className="content">
						<div className="header">
							No Accounts Found
						</div>
					</div>
				</div>
			);
		}else{
			let res_list = [];
			let color_ptr = "";

			for(let acc_dict of read_data.accounts){
				let acc_name = acc_dict.accName;
				let pub_address = acc_dict.accPubAddress;
				
				let getAccountInit = (name)=>{
					if (name == ""){
						return "NA"
					}else{
						return name[0].toUpperCase();
					}
				};

				let getAccountLabelColor = ()=>{
					let colors = ["violet_label", "light_blue_label", "gray_purple_label", "magenta_label"];
					let color_picked = colors[Math.floor(Math.random() * colors.length)];
					while (color_picked == color_ptr){
						color_picked = colors[Math.floor(Math.random() * colors.length)];
					}
					color_ptr = color_picked;
					return color_picked;
				}

				let getAccIcon = ()=>{
					if (pub_address != this.state.listSelectedItem){
						let classname = "ui circular large label " + getAccountLabelColor();
						return (<i className={classname}>{getAccountInit(acc_name)}</i>);
					}else{
						return(<i className="ui circular green check icon"/>)
					}
				}
				

				res_list.push(
					<div className="item" key={pub_address} onClick={(e)=>{this.accListItemSelect(e,pub_address)}}>
						<div className="ui one column grid">
						
							<div className="row">
								<div className="column two wide">
									{getAccIcon()}
								</div>

								<div className="left aligned column fourteen wide">
									<div className="header">
										{acc_name == "" ? "no name found" : acc_name}
									</div>
									<div className="meta">
										{pub_address}
									</div>
								</div>
							</div>
						</div>
						
						
					</div>
				);

			}
			return res_list;
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
								<img className="uivertical_center image" src="client/images/tronbluefat.png"
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
		let accounts = this.getAllAccounts();
		let getDescription = ()=>{
			if (accounts && accounts.length > 0){
				let description = `Please select one (${accounts.length} found)`;
				return <div className="description">{description}</div>;
			}
		}
		
		return(
			<div className="ui raised card height_fit_content
											cold_offline_import_card" id="importcard">
						
				<div className="center aligned content">
					<div className="ui header vertical_center mt-3 mb-1">Accounts</div>
					
					<div className="circular ui icon animated compact right floated button qrcode_scan_btn"
						onClick={this.startQRScan}>
						<div className="center aligned hidden content">Scan</div>
					  	<div className="visible content m-auto pl-2">
					    	<i className="qrcode large icon m-auto"></i>
					  	</div>
					</div>
						
					
					{getDescription()}
					<div className="ui middle aligned selection animated list cold_offline_import_list">
						{accounts}
					</div>
					
					<div className="ui header">Wallet Passcode</div>
					<div className="py-3">
						<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
							onChange={this.onCodeChangeHandler}/>
					</div>
				</div>
				<div className="ui bottom attached button cold_offline_import_btn"
					onClick={this.handleImportBtnClick}>
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
						<input type="text" className="account_name_input" placeholder="JakeWallet"/>
					</div>

					<div className="ui header">Wallet Passcode</div>
					<div className="py-3">
						<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
							onChange={this.onCodeChangeHandler}/>
					</div>
				</div>
				<div className="ui bottom attached button cold_offline_import_btn"
					onClick={this.handleRegisterBtnClick}>
			    	REGISTER
			    </div>
			</div>
		);
	}

	renderPaperWalletCard(){

		let margin = 20;
		let qrimagewh = 50;
		let c_width = 350;
		let c_height = 750;
		let pub_address = "27TkooQ63LTnLjprMAv1MHYxySRNNDjdyqH";
		let priv_address = "5a4b5a92dd18e42a0ee0214c53ac1bb69a15628a53e2074a7c982ab6117c1a51";
		let passcode = "123456";

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

		ctx.font = "bolder 16px Avenir";
		ctx.textAlign = "center";
		ctx.fillText("PUBLIC ADDRESS", c_width/2, margin * 2);

		ctx.font = "15px Avenir";
		ctx.textAlign = "center";
		ctx.fillText(pub_address, c_width/2, margin * 3);

		let getRoundedImage = (x,y,width,height,radius) =>{
			//thanks to markE -- stackoverflow
		    ctx.beginPath();
		    ctx.moveTo(x + radius, y);
		    ctx.lineTo(x + width - radius, y);
		    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		    ctx.lineTo(x + width, y + height - radius);
		    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		    ctx.lineTo(x + radius, y + height);
		    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		    ctx.lineTo(x, y + radius);
		    ctx.quadraticCurveTo(x, y, x + radius, y);
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
				image.src = "../images/blankqrcode.png";
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
				image.src = "../images/blankqrcode.png";
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
			image.src = "../images/blankqrcode.png";
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
							onChange={this.onCodeChangeHandler}/>
					</div>
				</div>
				<div className="ui bottom attached button cold_offline_import_btn"
					onClick={this.generatePaperWallet}>
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
		return(
			<div>
				<div className="draggable blue_gradient_background" id="coldofflinemainview">
					<div className="ui grid">
						{this.renderHeader()}
						<div className="row px-5">
							{this.renderMenu()}
						</div>
					</div>
				</div>
				<RegisterWalletModal/>
				<QRScanModal startCamera={this.state.startCamera} handleQRCallback={this.handleQRCallback}/>
			</div>

				
		);
	
	}
}

ColdOfflineMainView.defaultProps = {
	handleBackButtonClick: (function(){})
}
