import React from "react";
import ReactCodeInput from "react-code-input";
import speakeasy from "speakeasy";
import jetpack from "fs-jetpack";
import config from "../config/config.js";
import TransactionViewerModal from "./TransactionViewerModal.js";

export default class SignCard extends React.Component{
	constructor(props){
		super(props);
		this.handleQRScanClick = this.handleQRScanClick.bind(this);
		this.handleValidateTxClick = this.handleValidateTxClick.bind(this);
		this.onChangeHandler = this.onChangeHandler.bind(this);
		this.state = {
			code: "",
			token: ""
		};
		this.isSigning = false;
	}

	onChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({token: val});
		}
	}

	handleValidateTxClick(e){
		e.persist();
		if (!this.isSigning){
			this.isSigning = true;

			$(e.target).addClass("loading");

			let showError = (message)=>{
				if (message == undefined || message == null || message == ""){
					message = "Sign transaction failed!";
				}
				$(e.target).removeClass("loading right labeled");
				$(e.target).addClass("red");
				$(e.target).text(message);
				$(e.target).transition("shake");
				setTimeout(()=>{
					$(e.target).removeClass("red");
					$(e.target).addClass("right labeled");
					$(e.target).text("Validate Transaction");
					$(e.target).prepend("<i class='sitemap icon'/>");
					this.isSigning = false;
				},2000);
			}

			let showSuccess = ()=>{
				$(e.target).removeClass("loading right labeled");
				$(e.target).addClass("green");
				$(e.target).text("Sign transaction Success!");
				$(e.target).transition("pulse");
				setTimeout(()=>{
					$(e.target).removeClass("green");
					$(e.target).addClass("right labeled");
					$(e.target).prepend("<i class='sitemap icon'/>");
					$(e.target).text("Validate Transaction");
					this.isSigning = false;
				},2000);
			}

			let is_good = true;
			if (this.props.mobileAuthCode){
				let token_status = speakeasy.totp.verify({
					secret: this.state.code,
					encoding: "base32",
					token: this.state.token
				})
				if (!token_status){
					is_good = false;
				}
			}
			
			if (is_good){
				let hex_str = $("#raw_tx_input").val().trim();
				if (hex_str != ""){
					this.props.getTxData(hex_str,()=>{
						$("#tx_viewer_modal")
						.modal({
							allowMultiple: true,
							onShow:()=>{
								$("#hot_wallet_main").addClass("blur");
							},
							onHidden:()=>{
								$("#hot_wallet_main").removeClass("blur");
							},
							onApprove: ()=>{
								//now sign transaction TODO
								//show error if it fails
							}
						})
						.modal("show");
					});
				}else{
					showError("Hex data is empty!");
				}
			}else{
				showError("Auth code is incorrect!");
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
				},
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
			if (this.props.mobileAuthCode){
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
			}
		}

		return(
			<div className="ui one column centered padded grid" id="hot_wallet_sign_segment">
				<div className="row">
					<div className="ui medium header cold_wallet_send_card_header">
						Import Raw Transaction 
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
				{getMobileAuthInput()}
				<div className="row">
					<button className="ui right labeled icon blue button" onClick={(e)=>{this.handleValidateTxClick(e)}}>
						<i className="sitemap icon"/>
						Validate Transaction
					</button>
				</div>
			</div>
		);
	}
}

SignCard.defaultProps = {
	handleQRScanClick: (function(){}),
	getTxData: (function(){}),
	mobileAuthCode: ""
}