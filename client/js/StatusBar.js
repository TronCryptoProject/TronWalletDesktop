import React from "react";
import jetpack from "fs-jetpack";
import Equal from "deep-equal";
import config from "../config/config.js";


export default class StatusBar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			globalIconData: {
				networkStatus: this.props.globalIconData.networkStatus
			},
			hotWalletData: {
				showOnlineFeatures: this.props.hotWalletData.showOnlineFeatures
			}
		}

		this.renderGlobalDataIcons = this.renderGlobalDataIcons.bind(this);
		this.renderHotWalletIcons = this.renderHotWalletIcons.bind(this);
	}

	componentWillReceiveProps(nextProps){
		let tmp_state_dict = {};
		if (!Equal(nextProps.globalIconData, this.props.globalIconData)){
			tmp_state_dict.globalIconData = nextProps.globalIconData;
		}
		if (!Equal(nextProps.hotWalletData, this.props.hotWalletData)){
			tmp_state_dict.hotWalletData = nextProps.hotWalletData;
		}
		this.setState(tmp_state_dict);
	}

	renderGlobalDataIcons(){
		let status_divs = [];
		//is mobile auth set up 
		let read_data = jetpack.read(config.walletConfigFile, "json");
		if (read_data && ("mobileAuthCode" in read_data)){
			status_divs.push(
				<i className="mobile mobileauth_icon_green big icon status_icon" key="status_mobileauth"
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

	renderHotWalletIcons(){
		return(
			<div>
				<div className="ui tiny p-0 icon circular animated button basic inverted logout_btn">
					<div className="hidden content">logout</div>
					<div className="visible content m-0 px-2">
				  		<i className="sign out alternate large icon logout_icon"></i>
					</div>
				</div>
				<div className="ui mini statistic">
					<div className="value statistic_value_light_blue data_node_odometer mx-auto" id="hotwallet_datanode">
						<span id="hotwallet_datanodefirst">
							0.0
						</span>
						.
						<span id="hotwallet_datanodesec">
							0.0
						</span>
					</div>
					<div className="label statistic_datanode">
						Last Data Fetch From
					</div>
				</div>
			</div>
		);
	}

	render(){
		let getHotWalletData = ()=>{
			if (this.state.hotWalletData.showOnlineFeatures){
				return(
					<div className="ui bottom left attached label status_label">
						{this.renderHotWalletIcons()}
					</div>
				);
			}
		}

		return(
			<div>
				{getHotWalletData()}
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
		showOnlineFeatures: false
	}
}