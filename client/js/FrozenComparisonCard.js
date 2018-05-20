import React from "react";

export default class FrozenComparisonCard extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			title: props.title,
			value: props.value,
			rawValue: props.rawValue,
			id: props.id
		};

	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};

		if (nextProps.title != this.state.title){
			tmp_dict.title = nextProps.title;
		}

		if (nextProps.value != this.state.value){
			tmp_dict.value = nextProps.value;
		}
		if (nextProps.rawValue != this.state.rawValue){
			tmp_dict.rawValue = nextProps.rawValue;
		}

		if (nextProps.id != this.state.id){
			tmp_dict.id = nextProps.id;
		}

		tmp_dict = Object.assign(this.state, tmp_dict);
		this.setState(tmp_dict);
	}

	render(){
		let getOriginalValue = ()=>{
			if (this.state.value != this.state.rawValue){
				return(
					<div className="ui label" id={this.state.id}>
						ORIGINAL {this.state.rawValue}
					</div>
				);
			}
		}

		return(
			<div className="ui moneygreen statistic width_100">
				<div className="label">
					{this.state.title}
				</div>
				<div className="value my-2 clearfix">
					<span>{this.state.value}</span>
				</div>
				{getOriginalValue()}
			</div>
		);
	}
}

FrozenComparisonCard.defaultProps = {
	title: "",
	value: 0,
	rawValue: 0,
	id: ""
}