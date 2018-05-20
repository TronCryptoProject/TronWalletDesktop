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


export default class HotWalletMainView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			startCamera: false,
			contacts: [],
			dockModalOpened: false,
			isLoggedIn: props.isLoggedIn,
			nodeData: [],

			accInfo:{
				accountName : "",
				pubAddress: ""
			},
			blockNum: 0,
			trxPrice: 0,
			dataNodeFirstHalf: 0.0,
			dataNodeSecHalf: 0.0,
			trxBalance: 0,
			usdBalance: 0,
			frozenBalance: 0,
			bandwidth: 0,
			shares: 10000,
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

		//rendering functions
		this.renderHeader = this.renderHeader.bind(this);
		this.renderSubHeader = this.renderSubHeader.bind(this);
		this.renderAccountBalances = this.renderAccountBalances.bind(this);
		this.renderSendReceiveCard = this.renderSendReceiveCard.bind(this);
		
		//props functions
		this.getTxCardProps = this.getTxCardProps.bind(this);
		this.getSendCardProps = this.getSendCardProps.bind(this);
		this.getReceiveCardProps = this.getReceiveCardProps.bind(this);

		this.trxPriceSubscriber = null;
		this.blockNumSubscriber = null;
		this.nodeSubscriber = null;
	
	}

	componentDidMount(){
		//necessary
		$(".tabular.menu .item").tab();
		this.loadContacts();
		this.props.showStatusBar(true);
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

		
		setTimeout(()=>{
			this.setState({shares:8000});
		},10000);
		//testing
		/*this.setState({
			accInfo:{
				accountName: "GurkiratWallet",
				pubAddress: "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy"
			},
			expirationTime: "Thu May 17 00:02:15 PDT 2018"
			
		},()=>{
			console.log("time set: " + this.state.expirationTime);
		});*/
	}

	componentWillUnmount(){
		this.stomp = null;
		this.setState({stomp: null});
		this.props.showStatusBar(false);
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
		let jsonobj = JSON.parse(data);
		$("#send_address_input").val(jsonobj.address);
	}

	handleQRScanClick(toStartCamera, callback){
		this.setState({startCamera: toStartCamera},()=>{
			if (callback){
				callback();
			}
		})
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
			addContact: this.addContact,
			handleQRScanClick: this.handleQRScanClick
		};
	}

	getReceiveCardProps(){
		return{
			accInfo: this.state.accInfo
		};
	}

	getTxCardProps(){
		return{
			accInfo: this.state.accInfo
		};
	}

	fetchData(){
		let socket = new SockJS(`${config.API_URL}/walletws`);
		this.stomp = Stomp.over(socket);
		this.stomp.debug = null;

		this.stomp.connect({},(frame)=>{
			console.log("connected");
			this.trxPriceSubscriber = this.stomp.subscribe("/persist/trxPrice",(data)=>{
				let body = data.body.trim();
				if (body != ""){
					let res_json = JSON.parse(data.body.trim());
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

			this.blockNumSubscriber = this.stomp.subscribe("/persist/block",(data)=>{
				let body = data.body.trim();
				if (body != ""){
					let res_json = JSON.parse(data.body.trim());
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


			if (this.stomp){
				this.stomp.send("/persist/block");
				this.stomp.send("/persist/trxPrice");
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
		this.stomp.disconnect(()=>{
			console.log("stomp disconnected");
			this.props.permissionLogOut();
		});
	}

	getNodeData(){
		this.stomp.send("/persist/nodes");
	}

	subscribeNodeData(){
		this.nodeSubscriber = this.stomp.subscribe("/persist/nodes",(data)=>{
			let body = data.body.trim();
			if (body != ""){
				let res_json = JSON.parse(data.body.trim());
				if (res_json.result == config.constants.SUCCESS){
					let node_list = [];
					let node_set = new Set([]);
					for (let node of res_json.nodes){
						if (!node_set.has(node.host)){
							node_set.add(node.host);
							node_list.push(node);
						}
					}
					this.setState({nodeData:node_list});
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
		$("#hot_wallet_receive_segment").transition("scale out");
		$("#hot_wallet_send_segment").transition("scale in");
	}
	receiveMenuItemClick(){
		$("#hot_wallet_send_segment").transition("scale out");
		$("#hot_wallet_receive_segment").transition("scale in");
	}

	renderHeader(){
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
									<div className="hot_wallet_header_title">HOT WALLET</div>
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
						<div className="two column row py-0">
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
		return(
			<div className="ui card m-auto send_receive_card" id="send_receive_card">
				<div className="content">
					<div className="ui top attached tabular two item menu">
						<div className="item send_receive_card_item active" data-tab="send"
							onClick={this.sendMenuItemClick}>
	    					SEND
	  					</div>
	  					<div className="item send_receive_card_item" data-tab="receive"
	  						onClick={this.receiveMenuItemClick}>
	    					RECEIVE
	  					</div>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment active m-0"
						data-tab="send">
						<SendCard {...this.getSendCardProps()}/>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment"
						data-tab="receive">
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
			trxBalance: this.state.trxBalance
		};

		return(
			<div>
				<div className="draggable hot_wallet_main_background">
					<div className="ui grid px-4">
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
					<DockMenu handleDockClick={this.handleDockClick}/>
					<Nodes handleDockClick={this.handleDockClick} modalOpened={this.state.dockModalOpened}
						currNode={node_str} nodeData={this.state.nodeData}
						subscribe={this.subscribeNodeData} unsubscribe={this.unsubscribeNodeData}
						getNodeData={this.getNodeData}/>
					<BackupKeys handleDockClick={this.handleDockClick} modalOpened={this.state.dockModalOpened}
						/>
					<Witnesses handleDockClick={this.handleDockClick} modalOpened={this.state.dockModalOpened}
						shares={this.state.shares}/>
					<Freeze handleDockClick={this.handleDockClick} modalOpened={this.state.dockModalOpened}
						data={freeze_modal_data}/>
				</div>
				<QRScanModal startCamera={this.state.startCamera} handleQRCallback={this.handleQRCallback}/>
				
			</div>
		);
	}
}

HotWalletMainView.defaultProps={
	showStatusBar: (function(){}),
	accInfo: {
		pubAddress: "",
		accountName: ""
	},
	handleDataNode: (function(){}),
	permissionLogOut: (function(){})
}