import React from "react";

export default class NetworkConfirmationModal extends React.Component{
	constructor(props){
		super(props);
	}

	render(){
		return(
			<div className="ui basic modal" id="network_modal">
				<div className="ui icon header">
					<i className="wifi icon"></i>
					Connected to Network
			  	</div>
				<div className="p-5">
					<p>You are not allowed to use cold wallet when connected to the internet.
					For your security and protection, please disconnect from the internet and
					you will be automatically redirected to login.</p>
				</div>
			  	<div className="actions">
					<div className="ui red basic cancel inverted button network_modal_buttons">
				  		<i className="remove icon"></i>
				  		Cancel
					</div>
					<div className="ui green ok inverted vertical animated button"
						id="network_modal_approve_btn">
						
				  		<div className="visible content" >
				  			<i className="checkmark icon"></i>
				  			Check Network Now
				  		</div>
				  		<div className="hidden content">
				  			{`Status: ${this.props.networkStatus}`}
				  		</div>
					</div>
				</div>
			</div>
		);	
	}
}
