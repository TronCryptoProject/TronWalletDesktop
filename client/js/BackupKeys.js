import React from "react";
import ConfModal from "./ConfModal.js";
import FileSaver from "file-saver";
import axios from "axios";
import config from "../config/config.js";
import ReactCodeInput from "react-code-input";


export default class BackupKeys extends React.Component {
	constructor(props){
		super(props);
		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
		this.confModal = this.confModal.bind(this);
		this.handleAcceptConfModal = this.handleAcceptConfModal.bind(this);
		this.getCodeInputConfig = this.getCodeInputConfig.bind(this);
		this.onPasscodeChangeHandler = this.onPasscodeChangeHandler.bind(this);
		this.onAuthCodeChangeHandler = this.onAuthCodeChangeHandler.bind(this);
		this.state={
			modalId: "backup_conf_modal",
			passInputText: "",
			authInputText: ""
		}
	}

	getCodeInputConfig(){
		let code_input_props = {
			inputStyle: {
				fontFamily: "monospace",
			    borderRadius: "50px",
			    border: "3px solid rgba(53, 86, 212, 0.74)",
			    boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 10px 0px",
			    margin: "4px",
			    width: "50px",
			    height: "50px",
			    fontSize: "32px",
			    boxSizing: "border-box",
			    color: "#3316c5",
			    fontWeight: "bolder",
			    textAlign: "center",
			    backgroundColor: "transparent"
			}
		};
		return code_input_props;
	}

	onPasscodeChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({passInputText: val});
		}else{
			this.setState({passInputText: ""});
		}
	}

	onAuthCodeChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({authInputText: val});
		}else{
			this.setState({authInputText: ""});
		}
	}

	handleAcceptConfModal(){
		axios.get(`${config.API_URL}/api/backupWallet/`)
		.then((res)=>{
			let json_obj = res.body;
			if (json_obj.result == "success"){
				//uncomment
				//let encoded_str = window.btoa(JSON.stringify(json_obj));
				//FileSaver.saveAs(encoded_str, 'TronWalletBackup.dat');
			}else{

			}
		})
		.catch((error)=>{
			console.log(error);
		})
		
	}

	handleCloseButtonClick(){
		this.props.handleDockClick(false, "#backup_modal");
	}

	confModal(){
		$("#"+this.state.modalId).modal({
			blurring: true,
			centered: true,
			inverted: true,
			transition: "scale",
			allowMultiple: true,
		})
		.modal("show");
	}

	render(){
		let getMobileAuthConf = ()=>{
			if (this.props.mobileAuthCode){
				return(
					<div className="pt-5 pb-3">
						<div className="text_align_center content">
							<div className="ui header cold_wallet_send_card_header">
								Enter Mobile Auth code below
							</div>
						</div>
						<div className="center_button my-3">
							<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
								onChange={this.onAuthCodeChangeHandler}/>
						</div>
					</div>
				);
			}
		}

		return(
			<div className="ui fullscreen modal fullscreen_modal" id="backup_modal">
				<div className="ui blurring segment fullscreen_modal_segment">
					<div className="content">
						<button className="circular medium ui icon button" onClick={this.handleCloseButtonClick}>
							<i className="close icon"/>
						</button>
					</div>
					<div className="content">
						<h2 className="ui center aligned large icon header map_header_color mt-0">
							<i className="shield alternate icon"/>
							<div className="content">
								Backup Wallet Keys
							</div>
						</h2>
					</div>
					<div className="content p-5">
						<div className="backup_main_message">
							In order to secure your keys in case you forget or misplace them, remember to backup
							your wallet and keep them in a safe place. You can use your keys to open/recover 
							your wallet on another machine in case you are unable to access your current machine.
							<br/>
							<br/>
							<div className="text_align_center">
								Remember: Do not email or in any way send your keys to anyone. They are your secret!
							</div>
						</div>
					</div>
					<div className="content center_button p-4">
						<button className="positive ui button" onClick={this.confModal}>
							I understand
						</button>
					</div>
				</div>
				<ConfModal headerText="Do you want to begin backup?"
					message="Your backup will be saved to your computer in a 128 bit encrypted file"
					actions={["deny", "accept"]} id={this.state.modalId}
					handleAcceptConfModal={this.handleAcceptConfModal}>

					<div className="text_align_center content">
						<div className="ui header cold_wallet_send_card_header">
							Enter your wallet password below
						</div>
					</div>
					<div className="center_button my-3">
						<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
							onChange={this.onPasscodeChangeHandler}/>
					</div>
					{getMobileAuthConf()}
				</ConfModal>

			</div>
		);
	}
}

BackupKeys.defaultProps = {
	handleDockClick: (function(){}),
	mobileAuthCode: false
}