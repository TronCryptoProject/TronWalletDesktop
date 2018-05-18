import React from "react";

export default class FreezeCard extends React.Component{
	constructor(props){
		super(props);
		this.handleFreezeClick = this.handleFreezeClick.bind(this);
		this.closeErrorMessage = this.closeErrorMessage.bind(this);
		this.showErrorMessage = this.showErrorMessage.bind(this);
		this.onInputChange = this.onInputChange.bind(this);
		this.state = {
			errorMessage: ""
		};
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

	showErrorMessage(message){
		if ($("#freeze_error_div").hasClass("hidden")){
			$("#freeze_error_div").transition("slide right");
			$("#freeze_error_div").addClass("visible");
			$("#freeze_error_div").removeClass("hidden");
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
				$(e.target).val("0");
			}else{
				$(e.target).val(value);
			}
		}
	}

	render(){
		return(
			<div className="ui one column centered padded grid">
				<div className="row">
					<div className="ui medium header">
						Amount
					</div>
				</div>
				<div className="row">
					<div className="ui right labeled input">
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
				<div className="row">
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
	handleFreezeClick: (function(){})
}