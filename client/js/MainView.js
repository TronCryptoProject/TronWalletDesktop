import React from "react";
import ReactDOM from "react-dom";
import config from "../config/config.js";
import NetworkConfirmationModal from "./NetworkConfirmationModal.js";
import GoogleAuth from "./GoogleAuth.js";
import StatusBar from "./StatusBar.js";
import ColdOfflineMainView from "./ColdOfflineMainView.js";

export default class MainView extends React.Component {
	constructor(props){
		super(props);
		this.OFFLINE = "offline";
		this.ONLINE = "online";
		this.state = {
			networkStatus: navigator.onLine ? this.ONLINE : this.OFFLINE,
			modalHidden: true,
			currView: config.views.MAINVIEW
		}

		this.networkStatusUpdate = this.networkStatusUpdate.bind(this);
		this.handleColdOfflineClick = this.handleColdOfflineClick.bind(this);
		this.handleColdOnlineClick = this.handleColdOnlineClick.bind(this);
		this.handleMobileAuthClick = this.handleMobileAuthClick.bind(this);
		this.getMainViewComponent = this.getMainViewComponent.bind(this);
		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

	}

	componentDidMount(){
		window.addEventListener(this.ONLINE,  this.networkStatusUpdate);
	  	window.addEventListener(this.OFFLINE,  this.networkStatusUpdate);

	  	$('.status_icon').popup({
		    on: 'hover',
		    closable: true
		});
	}

	componentWillUnmount(){
		window.removeEventListener(this.ONLINE,  this.networkStatusUpdate);
	  	window.removeEventListener(this.OFFLINE,  this.networkStatusUpdate);
	}

	networkStatusUpdate(){
		this.setState({networkStatus: navigator.onLine ? this.ONLINE : this.OFFLINE},()=>{
			if (!this.state.modalHidden){
				$("#network_modal").modal("hide");
				this.setState({currView: config.views.COLDOFFLINE});
			}
		});
	}

	handleColdOfflineClick(e){
		if (this.state.networkStatus == this.ONLINE){
			/*$("#network_modal").modal({
				blurring: true,
				centered: false,
				transition: "scale",
				closable: false,
				onVisible: () =>{
					this.setState({modalHidden: false});
				},
				onHidden: ()=>{
					this.setState({modalHidden: true});
				},
				onDeny: () => {},
				onApprove:()=>{
					//we are forcing the check
					if (navigator.onLine){
						$("#network_modal_approve_btn").transition('shake');
						return false;
					}else{
						this.setState({currView: config.views.COLDOFFLINE});
					}
				}
			})
			.modal("show");*/
			//remove the following line and uncomment the above line to get the dialog back; that's all
			this.setState({currView: config.views.COLDOFFLINE});
		}
	}

	handleColdOnlineClick(e){

	}

	handleMobileAuthClick(e){
		this.setState({currView: config.views.MOBILEAUTH});
	}

	handleBackButtonClick(){
		this.setState({currView: config.views.MAINVIEW});	
	}


	getMainViewComponent(){
		return (
			<div>
				<div className="draggable blue_gradient_background">
					<div className="ui one column page centered padded grid" id="mainview">
						
						<div className="row">
							<div className="column twelve wide">
								<img className="ui centered row image" src="client/images/tronbluefat.png"
									width="200" height="200"/>
								<img className="ui centered row image" src="client/images/trontitleblue.png"
									width="450" height="200"/>
							</div>
						</div>
						<div className="row">
							<div className="ui buttons">
								<div className="ui labeled icon olive inverted button button_left"
									onClick={(e)=>{this.handleColdOfflineClick(e)}}>Cold Offline
									<i className="plane icon"></i>
								</div>
								<div className="or"></div>
								<div className="ui right labeled icon olive inverted button button_right"
									onClick={(e)=>{this.handleColdOnlineClick(e)}}>Cold Online
									 <i className="wifi icon"></i>
								</div>
							</div>
						</div>
						<div className="row"/>
						<div className="row">
							<div className="ui labeled icon button" 
								onClick={(e)=>{this.handleMobileAuthClick(e)}}>Mobile 2FA
								<i className="mobile alternate icon"></i>
							</div>
						</div>
					</div>
					
				</div>
				<NetworkConfirmationModal networkStatus={this.state.networkStatus}/>
			</div>
		);
	}

	render(){
		let view_component;
		if (this.state.currView == config.views.MAINVIEW){
			view_component = this.getMainViewComponent();
		}else if (this.state.currView == config.views.MOBILEAUTH){
			view_component = (
				<GoogleAuth handleBackButtonClick={this.handleBackButtonClick}/>
			);
		}else if (this.state.currView == config.views.COLDOFFLINE){
			view_component = (
				<ColdOfflineMainView handleBackButtonClick={this.handleBackButtonClick}/>
			);
		}

		let status_data = {
			networkStatus: this.state.networkStatus
		}

		return(
			<div>
				{view_component}
				<StatusBar data={status_data}/>
			</div>
		);
	}
}
