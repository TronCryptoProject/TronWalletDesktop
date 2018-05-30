import React from "react";
import QRCode from "qrcode";
import config from "../config/config.js";
import ReactCodeInput from "react-code-input";
import speakeasy from "speakeasy";
import jetpack from "fs-jetpack";
import copy from 'copy-to-clipboard';

export default class GoogleAuth extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			qrcodeData: "",
			qrcode: "",
			qrcodeCopied: false,
			token: "",
			tokenVerified: ""
		};
		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.generateCode = this.generateCode.bind(this);
		this.handleGenerateDismissCick = this.handleGenerateDismissCick.bind(this);
		this.renderMainHeader = this.renderMainHeader.bind(this);
		this.renderQRCheck = this.renderQRCheck.bind(this);
		this.renderQRShapeSideMain = this.renderQRShapeSideMain.bind(this);
		this.renderQRShapeSideFlip = this.renderQRShapeSideFlip.bind(this);
		this.handleQRCodeCopy = this.handleQRCodeCopy.bind(this);
		this.handleCheckCode = this.handleCheckCode.bind(this);
		this.onChangeHandler = this.onChangeHandler.bind(this);
	}

	onChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({token: val},()=>{
				this.handleCheckCode();
			});
		}else{
			this.setState({token: ""});
		}
	}
	componentDidMount(){
		$("#qr_shape").shape();
	}

	handleBackButtonClick(){
		this.props.handleBackButtonClick();
	}

	handleGenerateDismissCick(){
		$("#qr_shape").shape("flip back");
	}

	handleCheckCode(){
		let read_data = jetpack.read(config.walletConfigFile, "json");
		if (!read_data || !("mobileAuthCode" in read_data)){
			$("#qrcheck_modal").modal({
				blurring: true,
				closable: true
			})
			.modal("show");
		}else{
			let token_status = speakeasy.totp.verify({
				secret: read_data.mobileAuthCode,
				encoding: "base32",
				token: this.state.token
			})

			if (token_status){
				this.setState({tokenVerified: "success"},()=>{
					$("#token_check_btn").transition('pulse');
					setTimeout(()=>{
						this.setState({tokenVerified: ""});
					},1000);
				});
			}else{
				this.setState({tokenVerified: "failed"},()=>{
					$("#token_check_btn").transition('shake');
					setTimeout(()=>{
						this.setState({tokenVerified: ""});
					},1000);
				});
			}
		}

		
	}

	handleQRCodeCopy(){
		copy(this.state.qrcode);
		this.setState({qrcodeCopied: true},()=>{
			setTimeout(()=>{
				this.setState({qrcodeCopied: false});
			}, 700);
		});
	}

	generateCode(){
		$("#generate_button").addClass("loading");

		let mobilecode = speakeasy.generateSecret({length: 20});

		if (jetpack.exists(config.walletConfigFile) == "file"){
			let read_data = jetpack.read(config.walletConfigFile, "json");
			read_data.mobileAuthCode = mobilecode.base32;
			jetpack.write(config.walletConfigFile, read_data);
		}else{
			let data = {
				mobileAuthCode: mobilecode.base32
			};
			jetpack.write(config.walletConfigFile, data, { atomic: true });
		}

		QRCode.toDataURL(mobilecode.otpauth_url, (error, img_data)=>{
			if (!error){
				setTimeout(()=>{
					$("#generate_button").removeClass("loading");
					
					this.setState({qrcodeData: img_data, qrcode:mobilecode.base32},()=>{
						$("#qr_shape").shape("flip over");
					});
				}, 1000);
				this.props.handleMobileAuthGenerated(mobilecode.base32);
			}
		});

		
	}

	renderMainHeader(){
		return (
			<div className="three column row">
				<div className="two wide column">
					<button className="circular medium ui icon button" onClick={this.handleBackButtonClick}>
						<i className="arrow left icon"/>
					</button>
				</div>
				<div className="thirteen wide column">
					<div className="ui grid">
						<div className="ui one column page centered padded grid">
							<div className="row m-0 p-0">
								<img className="ui icon" src="client/images/securityauth.png" width="90" height="90"/>
							</div>
							<div className="row m-0 p-0">
								<h2 className="ui header">
									Two Factor Authentication
									<div className="sub header">
										with Google Authenticator
									</div>
								</h2>
							</div>
						</div>
					</div>
				</div>
				<div className="one wide column"/>
			</div>
		);
	}

	renderQRCheck(){
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

		let getTokenVerifyButton = ()=>{
			if (this.state.tokenVerified == "success"){
				return(
					<button className="ui icon green button" id="token_check_btn">
						<i className="check icon"/>
					</button>
				);
			}else if (this.state.tokenVerified == "failed"){
				return(
					<button className="ui icon red button" id="token_check_btn">
						<i className="remove icon"/>
					</button>
				);
			}else{
				return (
					<button className="ui right labeled icon button test_button"
						onClick={this.handleCheckCode} id="token_check_btn">
						Check
						<i className="chevron right icon"/>
					</button>
				);
			}
		};

		return(
			<div className="column">
				<div className="ui grid">
					<div className="ui one column page centered padded grid">
						<div className="row">
							<h2 className="ui header">
								Test Code
							</h2>
						</div>
						<div className="row">
							<ReactCodeInput type="number" fields={6} {...code_input_props}
								onChange={this.onChangeHandler}/>
						</div>
						<div className="row">
							{getTokenVerifyButton()}
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderQRShapeSideMain(){
		return(
			<div className="side active" id="generate_main_side">
				<div className="ui one column page centered padded grid">
					<div className="row">
						<h2 className="ui header">
							Generate Code
						</h2>
					</div>
					<div className="row">
						<img src="client/images/mobileauthplain.png" width="170" height="155"/>
					</div>
					<div className="row">
						<button className="ui labeled icon button generate_button" onClick={this.generateCode}
							id="generate_button">
							<i className="qrcode icon"/>
							Generate
						</button>
					</div>
				</div>
			</div>
		);
	}

	renderQRShapeSideFlip(){
		let getCopyIcon = ()=>{
			if (this.state.qrcodeCopied){
				return (<i className="clipboard check green icon"/>);
			}else{
				return (<i className="clipboard outline icon"/>);
			}
		};

		return(
			<div className="side" id="generate_qr_side">
				<div className="ui raised_qr_card card">
					<div className="ui left labeled button" tabIndex="0">
						<a className="ui basic label qrcard_qr_label">
							{this.state.qrcode}
						</a>
						<div className="ui icon button" onClick={this.handleQRCodeCopy}>
							{getCopyIcon()}
						</div>
					</div>
					<div className="image">
						<img src={this.state.qrcodeData} className="qrcode_image"/>
					</div>
					<div className="ui bottom attached button" onClick={this.handleGenerateDismissCick}>
							Dismiss
					</div>
				</div>
			</div>
		);
	}

	render(){
		
		return(
			<div className="draggable blue_gradient_background" id="googleauthview">
				<div className="ui grid">
					{this.renderMainHeader()}

					<div className="row">
						<div className="ui one column page centered padded grid">
							<div className="three column row">
								<div className="two wide column"/>
								<div className="thirteen wide center aligned column">
									<p>
										Enable mobile authentication for better security of your wallet.
										You will be asked to verify transactions through mobile before
										broadcasting them whether your wallet is online or offline. No one
										will be able to send fraudulent transactions or drain your wallet
										even if your private key is stolen as long as mobile auth is enabled.
									</p>
								</div>
								<div className="one wide column"/>
							</div>
						</div>
					</div>

					<div className="two column row">
						<div className="center aligned column">
							<div className="ui shape" id="qr_shape">
								<div className="centered sides">
									{this.renderQRShapeSideMain()}
									{this.renderQRShapeSideFlip()}	
								</div>
							</div>
						</div>
						{this.renderQRCheck()}
					</div>
				</div>
				<QRCheckModal/>
			</div>
		);
	}
}

class QRCheckModal extends React.Component{
	constructor(props){
		super(props);
	}

	render(){
		return(
			<div className="ui basic modal" id="qrcheck_modal">
				<div className="ui icon header">
					<i className="exclamation circle icon"></i>
					No Registration
			  	</div>
				<div className="p-5">
					<p>QR Code is not registered with Google Auth. Please first generate QR Code and then 
					test to confirm registeration.</p>
				</div>
			  	<div className="actions">
					<div className="ui green ok button">
				  		<i className="remove icon"></i>
				  		Okay
					</div>
				</div>
			</div>
		);	
	}
}

GoogleAuth.defaultProps = {
	handleBackButtonClick: (function(){}),
	handleMobileAuthGenerated: (function(){})
}