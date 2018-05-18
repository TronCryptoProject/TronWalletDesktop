import React from "react";

export default class Spinner extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			size: this.props.size,
			show: this.props.size,
			colorClass: this.props.colorClass
		}
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (this.props.size != nextProps.size){
			tmp_dict.size = nextProps.size;
		}
		if (this.props.show != nextProps.show){
			tmp_dict.show = nextProps.show;
		}
		if (this.props.colorClass != nextProps.colorClass){
			tmp_dict.colorClass = nextProps.colorClass;
		}
		tmp_dict = Object.assign(this.state, tmp_dict);
		this.setState(tmp_dict);
	}

	render(){
		if (this.state.show){
			let class_str = `spinner loading ${this.state.colorClass} icon ${this.state.size}`;
			return(
				<div className="center aligned content">
					<i className={class_str}></i>
				</div>
			);
		}else{
			return(<div/>)
		}
		
	}
}

Spinner.defaultProps={
	size: "big",
	show: false,
	colorClass: "violet"
}