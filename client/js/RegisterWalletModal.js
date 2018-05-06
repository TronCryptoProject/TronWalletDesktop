import React from "react";

export default class RegisterWalletModal extends React.Component{
	constructor(props){
		super(props);
		this.downloadCreds = this.downloadCreds.bind(this);
	}

	downloadCreds(){
		let pub_add = this.props.pubAddress;
		
	}

	render(){
		return(
			<div className="ui basic modal height_fit_content" id="registerwalletmodal">
				<div className="ui icon header">
					<i className="user secret icon"></i>
					Secret Wallet Credentials
			  	</div>
				<div className="p-5">
					<p>Please write down and save your credentials. If you lose them, you will not be
					able to access your wallet forever. This is the last time you will be shown them.</p>
				</div>

				<div className="ui center aligned grid">
					<div className="row">
						<div className="ui left labeled button">
							<label className="ui label">Public Address</label>
							<a className="ui basic label register_wallet_labels">
								2908324908235092834909
							</a>
							<div className="ui icon button">
								<i className="clipboard check green icon"/>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="ui left labeled button">
							<label className="ui label">Private Address</label>
							<a className="ui basic label register_wallet_labels">
								29083224q59i90afjamjdfao[jdf9i02i3424092834909
							</a>
							<div className="ui icon button">
								<i className="clipboard check green icon"/>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="ui left labeled button">
							<label className="ui label">Passcode</label>
							<a className="ui basic label register_wallet_labels">
								290485
							</a>
							<div className="ui icon button">
								<i className="clipboard check green icon"/>
							</div>
						</div>
					</div>
				</div>

			  	<div className="actions py-5">
					<div className="ui violet basic ok button" onClick={this.downloadCreds}>
				  		<i className="download icon"></i>
				  		Download Credentials
					</div>
					<div className="ui green ok inverted vertical animated button">
						
				  		<div className="visible content" >
				  			<i className="checkmark icon"></i>
				  			Go to Wallet
				  		</div>
				  		<div className="hidden content">
				  			I understand!
				  		</div>
					</div>
				</div>
			</div>
		);	
	}
}
