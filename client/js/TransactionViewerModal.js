import React from "react";
import config from "../config/config.js";
import axios from "axios";
import ConfModal from "./ConfModal.js";
import domtoimage from 'dom-to-image';
import FileSaver from "file-saver";
import Equal from "deep-equal";
import ReactCodeInput from "react-code-input";
import {BlowfishSingleton} from "Utils.js";
import QRCode from "qrcode";

export default class TransactionViewerModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			txData: props.txData
		};
		this.isSigning = false;
		this.handleSignTransaction = this.handleSignTransaction.bind(this);
		this.handleQRImageSave = this.handleQRImageSave.bind(this);
		this.renderQRCodeCanvas = this.renderQRCodeCanvas.bind(this);
	}

	componentDidMount(){
		this.renderQRCodeCanvas();
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (!Equal(this.props.txData, nextProps.txData)){
			tmp_dict.txData = nextProps.txData;
		}
		this.setState(tmp_dict, ()=>{
			if (!Equal(tmp_dict,{})){
				this.renderQRCodeCanvas();
			}
		});
	}

	renderQRCodeCanvas(){
		let canvas = $("#signed_tx_qr_canvas")[0];
		let ctx = canvas.getContext("2d");

		let getRoundedImage = (x,y,w,h,r) =>{
		    ctx.beginPath();
		    ctx.moveTo(x + r, y);
		    ctx.lineTo(x+w-r, y);
		    ctx.quadraticCurveTo(x + w,y, x + w,y + r);
		    ctx.lineTo(x +w, y + h-r);
		    ctx.quadraticCurveTo(x + w, y + h,x + w -r, y +h);
		    ctx.lineTo(x +r, y + h);
		    ctx.quadraticCurveTo(x, y + h, x, y +h - r);
		    ctx.lineTo(x,y+ r);
		    ctx.quadraticCurveTo(x, y,x+r,y);
		    ctx.closePath();
    	}

		let createRect = (image, canvas,x, y, width, height, border_rad)=>{
    		ctx.save();
			getRoundedImage(x, y, canvas.width, canvas.height, border_rad);
			ctx.clip();
		    ctx.drawImage(image, x, y,canvas.width,canvas.height);
		    ctx.restore();
    	}

    	if (this.state.txData.data != undefined){
    		QRCode.toDataURL(this.state.txData.data)
			.then(url =>{
				let image = new Image();
				image.src = url;
				image.onload = function(){
					createRect(image, canvas, 0,0, this.width, this.height, 16);
				}
			})
			.catch(err =>{
				let image = new Image();
				image.src = "client/images/blankqrcode.png";
				image.onload = function(){
					createRect(image, canvas, 0,0, this.width, this.height, 16);
				}
			});
    	}else{
    		let image = new Image();
			image.src = "client/images/blankqrcode.png";
			image.onload = function(){
				createRect(image, canvas, 0,0, this.width, this.height, 16);
			}
    	}
		
	}

	handleQRImageSave(){
		domtoimage.toBlob(document.getElementById("signed_tx_qr_canvas"))
	    .then((blob)=> {
	        FileSaver.saveAs(blob, `TronSignedTx-${this.state.txData.txhash}.jpg`);
	    });
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
				},2000);
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
						showSuccess();

						//automatically update new data
						this.setState({txData: data}, ()=>{
							this.renderQRCodeCanvas();

							$("#signed_tx_qrcode_modal")
							.modal({
								allowMultiple: true,
								closable: false,
								onHide: ()=>{
									showSuccess();
								}
							})
							.modal("show");

							//fetch new txs
							this.props.handleUpdateTxs();
						});

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
			let message = `Scan this QRCode in Watch Only wallet to broadcast your transaction. You will 
				not be able to access this QRCode after dismissing this popup, so make sure you save 
				it.`;

			if (this.props.view != config.views.COLDWALLET){
				message = `Scan this QRCode in Cold wallet to sign this transaction. You will 
					not be able to access this QRCode after dismissing this popup, so make sure you save 
					it.`;
			}
			return message;
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
				  	<table className="ui single line fixed definition stackable table rounded_corners tx_info_table">
						<tbody>
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
						<div className="ui red deny vertical icon left labeled button">
							Cancel
							<i className="remove icon"/>
						</div>
						<div className="ui button_tron_blue vertical icon right labeled button"
							onClick={(e)=>{this.handleSignTransaction(e)}} id="tx_modal_submit_button">
							Sign Transaction
							<i className="pencil alternate icon"/>
						</div>
					</div>
				</div>
				<div className="ui modal tx_qr_modal conf_modal" id="signed_tx_qrcode_modal">
					<div className="text_align_center header tx_qr_modal_header">
						Signed Transaction QRCode
					</div>
					<div className="content tx_qr_modal_content">
						<div className="text_align_center description">
							{getQRConfModalMessage()}
						</div>
					</div>
					<div className="content p-3 pb-4 width_100 mx-auto tx_qr_modal_content">
						<div className="mx-auto width_fit_content">
							<canvas id="signed_tx_qr_canvas" className="mb-3" width="300"
								height="300"/>
						</div>
						<div className="row center_button">
							<button className="ui right labeled icon blue button m-0" onClick={this.handleQRImageSave}>
								<i className="save icon"/>
								Save QRCode
							</button>
						</div>
					</div>
					<div className="actions tx_qr_modal_actions center_button">
						<div className="ui green positive right labeled icon button">
							Ok
							<i className="checkmark icon"></i>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

TransactionViewerModal.defaultProps = {
	txData: {},
	mobileAuthCode: "",
	handleUpdateTxs: (function(){}),
	view: config.views.COLDWALLET
}