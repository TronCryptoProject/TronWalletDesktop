import React from "react";
import Odometer from "./odometer.js";

export default class USDBalanceOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateUSDBalanceOdometer = this.updateUSDBalanceOdometer.bind(this);
		this.state = {
			usdBalance: props.usdBalance,
		};
		this.usdbalance_odometer = null;
	}

	componentDidMount(){
		this.updateUSDBalanceOdometer();
	}

	componentWillReceiveProps(nextProps){
		let usd_balance = nextProps.trxBalance * nextProps.trxPrice;
		if (usd_balance != this.state.usdBalance){
			this.setState({usdBalance: usd_balance},()=>{
				this.updateUSDBalanceOdometer();
			});
		}
	}

	updateUSDBalanceOdometer(){
		if (this.usdbalance_odometer == null){
			this.usdbalance_odometer = new Odometer({
				el: $("#hotwallet_usd_odo")[0],
				value: this.state.usdBalance,
				theme: "minimal",
				format: "(,ddd).dd"
			})
			this.usdbalance_odometer.render();
		}else{
			this.usdbalance_odometer.update(this.state.usdBalance);
		}
	}


	render(){
		return(
			<div className="ui mini statistic width_fit_content">
				<div className="value statistic_value_green_div text_align_right flex_end">
					<i className="dollar sign icon"></i>
					<span className="height_0" id="hotwallet_usd_odo">
						{this.state.usdBalance}
					</span>
				</div>
				<div className="label statistic_trx_price text_align_right">
					Equivalent USD
				</div>
			</div>
		);
	}
}

USDBalanceOdometer.defaultProps = {
	usdBalance: 0
}