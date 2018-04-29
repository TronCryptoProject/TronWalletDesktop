import React from "react";
import QRCode from "qrcode";
import config from "../config/config.js";
import ReactCodeInput from "react-code-input";
import speakeasy from "speakeasy";
import jetpack from "fs-jetpack";

export default class GoogleAuth extends React.Component{
	constructor(props){
		super(props);
		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.generateCode = this.generateCode.bind(this);
	}

	handleBackButtonClick(){
		this.props.handleBackButtonClick();
	}

	generateCode(){
		let mobilecode = speakeasy.generateSecret({length: 20});
		
		if (jetpack.file(config.walletConfigFile)){
			let read_data = jetpack.read(config.walletConfigFile, "json");
			read_data.mobileAuthCode = mobilecode.base32;
			jetpack.write(config.walletConfigFile, read_data, { atomic: true });
		}else{
			let data = {
				mobileAuthCode: mobilecode.base32
			};
			jetpack.write(config.walletConfigFile, data, { atomic: true });
		}

		QRCode.toDataURL(mobilecode.otpauth_url, (error, img_data)=>{

		});
	}

	render(){
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
		}
		return(
			<div className="draggable blue_gradient_background" id="googleauthview">
				<div className="ui grid">
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
						<div className="one wide column"></div>
					</div>

					<div className="row"/>

					<div className="two column row">
						<div className="column">
							<div className="ui grid">
								<div className="ui one column page centered padded grid">
									<div className="row">
										<h2 className="ui header">
											Generate Code
										</h2>
									</div>
									<div className="row">
										<img src="client/images/mobileauthplain.png" width="120" height="110"/>
									</div>
									<div className="row">
										<button className="ui labeled icon button generate_button" onClick={this.generateCode}>
											<i className="qrcode icon"/>
											Generate
										</button>
									</div>
								</div>
							</div>
						</div>

					

						<div className="column">
							<div className="ui grid">
								<div className="ui one column page centered padded grid">
									<div className="row">
										<h2 className="ui header">
											Test Code
										</h2>
									</div>
									<div className="row">
										<ReactCodeInput type="number" fields={6} {...code_input_props}/>
									</div>
									<div className="row">
										<button className="ui right labeled icon button test_button">
											Check
											<i className="chevron right icon"/>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					
				</div>
			</div>
		);
	}
}

GoogleAuth.defaultProps = {
	handleBackButtonClick: (function(){})
}