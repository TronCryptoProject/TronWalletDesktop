import React from "react";
import config from "../config/config.js";

export default class DockMenu extends React.Component {
	constructor(props){
		super(props);
		this.handleDockClick = this.handleDockClick.bind(this);
		this.getItem = this.getItem.bind(this);
		this.item_map = {
			[config.views.HOTWALLET]:["nodes","witnesses","freeze","backup"],
			[config.views.WATCHONLY]:["nodes","witnesses","freeze"],
			[config.views.COLDWALLET]:["backup"] 
		};
	}

	handleDockClick(modal_id){
		this.props.handleDockClick(true, modal_id);
	}

	getItem(item_type){
		let nodes = (
			<div className="three wide column p-0" key="nodes">
				<div className="ui circular icon button dock_btn nodes_btn"
					onClick={(e)=>{this.handleDockClick("#nodes_modal")}}>
					<i className="server large icon"/>
				</div>
				<div className="row color_white">
					Nodes
				</div>
			</div>
		);

		let witnesses = (
			<div className="three wide column p-0" key="witnesses">
				<div className="ui circular icon button dock_btn witnesses_btn"
					onClick={(e)=>{this.handleDockClick("#witnesses_modal")}}>
					<i className="linkify large icon"/>
				</div>
				<div className="row color_white">
					Witnesses
				</div>
			</div>
		);

		let freeze = (
			<div className="three wide column p-0" key="freeze">
				<div className="ui circular icon button dock_btn freeze_btn"
					onClick={(e)=>{this.handleDockClick("#freeze_modal")}}>
					<i className="snowflake outline large icon"/>
				</div>
				<div className="row color_white">
					Freeze Balance
				</div>
			</div>
		);

		let backup = (
			<div className="three wide column p-0" key="backup">
				<div className="ui circular icon button dock_btn backup_btn"
					onClick={(e)=>{this.handleDockClick("#backup_modal")}}>
					<i className="history large icon"/>
				</div>
				<div className="row color_white">
					Backup Keys
				</div>
			</div>
		);

		let map = {
			"nodes": nodes,
			"witnesses": witnesses,
			"freeze": freeze,
			"backup": backup
		}

		return map[item_type];
	}

	render(){
		let item_list = this.item_map[this.props.view];
		let item_res_divs = [];
		for(let item_type of item_list){
			item_res_divs.push(this.getItem(item_type));
		}
		return(
			<div className="ui center aligned grid fixed_footer">
				<div className="ten wide column row bottom aligned">
					{item_res_divs}
				</div>
			</div>
		);
	}
}

DockMenu.defaultProps={
	handleDockClick: (function(){}),
	view: config.views.HOTWALLET
}