import React from "react";
import Odometer from "./odometer.js";

export default class SharesOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateSharesOdometer = this.updateSharesOdometer.bind(this);
		this.state = {
			shares: props.shares
		};
		this.shares_odometer = null;
	}

	componentDidMount(){
		this.updateSharesOdometer();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.shares != this.state.shares){
			this.setState({shares: nextProps.shares},()=>{
				this.updateSharesOdometer();
			});
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


	render(){
		return(
			<div className="ui mini statistic width_fit_content">
				<div className="value statistic_value_purple text_align_right" id="hotwallet_shares_odo">
					{this.state.shares}
				</div>
				<div className="label statistic_balances text_align_right">
					Voting Shares 
				</div>
			</div>
		);
	}
}

SharesOdometer.defaultProps = {
	shares: 0
}