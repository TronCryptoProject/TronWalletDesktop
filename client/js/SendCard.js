import React from "react";
import config from "../config/config.js";

export default class SendCard extends React.Component{
	constructor(props){
		super(props);
		this.handleQRScanClick = this.handleQRScanClick.bind(this);
		this.handleSendClick = this.handleSendClick.bind(this);
		this.renderSimpleSendCard = this.renderSimpleSendCard.bind(this);
		this.renderPrepareTxCard = this.renderPrepareTxCard.bind(this);
		this.handleSignClick = this.handleSignClick.bind(this);
		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.state = {
			qrcodeData: ""
		};
	}

	componentDidMount(){
		$("#coldwallet_send_sign_shape").shape();
	}

	handleSendClick(e){
		let address = $("#send_address_input").val().trim();
		let value = $("#hotwallet_send_amout").val().trim();
		this.props.handleSendClick(address, value,(qrcode_data)=>{
			if (qrcode_data == ""){
				qrcode_data = "client/images/blankqrcode.png";
				$("#sign_tx_button").addClass("disabled");
			}else{
				$("#sign_tx_button").removeClass("disabled");
			}
			this.setState({qrcodeData: qrcode_data}, ()=>{
				$("#coldwallet_send_sign_shape").shape("flip over");
			});
		});
		
	}

	handleSignClick(e){
		//switch to sign card menu
		this.props.handlePrepareClick(this.state.qrcodeData);
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

				<div className="row">
					<div className="image">
						<img src={this.state.qrcodeData} className="qrcode_image"/>
					</div>
				</div>
				<div className="row">
					<button className="ui right labeled icon green button" onClick={(e)=>{this.handleSignClick(e)}}
						id="sign_tx_button">
						<i className="pencil alternate icon"/>
						Sign Transaction
					</button>
				</div>
			</div>
		);
	}

	renderSimpleSendCard(){
		let getCardDescription = ()=>{
			if (this.props.id == config.views.COLDWALLET){
				return(
					<div className="row">
						<div className="ui medium header cold_wallet_send_card_header">
							Prepare Transaction to Sign
						</div>
					</div>
				);
			}
		}
		let getSubmitButtonText = ()=>{
			if (this.props.id == config.views.COLDWALLET){
				return "Create Transaction";
			}else{
				return "Send";
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
									<div className="results"></div>
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
					<button className="ui right labeled icon blue button" onClick={(e)=>{this.handleSendClick(e)}}>
						<i className="paperplane icon"/>
						{getSubmitButtonText()}
					</button>
				</div>
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
	id: ""
}