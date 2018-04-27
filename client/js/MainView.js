import React from "react";
import ElectronOnline from "electron-online";

export default class MainView extends React.Component {
	constructor(props){
		super(props);
		this.registerNetworkListener = this.registerNetworkListener.bind(this);

		this.connection = new ElectronOnline();

		this.registerNetworkListener();
	}

	registerNetworkListener(){
		this.connection.on('online', () => {
			console.log('App is online!')
		})
		 
		this.connection.on('offline', () => {
			console.log('App is offline!')
		})
	}

	render(){
		return(
			<div className="draggable blue_gradient_background">
				<div className="ui one column page centered padded grid">
					
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
							<div className="ui labeled icon olive inverted button button_left">Cold Offline
								<i className="plane icon"></i>
							</div>
							<div class="or"></div>
							<div className="ui right labeled icon olive inverted button button_right">Cold Online
								 <i className="wifi icon"></i>
							</div>
						</div>
					</div>
					<div className="row"/>
					<div className="row">
						<div className="ui labeled icon button">Mobile 2FA
							<i className="mobile alternate icon"></i>
						</div>
					</div>
				</div>
		
			</div>
		);
	}
}