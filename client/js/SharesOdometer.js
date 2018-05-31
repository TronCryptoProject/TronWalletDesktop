import React from "react";
import Odometer from "./odometer.js";

export default class SharesOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateSharesOdometer = this.updateSharesOdometer.bind(this);
		this.state = {
			shares: props.shares,
			id: props.id,
			showDescription: props.showDescription
		};
		this.shares_odometer = null;
	}

	componentDidMount(){
		this.updateSharesOdometer();
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (nextProps.shares != this.state.shares){
			tmp_dict.shares = nextProps.shares;
		}
		if(nextProps.id != this.state.id){
			tmp_dict.id = nextProps.id;
		}
		if(nextProps.showDescription != this.state.showDescription){
			tmp_dict.showDescription = nextProps.showDescription;
		}

		tmp_dict = Object.assign(this.state, tmp_dict);
		this.setState(tmp_dict,()=>{
			this.updateSharesOdometer();
		});
	}

	updateSharesOdometer(){
		if (this.shares_odometer == null){
			this.shares_odometer = new Odometer({
				el: $("#" + this.state.id)[0],
				value: this.state.shares,
				theme: "minimal",
				format: "(,ddd)",
				duration: 300
			})
			this.shares_odometer.render();
		}else{
			this.shares_odometer.update(this.state.shares);
		}
	}


	render(){
		let getDescription = ()=>{
			if (this.state.showDescription){
				return (
					<div className="label statistic_balances text_align_right">
						Tron Power
					</div>
				);
			}
		}

		return(
			<div className="ui mini statistic width_fit_content">
				<div className="value statistic_value_purple text_align_right" id={this.state.id}>
					{this.state.shares}
				</div>
				{getDescription()}
			</div>
		);
	}
}

SharesOdometer.defaultProps = {
	shares: 0,
	id: "hotwallet_shares_odo",
	showDescription: true
}