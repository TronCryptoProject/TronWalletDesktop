import React from "react";
import ReactCodeInput from "react-code-input";
import speakeasy from "speakeasy";
import jetpack from "fs-jetpack";
import config from "../config/config.js";
import axios from "axios";
import {BlowfishSingleton} from "Utils.js";
import Equal from "deep-equal";

export default class BroadcastCard extends React.Component{
	constructor(props){
		super(props);
		this.handleQRScanClick = this.handleQRScanClick.bind(this);
		this.handleBroadcastTxClick = this.handleBroadcastTxClick.bind(this);
		this.onChangeHandler = this.onChangeHandler.bind(this);
		this.state = {
			token: ""
		};
		this.isSigning = false;
	}

	onChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({token: val});
		}else{
			this.setState({token: ""});
		}
	}

	handleBroadcastTxClick(e){
		e.persist();
		if (!this.isSigning){
			this.isSigning = true;
			let button_id = "#br_tx_submit_button";

			$(button_id).addClass("loading");

			let showError = (message)=>{
				if (message == undefined || message == null || message == ""){
					message = "Validation failed!";
				}
				$(button_id).removeClass("loading right labeled button_tron_blue");
				$(button_id).addClass("red");
				$(button_id).text(message);
				$(button_id).transition("shake");
				setTimeout(()=>{
					$(button_id).removeClass("red");
					$(button_id).addClass("right labeled button_tron_blue");
					$(button_id).text("Broadcast Transaction");
					$(button_id).prepend("<i class='bullhorn icon'/>");
					this.isSigning = false;
				},2000);
			}

			let showSuccess = ()=>{
				$(button_id).removeClass("loading right labeled button_tron_blue");
				$(button_id).addClass("green");
				$(button_id).text("Authenticated!");
				$(button_id).transition("pulse");
				setTimeout(()=>{
					$(button_id).removeClass("green");
					$(button_id).addClass("right labeled button_tron_blue");
					$(button_id).text("Broadcast Transaction");
					$(button_id).prepend("<i class='bullhorn icon'/>");
					this.isSigning = false;
				},2000);
			}

			let hex_str = $("#raw_tx_input").val().trim();
			if (hex_str != ""){
				let is_good = true;
				if (this.props.mobileAuthCode != ""){
					let token_status = speakeasy.totp.verify({
						secret: this.props.mobileAuthCode,
						encoding: "base32",
						token: this.state.token
					})
					if (!token_status){
						is_good = false;
					}
				}
				
				if (is_good){
					this.props.getTxData(hex_str,(data)=>{
						if (Equal(data,{})){
							showError("Transaction data fetch failed!");
						}else{
							showSuccess();
							setTimeout(()=>{
								$("#tx_hot_viewer_modal")
								.modal({
									allowMultiple: true,
									closable: false,
									onShow:()=>{
										$("#hot_wallet_main").addClass("blur");
									},
									onHidden:()=>{
										$("#hot_wallet_main").removeClass("blur");
									},
									onApprove:()=>{
										return false;
									}
								})
								.modal("show");
							}, 1000);
						}
						
					});
				}else{
					showError("Auth code is incorrect!");
				}
			}else{
				showError("Hex data is empty!");
			}

		}
	}

	handleQRScanClick(){
		this.props.handleQRScanClick(true, ()=>{
			$("#qrscan_modal")
			.modal({
				blurring: true,
				closable: false,
				onHidden: ()=>{
					this.props.handleQRScanClick(false);
				}
			})
			.modal("show");
		});
	}

	render(){
		let code_input_props = {
			inputStyle: {
				fontFamily: "monospace",
			    borderRadius: "40px",
			    border: "3px solid rgba(53, 86, 212, 0.74)",
			    boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 10px 0px",
			    margin: "4px",
			    width: "40px",
			    height: "40px",
			    fontSize: "28px",
			    boxSizing: "border-box",
			    color: "#3316c5",
			    fontWeight: "bolder",
			    textAlign: "center",
			    backgroundColor: "transparent"
			}
		};

		let getMobileAuthInput = ()=>{
			if (this.props.mobileAuthCode != ""){
				return(
					<div>
						<div className="row mb-3">
							<div className="ui small header text_align_center width_100">
								Mobile Auth Code
							</div>
						</div>
						<div className="row">
							<div className="content center_button">
						  		<ReactCodeInput type="number" fields={6} {...code_input_props}
						  			onChange={this.onChangeHandler}/>
						  	</div>
						</div>
					</div>
				);
			}else{
				<div className="row mb-3 content">
					<div className="meta">
						We recommend that you enable mobile authentication via Google Auth to prevent
						fraudulent transactions. Even if your private key is stolen, no one will be 
						able to sign and drain your wallet if you have mobile auth enabled.
					</div>
				</div>
			}
		}
		return(
			<div className="ui one column centered padded grid" id="hot_wallet_sign_segment">
				<div className="row">
					<div className="ui medium header cold_wallet_send_card_header">
						Import Raw Transaction to Broadcast
					</div>
				</div>
				<div className="row">
					<button className="ui right labeled icon button cornblue_button" data-content="scan qrcode"
						data-variation="tiny" data-inverted="" id="coldwallet_qrscan_btn"
						onClick={this.handleQRScanClick}>
						<i className="qrcode icon"/>
						Scan Tx from QRCode
					</button>
				</div>
				<div className="row">
					<div className="ui input raw_hex_input mx-3 width_100">
						 <textarea type="text" placeholder="Paste hex here..." className="width_100"
						 	id="raw_tx_input"/>
					</div>
				</div>
				<div>
				{getMobileAuthInput()}
				</div>
				<div className="row">
					<button className="ui right labeled icon button_tron_blue button" onClick={(e)=>{this.handleBroadcastTxClick(e)}}
						id="br_tx_submit_button">
						<i className="bullhorn icon"/>
						Broadcast Transaction
					</button>
				</div>
			</div>
		);
	}
}

BroadcastCard.defaultProps = {
	handleQRScanClick: (function(){}),
	getTxData: (function(){}),
	mobileAuthCode: ""
}