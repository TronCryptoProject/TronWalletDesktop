import React from "react";
import domtoimage from 'dom-to-image';
import FileSaver from "file-saver";
import QRCode from "qrcode";

export default class TxQRCodeModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			qrdata: props.qrdata,
			imgSrc: ""
		};

		this.getQRCode = this.getQRCode.bind(this);
	}

	componentWillReceiveProps(nextProps){
		console.log("STATE TX: " + this.state.qrdata);
		console.log("NEXT PROPS TX: " + nextProps.qrdata);
		console.log("PROPS RES: " + this.state.qrdata != nextProps.qrdata);
		if(this.state.qrdata != nextProps.qrdata){
			this.setState({qrdata: nextProps.qrdata},()=>{
				console.log("CALLING RENDER");
				this.getQRCode();
			});
		}
	}

	getQRCode(){
    	if (this.state.qrdata != "" && this.state.qrdata != undefined){
    		console.log("QRDATA: " + this.state.qrdata);

    		QRCode.toDataURL(this.state.qrdata)
			.then(url =>{
				console.log("GOT QRURL: "+ url);
				this.setState({imgSrc: url});
			})
			.catch(err =>{
				this.setState({imgSrc: "client/images/blankqrcode.png"});
			});
    	}else{
    		console.log("QRDATA ELSE: " + this.state.qrdata);
    		this.setState({imgSrc: "client/images/blankqrcode.png"});
    	}
		
	}

	render(){
		let getMessageDiv = ()=>{
			if (this.props.message != ""){
				return(
					<div className="content tx_qr_modal_content">
						<div className="text_align_center description">
							{this.props.message}
						</div>
					</div>
				);
			}
		}

		return(
			<div className="ui modal tx_qr_modal conf_modal" id={this.props.id}>
				<div className="text_align_center header tx_qr_modal_header">
					Signed Transaction QRCode
				</div>
				{getMessageDiv()}
				<div className="content p-3 pb-4 width_100 mx-auto tx_qr_modal_content">
					<div className="mx-auto width_fit_content">
						<img src={this.state.imgSrc} id="signed_tx_qr_img" className="mb-3" width="300"
							height="300"/>
					</div>
					<div className="row center_button">
						<a download="Signed_TRX_Transaction.jpg" href={this.state.imgSrc}>
							<button className="ui right labeled icon blue button m-0">
								<i className="save icon"/>
								Save QRCode
							</button>
						</a>
					</div>
				</div>
				<div className="actions tx_qr_modal_actions center_button">
					<div className="ui green positive right labeled icon button">
						Ok
						<i className="checkmark icon"></i>
					</div>
				</div>
			</div>
		);
	}
}

TxQRCodeModal.defaultProps = {
	message: "",
	filename: "TronTransaction.jpg",
	qrdata: "",
	id: "signed_tx_qrcode_modal"
}