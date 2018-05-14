import React from "react";

export default class Spinner extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			size: this.props.size,
			show: this.props.size
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
		this.setState(tmp_dict);
	}

	render(){
		if (this.state.show){
			let size = this.props.size;
			let class_str = `spinner loading violet icon ${size}`;
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
	show: false
}