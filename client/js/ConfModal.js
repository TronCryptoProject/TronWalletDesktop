import React from "react";
import Equal from "deep-equal";

export default class ConfModal extends React.Component {
	constructor(props){
		super(props);
		this.renderActions = this.renderActions.bind(this);

		this.state = {
			actions: this.props.actions
		}
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (!Equal(nextProps.actions, this.props.actions)){
			tmp_dict.actions = nextProps.actions;
		}
		tmp_dict = Object.assign(this.state,tmp_dict);
		this.setState(tmp_dict);

	}

	renderActions(){
		let action_list = [];
		if (this.state.actions.includes("deny")){
			action_list.push(
				<div className="ui red deny basic right labeled icon button" onClick={this.props.handleDenyConfModal}
					key={"deny_conf_modal"}>
					No
					 <i className="close icon"></i>
				</div>
			);
		}
		if (this.state.actions.includes("accept")){
			action_list.push(
				<div className="ui olive positive basic right labeled icon button" onClick={this.props.handleAcceptConfModal}
					key={"accept_conf_modal"}>
					Ok
					<i className="checkmark icon"></i>
				</div>
			);
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
		let headerClass = "text_align_center header " + this.props.headerClass;
		
		return(
			<div className="ui small modal conf_modal" id={this.props.id}>
				<div className={headerClass}>
					{this.props.headerText}
				</div>
				<div className="content">
					<div className="text_align_center description">
						{this.props.message}
					</div>
				</div>
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
	message: "",
	actions: ["deny", "accept"],
	handleDenyConfModal: (function(){}),
	handleAcceptConfModal: (function(){}),
	id: ""
}