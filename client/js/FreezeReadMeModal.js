import React from "react";

export default class FreezeReadMeModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {};
	}

	render(){
		return(
			<div className="ui modal rounded_corners" id="freeze_readme_modal">
				<div className="p-5">
					<div className="ui icon center aligned header witness_title_color">
						<i className="info circle icon"></i>
						What does Freezing/Unfreezing Involve?
				  	</div>
					<div className="content freeze_description">
						Freezing the account balance allows Tron to mitigate high frequency 
						transactions flooding the network. Freezing is also required if you 
						want to vote for witnesses or execute any sort of contracts.
						<br/>
						Once a certain amount is frozen, you will not be able to send that amount
						to anyone until you unfreeze after the time has expired. Your Entropy and 
						Tron Power will automatically be updated upon time of freezing and unfreezing.
					</div>

					<div className="content pt-4">
						<div className="ui sub header">
							Rules:
						</div>
					</div>
					<div className="ui list bulleted left aligned freeze_description">
						<div className="item">
							The minimum freeze amount is 1 TRX
						</div>
						<div className="item">
							You can only place 1 lock at any given time
						</div>
						<div className="item">
							You get as much Tron Power as you have current frozen
							balance
						</div>
						<div className="item">
							Your Entropy is calculated by the following equation
							<i>(constant * duration * amount_to_freeze)</i>
						</div>
						<div className="item">
							Your Entropy will not be wiped once you unfreeze; it's accumulated
						</div>
						<div className="item">
							Once balance is unfrozen, you previous votes will become void and you 
							will not have Tron Power. Refreezing the balance will make those
							votes active again.
						</div>
						<div className="item">
							You can only send transactions once every 5 minutes if you don't have 
							Entropy. You can gain Entropy by freezing your balance.
						</div>
						<div className="item">
							Contracts that take more than 5 minutes to execute from the last 
							contract execution time will not consume Entropy
						</div>
					</div> 

					<div className="center_button actions">
						<div className="ui green ok inverted vertical button">
							Okay
						</div>
					</div>
				</div>
			</div>
		);	
	}
}

