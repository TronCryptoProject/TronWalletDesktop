import React from "react";
import Odometer from "./odometer.js";

export default class TrxPriceOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateTrxPriceOdometer = this.updateTrxPriceOdometer.bind(this);
		this.state = {
			trxPrice: props.trxPrice
		};
		this.trxprice_odometer = null;
	}

	componentDidMount(){
		this.updateTrxPriceOdometer();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.trxPrice != this.state.trxPrice){
			this.setState({trxPrice: nextProps.trxPrice},()=>{
				this.updateTrxPriceOdometer();
			});
		}
	}

	updateTrxPriceOdometer(){
		if (this.trxprice_odometer == null){
			this.trxprice_odometer = new Odometer({
				el: $("#hotwallet_trxprice")[0],
				value: this.state.trxPrice,
				theme: "minimal",
				format: "(,ddd).dddd"
			})
			this.trxprice_odometer.render();
		}else{
			this.trxprice_odometer.update(this.state.trxPrice);
		}
	}

	render(){
		return(
			<div className="ui tiny statistic">
				<div className="value statistic_value_green_div mx-auto">
					<i className="dollar sign icon"></i>
					<span id="hotwallet_trxprice">
						0.0000
					</span>
				</div>
				<div className="label statistic_trx_price">
					Current Price
				</div>
			</div>
		);
	}
}

TrxPriceOdometer.defaultProps = {
	trxPrice: 0
}