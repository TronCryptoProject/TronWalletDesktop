import React from "react";
import config from "../config/config.js";
import Equal from "deep-equal";
import QRScanModal from "./QRScanModal.js";
import jetpack from "fs-jetpack";
import DockMenu from "./DockMenu.js";
import Nodes from "./Nodes.js";
import Stomp from "stompjs";
import BackupKeys from "./BackupKeys.js";
import Witnesses from "./Witnesses.js";
import SendCard from "./SendCard.js";
import ReceiveCard from "./ReceiveCard.js";
import BroadcastCard from "./BroadcastCard.js";
import TransactionsCard from "./TransactionsCard.js";
import BlockOdometer from "./BlockOdometer.js";
import TrxPriceOdometer from "./TrxPriceOdometer.js";
import NodeOdometer from "./NodeOdometer.js";
import RegAccBalanceOdometer from "./RegAccBalanceOdometer.js";
import USDBalanceOdometer from "./USDBalanceOdometer.js";
import FrozenBalanceOdometer from "./FrozenBalanceOdometer.js";
import BandwidthOdometer from "./BandwidthOdometer.js";
import SharesOdometer from "./SharesOdometer.js";
import ExpireOdometer from "./ExpireOdometer.js";
import Freeze from "./Freeze.js";
import MobileAuthModal from "./MobileAuthModal.js";
import {BlowfishSingleton} from "Utils.js";
import axios from "axios";
import TransactionViewerModal from "./TransactionViewerModal.js";

export default class HotWalletDashboard extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			startCamera: false,
			contacts: [],
			nodesModalOpened: false,
			witnessesModalOpened: false,
			freezeModalOpened: false,
			backupModalOpened: false,
			isLoggedIn: props.isLoggedIn,
			nodeData: [],
			mobileAuthValid: false,
			txsList: [],

			accInfo:{
				accountName : props.accInfo.accountName,
				pubAddress: props.accInfo.pubAddress,
				pdirty: props.accInfo.pdirty
			},
			voteHistory: [],

			blockNum: 0,
			trxPrice: 0,
			dataNodeFirstHalf: 0.0,
			dataNodeSecHalf: 0.0,
			trxBalance: 0,
			usdBalance: 0,
			frozenBalance: 0,
			bandwidth: 0,
			shares: 0,
			expirationTime: ""
		};

		//utitlity functions
		this.parseDataNode = this.parseDataNode.bind(this);
		this.fetchData = this.fetchData.bind(this);
		this.addContact = this.addContact.bind(this);
		this.loadContacts = this.loadContacts.bind(this);
		this.handleDockClick = this.handleDockClick.bind(this);
		this.handleQRCallback = this.handleQRCallback.bind(this);
		this.handleQRScanClick = this.handleQRScanClick.bind(this);
		this.handleLogOut = this.handleLogOut.bind(this);
		this.getNodeData = this.getNodeData.bind(this);
		this.subscribeNodeData = this.subscribeNodeData.bind(this);
		this.unsubscribeNodeData = this.unsubscribeNodeData.bind(this);
		this.initAllModals = this.initAllModals.bind(this);
		this.sendMenuItemClick = this.sendMenuItemClick.bind(this);
		this.receiveMenuItemClick = this.receiveMenuItemClick.bind(this);
		this.handleMobileAuthSuccess = this.handleMobileAuthSuccess.bind(this);
		this.sendTrxTransaction = this.sendTrxTransaction.bind(this);
		this.getTxData = this.getTxData.bind(this);
		this.handleTxDataLock = this.handleTxDataLock.bind(this);

		//rendering functions
		this.renderHeader = this.renderHeader.bind(this);
		this.renderSubHeader = this.renderSubHeader.bind(this);
		this.renderAccountBalances = this.renderAccountBalances.bind(this);
		this.renderSendReceiveCard = this.renderSendReceiveCard.bind(this);
		
		//props functions
		this.getTxCardProps = this.getTxCardProps.bind(this);
		this.getSendCardProps = this.getSendCardProps.bind(this);
		this.getReceiveCardProps = this.getReceiveCardProps.bind(this);
		this.getBroadcastCardProps = this.getBroadcastCardProps.bind(this);

		this.trxPriceSubscriber = null;
		this.blockNumSubscriber = null;
		this.nodeSubscriber = null;
		this.accountInfoSubscriber = null;
		this.txsSubscriber = null;
		this.accountInfoInterval = null;
		this.txsInterval = null;

		this.logoutcalled = false;
	}

	componentDidMount(){
		//necessary
		$(".tabular.menu .item").tab();
		this.loadContacts();
		this.props.showStatusBar(config.views.HOTWALLET);
		this.fetchData();

		$("#hotwallet_qrscan_btn").popup({
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
		if (!this.logoutcalled){
			this.handleLogOut();
		}
		
		this.stomp = null;
		this.setState({stomp: null});
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
		let ids = ["#nodes_modal","#witnesses_modal","#freeze_modal","#backup_modal"];
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
		let getStateKey = ()=>{
			let key = "";
			if (modal_id == "#nodes_modal"){
				key = "nodesModalOpened"
			}else if(modal_id == "#witnesses_modal"){
				key = "witnessesModalOpened"
			}else if(modal_id == "#freeze_modal"){
				key = "freezeModalOpened"
			}
			else if(modal_id == "#backup_modal"){
				key = "backupModalOpened"
			}
			return key;
		}

		if(toOpen){
			this.setState({[getStateKey()]: true},()=>{
				$(modal_id).modal("show");
			});
		}else{
			this.setState({[getStateKey()]: false},()=>{
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
			$("#send_search_div").search({
				source: contacts
			});
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

		if ($("#hotwallet_send_menu").hasClass("active")){
			try{
				let jsonobj = JSON.parse(data);
				$("#send_address_input").val(jsonobj.address);
				$("#hotwallet_send_amout").val(jsonobj.amount);
			}catch(e){
				$("#send_address_input").val(data);
			}
		}else if ($("#hotwallet_broadcast_menu").hasClass("active")){
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

	handleTxDataLock(data, callback){
		this.setState({currTxData: data}, ()=>{
			if(callback){
				callback();
			}
		});
	}


	handleMobileAuthSuccess(){
		this.setState({mobileAuthValid: true}, ()=>{
			this.setState({mobileAuthValid: false});
		});
	}

	sendTrxTransaction(address, amount, view, callback){
		let endpoint = (view == config.views.HOTWALLET) ? "sendCoin" : "prepareTx";

		let url = BlowfishSingleton.createPostURL(this.props.view, "POST",endpoint,{
			toAddress: address,
			amount: amount,
			pubAddress: this.state.accInfo.pubAddress
		});

		axios.post(url)
		.then((res)=>{
			let data = res.data;
			data = BlowfishSingleton.decryptToJSON(data);

			if ("result" in data){
				if (data.result == config.constants.SUCCESS){
					this.addContact(address, "", (contacts)=>{
						$("#send_search_div").search({
							source: contacts
						});
					});
					if(callback){
						if(view != config.views.HOTWALLET){
							callback(data.data);
						}else{
							callback(data);
						}
					}
				}else{
					if(callback){
						if(view != config.views.HOTWALLET){
							callback("");
						}else{
							callback(data);
						}
					}
				}

			}else{
				if (callback){
					if(view != config.views.HOTWALLET){
						callback("");
					}else{
						callback({});
					}
				}
			}
		})
		.catch((error)=>{
			if (callback){
				if(view != config.views.HOTWALLET){
					callback("");
				}else{
					callback({});
				}
			}
		});
	}

	parseDataNode(node){
		if (node != null && node != undefined && node != ""){
			node = node.split(":")[0]
			let num_list = node.split(".");
			let firsthalf = parseFloat(`${num_list[0]}.${num_list[1]}`);
			let sechalf = parseFloat(`${num_list[2]}.${num_list[3]}`);
			return [firsthalf,sechalf];
		}
		return [0.0,0.0];
	}

	
	getSendCardProps(){
		return {
			handleQRScanClick: this.handleQRScanClick,
			mobileAuthCode: this.props.mobileAuthCode,
			sendTrxTransaction: this.sendTrxTransaction,
			id: this.props.view,
			mobileAuthValid: this.state.mobileAuthValid,
			bandwidth: this.state.bandwidth,
			pubAddress: this.state.accInfo.pubAddress
		};
	}

	getBroadcastCardProps(){
		return{
			handleQRScanClick: this.handleQRScanClick,
			getTxData: this.getTxData,
			mobileAuthCode: this.props.mobileAuthCode
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
			view: this.props.view,
			txsList: this.state.txsList
		};
	}

	fetchData(){
		//send all encrypted data over socket
		let socket = new SockJS(`${config.API_URL}/walletws`);
		this.stomp = Stomp.over(socket);
		this.stomp.debug = null;

		console.log("trying to connect to stomp: " + this.stomp);
		this.stomp.connect({},(frame)=>{
			console.log("connected");

			this.txsSubscriber = this.stomp.subscribe("/persist/txs",(data)=>{
				let body = data.body.trim();
				console.log("TXSBODY: " + body);
				if (body != ""){
					let res_json = BlowfishSingleton.decryptToJSON(body);
					console.log("TXSINFO:" + JSON.stringify(res_json));

					if (res_json.result == config.constants.SUCCESS){
						this.setState({txsList: res_json.txs});
					}
				}
			});

			this.accountInfoSubscriber = this.stomp.subscribe("/persist/accountInfo",(data)=>{
				let body = data.body.trim();
				console.log("ACCBODY: " + body);
				if (body != ""){
					let res_json = BlowfishSingleton.decryptToJSON(body);
					console.log("ACCOUNTINFO:" + JSON.stringify(res_json));

					if (res_json.result == config.constants.SUCCESS){
						let trx_balance = res_json.balance;
						let frozen_balance = 0;
						let expiration_time = "";
						let shares_avail = 0;
						let vote_history = [];
						let bandwidth = 0;

						if (res_json.bandwidth != undefined && res_json.bandwidth != null){
							bandwidth = res_json.bandwidth;
						}

						if (res_json.frozenBalance != undefined && res_json.frozenBalance.length > 0){
							let f_dict = res_json.frozenBalance[0];
							frozen_balance = f_dict.frozenBalance;
							expiration_time = f_dict.expirationTime;
							shares_avail = frozen_balance;
						}

						if (res_json.votes != undefined && res_json.votes.length > 0){
							vote_history = res_json.votes;
						}

						this.setState({
							trxBalance: trx_balance,
							frozenBalance: frozen_balance,
							expirationTime: expiration_time,
							shares: shares_avail,
							voteHistory: vote_history,
							bandwidth: bandwidth
						});
					}
				}
			});

			this.blockNumSubscriber = this.stomp.subscribe("/persist/block",(data)=>{
				let body = data.body.trim();
				if (body != ""){
					let res_json = BlowfishSingleton.decryptToJSON(body);
					if (res_json.result == config.constants.SUCCESS){
						let node_list = this.parseDataNode(res_json.fullnode);
						this.setState({
							blockNum: res_json.blockNum,
							dataNodeFirstHalf: node_list[0],
							dataNodeSecHalf: node_list[1]
						},()=>{
							let data_node_data = {
								dataNodeFirstHalf: this.state.dataNodeFirstHalf,
								dataNodeSecHalf: this.state.dataNodeSecHalf
							}
							this.props.handleDataNode(data_node_data);

							setTimeout(()=>{
								if (this.stomp){
									this.stomp.send("/persist/block");
								}
								
							},2500);
						});
					}
				}
			});

			this.trxPriceSubscriber = this.stomp.subscribe("/persist/trxPrice",(data)=>{
				let body = data.body.trim();
				if (body != ""){
					let res_json = BlowfishSingleton.decryptToJSON(body);

					if (res_json.result == config.constants.SUCCESS){
						this.setState({
							trxPrice: res_json.trxPrice.toFixed(6)
						},()=>{
							setTimeout(()=>{
								if (this.stomp){
									this.stomp.send("/persist/trxPrice");
								}			
							},1500);
						});
					}
				}
			});


			if (this.stomp){
				this.accountInfoInterval = setInterval(()=>{
					let info_dict = {
						pubAddress: this.state.accInfo.pubAddress,
						isWatch: (this.props.view != config.views.HOTWALLET).toString()
					};
					this.stomp.send("/persist/accountInfo",{},
						BlowfishSingleton.encrypt(JSON.stringify(info_dict))
					);
				},1000);

				this.txsInterval = setInterval(()=>{
					this.stomp.send("/persist/txs",{},
						BlowfishSingleton.encrypt(this.state.accInfo.pubAddress)
					);
				},4000);
			}
			
		});

		this.setState({stomp: this.stomp});
	
	}

	handleLogOut(){
		if (this.trxPriceSubscriber){
			this.trxPriceSubscriber.unsubscribe();
		}
		if(this.blockNumSubscriber){
			this.blockNumSubscriber.unsubscribe();
		}
		if(this.nodeSubscriber){
			this.nodeSubscriber.unsubscribe();
		}
		if (this.accountInfoSubscriber){
			this.accountInfoSubscriber.unsubscribe();
		}
		if (this.txsSubscriber){
			this.txsSubscriber.unsubscribe();
		}
		if (this.txsInterval){
			clearInterval(this.txsInterval);
		}
		if(this.accountInfoInterval){
			clearInterval(this.accountInfoInterval);
		}
		
		let url = BlowfishSingleton.createPostURL(config.views.HOTWALLET, "POST","logout",{
			pubAddress: this.state.accInfo.pubAddress,
			isWatch: (this.props.view != config.views.HOTWALLET).toString()
		});

		axios.post(url)
		.then((res)=>{
			let data = res.data;
			data = BlowfishSingleton.decryptToJSON(data);

			//if (data.result == config.constants.SUCCESS){
				if (this.stomp){
					this.stomp.disconnect(()=>{
						this.logoutcalled = true;
						this.props.permissionLogOut();

						console.log("stomp disconnected");
					});
				}else{
					this.props.permissionLogOut();
				}
				
			//}
		})
		.catch((error)=>{
			console.log(error);
		});

	}

	getTxData(hex_str, callback){
		let url = BlowfishSingleton.createPostURL(config.views.HOTWALLET, "GET","signTxInfo",{
			hextx: hex_str
		});

		axios.get(url)
		.then((res)=>{
			let data = res.data;
			data = BlowfishSingleton.decryptToJSON(data);

			if (data.result == config.constants.SUCCESS){
				this.setState({currTxData: data},()=>{
					if (callback){
						callback(data);
					}
				});

			}else{
				this.setState({currTxData: {}},()=>{
					if (callback){
						callback({});
					}
				});
			}
		})
		.catch((error)=>{
			console.log(error);
			this.setState({currTxData: {}},()=>{
				if (callback){
					callback({});
				}
			});
		});
		
	}

	getNodeData(){
		this.stomp.send("/persist/nodes");
	}

	subscribeNodeData(){
		this.nodeSubscriber = this.stomp.subscribe("/persist/nodes",(data)=>{
			let body = data.body.trim();
			if (body != ""){
				let res_json = BlowfishSingleton.decryptToJSON(body);
				if (res_json.result == config.constants.SUCCESS){
					let flattenDict = (tmp_list)=>{
						let res_list = [];
						for (let inner_dict of tmp_list){
							res_list.push(inner_dict.host + ":" + inner_dict.port);
						}
						return res_list;
					}

					this.setState({nodeData:flattenDict(res_json.nodes)});
				}
			}
		});
	}

	unsubscribeNodeData(){
		if(this.nodeSubscriber){
			this.nodeSubscriber.unsubscribe();
		}
	}

	sendMenuItemClick(){
		/*$("#hot_wallet_receive_segment").transition("fade out");
		$("#hot_wallet_send_segment").transition("fade in");*/
	}
	receiveMenuItemClick(){
		/*$("#hot_wallet_send_segment").transition("fade out");
		$("#hot_wallet_receive_segment").transition("fade in");*/
	}

	renderHeader(){
		let getTitle = ()=>{
			if (this.props.view == config.views.HOTWALLET){
				return "HOT WALLET";
			}else{
				return "WATCH ONLY";
			}
		}
		return(
			<div className="three column row pb-0">
				<div className="four wide column pr-0 center aligned hot_top_header">
					<BlockOdometer blockNum={this.state.blockNum}/>
				</div>

				<div className="eight wide column px-0">
					<div className="ui one column page centered padded grid px-0">
						<div className="two column title_column p-0">
							<div>
								<img className="ui vertical_center image" src="client/images/tronbluefat.png"
									width="60" height="60"/>
							</div>
							<div className="column">
								<div className= "ui label header_label_div">
									<div className="hot_wallet_header_title">{getTitle()}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="four wide column pl-0 center aligned hot_top_header">
					<TrxPriceOdometer trxPrice={this.state.trxPrice}/>
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

	renderAccountBalances(){
		let getFrozenBalanceData = ()=>{
			if (this.state.frozenBalance > 0){
				return(
					<div className="two column row py-0" id="frozen_expire_div">
						<div className="bottom aligned column px-2 pb-3 width_fit_content left floated mr-auto">
							<FrozenBalanceOdometer frozenBalance={this.state.frozenBalance}/>
						</div>
						<div className="bottom aligned column px-2 pb-3 width_fit_content right floated ml-auto">
							<div className="ui mini statistic width_fit_content">
								
								<ExpireOdometer expirationTime={this.state.expirationTime}/>
								
								<div className="label statistic_balances text_align_right">
									Expiration Time Left
								</div>
							</div>
						</div>
					</div>
				);
			}
		}

		return(
			<div className="ui fluid centered raised doubling card account_balances_card" id="acc_balances_card">
				<div className="content">
					<div className="ui centered stackable page grid p-0">
						<div className="two column row pb-2">
							<div className="bottom aligned column px-2 pb-3 width_fit_content left floated mr-auto">
								<RegAccBalanceOdometer trxBalance={this.state.trxBalance}/>

							</div>

							<div className="bottom aligned column px-2 pb-3 width_fit_content right floated ml-auto">
								<USDBalanceOdometer trxBalance={this.state.trxBalance}
									trxPrice={this.state.trxPrice}/>
							</div>
						</div>
						{getFrozenBalanceData()}
						<div className="two column row pt-2">
							<div className="bottom aligned column px-2 width_fit_content left floated mr-auto">
								<BandwidthOdometer bandwidth={this.state.bandwidth}/>
							</div>
							<div className="bottom aligned column px-2 width_fit_content right floated ml-auto">
								<SharesOdometer shares={this.state.shares}/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}



	renderSendReceiveCard(){
		let getBroadcastMenuItem = ()=>{
			if (this.props.view == config.views.WATCHONLY){
				return(
					<div className="item send_receive_card_item" data-tab="broadcast"
  						id="hotwallet_broadcast_menu">
    					BROADCAST
  					</div>
				);
			}
		}

		let getBroadcastCard = ()=>{
			if(this.props.view == config.views.WATCHONLY){
				return(
					<div className="ui bottom attached tab segment send_receive_card_segment m-0"
						data-tab="broadcast" id="hot_wallet_broadcast_segment">
						<BroadcastCard {...this.getBroadcastCardProps()}/>
					</div>
				);
			}
		}
		let menu_classname = "ui top attached tabular ";
		if(this.props.view == config.views.WATCHONLY){
			menu_classname += "three item menu";
		}else{
			menu_classname += "two item menu";
		}

		return(
			<div className="ui card m-auto send_receive_card" id="send_receive_card">
				<div className="content">
					<div className={menu_classname}>
						<div className="item send_receive_card_item active" data-tab="send"
							onClick={this.sendMenuItemClick} id="hotwallet_send_menu">
	    					SEND
	  					</div>
	  					{getBroadcastMenuItem()}
	  					<div className="item send_receive_card_item" data-tab="receive"
	  						onClick={this.receiveMenuItemClick} id="hotwallet_receive_menu">
	    					RECEIVE
	  					</div>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment active m-0"
						data-tab="send" id="hot_wallet_send_segment">
						<SendCard {...this.getSendCardProps()}/>
					</div>
					{getBroadcastCard()}
					<div className="ui bottom attached tab segment send_receive_card_segment"
						data-tab="receive" id="hot_wallet_receive_segment">
						<ReceiveCard {...this.getReceiveCardProps()}/>
					</div>
				</div>
			</div>
		);
	}


	render(){
		let firstnode = this.state.dataNodeFirstHalf;
		if (this.state.dataNodeFirstHalf == 0){
			firstnode = firstnode.toFixed(1);
		}else{
			firstnode = firstnode.toString();
		}

		let secnode = this.state.dataNodeSecHalf;
		if (this.state.dataNodeSecHalf == 0){
			secnode = secnode.toFixed(1);
		}else{
			secnode = secnode.toString();
		}
		let node_str = `${firstnode}.${secnode}`;

		let freeze_modal_data = {
			frozenBalance: this.state.frozenBalance,
			bandwidth: this.state.bandwidth,
			shares: this.state.shares,
			expirationTime: this.state.expirationTime,
			trxBalance: this.state.trxBalance,
			pubAddress: this.state.accInfo.pubAddress
		};

		return(
			<div>
				<div className="hot_wallet_main_background" id="hot_wallet_main">
					<div className="ui grid px-4 draggable">
						{this.renderHeader()}
						{this.renderSubHeader()}
					</div>
					<div className="ui one column centered padded grid py-4 hot_wallet_main_content">
						<div className="two column row height_fit_content">
							<div className="middle aligned column">
								<div className="ui one column page centered grid px-0">
									<div className="row">
										{this.renderAccountBalances()}
									</div>
									<div className="row">
										<TransactionsCard {...this.getTxCardProps()}/>
									</div>
								</div>
							</div>
							<div className="middle aligned column">
								{this.renderSendReceiveCard()}
							</div>
						</div>
					</div>
					<DockMenu handleDockClick={this.handleDockClick} view={this.props.view}/>
					<Nodes handleDockClick={this.handleDockClick} modalOpened={this.state.nodesModalOpened}
						currNode={node_str} nodeData={this.state.nodeData}
						subscribe={this.subscribeNodeData} unsubscribe={this.unsubscribeNodeData}
						getNodeData={this.getNodeData}/>
					<BackupKeys handleDockClick={this.handleDockClick} modalOpened={this.state.backupModalOpened}
						pdirty={this.state.accInfo.pdirty} 
						pubAddress={this.state.accInfo.pubAddress}
						mobileAuthCode={this.props.mobileAuthCode} view={config.views.HOTWALLET}/>
					<Witnesses handleDockClick={this.handleDockClick} modalOpened={this.state.witnessesModalOpened}
						shares={this.state.shares} view={this.props.view} pubAddress={this.state.accInfo.pubAddress}
						voteHistory={this.state.voteHistory}/>
					<Freeze handleDockClick={this.handleDockClick} modalOpened={this.state.freezeModalOpened}
						data={freeze_modal_data} view={this.props.view}/>
				</div>
				<QRScanModal startCamera={this.state.startCamera} handleQRCallback={this.handleQRCallback}/>
				<MobileAuthModal mobileAuthCode={this.props.mobileAuthCode}
					handleOnSuccess={this.handleMobileAuthSuccess}/>
				<TransactionViewerModal txData={this.state.currTxData} view={this.props.view}
					pubAddress={this.state.accInfo.pubAddress}
					handleTxDataLock={this.handleTxDataLock}/>
			</div>
		);
	}
}

HotWalletDashboard.defaultProps={
	showStatusBar: (function(){}),
	accInfo: {
		pubAddress: "",
		accountName: "",
		pdirty: false
	},
	handleDataNode: (function(){}),
	permissionLogOut: (function(){}),
	mobileAuthCode: "",
	view: config.views.HOTWALLET
}