import React from "react";
import Equal from "deep-equal";
import FrozenBalanceOdometer from "./FrozenBalanceOdometer.js";
import BandwidthOdometer from "./BandwidthOdometer.js";
import SharesOdometer from "./SharesOdometer.js";
import ExpireOdometer from "./ExpireOdometer.js";
import FreezeCard from "./FreezeCard.js";
import UnfreezeCard from "./UnfreezeCard.js";
import FreezeReadMeModal from "./FreezeReadMeModal.js";
import FrozenComparisonCard from "./FrozenComparisonCard.js";
import {BlowfishSingleton} from "Utils.js";
import axios from "axios";
import config from "../config/config.js";
import TxQrCodeModal from "./TxQrCodeModal.js";

export default class Freeze extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			modalOpened: props.modalOpened,
			data: props.data,
			freezeQrdata: "",

			txQRCodeModalFilename: "Tron.jpg",

			newFrozenBalanceValue: props.data.frozenBalance,
			newSharesValue: props.data.shares,
			newBandwidthValue: props.data.bandwidth,
			newTrxBalance: props.data.trxBalance,
			frozenBalanceDirty: false,
			sharesDirty: false,
			bandwidthDirty: false
		};

		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
		this.renderFrozenTabMenu = this.renderFrozenTabMenu.bind(this);
		this.handleFreezeClick = this.handleFreezeClick.bind(this);
		this.handleUnfreezeClick = this.handleUnfreezeClick.bind(this);
		this.handleReadMoreClick = this.handleReadMoreClick.bind(this);
		this.handleFreezeAmountInputChange = this.handleFreezeAmountInputChange.bind(this);
		this.freezeMenuClick = this.freezeMenuClick.bind(this);
		this.unfreezeMenuClick = this.unfreezeMenuClick.bind(this);
		this.showSuccess = this.showSuccess.bind(this);
		this.showError = this.showError.bind(this);

		this.isFreezing = false;
	}

	componentDidMount(){
		$('.ui.dropdown').dropdown();
		$("#freeze_readme_modal").modal({
			allowMultiple: true,
			closable: true
		});
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {}
		let dirty = false;
		if(this.props.modalOpened != nextProps.modalOpened){
			tmp_dict.modalOpened = nextProps.modalOpened;
		}

		if(!Equal(nextProps.data, this.state.data)){
			tmp_dict.data = nextProps.data;
			dirty = true;
		}

		tmp_dict = Object.assign(this.state, tmp_dict);

		this.setState(tmp_dict,()=>{
			if (dirty){
				let freeze_amt_val = $("#freeze_amt_input").val().trim();
				this.handleFreezeAmountInputChange(freeze_amt_val == "" ? -1: parseInt(freeze_amt_val));
			}
		});
	}

	showError(button_id, message){
		if (message == undefined || message == null || message == ""){
			if (button_id == "#freeze_balance_btn"){
				message = "Freeze failed!";
			}else{
				message = "Unfreeze failed!";
			}
		}
		$(button_id).removeClass("loading right labeled button_tron_blue");
		$(button_id).addClass("red");
		$(button_id).text(message);
		$(button_id).transition("shake");
		setTimeout(()=>{
			$(button_id).removeClass("red");
			if (button_id == "#freeze_balance_btn"){
				$(button_id).addClass("right labeled button_tron_blue");
				$(button_id).text("Freeze Balance");
				$(button_id).prepend("<i class='snowflake icon'/>");
			}else{
				$(button_id).addClass("orange");
				$(button_id).text("Unfreeze");
			}
			this.isFreezing = false;
		},2000);
	}

	showSuccess(button_id){
		$(button_id).removeClass("loading right labeled button_tron_blue");
		$(button_id).addClass("green");
		$(button_id).text("Success!");
		$(button_id).transition("pulse");
		setTimeout(()=>{
			$(button_id).removeClass("green");

			if (button_id == "#freeze_balance_btn"){
				$(button_id).addClass("right labeled button_tron_blue");
				$(button_id).text("Freeze Balance");
				$(button_id).prepend("<i class='snowflake icon'/>");
			}else{
				$(button_id).addClass("orange");
				$(button_id).text("Unfreeze");
			}
			
			this.isFreezing = false;
		},2000);
	}

	handleFreezeClick(amount){
		let button_id = "#freeze_balance_btn";

		if (!this.isFreezing){
			this.isFreezing = true;
			$(button_id).addClass("loading");

			let endpoint = "freezeBalance";
			if (this.props.view != config.views.HOTWALLET){
				endpoint = "prepareFreezeBalance"
			}

			
			let url = BlowfishSingleton.createPostURL(config.views.HOTWALLET, "POST",endpoint,{
				duration: "3",
				amount: amount.toString(),
				pubAddress: this.state.data.pubAddress
			});

			axios.post(url)
			.then((res)=>{
				let data = res.data;
				data = BlowfishSingleton.decryptToJSON(data);
		
				if ("result" in data){
					if (data.result == config.constants.SUCCESS){
						if (this.props.view == config.views.HOTWALLET){
							this.showSuccess(button_id);
						}else{
							this.setState({
								txQRCodeModalFilename: `TronPreparedFreezeTransaction.jpg`,
								freezeQrdata: data.data
							},()=>{
								$("#signed_tx_qrcode_modal")
								.modal({
									allowMultiple: true,
									closable: false,
									onHide: ()=>{
										showSuccess(button_id);
									}
								})
								.modal("show");
							});
						}

					}else{
						this.showError(button_id, data.reason)
					}
					
				}else{
					this.showError(button_id);
				}

			})
			.catch((error)=>{
				this.showError(button_id);
			});
		}
		
	}

	handleUnfreezeClick(){
		let button_id = "#unfreeze_balance_btn";

		if (!this.isFreezing){
			this.isFreezing = true;
			$(button_id).addClass("loading");
			let endpoint = "unfreezeBalance";

			if (this.props.view != config.views.HOTWALLET){
				endpoint = "prepareUnfreezeBalance";
			}
			let url = BlowfishSingleton.createPostURL(config.views.HOTWALLET, "POST",endpoint,{
				pubAddress: this.state.data.pubAddress
			});

			axios.post(url)
			.then((res)=>{
				let data = res.data;
				data = BlowfishSingleton.decryptToJSON(data);

				if ("result" in data){
					if (data.result == config.constants.SUCCESS){
						if (this.props.view == config.views.HOTWALLET){
							this.showSuccess(button_id);
						}else{
							this.setState({
								txQRCodeModalFilename: `TronPreparedUnfreezeTransaction.jpg`,
								freezeQrdata: data.data
							},()=>{
								$("#signed_tx_qrcode_modal")
								.modal({
									allowMultiple: true,
									closable: false,
									onHide: ()=>{
										showSuccess(button_id);
									}
								})
								.modal("show");
							});
						}
						
					}else{
						this.showError(button_id, data.reason)
					}
					
				}else{
					this.showError(button_id);
				}
			})
			.catch((error)=>{
				this.showError(button_id);
			});
		}
	}

	handleFreezeAmountInputChange(newAmount,callback){
		//value was added to input
		if (newAmount != -1){
			let calculated_bandwidth = this.state.data.bandwidth + (3 * newAmount);
			let dirty = false;
			if (!this.state.frozenBalanceDirty){
				dirty = true;
			}

			this.setState({
				newTrxBalance: this.state.data.trxBalance - newAmount,
				newFrozenBalanceValue: this.state.data.frozenBalance + newAmount,
				newSharesValue: this.state.data.shares + newAmount,
				newBandwidthValue: calculated_bandwidth,
				frozenBalanceDirty: true,
				sharesDirty: true,
				bandwidthDirty: true
			},()=>{
				if (dirty){
					$("#freeze_frozen_balance_value").transition("swing down in");
					$("#freeze_shares_value").transition("swing down in");
					$("#freeze_bandwidth_value").transition("swing down in");
					$("#freeze_trx_balance_value").transition("swing down in");
				}
			});
		}else{
			if (this.state.frozenBalanceDirty){
				$("#freeze_frozen_balance_value").transition("swing down out");
				$("#freeze_shares_value").transition("swing down out");
				$("#freeze_bandwidth_value").transition("swing down out");
				$("#freeze_trx_balance_value").transition("swing down out");
			}

			//reset
			this.setState({
				newFrozenBalanceValue: this.state.data.frozenBalance,
				newSharesValue: this.state.data.shares,
				newBandwidthValue: this.state.data.bandwidth,
				newTrxBalance: this.state.data.trxBalance,
				frozenBalanceDirty: false,
				sharesDirty: false,
				bandwidthDirty: false
			},()=>{
				if (callback){
					callback();
				}
			});
		}
	}


	handleReadMoreClick(){
		$("#freeze_readme_modal")
		.modal({
			allowMultiple: true,
			onShow:()=>{
				$("#freeze_modal").addClass("blur");
			},
			onHidden:()=>{
				$("#freeze_modal").removeClass("blur");
			}
		})
		.modal("show");
	}

	handleCloseButtonClick(){
		$("#freeze_amt_input").val("");
		this.handleFreezeAmountInputChange(-1,()=>{
			this.props.handleDockClick(false, "#freeze_modal");
		});
		
	}


	freezeMenuClick(){
		$("#hot_wallet_unfreeze_segment").transition("scale out");
		$("#hot_wallet_freeze_segment").transition("scale in");
	}

	unfreezeMenuClick(){
		$("#hot_wallet_freeze_segment").transition("scale out");
		$("#hot_wallet_unfreeze_segment").transition("scale in");
	}

	renderFrozenTabMenu(){
		return(
			<div className="ui card m-auto send_receive_card" id="frozen_card">
				<div className="content">
					<div className="ui top attached tabular two item menu">
						<div className="item send_receive_card_item active" data-tab="freeze"
							onClick={this.freezeMenuClick}>
	    					FREEZE
	  					</div>
	  					<div className="item send_receive_card_item" data-tab="unfreeze"
	  						onClick={this.unfreezeMenuClick}>
	    					UNFREEZE
	  					</div>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment active m-0" data-tab="freeze">
						<FreezeCard handleFreezeClick={this.handleFreezeClick} 
							handleFreezeAmountInputChange={this.handleFreezeAmountInputChange}
							trxBalance={this.state.data.trxBalance}/>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment" data-tab="unfreeze">
						<UnfreezeCard handleUnfreezeClick={this.handleUnfreezeClick}
							frozenBalance={this.state.data.frozenBalance}/>
					</div>
				</div>
			</div>
		);
	}

	render(){
		return(
			<div className="ui fullscreen modal fullscreen_modal clearfix" id="freeze_modal">
				<div className="ui blurring segment fullscreen_modal_segment clearfix" id="freeze_snow">					
					<div className="content">
						<div className="ui centered grid">
							<div className="three column row">
								<div className="four wide column">
									<button className="circular medium ui icon button" onClick={this.handleCloseButtonClick}>
										<i className="close icon"/>
									</button>
								</div>
								<div className="eight wide column">
									<div className="ui center aligned icon header freeze_top_header mt-0">
										<i className="snowflake icon freeze_top_header_icon"></i>
										<div className="freeze_header_title">
											Freeze/Unfreeze Your Balance
										</div>							
									</div>
								</div>
								<div className="four wide right aligned column">
									<div className="ui label cursor_pointer" onClick={this.handleReadMoreClick}>
										Read More
									</div>
								</div>
							</div>
						</div>
						
					</div>


					<div className="content mt-3">
						<div className="ui stackable centered page equal width grid p-0">
							<div className="middle center aligned column">
								<FrozenComparisonCard title="Active Balance" value={this.state.newTrxBalance}
									rawValue={this.state.newTrxBalance}
									id="freeze_trx_balance_value"/>
							</div>
							<div className="middle center aligned column">
								<FrozenComparisonCard title="Frozen Balance" value={this.state.newFrozenBalanceValue}
									rawValue={this.state.data.frozenBalance} 
									id="freeze_frozen_balance_value"/>
							</div>
							<div className="middle center aligned column">
								<FrozenComparisonCard title="Bandwidth" value={this.state.newBandwidthValue}
									rawValue={this.state.data.bandwidth}
									id={"freeze_bandwidth_value"}/>
							</div>
							<div className="middle center aligned column">
								<FrozenComparisonCard title="Tron Power" value={this.state.newSharesValue}
									rawValue={this.state.data.shares}
									id={"freeze_shares_value"}/>
							</div>
							
						</div>
					</div>

					<div className="content p-4">
						{this.renderFrozenTabMenu()}
					</div>

					<div className="content p-4">
						<div className="proxima_semibold width_80 text_align_center mx-auto width_80">
							Calculate and compare below what your approximate near future bandwidth & Tron Power
							would be once you freeze a specific amount. Enter a value in the amount input field. 
						</div>
					</div>
					<div className="extra freeze_description px-5 pb-5 mb-5">
						Tron utilizes bandwidth in order to limit invalid, high frequency transactions. Freezing
						your balance generates bandwidth, allowing you to send more than 1 transaction every 5 minutes
						and gives you Tron Power to vote for witnesses. Unfreezing will transfer funds back into your
						active account.
					</div>
				</div>
				<FreezeReadMeModal/>
				<TxQrCodeModal message={`Scan this QRCode in Cold Wallet to sign and then
					broadcast here in Watch Only Wallet`}
					filename={this.state.txQRCodeModalFilename}
					qrdata={this.state.freezeQrdata}/>
			</div>
		);
	}
}

Freeze.defaulProps={
	modalOpened: false,
	handleDockClick: (function(){}),
	data: {},
	view: config.views.HOTWALLET
}