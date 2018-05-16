import React from "react";
import Odometer from "./odometer.js";

export default class RegAccBalanceOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateRegAccBalanceOdometer = this.updateRegAccBalanceOdometer.bind(this);
		this.state = {
			trxBalance: props.trxBalance
		};
		this.trxbalance_odometer = null;
	}

	componentDidMount(){
		this.updateRegAccBalanceOdometer();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.trxBalance != this.state.trxBalance){
			this.setState({trxBalance: nextProps.trxBalance},()=>{
				this.updateRegAccBalanceOdometer();
			});
		}
	}

	updateRegAccBalanceOdometer(){
		if (this.trxbalance_odometer == null){
			this.trxbalance_odometer = new Odometer({
				el: $("#hotwallet_trx_odo")[0],
				value: this.state.trxBalance,
				theme: "minimal",
				format: "(,ddd).dd"
			})
			this.trxbalance_odometer.render();
		}else{
			this.trxbalance_odometer.update(this.state.trxBalance);
		}
	}

	render(){
		return(
			<div className="ui mini statistic width_fit_content">
				<div className="value statistic_value_green text_align_left" id="hotwallet_trx_odo">
					<img width="25" height="25" src="client/images/tronmoney.png"/>
					{this.state.trxBalance}
				</div>
				<div className="label statistic_balances">
					Active Balance
				</div>
			</div>
		);
	}
}

RegAccBalanceOdometer.defaultProps = {
	trxBalance: 0
}