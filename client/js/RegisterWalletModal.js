import React from "react";
import copy from 'copy-to-clipboard';
import FileSaver from "file-saver";

export default class RegisterWalletModal extends React.Component{
	constructor(props){
		super(props);
		this.downloadCreds = this.downloadCreds.bind(this);
		this.copyToClipboard = this.copyToClipboard.bind(this);
		this.handleCopyIconClick = this.handleCopyIconClick.bind(this);
	}

	downloadCreds(){
		let pubAddress = `"${this.props.pubAddress}"`;
		let privAddress = `"${this.props.privAddress}"`;
		let passcode = `"${this.props.passcode}"`;
		//this info is displayed only 1 time during registration
		let cred_dict = `/*Use this information to safely recover your wallet in case you lose 
access to your machine. DO NOT SEND THIS FILE TO ANYONE.*/
{
	"Public Address": ${this.props.pubAddress == "" ? '""' : pubAddress},
	"Private Address": ${this.props.privAddress == "" ? '""' : privAddress},
	"Passcode": ${this.props.passcode == "" ? '""' : passcode}
}`;
		let blob = new Blob([cred_dict],{type:"application/json"});
		FileSaver.saveAs(blob, `TronWallet-${this.props.pubAddress}.json`);
		$("#registerwalletmodal").modal("show");
	}

	copyToClipboard(e,toPersist){
		if (toPersist == undefined || toPersist){
			e.persist();
			copy($(e.target).siblings(".register_wallet_labels").text().trim());
		}else{
			copy($(e).siblings(".register_wallet_labels").text().trim());
		}
		
	}

	handleCopyIconClick(e){
		this.copyToClipboard($(e.target).parent(), false);
	}

	render(){
		return(
			<div className="ui basic modal height_fit_content" id="registerwalletmodal">
				<div className="ui icon header">
					<i className="user secret icon"></i>
					Secret Wallet Credentials
			  	</div>
				<div className="p-5 text_align_center">
					<p>Please write down and save your credentials. If you lose them, you will not be
					able to access your wallet forever.</p>
					<p>This is the last time you will be shown them.</p>
				</div>

				<div className="ui center aligned grid">
					<div className="row">
						<div className="ui left labeled button">
							<label className="ui label">Public Address</label>
							<a className="ui basic label register_wallet_labels">
								{this.props.pubAddress}
							</a>
							<div className="ui icon button" onClick={(e)=>{this.copyToClipboard(e)}}>
								<i className="clipboard check green icon" onClick={this.handleCopyIconClick}/>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="ui left labeled button">
							<label className="ui label">Private Address</label>
							<a className="ui basic label register_wallet_labels">
								{this.props.privAddress}
							</a>
							<div className="ui icon button" onClick={(e)=>{this.copyToClipboard(e)}}>
								<i className="clipboard check green icon" onClick={this.handleCopyIconClick}/>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="ui left labeled button">
							<label className="ui label">Passcode</label>
							<a className="ui basic label register_wallet_labels">
								{this.props.passcode}
							</a>
							<div className="ui icon button" onClick={(e)=>{this.copyToClipboard(e)}}>
								<i className="clipboard check green icon" onClick={this.handleCopyIconClick}/>
							</div>
						</div>
					</div>
				</div>

			  	<div className="actions py-5">
					<div className="ui yellow basic button" onClick={this.downloadCreds}>
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

RegisterWalletModal.defaultProps = {
	pubAddress: "",
	privAddress: "",
	passcode: ""
}