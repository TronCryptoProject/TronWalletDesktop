import React from "react";
import config from "../config/config.js";
import Equal from "deep-equal";
import QRScanModal from "./QRScanModal.js";
import jetpack from "fs-jetpack";
import BackupKeys from "./BackupKeys.js";
import SendCard from "./SendCard.js";
import ReceiveCard from "./ReceiveCard.js";
import TransactionsCard from "./TransactionsCard.js";
import SignCard from "./SignCard.js";
import TransactionViewerModal from "./TransactionViewerModal.js";
import DockMenu from "./DockMenu.js";
import axios from "axios";
import {BlowfishSingleton} from "Utils.js";

export default class ColdOfflineDashboard extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			startCamera: false,
			isLoggedIn: props.isLoggedIn,
			contacts: [],

			accInfo:{
				accountName : props.accInfo.accountName,
				pubAddress: props.accInfo.pubAddress
			},
			currTxData: {},
			txToken: "",
			toUpdateTxs: false
		};

		//utitlity functions
		this.addContact = this.addContact.bind(this);
		this.loadContacts = this.loadContacts.bind(this);
		this.handleQRCallback = this.handleQRCallback.bind(this);
		this.handleQRScanClick = this.handleQRScanClick.bind(this);
		this.handleLogOut = this.handleLogOut.bind(this);
		this.initAllModals = this.initAllModals.bind(this);
		this.sendMenuItemClick = this.sendMenuItemClick.bind(this);
		this.receiveMenuItemClick = this.receiveMenuItemClick.bind(this);
		this.signMenuItemClick = this.signMenuItemClick.bind(this);
		this.handleSendClick = this.handleSendClick.bind(this);
		this.handlePrepareClick = this.handlePrepareClick.bind(this);
		this.handleDockClick = this.handleDockClick.bind(this);
		this.getTxData = this.getTxData.bind(this);
		this.handleUpdateTxs = this.handleUpdateTxs.bind(this);

		//rendering functions
		this.renderHeader = this.renderHeader.bind(this);
		this.renderSubHeader = this.renderSubHeader.bind(this);
		this.renderSendReceiveCard = this.renderSendReceiveCard.bind(this);
		
		//props functions
		this.getTxCardProps = this.getTxCardProps.bind(this);
		this.getSendCardProps = this.getSendCardProps.bind(this);
		this.getReceiveCardProps = this.getReceiveCardProps.bind(this);
		this.getSignCardProps = this.getSignCardProps.bind(this);
	}

	componentDidMount(){
		//necessary
		$(".tabular.menu .item").tab();
		this.loadContacts();
		this.props.showStatusBar(config.views.COLDWALLET);

		$("#coldwallet_qrscan_btn").popup({
			delay: {
				show: 500,
				hide: 0
			}
		});

		$("#acc_balances_card").transition("hide");
		$("#send_receive_card").transition("hide");
		setTimeout(()=>{
			$("#acc_balances_card").transition({
				animation: "scale in",
			 	duration  : 1000
			});
			$("#send_receive_card").transition({
				animation: "scale in",
			 	duration  : 1000
			});
		},200);
		

		this.initAllModals();
	}

	componentWillUnmount(){
		this.props.showStatusBar("");
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (!Equal(nextProps.accInfo, this.props.accInfo)){
			tmp_dict.accInfo = nextProps.accInfo;
		}
		if (!Equal(nextProps.isLoggedIn, this.state.isLoggedIn)){
			tmp_dict.isLoggedIn = nextProps.isLoggedIn;
		}

		tmp_dict = Object.assign(this.state, tmp_dict);
		this.setState(tmp_dict, ()=>{
			if(!this.state.isLoggedIn){
				this.handleLogOut();
			}
		});
	}


	initAllModals(){
		let ids = ["#backup_modal"];
		for(let id of ids){
			$(ids).modal({
				blurring: true,
				centered: false,
				transition: "slide up",
				closable: false,
				duration: 100,
				onShow: () =>{
					$(id).parent().addClass("fullscreen_modal_background");
					$(id).parent().addClass("overflow_hidden");
				}
			});
		}
	}

	handleDockClick(toOpen, modal_id){
		if(toOpen){
			this.setState({dockModalOpened: true},()=>{
				$(modal_id).modal("show");
			});
		}else{
			this.setState({dockModalOpened: false},()=>{
				$(modal_id).modal("hide");
			})
		}
	}

	loadContacts(callback){
		let contacts = [];
		if (jetpack.exists(config.walletConfigFile) == "file"){
			let read_data = jetpack.read(config.walletConfigFile, "json");
			if ("contacts" in read_data){
				for (let c in read_data.contacts){
					let name = read_data.contacts[c];
					contacts.push({
						title: c
					});
				}
			}	
		}
		this.setState({contacts: contacts},()=>{
			if (callback){
				callback(contacts);
			}
		});
	}

	addContact(address, name, callback){
		if (address != ""){
			if (jetpack.exists(config.walletConfigFile) == "file"){
				let read_data = jetpack.read(config.walletConfigFile, "json");

				if ("contacts" in read_data){
					if (!(address in read_data.contacts)){
						//no accname yet
						read_data.contacts[address] = "";
					}
				}else{
					read_data["contacts"] = {[address]: ""};
				}
				jetpack.write(config.walletConfigFile, read_data, { atomic: true });
			}else{
				let data = {
					contacts: {[address]: ""}
				};
				jetpack.write(config.walletConfigFile, data, { atomic: true });
			}
			this.loadContacts(callback);
		}
		
	}
	

	handleQRCallback(data){
		setTimeout(()=>{
			$("#qrscan_modal").modal("hide");
		}, 1000);
		

		if ($("#coldwallet_send_menu").hasClass("active")){
			try{
				let jsonobj = JSON.parse(data);
				$("#send_address_input").val(jsonobj.address);
				$("#hotwallet_send_amout").val(jsonobj.amount);
			}catch(e){
				$("#send_address_input").val(data);
			}
			
		}else if ($("#coldwallet_sign_menu").hasClass("active")){
			$("#raw_tx_input").val(data);
		}
		
	}

	handleQRScanClick(toStartCamera, callback){
		this.setState({startCamera: toStartCamera},()=>{
			if (callback){
				callback();
			}
		})
	}

	handleUpdateTxs(){
		this.setState({toUpdateTxs: true},()=>{
			this.setState({toUpdateTxs: false});
		})
	}

	//after prepare transaction
	handlePrepareClick(qrcode_data){
		$("#raw_tx_input").val(qrcode_data);
		$(".ui.tabular.three.item.menu .item.active").removeClass("active");
		$("#coldwallet_sign_menu").addClass("active");
		$("#send_receive_card .content .send_receive_card_segment.active").removeClass("active");
		$("#cold_wallet_sign_segment").addClass("active");
		this.signMenuItemClick();
	}

	handleSendClick(address, amount, callback){
		this.addContact(address, "", (contacts)=>{
			$("#send_search_div").search({
				source: contacts
			});
		});

		let url = BlowfishSingleton.createPostURL(config.views.COLDWALLET, "POST","prepareTx",{
			toAddress: address,
			amount: amount
		});

		axios.post(url)
		.then((res)=>{
			let data = res.data;
			data = BlowfishSingleton.decryptToJSON(data);

			if (data.result == config.constants.SUCCESS){
				if (callback){
					callback(data.data);
				}
			}else{
				//TODO error handling
				if (callback){
					callback("");
				}
			}
		})
		.catch((error)=>{
			console.log(error);
			if (callback){
				callback("");
			}
		});
		
	}

	getTxData(hex_str, token, callback){
		let url = BlowfishSingleton.createPostURL(config.views.COLDWALLET, "GET","signTxInfo",{
			hextx: hex_str
		});

		axios.get(url)
		.then((res)=>{
			let data = res.data;
			data = BlowfishSingleton.decryptToJSON(data);

			if (data.result == config.constants.SUCCESS){
				this.setState({currTxData: data, txToken: token},()=>{
					if (callback){
						callback();
					}
				});

			}else{
				this.setState({currTxData: {}, txToken: token},()=>{
					//TODO error handling
				});
			}
		})
		.catch((error)=>{
			console.log(error);
			this.setState({currTxData: {}, txToken: token},()=>{
				//TODO error handling
			});
		});
		
	}

	getSignCardProps(){
		return{
			handleQRScanClick: this.handleQRScanClick,
			getTxData: this.getTxData,
			mobileAuthCode: this.props.mobileAuthCode
		};
	}

	getSendCardProps(){
		return {
			handleQRScanClick: this.handleQRScanClick,
			handleSendClick: this.handleSendClick,
			handlePrepareClick: this.handlePrepareClick,
			id: config.views.COLDWALLET
		};
	}

	getReceiveCardProps(){
		return{
			accInfo: this.state.accInfo
		};
	}

	getTxCardProps(){
		return{
			accInfo: this.state.accInfo,
			view: config.views.COLDWALLET,
			toUpdate: this.state.toUpdateTxs
		};
	}

	handleLogOut(){
		let url = BlowfishSingleton.createPostURL(config.views.COLDWALLET, "POST","logout",{});

		axios.post(url)
		.then((res)=>{
			let data = res.data;
			data = BlowfishSingleton.decryptToJSON(data);

			if (data.result == config.constants.SUCCESS){
				this.props.permissionLogOut();
			}
		})
		.catch((error)=>{
			console.log(error);
		});
		
	}

	sendMenuItemClick(){
		$("#hot_wallet_receive_segment").transition("scale out");
		$("#hot_wallet_sign_segment").transition("scale out");
		$("#hot_wallet_send_segment").transition("scale in");
	}
	receiveMenuItemClick(){
		$("#hot_wallet_send_segment").transition("scale out");
		$("#hot_wallet_sign_segment").transition("scale out");
		$("#hot_wallet_receive_segment").transition("scale in");
	}

	signMenuItemClick(){
		$("#hot_wallet_send_segment").transition("scale out");
		$("#hot_wallet_receive_segment").transition("scale out");
		$("#hot_wallet_sign_segment").transition("scale in");
	}

	renderHeader(){
		return(
			<div className="sixteen wide column">
				<div className="ui one column page centered padded grid px-0">
					<div className="two column title_column p-0">
						<div>
							<img className="ui vertical_center image" src="client/images/tronbluefat.png"
								width="60" height="60"/>
						</div>
						<div className="column">
							<div className= "ui label header_label_div">
								<div className="hot_wallet_header_title">COLD OFFLINE WALLET</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderSubHeader(){
		return(
			<div className="three column row pt-0">
				<div className="four wide column center aligned hot_sub_header_column pr-0">
				</div>

				<div className="eight wide center aligned column">
					<div className="ui sub header">
						Welcome {this.state.accInfo.accountName}
					</div>
				</div>
				<div className="four wide column center aligned">
				</div>
			</div>
		);
	}


	renderSendReceiveCard(){
		return(
			<div className="ui card m-auto send_receive_card" id="send_receive_card">
				<div className="content">
					<div className="ui top attached tabular three item menu">
						<div className="item send_receive_card_item active" data-tab="send"
							onClick={this.sendMenuItemClick} id="coldwallet_send_menu">
	    					SEND
	  					</div>
	  					<div className="item send_receive_card_item" data-tab="sign"
	  						onClick={this.signMenuItemClick} id="coldwallet_sign_menu">
	    					SIGN
	  					</div>
	  					<div className="item send_receive_card_item" data-tab="receive"
	  						onClick={this.receiveMenuItemClick} id="coldwallet_receive_menu">
	    					RECEIVE
	  					</div>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment active m-0"
						data-tab="send" id="cold_wallet_send_segment">
						<SendCard {...this.getSendCardProps()}/>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment m-0"
						data-tab="sign" id="cold_wallet_sign_segment">
						<SignCard {...this.getSignCardProps()}/>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment"
						data-tab="receive" id="cold_wallet_receive_segment">
						<ReceiveCard {...this.getReceiveCardProps()}/>
					</div>
				</div>
			</div>
		);
	}


	render(){
		return(
			<div>
				<div className="draggable hot_wallet_main_background" id="hot_wallet_main">
					<div className="ui grid px-4">
						{this.renderHeader()}
						{this.renderSubHeader()}
					</div>
					<div className="ui one column centered padded grid py-4 hot_wallet_main_content">
						<div className="two column row height_fit_content pt-0 my-auto">
							<div className="middle aligned column">
								<TransactionsCard {...this.getTxCardProps()}/>
							</div>
							<div className="middle aligned column">
								{this.renderSendReceiveCard()}
							</div>
						</div>
					</div>
					<DockMenu handleDockClick={this.handleDockClick} view={config.views.COLDWALLET}/>
					<BackupKeys handleDockClick={this.handleDockClick} modalOpened={this.state.dockModalOpened}
						mobileAuthCode={this.props.mobileAuthCode}/>
				</div>
				<TransactionViewerModal txData={this.state.currTxData} txToken={this.state.txToken}
					mobileAuthCode={this.props.mobileAuthCode}
					handleUpdateTxs={this.handleUpdateTxs} view={config.views.COLDWALLET}/>
				<QRScanModal startCamera={this.state.startCamera} handleQRCallback={this.handleQRCallback}/>
			</div>
		);
	}
}

ColdOfflineDashboard.defaultProps={
	showStatusBar: (function(){}),
	accInfo: {
		pubAddress: "",
		accountName: ""
	},
	permissionLogOut: (function(){}),
	mobileAuthCode: ""
}