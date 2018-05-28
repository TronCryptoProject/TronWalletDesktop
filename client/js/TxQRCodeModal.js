import React from "react";
import domtoimage from 'dom-to-image';
import FileSaver from "file-saver";
import QRCode from "qrcode";

export default class TxQRCodeModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {};
		this.handleQRImageSave = this.handleQRImageSave.bind(this);
		this.renderQRCodeCanvas = this.renderQRCodeCanvas.bind(this);
	}

	componentDidMount(){
		this.renderQRCodeCanvas();
	}

	componentWillReceiveProps(nextProps){
		if(this.props.qrdata != nextProps.qrdata){
			this.renderQRCodeCanvas();
		}
	}

	handleQRImageSave(){
		domtoimage.toBlob(document.getElementById("signed_tx_qr_canvas"))
	    .then((blob)=> {
	        FileSaver.saveAs(blob, this.props.filename);
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

    	if (this.props.qrdata != undefined){
    		QRCode.toDataURL(this.props.qrdata)
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
			<div className="ui modal tx_qr_modal conf_modal" id="signed_tx_qrcode_modal">
				<div className="text_align_center header tx_qr_modal_header">
					Signed Transaction QRCode
				</div>
				{getMessageDiv()}
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
		);
	}
}

TxQRCodeModal.defaultProps = {
	message: "",
	filename: "TronTransaction.jpg",
	qrdata: ""
}