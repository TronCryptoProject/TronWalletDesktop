import React from "react";
import Odometer from "./odometer.js";

export default class BlockOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateBlockNumOdometer = this.updateBlockNumOdometer.bind(this);
		this.state = {
			blockNum: this.props.blockNum
		};
		this.block_odometer = null;
	}

	componentDidMount(){
		this.updateBlockNumOdometer();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.blockNum != this.state.blockNum){
			this.setState({blockNum: nextProps.blockNum},()=>{
				this.updateBlockNumOdometer();
			});
		}
	}

	updateBlockNumOdometer(){
		if (this.block_odometer == null){
			this.block_odometer = new Odometer({
				el: $("#hotwallet_blockcount")[0],
				value: this.state.blockNum,
				theme: "minimal",
				format: "(,ddd)"
			});
			this.block_odometer.render();
		}else{
			this.block_odometer.update(this.state.blockNum);
		}
	}

	render(){
		return(
			<div className="ui tiny statistic">
				<div className="value statistic_value_purple" id="hotwallet_blockcount">
					{this.state.blockNum}
				</div>
				<div className="label statistic_block">
					Current block
				</div>
			</div>
		);
	}
}

BlockOdometer.defaultProps = {
	blockNum: 0
}