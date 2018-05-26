import React from "react";
import Equal from "deep-equal";

export default class ConfModal extends React.Component {
	constructor(props){
		super(props);
		this.renderActions = this.renderActions.bind(this);

		this.action_map = {
			"deny": 0,
			"accept": 1
		}
		this.state = {
			actions: this.props.actions,
			actionsText: this.props.actionsText
		}
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (!Equal(nextProps.actions, this.props.actions)){
			tmp_dict.actions = nextProps.actions;
		}
		if (!Equal(nextProps.actionsText, this.props.actionsText)){
			tmp_dict.actionsText = nextProps.actionsText;
		}
		tmp_dict = Object.assign(this.state,tmp_dict);
		this.setState(tmp_dict);

	}

	renderActions(){
		let action_list = [];

		for(let i = 0; i < this.state.actions.length; i++){
			if (this.state.actions[i] == "deny"){
				action_list.push(
					<div className="ui red custom_red_conf_button deny inverted right labeled icon button" 
						onClick={(e)=>{this.props.handleDenyConfModal(e)}}
						key={"deny_conf_modal"}
						id={this.props.id + "_deny"}>
						{this.state.actionsText[this.action_map[this.state.actions[i]]]}
						 <i className="close icon"></i>
					</div>
				);
			}else if (this.state.actions[i] == "accept"){
				action_list.push(
					<div className="ui green custom_red_conf_button positive inverted right labeled icon button"
						onClick={(e)=>{this.props.handleAcceptConfModal(e)}}
						key={"accept_conf_modal"}
						id={this.props.id + "_accept"}>
						{this.state.actionsText[this.action_map[this.state.actions[i]]]}
						<i className="checkmark icon"></i>
					</div>
				);
			}
		}
		
		return action_list;
	}

	render(){
		let getPropsChildren = ()=>{
			if (this.props.children != undefined){
				return (
					<div>
						{this.props.children}
					</div>
				);
			}
		}
		let getMessageDiv = ()=>{
			if (this.props.message.trim() != ""){
				return(
					<div className="content">
						<div className="text_align_center description">
							{this.props.message}
						</div>
					</div>
				);
			}
		}
		let getHeader = ()=>{
			if (this.props.headerText != ""){
				let headerClass = "text_align_center header ";
				if (this.props.headerClass && this.props.headerClass != ""){
					headerClass += this.props.headerClass;
				}
				return(
					<div className={headerClass}>
						{this.props.headerText}
					</div>
				);
			}
		}
		
		let modalClass = "ui small modal conf_modal ";
		if (this.props.modalClass && this.props.modalClass != ""){
			modalClass += this.props.modalClass;
		}

		return(
			<div className={modalClass} id={this.props.id}>
				{getHeader()}
				{getMessageDiv()}
				{getPropsChildren()}
				<div className="actions">
					{this.renderActions()}
				</div>
			</div>
		);
	}
}

ConfModal.defaultProps={
	headerText: "",
	headerClass: "",
	modalClass: "",
	message: "",
	actions: ["deny", "accept"],
	actionsText: ["No","Ok"],
	handleDenyConfModal: (function(){}),
	handleAcceptConfModal: (function(){}),
	id: ""
}