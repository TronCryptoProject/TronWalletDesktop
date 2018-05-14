import React from "react";

export default class DockMenu extends React.Component {
	constructor(props){
		super(props);
		this.handleDockClick = this.handleDockClick.bind(this);
	}

	handleDockClick(modal_id){
		this.props.handleDockClick(true, modal_id);
	}

	render(){
		return(
			<div className="ui center aligned grid fixed_footer">
				<div className="ten wide column row bottom aligned">
					<div className="three wide column p-0">
						<div className="ui circular icon button dock_btn nodes_btn"
							onClick={(e)=>{this.handleDockClick("#nodes_modal")}}>
							<i className="server large icon"/>
						</div>
						<div className="row color_white">
							Nodes
						</div>
					</div>
					<div className="three wide column p-0">
						<div className="ui circular icon button dock_btn witnesses_btn"
							onClick={(e)=>{this.handleDockClick("#witnesses_modal")}}>
							<i className="linkify large icon"/>
						</div>
						<div className="row color_white">
							Witnesses
						</div>
					</div>
					<div className="three wide column p-0">
						<div className="ui circular icon button dock_btn freeze_btn"
							onClick={(e)=>{this.handleDockClick("#freeze_modal")}}>
							<i className="snowflake outline large icon"/>
						</div>
						<div className="row color_white">
							Freeze Balance
						</div>
					</div>
					<div className="three wide column p-0">
						<div className="ui circular icon button dock_btn backup_btn"
							onClick={(e)=>{this.handleDockClick("#backup_modal")}}>
							<i className="history large icon"/>
						</div>
						<div className="row color_white">
							Backup Keys
						</div>
					</div>
					
				</div>
			</div>
		);
	}
}

DockMenu.defaultProps={
	handleDockClick: (function(){})
}