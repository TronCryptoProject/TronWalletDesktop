import React from "react";
import ConfModal from "./ConfModal.js";
import FileSaver from "file-saver";
import axios from "axios";
import config from "../config/config.js";
import ReactCodeInput from "react-code-input";
import {BlowfishSingleton} from "Utils.js";
import speakeasy from "speakeasy";

export default class BackupKeys extends React.Component {
	constructor(props){
		super(props);
		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
		this.confModal = this.confModal.bind(this);
		this.handleAcceptConfModal = this.handleAcceptConfModal.bind(this);
		this.getCodeInputConfig = this.getCodeInputConfig.bind(this);
		this.onPasscodeChangeHandler = this.onPasscodeChangeHandler.bind(this);
		this.onAuthCodeChangeHandler = this.onAuthCodeChangeHandler.bind(this);
		this.saveBackupFile = this.saveBackupFile.bind(this);

		this.state={
			modalId: "backup_conf_modal",
			passInputText: "",
			authInputText: "",
			getConfModal: false
		}

		//this.isBackingLock = false;
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


	saveBackupFile(encrypted_data){
		let blob = new Blob([encrypted_data],{type: "text/plain;charset=utf-8"});
		let suffix_file_name = "";
		if (this.props.pubAddress != ""){
			suffix_file_name = "-" + this.props.pubAddress;
		}

		FileSaver.saveAs(blob, `TronWallet${suffix_file_name}.txt`);
	}

	handleAcceptConfModal(e){
		e.persist();

		//if (!this.isBackingLock){
		//	this.isBackingLock = true;

			let button_id = "#" + this.state.modalId + "_accept";
			$(button_id).addClass("loading");

			let showError = (message)=>{
				if (message == undefined || message == null || message == ""){
					message = "Backup failed!";
				}
				$(button_id).removeClass("loading right labeled");
				$(button_id).addClass("red");
				$(button_id).text(message);
				$(button_id).transition("shake");
				setTimeout(()=>{
					$(button_id).removeClass("red");
					$(button_id).addClass("right labeled");
					$(button_id).text("Backup");
					$(button_id).prepend("<i class='checkmark icon'/>");
					//this.isBackingLock = false;
				},2000);
			}

			let showSuccess = ()=>{
				$(button_id).removeClass("loading right labeled");
				$(button_id).addClass("green");
				$(button_id).text("Backup successful!");
				$(button_id).transition("pulse");
				setTimeout(()=>{
					$(button_id).removeClass("green");
					$(button_id).addClass("right labeled");
					$(button_id).text("Backup");
					$(button_id).prepend("<i class='checkmark icon'/>");
					//this.isBackingLock = false;
				},2000);
			}
				
			let pcheck = true;
			if (this.props.pdirty){
				if (this.state.passInputText == ""){
					pcheck = false;
				}
			}

			let ismobileauth = true;
			if (this.props.mobileAuthCode != ""){
				if (this.state.authInputText == ""){
					ismobileauth = false;
				}
			}

			if (ismobileauth && pcheck){
				let is_good = true;
				if (this.props.mobileAuthCode != ""){
					let token_status = speakeasy.totp.verify({
						secret: this.props.mobileAuthCode,
						encoding: "base32",
						token: this.state.authInputText
					})
					if (!token_status){
						is_good = false;
					}
				}

				if (is_good){
					let pass = "******";
					if (this.props.pdirty){
						pass = this.state.passInputText
					}
					let url_dict = {
						password: pass
					};
					let url = "";
					let req = null;
					if (this.props.view != config.views.COLDWALLET){
						url_dict.pubAddress = this.props.pubAddress;
						url = BlowfishSingleton.createPostURL(this.props.view, "POST","backupWallet",
							url_dict);
						req = axios.post;
					}else{
						url = BlowfishSingleton.createPostURL(this.props.view, "GET","backupWallet",
							url_dict);
						req = axios.get;
					}

					req(url)
					.then((res)=>{
						let data = res.data;
						data = BlowfishSingleton.decryptToJSON(data);

						if ("result" in data && data.result == config.constants.SUCCESS){
							showSuccess();
							setTimeout(()=>{
								this.saveBackupFile(res.data);
								$("#" + this.state.modalId).modal("hide");
							},1200);
						}else{
							if ("reason" in data){
								showError(data.reason);
							}else{
								showError();
							}
						}
					})
					.catch((error)=>{
						showError("Request failed :(");
					});


				}else{
					showError("Auth code is incorrect!");
				}
			}else{
				showError("Empty input!");
			}
		//}
		
	}

	handleCloseButtonClick(){
		this.props.handleDockClick(false, "#backup_modal");
	}

	confModal(){
		this.setState({getConfModal: true},()=>{
			$("#"+this.state.modalId).modal({
				blurring: true,
				centered: true,
				inverted: true,
				transition: "scale",
				allowMultiple: true,
				onApprove: ()=>{
					return false;
				},
				onHidden: ()=>{
					this.onPasscodeChangeHandler("");
					this.onAuthCodeChangeHandler("");
					this.setState({getConfModal: false});
				},
				onShow:()=>{
					$("#backup_modal").addClass("blur");
				},
				onHidden:()=>{
					$("#backup_modal").removeClass("blur");
				}
			})
			.modal("show");
		});
		
	}

	render(){
		let getMobileAuthConf = ()=>{
			let padding = "pb-3 ";
			if (this.props.pdirty){
				padding += "pt-5";
			}
			if (this.props.mobileAuthCode){
				return(
					<div className={padding}>
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

		let getPassConf = ()=>{
			if (this.props.pdirty){
				return(
					<div>
						<div className="text_align_center content">
							<div className="ui header cold_wallet_send_card_header">
								Enter your wallet password below
							</div>
						</div>
						<div className="center_button my-3">
							<ReactCodeInput type="number" fields={6} {...this.getCodeInputConfig()}
								onChange={this.onPasscodeChangeHandler}/>
						</div>
					</div>
				);
			}
		}

		let getConfModal = ()=>{
			if (this.state.getConfModal){
				return(
					<div>
						<ConfModal headerText="Do you want to begin backup?"
							message="Your backup will be saved to your computer in a 128 bit encrypted file"
							actions={["deny", "accept"]} actionsText={["Cancel", "Backup"]} id={this.state.modalId}
							handleAcceptConfModal={this.handleAcceptConfModal}>

							{getPassConf()}
							{getMobileAuthConf()}
						</ConfModal>
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
								<b>Remember:</b> Do not email or in any way send your keys to anyone. They are your secret!
							</div>
							<br/>
							<br/>
							<div className="force_meta text_align_center">
								Your backup will store encrypted private key, public address, password and 
								account name into the file.
							</div>
						</div>
					</div>
					<div className="content center_button p-4">
						<button className="positive ui button" onClick={this.confModal}>
							I understand
						</button>
					</div>
				</div>
				{getConfModal()}

			</div>
		);
	}
}

BackupKeys.defaultProps = {
	handleDockClick: (function(){}),
	mobileAuthCode: "",
	pdirty: false,
	pubAddress: "",
	view: config.views.HOTWALLET
}