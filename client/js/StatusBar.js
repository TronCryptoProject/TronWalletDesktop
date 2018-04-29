import React from "react";
import jetpack from "fs-jetpack";
import Equal from "deep-equal";
import config from "../config/config.js";

export default class StatusBar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			networkStatus: this.props.data.networkStatus
		}
	}

	componentWillReceiveProps(nextProps){
		if (!Equal(nextProps.data, this.props.data)){
			this.setState({networkStatus: nextProps.data.networkStatus});
		}
	}

	render(){
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
		if (this.state.networkStatus == "online"){
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

		return(
			<div className="ui bottom right attached label status_label">
				{status_divs}
			</div>
		);
	}
}

StatusBar.defaultProps = {
	networkStatus: navigator.onLine ? "online" : "offline"
}