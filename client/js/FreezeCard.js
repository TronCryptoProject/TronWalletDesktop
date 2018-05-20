import React from "react";

export default class FreezeCard extends React.Component{
	constructor(props){
		super(props);
		this.handleFreezeClick = this.handleFreezeClick.bind(this);
		this.closeErrorMessage = this.closeErrorMessage.bind(this);
		this.showErrorMessage = this.showErrorMessage.bind(this);
		this.onInputChange = this.onInputChange.bind(this);
		this.state = {
			errorMessage: "",
			trxBalance: props.trxBalance
		};
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.trxBalance != this.state.trxBalance){
			this.setState({trxBalance: nextProps.trxBalance});
		}
	}

	handleFreezeClick(e){
		let amt_val = $("#freeze_amt_input").val();
		if (amt_val != ""){
			amt_val = parseInt(amt_val);
			if (!isNaN(amt_val) && amt_val != 0){
				this.closeErrorMessage();
				this.props.handleFreezeClick(amt_val);
				return;
			}else if (amt_val == 0){
				this.showErrorMessage("Must freeze at least 1 TRX");
				return;
			}
		}
		this.showErrorMessage("Amount entered is invalid");
	}

	closeErrorMessage(){
		if ($("#freeze_error_div").hasClass("visible")){
			$("#freeze_error_div").transition("slide left");
			$("#freeze_error_div").addClass("hidden");
			$("#freeze_error_div").removeClass("visible");
			this.setState({errorMessage: ""});
		}
	}

	showErrorMessage(message, error_state){
		if ($("#freeze_error_div").hasClass("hidden")){
			$("#freeze_error_div").transition("slide right");
			$("#freeze_error_div").addClass("visible");
			$("#freeze_error_div").removeClass("hidden");
			if (error_state && error_state == "info"){
				$("#freeze_error_div").removeClass("error");
				$("#freeze_error_div").addClass("info");
			}else{
				$("#freeze_error_div").removeClass("info");
				$("#freeze_error_div").addClass("error");
			}
			this.setState({errorMessage: message},()=>{
				setTimeout(()=>{
					this.closeErrorMessage();
				},2500);
			});
		}
	}

	onInputChange(e){
		let value = e.target.value.trim();
		if (value != ""){
			value = parseInt(value);
			if (isNaN(value) || value < 0){
				value = 0;
			}else if(value > this.state.trxBalance){
				value = this.state.trxBalance;
				this.showErrorMessage("Amount exceeds your available balance","info");
			}
			$(e.target).val(value);
		}
		this.props.handleFreezeAmountInputChange((value == "")  ? -1 : value);
	}

	render(){
		return(
			<div className="ui one column centered padded grid" id="hot_wallet_freeze_segment">
				<div className="row">
					<div className="ui medium header">
						Amount
					</div>
				</div>
				<div className="row">
					<div className="ui right labeled input send_receive_card_input_div">
						<input type="number" className="send_receive_card_input placeholder_left_align"
							id="freeze_amt_input" placeholder="0" onChange={(e)=>{this.onInputChange(e)}}/>
						<div className="ui label">
							TRX
						</div>
					</div>
				</div>
				<div className="row">
					<div className="ui medium header">
						Duration
					</div>
				</div>
				<div className="row">
					<div className="ui selection dropdown text_align_center">
						<input name="freeze_duration" type="hidden" value="3 Days"/>
						<i className="dropdown icon"></i>
						<div className="text">3 Days</div>
					  	<div className="menu">
					    	<div className="item text_align_center" data-value="0">3 Days</div>
					    </div>
					    
					</div>
				</div>
				<div className="row my-3">
					<div className="ui labeled icon blue button"
						onClick={(e)=>{this.handleFreezeClick(e)}}>
					  	<span className="text">Freeze Balance</span>
					  	<i className="snowflake icon"></i>
					</div>
				</div>
				<div className="ui hidden error message width_100" id="freeze_error_div">
			    	<i className="close icon" onClick={(e)=>{this.closeErrorMessage()}}></i>
			      	<div className="header">Error</div>
			      	<p>{this.state.errorMessage}</p>
			    </div>
			</div>
		);
	}
}

FreezeCard.defaultProps = {
	handleFreezeClick: (function(){}),
	handleFreezeAmountInputChange: (function(){}),
	trxBalance: 0
}