import React from "react";
import Equal from "deep-equal";
import axios from "axios";
import config from "../config/config.js";

export default class NodesList extends React.Component{
	constructor(props){
		super(props);
		this.renderNodes = this.renderNodes.bind(this);
		this.onMouseEnterItem = this.onMouseEnterItem.bind(this);
		this.onMouseLeaveItem = this.onMouseLeaveItem.bind(this);
		this.handleItemClick = this.handleItemClick.bind(this);
		this.handleConnectNodeBtn = this.handleConnectNodeBtn.bind(this);
		this.setMessage = this.setMessage.bind(this);
		this.state={
			nodes:this.props.nodes,
			listSelectedItem: {},
			error: ""
		}
	}

	componentWillReceiveProps(nextProps){
		if(!Equal(this.props.nodes, nextProps.nodes)){
			this.setState({nodes: nextProps.nodes});
		}
	}

	onMouseEnterItem(e,host_dict){
		this.props.handleNodeItemClick(host_dict.host);
	}

	onMouseLeaveItem(e,host_dict){
		if (Equal(this.state.listSelectedItem,{})){
			this.props.handleNodeItemClick("");
		}else{
			this.props.handleNodeItemClick(this.state.listSelectedItem.host);
		}
		
	}

	setMessage(message,isSuccess){
		this.setState({error: message},()=>{
			let params = {
				headerText:(isSuccess)?"Success" : "Error",
				message:message,
				actions:["accept"]
			};	
			this.props.handleConfModalParams(params, isSuccess);
		});
	}

	handleItemClick(e,host_dict){
		let res = {};
		if (!Equal(this.state.listSelectedItem,host_dict)){
			res = host_dict;
		}
		this.setState({listSelectedItem: res});
		
	}

	handleConnectNodeBtn(){
		let message = "";
		if (!Equal(this.state.listSelectedItem,{})){
			axios.post(`${config.API_URL}/api/connectNode`,{
				node: `${this.state.listSelectedItem.host}:${this.state.listSelectedItem.port}`
			})
			.then((res)=>{
				message = "Node is connected.";
				this.setMessage(message,true);
			})
			.catch((error)=>{
				message = "Error in connecting";
				this.setMessage(message,false);
			});
		}else{
			message = "Node is not selected. Please select a node first before connecting.";
			this.setMessage(message,false);
		}

	}

	renderNodes(){
		let item_list = [];
		for(let node_dict of this.state.nodes){
			let selected_icon = <span/>;
			if (Equal(node_dict, this.state.listSelectedItem)){
				selected_icon = <i className="ui big green check circle icon"/>;
			}

			item_list.push(
				<div className="text_align_right item" key={node_dict.host}
					onMouseEnter={(e)=>{this.onMouseEnterItem(e,node_dict)}}
					onMouseLeave={(e)=>{this.onMouseLeaveItem(e,node_dict)}}
					onClick={(e)=>{this.handleItemClick(e,node_dict)}}>
					{selected_icon}
					<div className="content">
						<div className="ui small header">
							{node_dict.host}
						</div>
						<div className="extra">
							Port: {node_dict.port}
						</div>
					</div>
				</div>
			);
		}

		return item_list;
	}

	render(){
		let getConnectButton = ()=>{
			if (this.state.nodes.length != 0){
				return(
					<button className="ui mini green right floated button my-2"
						onClick={this.handleConnectNodeBtn}>
						Connect To Node
					</button>
				);
			}
		}
		return(
			<div>
				<div className="nodelist_div clearfix m-auto">
					<div className="ui middle aligned selection animated list
						m-auto ">
						{this.renderNodes()}
					</div>
					
				</div>
				{getConnectButton()}
			</div>
		);
	}
}

NodesList.defaultProps={
	nodes:[],
	handleConfModalParams: (function(){})
}