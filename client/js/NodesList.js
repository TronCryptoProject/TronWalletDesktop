import React from "react";
import Equal from "deep-equal";

export default class NodesList extends React.Component{
	constructor(props){
		super(props);
		this.renderNodes = this.renderNodes.bind(this);
		this.onMouseEnterItem = this.onMouseEnterItem.bind(this);
		this.onMouseLeaveItem = this.onMouseLeaveItem.bind(this);
		this.handleItemClick = this.handleItemClick.bind(this);
		this.state={
			nodes:this.props.nodes,
			listSelectedItem: ""
		}
	}

	componentWillReceiveProps(nextProps){
		if(!Equal(this.props.nodes, nextProps.nodes)){
			this.setState({nodes: nextProps.nodes});
		}
	}

	onMouseEnterItem(){

	}

	onMouseLeaveItem(){

	}

	handleItemClick(e,host){
		if (this.state.listSelectedItem == host){
			this.setState({listSelectedItem: ""});
		}else{
			this.setState({listSelectedItem: host});
		}
	}

	renderNodes(){
		let item_list = [];
		for(let node_dict of this.state.nodes){
			let selected_icon = <span/>;
			if (node_dict.host == this.state.listSelectedItem){
				selected_icon = <i className="ui circular green check icon"/>;
			}

			item_list.push(
				<div className="item" key={node_dict.host} onMouseEnter={this.onMouseEnterItem}
					onMouseLeave={this.onMouseLeaveItem} onClick={(e)=>{this.handleItemClick(e,node_dict.host)}}>
					{selected_icon}
					<div className="content">
						<div className="ui small header">
							{node_dict.host}
						</div>
						<div className="ui sub header">
							Port: {node_dict.port}
						</div>
					</div>
				</div>
			);
		}

		return item_list;
	}

	render(){
		return(
			<div className="nodelist_div m-auto">
				<div className="ui middle aligned selection animated list">
					{this.renderNodes()}
				</div>
				<button className="ui right labeled green icon button">
					<i className="microchip icon"></i>
					Connect To Node
				</button>
			</div>
		);
	}
}

NodesList.defaultProps={
	nodes:[]
}