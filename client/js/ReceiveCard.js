import React from "react";
import QRCode from "qrcode";
import copy from 'copy-to-clipboard';
import domtoimage from 'dom-to-image';
import FileSaver from "file-saver";
import Equal from "deep-equal";

export default class ReceiveCard extends React.Component{
	constructor(props){
		super(props);
		this.handleReceiveCardTrxChange = this.handleReceiveCardTrxChange.bind(this);
		this.renderReceiveCanvas = this.renderReceiveCanvas.bind(this);
		this.handleAddressCopy = this.handleAddressCopy.bind(this);
		this.handleReceiveSave = this.handleReceiveSave.bind(this);
		

		this.state = {
			receiveAmount: 0,
			accInfo: this.props.accInfo
		};
	}

	componentDidMount(){
		this.renderReceiveCanvas();
	}

	componentWillReceiveProps(nextProps) {
		if (!Equal(this.props.accInfo, nextProps.accInfo)){
			this.setState({accInfo: nextProps.accInfo});
		}
	}

	handleReceiveCardTrxChange(e){
		let curr_val = e.target.value;
		this.setState({receiveAmount: curr_val},()=>{
			this.renderReceiveCanvas();
		})
	}

	handleAddressCopy(e){
		copy(this.state.accInfo.pubAddress)
		$("#receive_pub_address").addClass("green");
		setTimeout(()=>{
			$("#receive_pub_address").removeClass("green");
		},300);
	}

	handleReceiveSave(){
		domtoimage.toBlob(document.getElementById("hotwalletreceivecanvas"))
	    .then(function (blob) {
	        FileSaver.saveAs(blob, 'TronReceiveQRCode.jpg');
	    });
	}


	renderReceiveCanvas(){
		let canvas = $("#hotwalletreceivecanvas")[0];
		let ctx = canvas.getContext("2d");
		let qrobj = {
			address: this.state.accInfo.pubAddress,
			amount: this.state.receiveAmount
		};
		let qrstr = JSON.stringify(qrobj);

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
			getRoundedImage(x, y, (canvas.width - (x*2)), (canvas.height - (y*2)), border_rad);
			ctx.clip();
		    ctx.drawImage(image, x, y,(canvas.width - (x*2)),(canvas.height - (y*2)));
		    ctx.restore();
    	}

		QRCode.toDataURL(qrstr)
		.then(url =>{
			let image = new Image();
			image.src = url;
			image.onload = function(){
				createRect(image, canvas, 5,5, this.width, this.height, 16);
			}
		})
		.catch(err =>{
			let image = new Image();
			image.src = "client/images/blankqrcode.png";
			image.onload = function(){
				createRect(image, canvas, 5,5, this.width, this.height, 16);
			}
		});
	}

	render(){
		return(
			<div className="ui one column centered padded grid">
				<div className="row">
					<div className="ui small header">
						Amount to Receive
					</div>
				</div>
				<div className="row p-0">
					<div className="ui right labeled input">
						<input type="text" className="send_receive_card_input placeholder_left_align" placeholder="0"
							onChange={(e)=>{this.handleReceiveCardTrxChange(e)}}/>
						<div className="ui label receive_right_btn_border">
							TRX
						</div>
					</div>
				</div>
				<div className="row">
					<div className="ui small header">
						Public Address
					</div>
				</div>
				<div className="row p-0">
					<div className="ui left labeled button">
						<div className="ui basic label receive_public_address">
							{this.state.accInfo.pubAddress}
						</div>
						<div className="ui icon button receive_right_btn_border"
							onClick={(e)=>{this.handleAddressCopy(e)}} id="receive_pub_address">
							<i className="copy icon"/>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="hotwallet_canvas_div">
						<canvas id="hotwalletreceivecanvas" className="hotwalletreceivecanvas"/>
					</div>
				</div>
				<div className="row">
					<button className="ui right labeled icon blue button" onClick={this.handleReceiveSave}>
						<i className="save icon"/>
						Save QR Image
					</button>
				</div>
			</div>
		);
	}

}

ReceiveCard.defaultProps = {
	accInfo: {
		accountName : "",
		pubAddress: ""
	}
}