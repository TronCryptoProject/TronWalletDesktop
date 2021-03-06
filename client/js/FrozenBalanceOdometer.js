import React from "react";
import Odometer from "./odometer.js";

export default class FrozenBalanceOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateFrozenAccOdomoter = this.updateFrozenAccOdomoter.bind(this);
		this.state = {
			frozenBalance: props.frozenBalance,
			showDescription: props.showDescription
		};
		this.frozenbalance_odometer = null;
	}

	componentDidMount(){
		this.updateFrozenAccOdomoter();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.frozenBalance != this.state.frozenBalance){
			this.setState({frozenBalance: nextProps.frozenBalance},()=>{
				this.updateFrozenAccOdomoter();
			});
		}
		if (nextProps.showDescription != this.state.showDescription){
			this.setState({showDescription: nextProps.showDescription});
		}
	}

	updateFrozenAccOdomoter(){
		if (this.frozenbalance_odometer == null){
			this.frozenbalance_odometer = new Odometer({
				el: $("#hotwallet_frozen_odo")[0],
				value: this.state.frozenBalance,
				theme: "minimal",
				format: "(,ddd)"
			})
			this.frozenbalance_odometer.render();
		}else{
			this.frozenbalance_odometer.update(this.state.frozenBalance);
		}
	}


	render(){
		let getDescription = ()=>{
			if (this.state.showDescription){
				return(
					<div className="label statistic_balances">
						Frozen Balance
					</div>
				);
			}
		}

		return(
			<div className="ui mini statistic width_fit_content">
				<div className="value statistic_value_green text_align_left" id="hotwallet_frozen_odo">
					<img width="25" height="25" src="client/images/tronmoney.png"/>
					{this.state.frozenBalance}
				</div>
				{getDescription()}
			</div>
		);
	}
}

FrozenBalanceOdometer.defaultProps = {
	frozenBalance: 0,
	showDescription: true
}