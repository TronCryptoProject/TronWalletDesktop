import React from "react";
import config from "../config/config.js";
import QRCode from "qrcode";

export default class SendCard extends React.Component{
	constructor(props){
		super(props);
		this.handleQRScanClick = this.handleQRScanClick.bind(this);
		this.handleSendClick = this.handleSendClick.bind(this);
		this.renderSimpleSendCard = this.renderSimpleSendCard.bind(this);
		this.renderPrepareTxCard = this.renderPrepareTxCard.bind(this);
		this.handleSignClick = this.handleSignClick.bind(this);
		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.handleAuthModalSuccess = this.handleAuthModalSuccess.bind(this);
		this.showError = this.showError.bind(this);
		this.showSuccess = this.showSuccess.bind(this);
		this.state = {
			qrcodeData: ""
		};
		this.isCreatingTx = false;
	}

	componentDidMount(){
		$("#coldwallet_send_sign_shape").shape();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.mobileAuthValid != this.props.mobileAuthValid){
			if (nextProps.mobileAuthValid){
				this.handleAuthModalSuccess();
			}
		}
	}

	handleAuthModalSuccess(){
		$("#mobile_auth_modal").modal("hide");
		let address = $("#send_address_input").val().trim();
		let value = $("#hotwallet_send_amout").val().trim();

		this.props.sendTrxTransaction(address,value,(result)=>{
			if ("result" in result){
				if (result.result == config.constants.FAILED && "reason" in result){
					this.showError(result.reason);
				}else{
					this.showSuccess();
				}
			}else{
				this.showError();
			}
		});
	}

	showError(message){
		if (message == undefined || message == null || message == ""){
			if (this.props.id != config.views.HOTWALLET){
				message = "Create transaction failed!";
			}else{
				message = "Send failed!";
			}
		}
		$("#send_submit_button").removeClass("loading right labeled button_tron_blue");
		$("#send_submit_button").addClass("red");
		$("#send_submit_button").text(message);
		$("#send_submit_button").transition("shake");
		setTimeout(()=>{
			$("#send_submit_button").removeClass("red");
			$("#send_submit_button").addClass("right labeled button_tron_blue");
			if (this.props.id != config.views.HOTWALLET){
				$("#send_submit_button").text("Create Transaction");
			}else{
				$("#send_submit_button").text("Send");
			}
			$("#send_submit_button").prepend("<i class='paperplane icon'/>");
			this.isCreatingTx = false;
		},2000);
	}

	showSuccess(){
		$("#send_submit_button").removeClass("loading right labeled button_tron_blue");
		$("#send_submit_button").addClass("green");
		$("#send_submit_button").text("Success!");
		$("#send_submit_button").transition("pulse");
		setTimeout(()=>{
			$("#send_submit_button").removeClass("green");
			$("#send_submit_button").addClass("right labeled button_tron_blue");
			if (this.props.id != config.views.HOTWALLET){
				$("#send_submit_button").text("Create Transaction");
			}else{
				$("#send_submit_button").text("Send");
			}
			$("#send_submit_button").prepend("<i class='paperplane icon'/>");
			this.isCreatingTx = false;
		},2000);
	}


	handleSendClick(e){
		e.persist();
		if (!this.isCreatingTx){
			this.isCreatingTx = true;

			$("#send_submit_button").addClass("loading");

			let address = $("#send_address_input").val().trim();
			let value = $("#hotwallet_send_amout").val().trim();

			if (address != "" && value != ""){
				if (this.props.id != config.views.HOTWALLET){

					this.props.handleSendClick(address, value, this.props.id,(result)=>{
						let showQR = (qrdata)=>{
							if (qrdata == null || qrdata == undefined || qrdata == ""){
								qrdata = "";
								result = "client/images/blankqrcode.png";
								$("#sign_tx_button").addClass("disabled");
								$("#cold_qr_img").removeClass("qrcode_image");
								$("#cold_qr_img").addClass("error_qr_code");
							}
							
							$("#send_submit_button").removeClass("loading");
							this.isCreatingTx = false;

							this.setState({qrcodeData: result, qrRawData:qrdata}, ()=>{
								$("#coldwallet_send_sign_shape").shape("flip over");
							});
						}

						if (result == ""){
							showQR("");
						}else{
							QRCode.toDataURL(result, (error, img_data)=>{
								if (!error){
									$("#sign_tx_button").removeClass("disabled");
									$("#cold_qr_img").addClass("qrcode_image");
									$("#cold_qr_img").removeClass("error_qr_code");
									let tmp_data = result;
									result = img_data;
									showQR(tmp_data);
								}else{
									showQR("");
								}
							});
						}
					});
				}else{
					if (this.props.bandwidth == 0){
						this.showError("Not enough bandwidth! Freeze TRX");
						
					}else if (this.props.mobileAuthCode != ""){
						$("#mobile_auth_modal")
						.modal({
							allowMultiple: true,
							closable: false,
							onShow:()=>{
								$("#hot_wallet_main").addClass("blur");
							},
							onHidden:()=>{
								$("#hot_wallet_main").removeClass("blur");
							},
							onApprove: ()=>{
								return false;
							},
							onDeny: ()=>{
								$("#send_submit_button").removeClass("loading");
								
								$("#mobile_auth_modal_validate_btn").text("Validate");
								$("#mobile_auth_modal_validate_btn").prepend("<i className='check icon'/>");
								this.isCreatingTx = false;
							}
						})
						.modal("show");
					}else{
						this.props.sendTrxTransaction(address, value, (result)=>{
							if ("result" in result){
								if (result.result == config.constants.FAILED && "reason" in result){
									this.showError(result.reason);
								}else{
									this.showSuccess();
								}
							}else{
								this.showError();
							}
						});
					}
				}

			}else{
				this.showError("Input is empty!");
			}
		}
		
	}

	handleSignClick(e){
		//switch to sign card menu
		this.props.handlePrepareClick(this.state.qrRawData);
	}

	handleBackButtonClick(){
		$("#coldwallet_send_sign_shape").shape("flip back");
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

	renderPrepareTxCard(){
		let getDesc = ()=>{
			if (this.props.id != config.views.HOTWALLET){
				return (
					<div className="content">
						<div className="extra">
							Scan this QRCode in cold wallet to sign
						</div>
					</div>
				);
			}
		}

		let getSignAction = ()=>{
			if (this.props.id == config.views.COLDWALLET){
				return(
					<div className="row">
						<button className="ui right labeled icon green button" onClick={(e)=>{this.handleSignClick(e)}}
							id="sign_tx_button">
							<i className="pencil alternate icon"/>
							Sign Transaction
						</button>
					</div>
				);
			}
		}

		return(
			<div className="ui one column centered padded grid">
				<div className="three column row">
					<div className="three wide column">
						<button className="circular medium ui icon button" onClick={this.handleBackButtonClick}>
							<i className="arrow left icon"/>
						</button>
					</div>
					<div className="eleven wide center middle aligned column">
						<div className="ui medium header cold_wallet_send_card_header">
							Raw Transaction Data
						</div>
					</div>
					<div className="two wide column right aligned px-3"/>
				</div>

				{getDesc()}
				<div className="row">
					<div className="image">
						<img src={this.state.qrcodeData} id="cold_qr_img" width="120" height="120"/>
					</div>
				</div>
				{getSignAction()}
			</div>
		);
	}

	renderSimpleSendCard(){
		let getCardDescription = ()=>{
			if (this.props.id != config.views.HOTWALLET){
				return(
					<div className="row">
						<div className="ui medium header cold_wallet_send_card_header">
							Prepare Transaction to Sign
						</div>
					</div>
				);
			}else{
				return(
					<div className="row">
						<div className="ui medium header cold_wallet_send_card_header">
							Send Transaction
						</div>
					</div>
				);
			}
		}
		let getSubmitButtonText = ()=>{
			if (this.props.id != config.views.HOTWALLET){
				return "Create Transaction";
			}else{
				return "Send";
			}
		}
		let getBottomTextMessage = ()=>{
			if (this.props.id == config.views.HOTWALLET){
				return(
					<div className="row">
						<div className="content">
							<div className="meta">
								You can only send transactions once every 5 mins without bandwidth. 
								Freeze TRX to get more bandwidth!
							</div>
						</div>
					</div>
				);
			}
		}
		return(
			<div className="ui one column centered padded grid" id="hot_wallet_send_segment">
				{getCardDescription()}
				<div className="three column row">
					<div className="four wide column"/>
					<div className="eight wide center middle aligned column">
						<div className="ui medium header">
							To
						</div>
					</div>
					<div className="four wide column right aligned px-3">
						<button className="ui icon button cornblue_button" data-content="scan qrcode"
							data-variation="tiny" data-inverted="" id="hotwallet_qrscan_btn"
							onClick={this.handleQRScanClick}>
							<i className="qrcode icon"/>
						</button>
					</div>
				</div>
				<div className="row">
					<div className="ui grid width_100">
						<div className="centered row">
							<div className="column">
								<div className="ui fluid search" id="send_search_div">
									<div className="ui icon input width_100">
										<input className="prompt send_receive_card_input placeholder_left_align"
											id="send_address_input" type="text" placeholder="address"/>
										<i className="search icon"/>
									</div>
									<div className="results search_results_div"></div>
								</div>
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
					<div className="ui right labeled input send_receive_card_input_div">
						<input type="number" className="send_receive_card_input placeholder_left_align"
							placeholder="0" min="0" id="hotwallet_send_amout"/>
						<div className="ui label">
							TRX
						</div>
					</div>
				</div>
				<div className="row mt-3">
					<button className="ui right labeled icon button_tron_blue button" onClick={(e)=>{this.handleSendClick(e)}}
						id="send_submit_button">
						<i className="paperplane icon"/>
						{getSubmitButtonText()}
					</button>
				</div>
				{getBottomTextMessage()}
			</div>
		);
	}

	render(){
		return(
			<div className="ui people shape" id="coldwallet_send_sign_shape">
				<div className="sides">
					<div className="active side">
						{this.renderSimpleSendCard()}
					</div>
					<div className="side">
						{this.renderPrepareTxCard()}
					</div>
				</div>
			</div>
			
		);
	}
}

SendCard.defaultProps = {
	handleQRScanClick: (function(){}),
	handleSendClick: (function(){}),
	handlePrepareClick: (function(){}),
	sendTrxTransaction: (function(){}),
	id: "",
	mobileAuthCode: "",
	mobileAuthValid: false,
	bandwidth: 0
}