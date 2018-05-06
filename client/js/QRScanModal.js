import React from "react";
import Instascan from "instascan";

export default class QRScanModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			error : "",
			startCamera: false //don't start when this module is imported; wait for command
		}
		this.addQRListener = this.addQRListener.bind(this);
		this.checkCameras = this.checkCameras.bind(this);
		this.showErrorModal = this.showErrorModal.bind(this);
		this.startStopCamera = this.startStopCamera.bind(this);

		this.qrscanner = null;
	}

	componentDidMount(){
		$("#qrcheckicon").transition("hide");
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.startCamera != this.props.startCamera){
			this.setState({startCamera: nextProps.startCamera},()=>{
				this.startStopCamera();
			});
		}
	}

	startStopCamera(){
		if (this.state.startCamera){
			this.qrscanner = new Instascan.Scanner({video:document.getElementById("qrvideo")});
			this.addQRListener();
			this.checkCameras();
		}else{
			if (this.qrscanner != null){
				this.qrscanner.stop()
				.then((res)=>{
					$("#qrcheckicon").transition("hide");
				})
				.catch((error)=>{
					let error_str = "Unable to Stop the Camera: " + error;
					this.setState({error: error},()=>{
						this.showErrorModal();
					});
				});
			}
		}
		
	}

	addQRListener(){
		this.qrscanner.addListener("scan", (content)=>{
			console.log(content);
			$("#qrcheckicon")
			.transition({
				animation: "fade up",
				duration: "0.8s",
				onComplete : ()=> {
					this.props.handleQRCallback(content);
				}
			});
			
		});
	}

	showErrorModal(){
		$("#camera_error_modal")
		.modal({
			blurring: true
		})
		.modal("show");
	}

	checkCameras(){
		Instascan.Camera.getCameras()
		.then(cameraslist => {
			if (cameraslist.length > 0){
				this.qrscanner.start(cameraslist[0]);
			}else{
				this.setState({error: "No Cameras Found!"},()=>{
					this.showErrorModal();
				});
			}
		})
		.catch(error => {
			this.setState({error: error},()=>{
				this.showErrorModal();
			});
		});
	}

	render(){
		return(
			<div className="ui basic modal" id="qrscan_modal">
				<div className="ui icon header">
					<i className="qrcode icon"></i>
					Please Scan QRCode
			  	</div>
				<div className="p-3 text_align_center">
					Your qrcode image will be automatically scanned.
				</div>
				
				<div className="content qrvideo_div">
					

					<video className="qrscan_video" id="qrvideo"/>

					<div className="qrcheckoverlay">
						<i className="ui circular qr_check_icon check circle outline icon massive"
							id="qrcheckicon"/>
					</div>
				</div>
			  	<div className="actions text_align_center">
					<div className="ui red basic cancel inverted button">
				  		<i className="remove icon"></i>
				  		Cancel
					</div>
				</div>
				<CameraErrorModal headerTitle={this.state.error}/>
			</div>
		);
	}
}

class CameraErrorModal extends React.Component{
	constructor(props){
		super(props);
	}

	render(){
		return(
			<div className="ui tiny modal" id="camera_error_modal">
				<div className="ui icon header">
					<i className="camera icon"></i>
					{this.props.headerTitle}
			  	</div>
			  	<div className="actions text_align_center">
					<div className="ui red basic cancel inverted button">
				  		<i className="remove icon"></i>
				  		Cancel
					</div>
				</div>
			</div>
		);
	}
}

CameraErrorModal.defaultProps = {
	headerTitle: "",
	handleQRCallback: (function(){})
}