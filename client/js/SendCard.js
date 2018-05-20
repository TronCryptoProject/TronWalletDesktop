import React from "react";

export default class SendCard extends React.Component{
	constructor(props){
		super(props);
		this.handleQRScanClick = this.handleQRScanClick.bind(this);
		this.handleSendClick = this.handleSendClick.bind(this);
		this.state = {};
	}

	handleSendClick(e){
		this.props.addContact($("#send_address_input").val().trim(), "", (contacts)=>{
			$("#send_search_div").search({
				source: contacts
			});
		});
		
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
		return(
			<div className="ui one column centered padded grid" id="hot_wallet_send_segment">
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
							placeholder="0" min="0"/>
						<div className="ui label">
							TRX
						</div>
					</div>
				</div>
				<div className="row mt-5">
					<button className="ui right labeled icon blue button" onClick={(e)=>{this.handleSendClick(e)}}>
						<i className="paperplane icon"/>
						Send
					</button>
				</div>
			</div>
		);
	}
}

SendCard.defaultProps = {
	handleQRScanClick: (function(){}),
	addContact: (function(){})
}