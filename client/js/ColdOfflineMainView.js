import React from "react";

export default class ColdOfflineMainView extends React.Component {
	construtor(props){
		super(props);
	}

	render(){
		return(
			<div>
				<h1 className="ui center aligned header">
					<img className="ui centered row image" src="client/images/tronbluefat.png"
						width="50" height="50"/>
					<div className="content">Cold Offline</div>
				</h1>
				<div class="ui section divider"></div>
				
				<div className="ui grid">
					<div className="four wide column">
						<div className="ui vertical fluid tabular menu">
							<a className="active item">

							</a>
							<a className="item">

							</a>
							<a className="item">

							</a>
							<a className="item">

							</a>
						</div>
					</div>
					<div className="twelve wide stretched column">
						<div className="ui segment">

						</div>
					</div>
				</div>
			</div>
		);
	}
}

/*<div className="ui one column page centered padded grid">
					<div className="row">
						<img className="ui centered row image" src="client/images/tronbluefat.png"
							width="50" height="50"/>
						<span>COLD OFFLINE</span>
					</div>
					
				</div>*/