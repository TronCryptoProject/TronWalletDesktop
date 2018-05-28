import React from "react";
import ReactCodeInput from "react-code-input";
import speakeasy from "speakeasy";

export default class MobileAuthModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			token: ""
		};
		this.handleCheckCode = this.handleCheckCode.bind(this);
		this.onChangeHandler = this.onChangeHandler.bind(this);
	}

	onChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({token: val});
		}else{
			this.setState({token: ""});
		}
	}

	handleCheckCode(){
		let button_id = "#mobile_auth_modal_validate_btn";

		let showError = (message)=>{
			if (message == undefined || message == null || message == ""){
				message = "Validation failed!";
			}
			$(button_id).removeClass("loading right labeled");
			$(button_id).addClass("red");
			$(button_id).text(message);
			$(button_id).transition("shake");
			setTimeout(()=>{
				$(button_id).removeClass("red");
				$(button_id).addClass("right labeled");
				$(button_id).text("Validate");
				$(button_id).prepend("<i class='check icon'/>");
			},2000);
		}

		let showSuccess = ()=>{
			$(button_id).removeClass("loading right labeled");
			$(button_id).text("Authenticated!");
			$(button_id).transition("pulse");
		}

		if (this.state.token == ""){
			showError("Input empty!");
		}else{
			let is_good = true;
			let token_status = speakeasy.totp.verify({
				secret: this.props.mobileAuthCode,
				encoding: "base32",
				token: this.state.token
			})
			if (!token_status){
				is_good = false;
			}
					
			if (is_good){
				showSuccess();
				this.props.handleOnSuccess();
			}else{
				showError();
			}
		}
		
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
		};

		return(
			<div className="ui modal rounded_corners" id="mobile_auth_modal">
				<div className="p-5">
					<div className="ui icon center aligned large header green">
						<i className="shield alternate icon"></i>
						Mobile Auth Confirmation
				  	</div>
				  	<div className="content text_align_center">
				  		<div className="ui header">
				  			Please enter your authentication code from Google Authenticator
				  		</div>
				  	</div>
				  	
				  	<div className="content my-5 center_button">
				  		<ReactCodeInput type="number" fields={6} {...code_input_props}
				  			onChange={this.onChangeHandler}/>
				  	</div>

				  	<div className="content mt-5">
				  		<div className="meta freeze_description text_align_center">
				  			In order to validate your transaction and protect your identity,
				  			we use mobile authentication to make sure that this is a 
				  			legitimate request.
				  		</div>
				  	</div>
				</div>
				<div className="center_button actions">
					<div className="ui red custom_red_conf_button deny inverted vertical icon left labeled button">
						Cancel
						<i className="remove icon"/>
					</div>
					<div className="ui green custom_red_conf_button positive inverted vertical icon right labeled button"
						onClick={this.handleCheckCode} id="mobile_auth_modal_validate_btn">
						Validate
						<i className="check icon"/>
					</div>
				</div>
			</div>
		);
	}
}

MobileAuthModal.defaultProps = {
	handleOnSuccess: (function(){}),
	mobileAuthCode: ""
}