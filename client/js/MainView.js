import React from "react";
import ReactDOM from "react-dom";
import config from "../config/config.js";
import NetworkConfirmationModal from "./NetworkConfirmationModal.js";
import GoogleAuth from "./GoogleAuth.js";
import StatusBar from "./StatusBar.js";
import ColdOfflineMainView from "./ColdOfflineMainView.js";
import WatchOnlyMainView from "./WatchOnlyMainView.js";
import ColdOfflineDashboard from "./ColdOfflineDashboard.js";
import jetpack from "fs-jetpack";

export default class MainView extends React.Component {
	constructor(props){
		super(props);
		this.OFFLINE = "offline";
		this.ONLINE = "online";
		
		this.state = {
			networkStatus: navigator.onLine ? this.ONLINE : this.OFFLINE,
			modalHidden: true,
			currView: config.views.MAINVIEW,
			onlineFeaturesView: "",
			dataNodeDict: {},
			isLoggedIn: false,
			mobileAuthCode: "",
			dashboardData: {}
		}

		this.networkStatusUpdate = this.networkStatusUpdate.bind(this);
		this.handleColdOfflineClick = this.handleColdOfflineClick.bind(this);
		this.handleWatchOnlyWalletClick = this.handleWatchOnlyWalletClick.bind(this);
		this.handleMobileAuthClick = this.handleMobileAuthClick.bind(this);
		this.getMainViewComponent = this.getMainViewComponent.bind(this);
		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.handleHotWalletClick = this.handleHotWalletClick.bind(this);
		this.handleStatusBar = this.handleStatusBar.bind(this);
		this.handleDataNode = this.handleDataNode.bind(this);
		this.handleLogoutClick = this.handleLogoutClick.bind(this);
		this.permissionLogOut = this.permissionLogOut.bind(this);
		this.handleMobileAuthGenerated = this.handleMobileAuthGenerated.bind(this);
		this.checkMobileAuth = this.checkMobileAuth.bind(this);
		this.handleWalletGatewaySuccess = this.handleWalletGatewaySuccess.bind(this);
	}

	componentDidMount(){
		window.addEventListener(this.ONLINE,  this.networkStatusUpdate);
	  	window.addEventListener(this.OFFLINE,  this.networkStatusUpdate);

	  	$('.status_icon').popup({
		    on: 'hover',
		    closable: true
		});
		$("#cold_wallet_btn").popup({
			delay: {
				show: 500,
				hide: 0
			}
		});
		$("#hot_wallet_btn").popup({
			delay: {
				show: 500,
				hide: 0
			}
		});
		$("#watch_only_btn").popup({
			delay: {
				show: 500,
				hide: 0
			}
		});
		this.checkMobileAuth();
	}

	componentWillUnmount(){
		window.removeEventListener(this.ONLINE,  this.networkStatusUpdate);
	  	window.removeEventListener(this.OFFLINE,  this.networkStatusUpdate);
	}

	checkMobileAuth(){
		let read_data = jetpack.read(config.walletConfigFile, "json");
		if (!read_data || !("mobileAuthCode" in read_data)){
			this.setState({mobileAuthCode: ""});
		}else{
			this.setState({mobileAuthCode: read_data.mobileAuthCode});
		}
	}

	networkStatusUpdate(){
		this.setState({networkStatus: navigator.onLine ? this.ONLINE : this.OFFLINE},()=>{
			if (!this.state.modalHidden){
				$("#network_modal").modal("hide");
				this.setState({currView: config.views.COLDWALLET});
			}
		});
	}

	handleMobileAuthGenerated(code){
		this.setState({mobileAuthCode: code});
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
						this.setState({currView: config.views.COLDWALLET});
					}
				}
			})
			.modal("show");*/
			//remove the following line and uncomment the above line to get the dialog back; that's all
			this.setState({currView: config.views.COLDWALLET, isLoggedIn: true});
		}else{
			/*remove this line*/
		this.setState({currView: config.views.COLDWALLET, isLoggedIn: true});
		}
		
	}

	handleWatchOnlyWalletClick(e){
		this.setState({currView: config.views.WATCHONLY});
	}

	handleMobileAuthClick(e){
		this.setState({currView: config.views.MOBILEAUTH});
	}

	handleBackButtonClick(){
		this.setState({currView: config.views.MAINVIEW});	
	}

	handleWalletGatewaySuccess(view, data){
		let gotoview;
		if (view == config.views.COLDWALLET){
			gotoview = config.views.COLDDASH;
		}else if (view == config.views.HOTWALLET){
			gotoview = config.views.HOTDASH;
		}else if (view == config.views.WATCHONLY){
			gotoview = config.views.WATCHDASH;
		}
		this.setState({currView: gotoview, dashboardData: data});
	}

	handleHotWalletClick(){
		this.setState({currView: config.views.HOTWALLET, isLoggedIn: true});
	}

	handleStatusBar(view){
		this.setState({onlineFeaturesView: view});
	}

	handleDataNode(node_dict){
		this.setState({dataNodeDict: node_dict});
	}

	handleLogoutClick(){
		this.setState({isLoggedIn: false});
	}

	permissionLogOut(){
		this.setState({currView: config.views.MAINVIEW,
			onlineFeaturesView: ""
		});
	}

	getMainViewComponent(){
		return (
			<div>
				<div className="draggable blue_gradient_background">
					<div className="ui one column page centered padded grid vertical_center" id="mainview">
						
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
								<div className="ui labeled icon olive inverted button button_left mainview_btn"
									onClick={(e)=>{this.handleColdOfflineClick(e)}}
									data-content="Network connection not allowed" 
							  		data-position="bottom left" data-variation="mini" id="cold_wallet_btn">Cold Wallet
									<i className="plane icon"></i>
								</div>
								<div className="or custom_or"></div>
								<div className="ui olive inverted button button_middle mainview_btn"
									onClick={(e)=>{this.handleWatchOnlyWalletClick(e)}}
									data-content="Used with cold wallet to broadcast transactions. Requires
									no private key" data-position="bottom center" data-variation="mini" id="watch_only_btn">
									Watch Only Wallet
								</div>
								<div className="or custom_or"></div>
								<div className="ui right labeled icon olive inverted button button_right mainview_btn"
									onClick={(e)=>{this.handleHotWalletClick(e)}}
									data-content="Network connected -- Signs transactions automatically"
			  						data-position="bottom right" data-variation="mini" id="hot_wallet_btn">Hot Wallet
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
				<GoogleAuth handleBackButtonClick={this.handleBackButtonClick}
					handleMobileAuthGenerated={this.handleMobileAuthGenerated}/>
			);
		}else if (this.state.currView == config.views.COLDWALLET){
			view_component = (
				<ColdOfflineMainView handleBackButtonClick={this.handleBackButtonClick}
					view={config.views.COLDWALLET} handleWalletGatewaySuccess={this.handleWalletGatewaySuccess}/>
			);
		}else if(this.state.currView == config.views.COLDDASH){
			view_component = (
				<ColdOfflineDashboard showStatusBar={this.handleStatusBar}
					permissionLogOut={this.permissionLogOut} isLoggedIn={this.state.isLoggedIn}
					mobileAuthCode={this.state.mobileAuthCode}
					accInfo={this.state.dashboardData}/>
			);

		}else if (this.state.currView == config.views.HOTWALLET){
			view_component = (
				<ColdOfflineMainView handleBackButtonClick={this.handleBackButtonClick}
					view={config.views.HOTWALLET} handleWalletGatewaySuccess={this.handleWalletGatewaySuccess}/>
			);

		}else if(this.state.currView == config.views.HOTDASH){
			view_component = (
				<HotWalletDashboard showStatusBar={this.handleStatusBar}
					handleDataNode={this.handleDataNode} isLoggedIn={this.state.isLoggedIn}
					permissionLogOut={this.permissionLogOut} mobileAuthCode={this.state.mobileAuthCode}
					accInfo={this.state.dashboardData}/>
			);

		}else if (this.state.currView == config.views.WATCHONLY){
			view_component = (
				<WatchOnlyMainView handleBackButtonClick={this.handleBackButtonClick}
					mobileAuthCode={this.state.mobileAuthCode}/>
			);
		}else if (this.state.currView == config.views.WATCHDASH){

		}

		let status_data = {
			networkStatus: this.state.networkStatus
		}

		let hot_wallet_data = {
			onlineFeaturesView: this.state.onlineFeaturesView
		}
		hot_wallet_data = Object.assign(hot_wallet_data, this.state.dataNodeDict);
		return(
			<div>
				{view_component}
				<StatusBar globalIconData={status_data} hotWalletData={hot_wallet_data}
					handleLogoutClick={this.handleLogoutClick} mobileAuthCode={this.state.mobileAuthCode}/>
			</div>
		);
	}
}
