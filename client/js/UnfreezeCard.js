import React from "react";

export default class UnfreezeCard extends React.Component{
	constructor(props){
		super(props);
		this.handleUnfreezeClick = this.handleUnfreezeClick.bind(this);
		this.checkIfTimeExpired = this.checkIfTimeExpired.bind(this);
		this.closeErrorMessage = this.closeErrorMessage.bind(this);
		this.showErrorMessage = this.showErrorMessage.bind(this);

		this.state = {
			frozenBalance: props.frozenBalance,
			expirationTime: props.expirationTime,
			errorMessage: ""
		};
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (nextProps.frozenBalance != this.state.frozenBalance){
			tmp_dict.frozenBalance = nextProps.frozenBalance;
		}

		if (nextProps.expirationTime != this.state.expirationTime){
			tmp_dict.expirationTime = nextProps.expirationTime;
		}

		tmp_dict = Object.assign(this.state, tmp_dict);
		this.setState(tmp_dict);
	}

	checkIfTimeExpired(date_str){
		let date = new Date(date_str);
		let curr_date = new Date();

		let long_date = date.getTime();
		let long_curr_date = curr_date.getTime();

		if (long_curr_date - long_date > 0){
			return true;
		}
		return false;
	}

	handleUnfreezeClick(e){
		if (this.state.frozenBalance == 0){
			this.showErrorMessage("You have no balance to unfreeze. Please freeze at least 1 TRX first.");
		}else if (this.state.frozenBalance != 0 && 
			!this.checkIfTimeExpired(this.state.expirationTime)){
			this.showErrorMessage("Freeze time hasn't expired yet. Please wait until it expires and try again.");
		}else{
			this.closeErrorMessage();
			this.props.handleUnfreezeClick();
		}
		
	}

	closeErrorMessage(){
		if ($("#unfreeze_error_div").hasClass("visible")){
			$("#unfreeze_error_div").transition("slide left");
			$("#unfreeze_error_div").addClass("hidden");
			$("#unfreeze_error_div").removeClass("visible");
			this.setState({errorMessage: ""});
		}
	}

	showErrorMessage(message){
		if ($("#unfreeze_error_div").hasClass("hidden")){
			$("#unfreeze_error_div").transition("slide right");
			$("#unfreeze_error_div").addClass("visible");
			$("#unfreeze_error_div").removeClass("hidden");
			this.setState({errorMessage: message},()=>{
				setTimeout(()=>{
					this.closeErrorMessage();
				},2500);
			});
		}
	}


	render(){
		return(
			<div className="ui one column centered padded px-2 grid" id="hot_wallet_unfreeze_segment">
				<div className="row">
					<div className="content">
						<div className="extra freeze_description">
							You will be unfreezing entire frozen balance of {this.state.frozenBalance} TRX. You will only be
							able to unfreeze when the freeze time has expired.
						</div>
					</div>
				</div>

				<div className="row">
					<div className="ui right labeled input unfreeze_trx_label">
						<div className="ui label top_right_border_0 bottom_right_border_0">
							{this.state.frozenBalance}
						</div>
						<div className="ui label top_left_border_0 bottom_left_border_0">
							TRX
						</div>
					</div>
				</div>

				<div className="row">
					<button className="ui orange button"
						onClick={(e)=>{this.handleUnfreezeClick(e)}} id="unfreeze_balance_btn">
						<span className="text">Unfreeze</span>
					</button>
				</div>

				<div className="row">
					<div className="content">
						<div className="meta">
							<div>
								Remember:
							</div>
							<div className="ui list bulleted left aligned">
								<div className="item">
								Once unfrozen, you previous votes will become void
								</div>
								<div className="item">
								Your Tron Power will be entirely eliminated
								</div>
								<div className="item">
								Your Entropy will not be cleared when you unfreeze; it's accumulated
								</div>
							</div> 
						</div>
					</div>
				</div>
				<div className="ui hidden error message width_100" id="unfreeze_error_div">
			    	<i className="close icon" onClick={(e)=>{this.closeErrorMessage()}}></i>
			      	<div className="header">Error</div>
			      	<p>{this.state.errorMessage}</p>
			    </div>
			</div>
		);
	}
}

UnfreezeCard.defaultProps = {
	handleUnfreezeClick: (function(){}),
	frozenBalance: 0,
	expirationTime: ""
}