import React from "react";
import Odometer from "./odometer.js";

export default class BandwidthOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateBandwidthOdometer = this.updateBandwidthOdometer.bind(this);
		this.state = {
			bandwidth: props.bandwidth,
			showDescription: props.showDescription
		};
		this.bandwidth_odometer = null;
	}

	componentDidMount(){
		this.updateBandwidthOdometer();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.bandwidth != this.state.bandwidth){
			this.setState({bandwidth: nextProps.bandwidth},()=>{
				this.updateBandwidthOdometer();
			});
		}
		if (nextProps.showDescription != this.state.showDescription){
			this.setState({showDescription: nextProps.showDescription});
		}
	}

	updateBandwidthOdometer(){
		if (this.bandwidth_odometer == null){
			this.bandwidth_odometer = new Odometer({
				el: $("#hotwallet_bandwidth_odo")[0],
				value: this.state.bandwidth,
				theme: "minimal",
				format: "(,ddd)"
			})
			this.bandwidth_odometer.render();
		}else{
			this.bandwidth_odometer.update(this.state.bandwidth);
		}
	}


	render(){
		let getDescription = ()=>{
			if (this.state.showDescription){
				return(
					<div className="label statistic_balances">
						Bandwidth
					</div>
				);
			}
		}

		return(
			<div className="ui mini statistic width_fit_content">
				<div className="value statistic_value_purple text_align_left" id="hotwallet_bandwidth_odo">
					{this.state.bandwidth}
				</div>
				{getDescription()}
			</div>
		);
	}
}

BandwidthOdometer.defaultProps = {
	bandwidth: 0,
	showDescription: true
}