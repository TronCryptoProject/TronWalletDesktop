import React from "react";
import jetpack from "fs-jetpack";
import Equal from "deep-equal";
import config from "../config/config.js";
import NodeOdometer from "./NodeOdometer.js";

export default class StatusBar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			globalIconData: {
				networkStatus: props.globalIconData.networkStatus
			},
			hotWalletData: {
				onlineFeaturesView: props.hotWalletData.onlineFeaturesView
			}
		}

		this.renderGlobalDataIcons = this.renderGlobalDataIcons.bind(this);
		this.renderHotWalletIcons = this.renderHotWalletIcons.bind(this);
		this.renderLogOutButton = this.renderLogOutButton.bind(this);
		this.handleLogoutClick = this.handleLogoutClick.bind(this);
	}

	componentWillReceiveProps(nextProps){
		let tmp_state_dict = {};
		if (!Equal(nextProps.globalIconData, this.props.globalIconData)){
			tmp_state_dict.globalIconData = nextProps.globalIconData;
		}
		if (!Equal(nextProps.hotWalletData, this.props.hotWalletData)){
			tmp_state_dict.hotWalletData = nextProps.hotWalletData;
		}
		tmp_state_dict = Object.assign(this.state, tmp_state_dict);
		this.setState(tmp_state_dict);
	}

	handleLogoutClick(){
		this.props.handleLogoutClick();
	}

	renderGlobalDataIcons(){
		let status_divs = [];
		//is mobile auth set up 
		let read_data = jetpack.read(config.walletConfigFile, "json");
		if (read_data && ("mobileAuthCode" in read_data)){
			let color = "mobileauth_icon_green";
			/*if (this.state.hotWalletData.onlineFeaturesView == config.views.HOTWALLET
				|| this.state.hotWalletData.onlineFeaturesView == config.views.COLDWALLET){
				color = "mobileauth_icon_green";
			}*/

			status_divs.push(
				<i className={"mobile big icon status_icon_size status_icon " + color} key="status_mobileauth"
					data-title="Mobile 2FA is on!"
			  		data-variation="tiny"
			  		data-position="top center"/>
			);

		}

		// is wifi connected
		if (this.state.globalIconData.networkStatus == "online"){
			status_divs.push(
				<i className="wifi wifi_icon_blue big icon status_icon" key="status_wifi_connected"
					data-title="Online"
			  		data-variation="tiny"
			  		data-position="top right"/>
			  	);
		}else{
			status_divs.push(
				<i className="plane big icon" key="status_wifi_disconnected"
					data-title="Offline"
			  		data-variation="tiny"
			  		data-position="top right"/>
			  	);
		}
		return status_divs;
	}

	renderLogOutButton(){
		return(
			<div className="ui tiny p-0 icon circular animated button basic inverted logout_btn"
				onClick={this.handleLogoutClick}>
				<div className="hidden content">logout</div>
				<div className="visible content m-0 px-2">
			  		<i className="sign out alternate large icon logout_icon"></i>
				</div>
			</div>
		);
	}

	renderHotWalletIcons(){
		return(
			<div>
				{this.renderLogOutButton()}
				<NodeOdometer dataNodeFirstHalf={this.state.hotWalletData.dataNodeFirstHalf}
					dataNodeSecHalf={this.state.hotWalletData.dataNodeSecHalf}/>
			</div>
		);
	}

	render(){
		let getLeftSideData = ()=>{
			if (this.state.hotWalletData.onlineFeaturesView == config.views.HOTWALLET){
				return(
					<div className="ui bottom left attached label status_label">
						{this.renderHotWalletIcons()}
					</div>
				);
			}else if(this.state.hotWalletData.onlineFeaturesView == config.views.COLDWALLET){
				return(
					<div className="ui bottom left attached label status_label">
						{this.renderLogOutButton()}
					</div>
				);
			}
		}

		return(
			<div>
				{getLeftSideData()}
				<div className="ui bottom right attached label status_label">
					{this.renderGlobalDataIcons()}
				</div>
			</div>
		);
	}
}

StatusBar.defaultProps = {
	globalIconData:{
		networkStatus: navigator.onLine ? "online" : "offline"
	},
	hotWalletData:{
		onlineFeaturesView: "",
		dataNodeFirstHalf: 0.0,
		dataNodeSecHalf: 0.0
	},
	handleLogoutClick:(function(){})
}