import React from "react";
import config from "../config/config.js";
import axios from "axios";
import ConfModal from "./ConfModal.js";
import Equal from "deep-equal";
import ReactCodeInput from "react-code-input";
import {BlowfishSingleton} from "Utils.js";
import TxQrCodeModal from "./TxQrCodeModal.js";

export default class TransactionViewerModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			txData: props.txData
		};
		this.isSigning = false;
		this.handleSignTransaction = this.handleSignTransaction.bind(this);
		this.handleBroadcastTransaction = this.handleBroadcastTransaction.bind(this);
		this.handleCancelClick = this.handleCancelClick.bind(this);
	}


	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		console.log("STATE TX DATA: " + JSON.stringify(this.state.txData));
		console.log("NEXT PROPS TX DATA: " + JSON.stringify(nextProps.txData));
		if (!Equal(this.state.txData, nextProps.txData)){
			tmp_dict.txData = nextProps.txData;
			console.log("Setting new data");
		}
		this.setState(tmp_dict);
	}

	handleCancelClick(){
		this.isSigning = false;
		let button_id = "#tx_modal_submit_button";
		$(button_id).removeClass("red green loading");
		$(button_id).addClass("right labeled button_tron_blue");
		if (this.props.view == config.views.COLDWALLET){
			$(button_id).text("Sign Transaction");
			$(button_id).prepend("<i class='pencil alternate icon'/>");
		}else if (this.props.view == config.views.WATCHONLY){
			$(button_id).text("Broadcast Transaction");
			$(button_id).prepend("<i class='bullhorn icon'/>");
		}
		
		
	}

	handleSignTransaction(e){
		e.persist();
		let button_id = "#tx_modal_submit_button";

		if (!this.isSigning){
			this.isSigning = true;

			$(button_id).addClass("loading");

			let showError = (message)=>{
				if (message == undefined || message == null || message == ""){
					message = "Sign transaction failed!";
				}
				$(button_id).removeClass("loading right labeled");
				$(button_id).addClass("red");
				$(button_id).text(message);
				$(button_id).transition("shake");
				setTimeout(()=>{
					$(button_id).removeClass("red");
					$(button_id).addClass("right labeled");
					$(button_id).text("Sign Transaction");
					$(button_id).prepend("<i class='pencil alternate icon'/>");
					this.isSigning = false;
				},2000);
			}

			let showSuccess = ()=>{
				$(button_id).removeClass("loading right labeled button_tron_blue");
				$(button_id).addClass("green");
				$(button_id).text("Sign transaction Success!");
				$(button_id).transition("pulse");
				setTimeout(()=>{
					$(button_id).addClass("right labeled button_tron_blue");
					$(button_id).text("Sign Transaction");
					$(button_id).prepend("<i class='pencil alternate icon'/>");
					this.isSigning = false;
				},1000);
			}

			
			if (Equal(this.state.txData,{})){
				showError("Transaction data empty!");
			}else{
				let url = BlowfishSingleton.createPostURL(this.props.view, "POST","signTx",{
					hextx: this.state.txData.data
				});

				axios.post(url)
				.then((res)=>{
					let data = res.data;
					data = BlowfishSingleton.decryptToJSON(data);

					if (data.result == config.constants.SUCCESS){
						console.log("Signed: " + JSON.stringify(data));
						
						$("#signed_tx_qrcode_modal")
						.modal({
							allowMultiple: true,
							closable: false,
							onHide: ()=>{
								this.props.handleTxDataLock(data);
								showSuccess();
							}
						})
						.modal("show");

						//fetch new txs
						this.props.handleUpdateTxs();

					}else{
						showError("Failed to sign!");
					}
				})
				.catch((error)=>{
					console.log(error);
					showError("Request failed :(");
				});
			}
		}
	}

	handleBroadcastTransaction(e){
		e.persist();
		let button_id = "#tx_modal_submit_button";

		if (!this.isSigning){
			this.isSigning = true;

			$(button_id).addClass("loading");

			let showError = (message)=>{
				if (message == undefined || message == null || message == ""){
					message = "Broadcast failed!";
				}
				$(button_id).removeClass("loading right labeled button_tron_blue");
				$(button_id).addClass("red");
				$(button_id).text(message);
				$(button_id).transition("shake");
				setTimeout(()=>{
					$(button_id).removeClass("red");
					$(button_id).addClass("right labeled button_tron_blue");
					$(button_id).text("Broadcast Transaction");
					$(button_id).prepend("<i class='bullhorn icon'/>");
					this.isSigning = false;
				},2000);
			}

			let showSuccess = ()=>{
				$(button_id).removeClass("loading right labeled button_tron_blue");
				$(button_id).addClass("green");
				$(button_id).text("Broadcast Successful!");
				$(button_id).transition("pulse");
				setTimeout(()=>{
					$(button_id).addClass("right labeled button_tron_blue");
					$(button_id).text("Broadcast Transaction");
					$(button_id).prepend("<i class='bullhorn icon'/>");
					this.isSigning = false;
				},2000);
			}

			
			if (Equal(this.state.txData,{})){
				showError("Transaction data empty!");
			}else{
				let url = BlowfishSingleton.createPostURL(this.props.view, "POST","broadcastTx",{
					hextx: this.state.txData.data,
					pubAddress: this.props.pubAddress
				});

				axios.post(url)
				.then((res)=>{
					let data = res.data;
					data = BlowfishSingleton.decryptToJSON(data);
					console.log("Broadcasted: " + JSON.stringify(data));
					if (data.result == config.constants.SUCCESS){
						showSuccess();
					}else{
						showError("Failed to broadcast!");
					}
				})
				.catch((error)=>{
					console.log(error);
					showError("Request failed :(");
				});
			}
		}
	}


	render(){
		let parseTimestamp = ()=>{
			if (this.state.txData.timestamp == ""){
				return(
					<div className="force_meta">
						will be updated when transaction is signed
					</div>
				);
			}else{
				return (this.state.txData.timestamp);
			}
		}

		let getQRConfModalMessage = ()=>{
			let message = "";
			if (this.props.view == config.views.COLDWALLET){
				message = `Scan this QRCode in Watch Only wallet to broadcast your transaction. You will 
					not be able to access this QRCode after dismissing this popup, so make sure you save 
					it.`;
			}
			return message;
		}

		let getTransferContractInfo = ()=>{
			if (this.props.view == config.views.COLDWALLET || (this.state.txData.contractType != "" &&
				this.state.txData.contractType == "TransferContract")){
				return(
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
				);
			}
		}

		let getContractType = ()=>{
			if (this.props.view != config.views.COLDWALLET){
				return(
					<tr>
						<td className="four wide">
							Contract Type
						</td>
						<td>
							{this.state.txData.contractType}
						</td>
					</tr>
				);
			}
		}

		let getSubmitButton = ()=>{
			if (this.props.view == config.views.COLDWALLET){
				return(
					<div className="ui button_tron_blue vertical icon right labeled button"
						onClick={(e)=>{this.handleSignTransaction(e)}} id="tx_modal_submit_button">
						Sign Transaction
						<i className="pencil alternate icon"/>
					</div>
				);
			}else{
				return(
					<div className="ui button_tron_blue vertical icon right labeled button"
						onClick={(e)=>{this.handleBroadcastTransaction(e)}} id="tx_modal_submit_button">
						Broadcast Transaction
						<i className="bullhorn icon"/>
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
			  		{getTransferContractInfo()}
				  	<table className="ui single line fixed definition stackable table rounded_corners tx_info_table">
						<tbody>
							{getContractType()}
							<tr>
								<td className="four wide">
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
									{parseTimestamp()}
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
									Total Signatures
								</td>
								<td className="clearfix">
									{this.state.txData.signatures ? this.state.txData.signatures.length:0}
								</td>
							</tr>
							<tr>
								<td>
									Signatures
								</td>
								<td className="clearfix">
									{JSON.stringify(this.state.txData.signatures)}
								</td>
							</tr>
							<tr>
								<td>
									Status
								</td>
								<td>
									{this.state.txData.timestamp == "" ? "pending": this.state.txData.status}
								</td>
							</tr>
						</tbody>
					</table>
					
					<div className="center_button actions mt-5">
						<div className="ui red deny vertical icon left labeled button"
							onClick={this.handleCancelClick}>
							Cancel
							<i className="remove icon"/>
						</div>
						{getSubmitButton()}
					</div>
				</div>
				<TxQrCodeModal message={getQRConfModalMessage()}
					filename={`TronSignedTx-${this.state.txData.txhash}.jpg`}
					qrdata={this.state.txData.data}/>
			</div>
		);
	}
}

TransactionViewerModal.defaultProps = {
	txData: {},
	handleUpdateTxs: (function(){}),
	view: config.views.COLDWALLET,
	pubAddress: "",
	handleTxDataLock: (function(){})
}