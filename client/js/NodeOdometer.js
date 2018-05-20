import React from "react";
import Odometer from "./odometer.js";

export default class NodeOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateDataNodeOdometer = this.updateDataNodeOdometer.bind(this);
		this.state = {
			dataNodeFirstHalf: this.props.dataNodeFirstHalf,
			dataNodeSecHalf: this.props.dataNodeSecHalf
		};
		this.datanodefirst_odometer = null;
		this.datanodesec_odometer = null;
	}

	componentDidMount(){
		this.updateDataNodeOdometer();
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (nextProps.dataNodeFirstHalf != this.state.dataNodeFirstHalf){
			tmp_dict.dataNodeFirstHalf = nextProps.dataNodeFirstHalf;
		}
		if (nextProps.dataNodeSecHalf != this.state.dataNodeSecHalf){
			tmp_dict.dataNodeSecHalf = nextProps.dataNodeSecHalf;
		}
		tmp_dict = Object.assign(this.state, tmp_dict);
		this.setState(tmp_dict,()=>{
			this.updateDataNodeOdometer();
		});
	}

	updateDataNodeOdometer(){
		let firstnode = this.state.dataNodeFirstHalf;
		if (this.state.dataNodeFirstHalf == 0){
			firstnode = firstnode.toFixed(1);
			console.log("f is 0");
		}else{
			firstnode = firstnode.toString();
		}

		let secnode = this.state.dataNodeSecHalf;
		if (this.state.dataNodeSecHalf == 0){
			secnode = secnode.toFixed(1);
			console.log("sec is 0");
		}else{
			secnode = secnode.toString();
		}

		console.log("firstnode: " + firstnode);
		console.log("secnode: " + secnode);
		if (this.datanodefirst_odometer == null){
			this.datanodefirst_odometer = new Odometer({
				el: $("#hotwallet_datanodefirst")[0],
				value: firstnode,
				theme: "minimal",
				format: "(ddd).d",
				duration: 500
			});
			this.datanodefirst_odometer.render();
		}else{
			this.datanodefirst_odometer.update(firstnode);
		}

		if (this.datanodesec_odometer == null){
			this.datanodesec_odometer = new Odometer({
				el: $("#hotwallet_datanodesec")[0],
				value: secnode,
				theme: "minimal",
				format: "(ddd).d"
			});
			this.datanodesec_odometer.render();
		}else{
			this.datanodesec_odometer.update(secnode);
		}
	}

	render(){
		return(
			<div className="ui mini statistic">
				<div className="value statistic_value_light_blue data_node_odometer mx-auto" id="hotwallet_datanode">
					<span id="hotwallet_datanodefirst">
						0.0
					</span>
					.
					<span id="hotwallet_datanodesec">
						0.0
					</span>
				</div>
				<div className="label statistic_datanode">
					Last Data Fetch From
				</div>
			</div>
		);
	}
}

NodeOdometer.defaultProps = {
	dataNodeFirstHalf: 0.0,
	dataNodeSecHalf: 0.0
}