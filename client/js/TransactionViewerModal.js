import React from "react";
import config from "../config/config.js";
import axios from "axios";
import ConfModal from "./ConfModal.js";
import domtoimage from 'dom-to-image';
import FileSaver from "file-saver";
import Equal from "deep-equal";
import ReactCodeInput from "react-code-input";
import {BlowfishSingleton} from "Utils.js";

export default class TransactionViewerModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			txData: props.txData,
			txToken: props.txToken,
			token: ""
		};
		this.isSigning = false;
		this.onChangeHandler = this.onChangeHandler.bind(this);
		this.handleSignTransaction = this.handleSignTransaction.bind(this);
		this.getConfModalProps = this.getConfModalProps.bind(this);
		this.handleQRImageSave = this.handleQRImageSave.bind(this);
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (!Equal(this.props.txData, nextProps.txData)){
			tmp_dict.txData = nextProps.txData;
		}
		if(!Equal(this.props.txToken, nextProps.txToken)){
			tmp_dict.txToken = nextProps.txToken;
		}
		this.setState(tmp_dict);
	}

	onChangeHandler(val){
		if (val.length >= 6){
			val = val.substring(0,6);
			this.setState({token: val});
		}else{
			this.setState({token: ""});
		}
	}

	getConfModalProps(){
		return{
			headerText: "Signed Transaction QRCode",
			message: `Scan this QRCode in Watch Only wallet to broadcast your transaction. You will 
				not be able to access this QRCode after dismissing this popup, so make sure you save 
				it.`,
			actions: ["accept"],
			id: "signed_tx_qrcode_modal"
		};
	}

	handleQRImageSave(){
		domtoimage.toBlob(document.getElementById("signed_tx_qr_canvas"))
	    .then(function (blob) {
	        FileSaver.saveAs(blob, `TronSignedTx-${this.state.txData.txhash}.jpg`);
	    });
	}

	handleSignTransaction(e){
		e.persist();
		if (!this.isSigning){
			this.isSigning = true;

			$(e.target).addClass("loading");

			let showError = (message)=>{
				if (message == undefined || message == null || message == ""){
					message = "Sign transaction failed!";
				}
				$(e.target).removeClass("loading right labeled");
				$(e.target).addClass("red");
				$(e.target).text(message);
				$(e.target).transition("shake");
				setTimeout(()=>{
					$(e.target).removeClass("red");
					$(e.target).addClass("right labeled");
					$(e.target).text("Sign Transaction");
					$(e.target).prepend("<i class='pencil alternate icon'/>");
					this.isSigning = false;
				},2000);
			}

			let showSuccess = ()=>{
				$(e.target).removeClass("loading right labeled");
				$(e.target).addClass("green");
				$(e.target).text("Sign transaction Success!");
				$(e.target).transition("pulse");
				//don't click again; transaction was already processed
				$(e.target).addClass("disabled");
				setTimeout(()=>{
					$(e.target).removeClass("green");
					$(e.target).addClass("right labeled");
					$(e.target).prepend("<i class='pencil alternate icon'/>");
					$(e.target).text("Sign Transaction");
					this.isSigning = false;
				},2000);
			}

			let is_good = true;
			if (this.props.mobileAuthCode != ""){
				let token_status = speakeasy.totp.verify({
					secret: this.props.mobileAuthCode,
					encoding: "base32",
					token: this.state.token
				})
				if (!token_status){
					is_good = false;
				}
			}
			
			if (is_good){
				if (Equal(this.state.txData,{})){
					showError("Transaction data empty!");
				}else{
					let url = BlowfishSingleton.createPostURL(this.props.view, "POST","signTx",{
						password: this.state.txToken,
						hextx: this.state.txData.data
					});


					axios.post(url)
					.then((res)=>{
						let data = res.data;
						data = BlowfishSingleton.decryptToJSON(data);

						if (data.result == config.constants.SUCCESS){
							showSuccess();
							//automatically update new data
							this.state({txData: data}, ()=>{
								$("#signed_tx_qrcode_modal")
								.modal({
									allowMultiple: true,
									closable: false
								})
								.modal("show");

								this.props.handleUpdateTxs();
							});

						}else{
							showError("Failed to sign!");
						}
					})
					.catch((error)=>{
						console.log(error);
						showError("Failed to make request!");
					});
				}

			}else{
				showError("Auth code is incorrect!");
			}
		}
	}

	render(){
		let code_input_props = {
			inputStyle: {
				fontFamily: "monospace",
			    borderRadius: "40px",
			    border: "3px solid rgba(53, 86, 212, 0.74)",
			    boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 10px 0px",
			    margin: "4px",
			    width: "40px",
			    height: "40px",
			    fontSize: "28px",
			    boxSizing: "border-box",
			    color: "#3316c5",
			    fontWeight: "bolder",
			    textAlign: "center",
			    backgroundColor: "transparent"
			}
		};

		let getMobileAuthInput = ()=>{
			if (this.props.mobileAuthCode){
				return(
					<div>
						<div className="row mb-3">
							<div className="ui small header text_align_center width_100">
								Mobile Auth Code
							</div>
						</div>
						<div className="row">
							<div className="content center_button">
						  		<ReactCodeInput type="number" fields={6} {...code_input_props}
						  			onChange={this.onChangeHandler}/>
						  	</div>
						</div>
					</div>
				);
			}
		}

		return(
			<div className="ui modal rounded_corners" id="tx_viewer_modal">
				<div className="p-5">
					<div className="ui center aligned large header witness_title_color">
						<i className="list alternate icon"></i>
						Validate Transaction Info
				  	</div>
			  		<div className="ui one column centered padded grid">
						<div className="two column row">
							<div className="ten wide column">
								<div className="ui one column grid">
									<div className="row pb-0">
										<div className="content">
											<div className="ui header">
												FROM:
											</div>
											<div className="meta">
												{this.state.txData.from}
											</div>
										</div>
									</div>
									<div className="row">
										<div className="content">
											<div className="ui header">
												To:
											</div>
											<div className="meta">
												{this.state.txData.to}
											</div>
										</div>
									</div>
								</div>
								
								
							</div>
							<div className="six wide middle aligned column">

								<div className="ui statistic m-0">
									<div className="label">
										Amount
									</div>
									<div className="value statistic_value_green">
										{this.state.txData.amount ? this.state.txData.amount : 0}
									</div>
									<div className="label statistic_value_green">
										TRX
									</div>
								</div>
							</div>
						</div>
					</div>
				  	<table className="ui single line definition stackable table rounded_corners">
						<tbody>
							<tr>
								<td>
									Raw Transaction Data
								</td>
								<td>
									{this.state.txData.data}
								</td>
							</tr>
							<tr>
								<td>
									Timestamp
								</td>
								<td>
									{this.state.txData.timestamp}
								</td>
							</tr>
							<tr>
								<td>
									Transaction Hash
								</td>
								<td>
									{this.state.txData.txhash}
								</td>
							</tr>
							<tr>
								<td>
									Signatures
								</td>
								<td>
									{this.state.txData.signatures}
								</td>
							</tr>
							<tr>
								<td>
									Status
								</td>
								<td>
									{this.state.txData.status}
								</td>
							</tr>
						</tbody>
					</table>
					{getMobileAuthInput()}
					<div className="center_button actions mt-5">
						<div className="ui red deny inverted vertical icon left labeled button">
							Cancel
							<i className="remove icon"/>
						</div>
						<div className="ui green ok inverted vertical icon right labeled button"
							onClick={(e)=>{this.handleSignTransaction(e)}}>
							Sign Transaction
							<i className="pencil alternate icon"/>
						</div>
					</div>
				</div>
				<ConfModal {...this.getConfModalProps()}>
					<canvas id="signed_tx_qr_canvas" className="hotwalletreceivecanvas"/>
					<div className="row">
						<button className="ui right labeled icon blue button" onClick={this.handleQRImageSave}>
							<i className="save icon"/>
							Save QRCode
						</button>
					</div>
				</ConfModal>
			</div>
		);
	}
}

TransactionViewerModal.defaultProps = {
	txData: {},
	txToken: "",
	mobileAuthCode: "",
	handleUpdateTxs: (function(){}),
	view: config.views.COLDWALLET
}