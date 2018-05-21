import React from "react";
import config from "../config/config.js";
import jetpack from "fs-jetpack";
import ReactCodeInput from "react-code-input";
import QRCode from "qrcode";
import QRScanModal from "./QRScanModal.js";

export default class WatchOnlyMainView extends React.Component {
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
		this.renderRestoreCard = this.renderRestoreCard.bind(this);
		this.getAllAccounts = this.getAllAccounts.bind(this);
		this.onCodeChangeHandler = this.onCodeChangeHandler.bind(this);
		this.getCodeInputConfig = this.getCodeInputConfig.bind(this);
		this.startQRScan = this.startQRScan.bind(this);
		this.accListItemSelect = this.accListItemSelect.bind(this);
		this.handleQRCallback = this.handleQRCallback.bind(this);
		this.handleRestoreBtnClick = this.handleRestoreBtnClick.bind(this);
	}

	componentDidMount(){
		 $("#" + config.watchOnlyMenuItems.RESTORE).addClass("menu_item_active"); 	
	}

	handleBackButtonClick(){
		this.props.handleBackButtonClick();
	}


	handleQRCallback(data){
		setTimeout(()=>{
			$("#qrscan_modal").modal("hide");
		}, 1000);
	}

	handleRestoreBtnClick(){

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


	accListItemSelect(e, pub_address){
		if (this.state.listSelectedItem == pub_address){
			this.setState({listSelectedItem: ""});
		}else{
			this.setState({listSelectedItem: pub_address});
		}
		
	}

	getAllAccounts(){
		let read_data = jetpack.read(config.walletConfigFile, "json");
		if (!read_data || !("accounts" in read_data) || read_data.accounts.length == 0){
			return(
				<div className="item mt-3">
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
								<img className="ui vertical_center image" src="client/images/tronbluefat.png"
									width="80" height="80"/>
							</div>
							<div className="column">
								<div className= "ui label header_label_div">
									<div className="cold_offline_header_title
										watch_only_header_title">WATCH ONLY WALLET</div>
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

	renderRestoreCard(){
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
					<div className="ui middle aligned selection animated list
						cold_offline_import_list width_100">
						{accounts}
					</div>
					
					<div className="ui header">Wallet Passcode</div>
					<div className="py-3">
						<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
							onChange={this.onCodeChangeHandler}/>
					</div>
				</div>
				<div className="ui bottom attached button cold_offline_import_btn"
					onClick={this.handleRestoreBtnClick}>
			    	RESTORE
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
							<a className="item" id={config.watchOnlyMenuItems.RESTORE}>
								Restore Wallet
							</a>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="twelve wide center aligned column">
						<div className="ui m-auto people shape pink">
							<div className="centered sides">
								<div className="side active">
									{this.renderRestoreCard()}
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
				<div className="draggable blue_gradient_background" id="watchonlymainview">
					<div className="ui grid">
						{this.renderHeader()}
						<div className="row px-5">
							{this.renderMenu()}
						</div>
					</div>
					<div className="content text_align_center width_80 mt-5 mx-auto color_white
						p-4">
						Use Watch Only wallet with your cold offline wallet to broadcast/view
						transactions, balances, etc. Watch Only wallet is connected to the 
						internet but doesn't have access to your private key, making it 
						securer than a hot wallet.
					</div>
				</div>
				<QRScanModal startCamera={this.state.startCamera} handleQRCallback={this.handleQRCallback}/>
			</div>
				
		);
	
	}
}

WatchOnlyMainView.defaultProps = {
	handleBackButtonClick: (function(){})
}
