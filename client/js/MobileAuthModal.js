import React from "react";
import ReactCodeInput from "react-code-input";

export default class MobileAuthModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {};
		this.handleCheckCode = this.handleCheckCode.bind(this);
	}

	handleCheckCode(){

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
				  		<ReactCodeInput type="number" fields={6} {...code_input_props}/>
				  	</div>

				  	<div className="content mt-5">
				  		<div className="extra freeze_description text_align_center">
				  			In order to validate your transaction and protect your identity,
				  			we use mobile authentication to make sure that this is a 
				  			legitimate request.
				  		</div>
				  	</div>
				</div>
				<div className="center_button actions">
					<div className="ui red deny inverted vertical icon left labeled button">
						Cancel
						<i className="remove icon"/>
					</div>
					<div className="ui green ok inverted vertical icon right labeled button"
						onClick={this.handleCheckCode}>
						Validate
						<i className="check icon"/>
					</div>
				</div>
			</div>
		);
	}
}

MobileAuthModal.defaultProps = {

}