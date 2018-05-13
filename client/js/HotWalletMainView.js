import React from "react";
import Odometer from "./odometer.js";
import axios from "axios";
import config from "../config/config.js";
import Stomp from "stompjs";
import Equal from "deep-equal";
import QRCode from "qrcode";
import domtoimage from 'dom-to-image';
import FileSaver from "file-saver";
import copy from 'copy-to-clipboard';
import QRScanModal from "./QRScanModal.js";
import jetpack from "fs-jetpack";

export default class HotWalletMainView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			startCamera: false,
			contacts: [],

			accInfo:{
				accountName : "",
				pubAddress: ""
			},
			blockNum: 0,
			dataNodeFirstHalf: 0.0,
			dataNodeSecHalf: 0.0,
			trxPrice: 0,
			trxBalance: 0,
			usdBalance: 132353424352.490,
			frozenBalance: 0,
			expirationTime: 0,
			bandwidth: 0,
			shares: 0,
			txsList: [],
			receiveAmount: 0
		};

		this.renderHeader = this.renderHeader.bind(this);
		this.renderSubHeader = this.renderSubHeader.bind(this);
		this.fetchData = this.fetchData.bind(this);
		this.updateBlockNumOdometer = this.updateBlockNumOdometer.bind(this);
		this.updateTrxPriceOdometer = this.updateTrxPriceOdometer.bind(this);
		this.updateDataNodeOdometer = this.updateDataNodeOdometer.bind(this);
		this.updateRegAccBalanceOdometer = this.updateRegAccBalanceOdometer.bind(this);
		this.updateFrozenAccOdomoter = this.updateFrozenAccOdomoter.bind(this);
		this.updateBandwidthOdometer = this.updateBandwidthOdometer.bind(this);
		this.updateSharesOdometer = this.updateSharesOdometer.bind(this);
		this.updateUSDBalanceOdometer = this.updateUSDBalanceOdometer.bind(this);
		this.renderAccountBalances = this.renderAccountBalances.bind(this);
		this.renderRecentTransaction = this.renderRecentTransaction.bind(this);
		this.getTransactions = this.getTransactions.bind(this);
		this.renderSendReceiveCard = this.renderSendReceiveCard.bind(this);
		this.renderSendCard = this.renderSendCard.bind(this);
		this.renderReceiveCard = this.renderReceiveCard.bind(this);
		this.parseDataNode = this.parseDataNode.bind(this);
		this.handleReceiveCardTrxChange = this.handleReceiveCardTrxChange.bind(this);
		this.renderReceiveCanvas = this.renderReceiveCanvas.bind(this);
		this.handleReceiveSave = this.handleReceiveSave.bind(this);
		this.handleAddressCopy = this.handleAddressCopy.bind(this);
		this.handleSendClick = this.handleSendClick.bind(this);
		this.handleQRScanClick = this.handleQRScanClick.bind(this);
		this.handleQRCallback = this.handleQRCallback.bind(this);
		this.addContact = this.addContact.bind(this);
		this.loadContacts = this.loadContacts.bind(this);

		this.block_odometer = null;
		this.trxprice_odometer = null;
		this.datanodefirst_odometer = null;
		this.datanodesec_odometer = null;
		this.trxbalance_odometer = null;
		this.usdbalance_odometer = null;
		this.frozenbalance_odometer = null
		this.bandwidth_odometer = null;
		this.shares_odometer = null;
		this.SUCCESS = "success";
		this.FAILED = "failed";
	}

	componentDidMount(){
		//necessary
		$(".tabular.menu .item").tab();
		this.loadContacts();
		this.props.showStatusBar(true);
		this.fetchData(this.props);
		this.renderReceiveCanvas();

		$("#hotwallet_qrscan_btn").popup({
			delay: {
				show: 500,
				hide: 0
			}
		});

		$("#acc_balances_card").transition("hide");
		$("#txscard").transition("hide");
		$("#send_receive_card").transition("hide");

		setTimeout(()=>{
			$("#acc_balances_card").transition({
				animation: "scale in",
			 	duration  : 1000
			});
			$("#txscard").transition({
				animation: "scale in",
			 	duration  : 1000
			});
			$("#send_receive_card").transition({
				animation: "scale in",
			 	duration  : 1000
			});
		},200);
		

		//testing
		this.setState({
			accInfo:{
				accountName: "GurkiratWallet",
				pubAddress: "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy"
			},
			txsList: [
				{
					"from": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"to": "27UJ8qgmW8e2vx2Cev7s76eFX3tuKHtF21E",
					"amount": 45924,
					"timestamp": 2903849823572
				},
				{
					"from": "27XSDWdW218f3n24w3X9zsrizfTHyty6gLy",
					"to": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"amount": 4594,
					"timestamp": 2903849823272
				},
				{
					"from": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"to": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"amount": 4593242324,
					"timestamp": 290384523572
				},
				{
					"from": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"to": "27UJ8qgmW8e2vx2Cev7s26eFX3tuKHtF21E",
					"amount": 424.24,
					"timestamp": 2903829823572
				}
			]
		});
	}

	componentWillReceiveProps(nextProps){
		if (!Equal(nextProps.accInfo, this.props.accInfo)){
			this.setState({accInfo: nextProps.accInfo});
		}
	}

	loadContacts(){
		let contacts = [];
		if (jetpack.exists(config.walletConfigFile) == "file"){
			let read_data = jetpack.read(config.walletConfigFile, "json");
			if ("contacts" in read_data){
				for (let c in read_data.contacts){
					let name = read_data.contacts[c];
					contacts.push({
						category: name,
						title: c
					});
				}
			}	
		}
		this.setState({contacts: contacts},()=>{
			console.log(JSON.stringify(this.state.contacts));
			$("#send_search_div").search({
				type: "category",
				source: this.state.contacts,
				searchFields   : [
			    	"category", "title"
			    ],
			});
		});
	}

	addContact(address, name){
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
			this.loadContacts();
		}
		
	}

	handleSendClick(e){
		this.addContact($("#send_address_input").val().trim(), "");
		
	}

	handleQRScanClick(){
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

	handleQRCallback(data){
		setTimeout(()=>{
			$("#qrscan_modal").modal("hide");
		}, 1000);
		let jsonobj = JSON.parse(data);
		$("#send_address_input").val(jsonobj.address);
	}

	handleAddressCopy(e){
		copy(this.state.accInfo.pubAddress)
		$("#receive_pub_address").addClass("green");
		setTimeout(()=>{
			$("#receive_pub_address").removeClass("green");
		},300);
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

	updateRegAccBalanceOdometer(){
		if (this.trxbalance_odometer == null){
			this.trxbalance_odometer = new Odometer({
				el: $("#hotwallet_trx_odo")[0],
				value: this.state.trxBalance,
				theme: "minimal",
				format: "(,ddd).dd"
			})
			this.trxbalance_odometer.render();
		}else{
			this.trxbalance_odometer.update(this.state.trxBalance);
		}
	}

	updateUSDBalanceOdometer(){
		if (this.usdbalance_odometer == null){
			this.usdbalance_odometer = new Odometer({
				el: $("#hotwallet_usd_odo")[0],
				value: this.state.usdBalance,
				theme: "minimal",
				format: "(,ddd).dd"
			})
			this.usdbalance_odometer.render();
		}else{
			this.usdbalance_odometer.update(this.state.usdBalance);
		}
	}

	updateFrozenAccOdomoter(){
		if (this.frozenbalance_odometer == null){
			this.frozenbalance_odometer = new Odometer({
				el: $("#hotwallet_frozen_odo")[0],
				value: this.state.frozenBalance,
				theme: "minimal",
				format: "(,ddd).dd"
			})
			this.frozenbalance_odometer.render();
		}else{
			this.frozenbalance_odometer.update(this.state.frozenBalance);
		}
	}

	updateBandwidthOdometer(){
		if (this.bandwidth_odometer == null){
			this.bandwidth_odometer = new Odometer({
				el: $("#hotwallet_bandwidth_odo")[0],
				value: this.state.bandwidth,
				theme: "minimal",
				format: "(,ddd).dd"
			})
			this.bandwidth_odometer.render();
		}else{
			this.bandwidth_odometer.update(this.state.bandwidth);
		}
	}

	updateSharesOdometer(){
		if (this.shares_odometer == null){
			this.shares_odometer = new Odometer({
				el: $("#hotwallet_shares_odo")[0],
				value: this.state.shares,
				theme: "minimal",
				format: "(,ddd)"
			})
			this.shares_odometer.render();
		}else{
			this.shares_odometer.update(this.state.shares);
		}
	}


	updateTrxPriceOdometer(){
		if (this.trxprice_odometer == null){
			this.trxprice_odometer = new Odometer({
				el: $("#hotwallet_trxprice")[0],
				value: this.state.trxPrice,
				theme: "minimal",
				format: "(,ddd).dddd"
			})
			this.trxprice_odometer.render();
		}else{
			this.trxprice_odometer.update(this.state.trxPrice);
		}

		//also update the usd price
		this.setState({usdBalance: this.state.trxPrice * this.state.trxBalance},()=>{
			this.updateUSDBalanceOdometer();
		});
	}


	updateBlockNumOdometer(){
		if (this.block_odometer == null){
			this.block_odometer = new Odometer({
				el: $("#hotwallet_blockcount")[0],
				value: this.state.blockNum,
				theme: "minimal",
				format: "(,ddd)"
			});
			this.block_odometer.render();
		}else{
			this.block_odometer.update(this.state.blockNum);
		}
	}

	updateDataNodeOdometer(){
		if (this.datanodefirst_odometer == null){
			this.datanodefirst_odometer = new Odometer({
				el: $("#hotwallet_datanodefirst")[0],
				value: this.state.dataNodeFirstHalf,
				theme: "minimal",
				format: "(ddd).ddd",
				duration: 500
			});
			this.datanodefirst_odometer.render();
		}else{
			this.datanodefirst_odometer.update(this.state.dataNodeFirstHalf);
		}

		if (this.datanodesec_odometer == null){
			this.datanodesec_odometer = new Odometer({
				el: $("#hotwallet_datanodesec")[0],
				value: this.state.dataNodeSecHalf,
				theme: "minimal",
				format: "(ddd).ddd"
			});
			this.datanodesec_odometer.render();
		}else{
			this.datanodesec_odometer.update(this.state.dataNodeSecHalf);
		}
	}

	fetchData(props){
		let socket = new SockJS(`${config.API_URL}/walletws`);
		this.stomp = Stomp.over(socket);
		this.stomp.debug = null
		this.stomp.connect({},(frame)=>{
			this.stomp.subscribe("/persist/trxPrice",(data)=>{
				let body = data.body.trim();
				if (body != ""){
					let res_json = JSON.parse(data.body.trim());
					if (res_json.result == this.SUCCESS){
						this.setState({
							trxPrice: res_json.trxPrice.toFixed(6)
						},()=>{
							this.updateTrxPriceOdometer();
							setTimeout(()=>{
								this.stomp.send("/persist/trxPrice");
							},1500);
						});
					}
				}
			});

			this.stomp.subscribe("/persist/block",(data)=>{
				let body = data.body.trim();
				if (body != ""){
					let res_json = JSON.parse(data.body.trim());
					if (res_json.result == this.SUCCESS){
						let node_list = this.parseDataNode(res_json.fullnode);
						this.setState({
							blockNum: res_json.blockNum,
							dataNodeFirstHalf: node_list[0],
							dataNodeSecHalf: node_list[1]
						},()=>{
							this.updateBlockNumOdometer();
							this.updateDataNodeOdometer();
							setTimeout(()=>{
								this.stomp.send("/persist/block");
							},2500);
						});
					}
				}
			});
		})

	
	}

	renderHeader(){
		return(
			<div className="three column row pb-0">
				<div className="four wide column pr-0 center aligned hot_top_header">
					<div className="ui tiny statistic">
						<div className="value statistic_value_purple" id="hotwallet_blockcount">
							{this.state.blockNum}
						</div>
						<div className="label statistic_block">
							Current block
						</div>
					</div>
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
					<div className="ui tiny statistic">
						<div className="value statistic_value_green_div mx-auto">
							<i className="dollar sign icon"></i>
							<span id="hotwallet_trxprice">
								0.0000
							</span>
						</div>
						<div className="label statistic_trx_price">
							Current Price
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

	renderAccountBalances(){
		return(
			<div className="ui fluid centered raised doubling card account_balances_card" id="acc_balances_card">
				<div className="content">
					<div className="ui centered stackable page grid p-0">
						<div className="two column row pb-2">
							<div className="bottom aligned column px-2 pb-3 width_fit_content left floated mr-auto">
								<div className="ui mini statistic width_fit_content">
									<div className="value statistic_value_green text_align_left" id="hotwallet_trx_odo">
										<img width="25" height="25" src="client/images/tronmoney.png"/>
										{this.state.trxBalance}
									</div>
									<div className="label statistic_balances">
										Active Balance
									</div>
								</div>

							</div>

							<div className="bottom aligned column px-2 pb-3 width_fit_content right floated ml-auto">
								<div className="ui mini statistic width_fit_content">
									<div className="value statistic_value_green_div text_align_right">
										<i className="dollar sign icon"></i>
										<span className="height_0" id="hotwallet_usd_odo">
											{this.state.usdBalance}
										</span>
									</div>
									<div className="label statistic_trx_price text_align_right">
										Equivalent USD
									</div>
								</div>
							</div>
						</div>
						<div className="two column row py-0">
							<div className="bottom aligned column px-2 pb-3 width_fit_content left floated mr-auto">
								<div className="ui mini statistic width_fit_content">
									<div className="value statistic_value_green text_align_left" id="hotwallet_frozen_odo">
										<img width="25" height="25" src="client/images/tronmoney.png"/>
										{this.state.frozenBalance}
									</div>
									<div className="label statistic_balances">
										Frozen Balance
									</div>
								</div>
							</div>
							<div className="bottom aligned column px-2 pb-3 width_fit_content right floated ml-auto">
								<div className="ui mini statistic width_fit_content">
									<div className="value statistic_value_purple text_align_right" id="">
										{this.state.expirationTime}
									</div>
									<div className="label statistic_balances text_align_right">
										Expiration Time Left
									</div>
								</div>
							</div>
						</div>
						<div className="two column row pt-2">
							<div className="bottom aligned column px-2 width_fit_content left floated mr-auto">
								<div className="ui mini statistic width_fit_content">
									<div className="value statistic_value_purple text_align_left" id="hotwallet_bandwidth_odo">
										{this.state.bandwidth}
									</div>
									<div className="label statistic_balances">
										Bandwidth
									</div>
								</div>
							</div>
							<div className="bottom aligned column px-2 width_fit_content right floated ml-auto">
								<div className="ui mini statistic width_fit_content">
									<div className="value statistic_value_purple text_align_right" id="hotwallet_shares_odo">
										{this.state.shares}
									</div>
									<div className="label statistic_balances text_align_right">
										Voting Shares 
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	getTransactions(){
		let txs_list = [];
		for (let tx of this.state.txsList){
			let acc_from = tx.from;
			let acc_to = tx.to;
			let amt = tx.amount;
			let timestamp = tx.timestamp;

			//outgoing transaction
			let from_me = true;

			//incoming transaction
			if (acc_from != this.state.accInfo.pubAddress){
				from_me = false;
			}

			let imgsrc = "client/images/txin.png";
			let header = "From";
			let address = acc_from;
			if (from_me){
				imgsrc = "client/images/txout.png";
				header = "To";
				address = acc_to;
			}

			txs_list.push(
				<div className="pl-0 item" key={timestamp}>
					<img className="ui left floated image m-0" width="40" height="40"
						src={imgsrc}/>
					<div className="right floated content">
						<div className="right aligned header">Amount</div>
						<div className="right aligned description">{amt}</div>
					</div>
					
					<div className="left aligned floated content p-0">
						<div className="header">{header}</div>
						<div className="description tx_list_address">{address}</div>
						<div className="extra tx_list_timestamp">April 20, 2018 42:21</div>
					</div>
					
				</div>
			);
		}
		return txs_list;
	}

	renderRecentTransaction(){
		let title = `Recent Transactions (${this.state.txsList.length})`;
		return(
			<div className="ui fluid centered raised doubling card txs_card" id="txscard">
				<div className="content clearfix">
					<div className="ui small m-0 center aligned header">{title}</div>
					<div className="ui middle aligned selection list">
						{this.getTransactions()}
					</div>
					<div className="faded_bottom"/>
				</div>
			</div>
		);
	}

	renderReceiveCanvas(){
		let canvas = $("#hotwalletreceivecanvas")[0];
		let ctx = canvas.getContext("2d");
		let qrobj = {
			address: this.state.accInfo.pubAddress,
			amount: this.state.receiveAmount
		};
		let qrstr = JSON.stringify(qrobj);

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

		let createRect = (image, canvas,x, y, width, height, border_rad)=>{
    		ctx.save();
			getRoundedImage(x, y, (canvas.width - (x*2)), (canvas.height - (y*2)), border_rad);
			ctx.clip();
		    ctx.drawImage(image, x, y,(canvas.width - (x*2)),(canvas.height - (y*2)));
		    ctx.restore();
    	}

		QRCode.toDataURL(qrstr)
		.then(url =>{
			let image = new Image();
			image.src = url;
			image.onload = function(){
				createRect(image, canvas, 5,5, this.width, this.height, 16);
			}
		})
		.catch(err =>{
			let image = new Image();
			image.src = "client/images/blankqrcode.png";
			image.onload = function(){
				createRect(image, canvas, 5,5, this.width, this.height, 16);
			}
		});
	}

	handleReceiveCardTrxChange(e){
		let curr_val = e.target.value;
		this.setState({receiveAmount: curr_val},()=>{
			this.renderReceiveCanvas();
		})
	}

	handleReceiveSave(){
		domtoimage.toBlob(document.getElementById("hotwalletreceivecanvas"))
	    .then(function (blob) {
	        FileSaver.saveAs(blob, 'TronReceiveQRCode.jpg');
	    });
	}

	renderSendCard(){
		return(
			<div className="ui one column centered padded grid">
				<div className="row">
					<div className="ui medium header">
						To
					</div>
				</div>
				<div className="row">
					<div className="ui grid width_100">
						<div className="three centered column row">
							<div className="twelve wide column">
								<div className="ui fluid category search" id="send_search_div">
									<div className="ui icon input width_100">
										<input className="prompt send_receive_card_input placeholder_left_align"
											id="send_address_input" type="text" placeholder="address"/>
										<i className="search icon"/>
									</div>
									<div className="results"></div>
								</div>
							</div>
							<div className="four wide column px-3">
								<button className="ui icon button cornblue_button" data-content="scan qrcode"
									data-variation="tiny" data-inverted="" id="hotwallet_qrscan_btn"
									onClick={this.handleQRScanClick}>
									<i className="qrcode icon"/>
								</button>
							</div>
						</div>
							
					</div>
				</div>
				<div className="row">
					<div className="ui medium header">
						Amount
					</div>
				</div>
				<div className="row">
					<div className="ui right labeled input">
						<input type="text" className="send_receive_card_input placeholder_left_align" placeholder="0"/>
						<div className="ui label">
							TRX
						</div>
					</div>
				</div>
				<div className="row">
					<button className="ui right labeled icon blue button" onClick={(e)=>{this.handleSendClick(e)}}>
						<i className="paperplane icon"/>
						Send
					</button>
				</div>
			</div>
		);
	}

	renderReceiveCard(){
		return(
			<div className="ui one column centered padded grid">
				<div className="row">
					<div className="ui small header">
						Amount to Receive
					</div>
				</div>
				<div className="row p-0">
					<div className="ui right labeled input">
						<input type="text" className="send_receive_card_input placeholder_left_align" placeholder="0"
							onChange={(e)=>{this.handleReceiveCardTrxChange(e)}}/>
						<div className="ui label receive_right_btn_border">
							TRX
						</div>
					</div>
				</div>
				<div className="row">
					<div className="ui small header">
						Public Address
					</div>
				</div>
				<div className="row p-0">
					<div className="ui left labeled button">
						<div className="ui basic label receive_public_address">
							{this.state.accInfo.pubAddress}
						</div>
						<div className="ui icon button receive_right_btn_border"
							onClick={(e)=>{this.handleAddressCopy(e)}} id="receive_pub_address">
							<i className="copy icon"/>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="hotwallet_canvas_div">
						<canvas id="hotwalletreceivecanvas" className="hotwalletreceivecanvas"/>
					</div>
				</div>
				<div className="row">
					<button className="ui right labeled icon blue button" onClick={this.handleReceiveSave}>
						<i className="save icon"/>
						Save QR Image
					</button>
				</div>
			</div>
		);
	}

	renderSendReceiveCard(){
		return(
			<div className="ui card m-auto send_receive_card" id="send_receive_card">
				<div className="content pt-0">
					<div className="ui top attached tabular two item menu">
						<div className="item send_receive_card_item active" data-tab="send">
	    					SEND
	  					</div>
	  					<div className="item send_receive_card_item" data-tab="receive">
	    					RECEIVE
	  					</div>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment active" data-tab="send">
						{this.renderSendCard()}
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment" data-tab="receive">
						{this.renderReceiveCard()}
					</div>
				</div>
			</div>
		);
	}


	render(){
		return(
			<div>
				<div className="draggable hot_wallet_main_background">
					<div className="ui grid px-4">
						{this.renderHeader()}
						{this.renderSubHeader()}
					</div>
					<div className="ui one column centered padded grid py-4">
						<div className="two column row">
							<div className="column">
								<div className="ui one column page centered grid px-0">
									<div className="row">
										{this.renderAccountBalances()}
									</div>
									<div className="row">
										{this.renderRecentTransaction()}
									</div>
								</div>
							</div>
							<div className="column">
								{this.renderSendReceiveCard()}
							</div>
						</div>
					</div>
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
	}
}