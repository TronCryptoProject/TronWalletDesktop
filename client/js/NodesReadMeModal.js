import React from "react";

export default class NodesReadMeModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {};
	}

	render(){
		let sending_tx_node_list = this.props.nodeInfo.sendingTxNode.split(":");
		let sending_tx_node = sending_tx_node_list[0];
		let sending_tx_node_label = "";
		if (sending_tx_node_list.length == 2){
			sending_tx_node_label = sending_tx_node_list[1];
		} 

		let fetch_tx_node_list = this.props.nodeInfo.fetchTxNode.split(":");
		let fetch_tx_node = fetch_tx_node_list[0];
		let fetch_tx_node_label = "";
		if (fetch_tx_node_list.length == 2){
			fetch_tx_node_label = fetch_tx_node_list[1];
		}

		let account_node_list = this.props.nodeInfo.accountNode.split(":");
		let account_node = account_node_list[0];
		let account_node_label = "";
		if (account_node_list.length == 2){
			account_node_label = account_node_list[1];
		}

		let non_account_node_list = this.props.nodeInfo.nonAccountNode.split(":");
		let non_account_node = non_account_node_list[0];
		let non_account_node_label = "";
		if (non_account_node_list.length == 2){
			non_account_node_label = non_account_node_list[1];
		}

		return(
			<div className="ui modal rounded_corners" id="nodes_readme_modal">
				<div className="p-5">
					<div className="ui icon center aligned header witness_title_color">
						<i className="signal icon"></i>
						Which Nodes is the Information Fetched From?
				  	</div>
					<div className="content freeze_description">
						Different kinds of information is fetched from specific most synced nodes in order to build
						smart consensus among them and to send transactions fast without failing. If a node fails to
						return data, a new most synced node will be tried automatically, except for the node that handles
						sending/creating transactions. This is so that the transactions stay atomic. 
						<br/>
						Auto connect to different
						nodes also allows to get your wallet information quicker without having to rely on 1 node to 
						send all data.
						<br/>
						We make sure that all fetched data is most up to date. 
					</div>

					<div className="content pt-4">
						<div className="ui tiny centered header">
							Below are the nodes from which specific information is retrieved from
						</div>
					</div>

					<div className="ui centered relaxed page equal width padded grid p-3">
						<div className="two column row">
							<div className="center aligned column pl-0">
								<div className="ui statistic">
									<div className="label py-2">
										sending/creating transactions
									</div>
									<div className="value nodeinfo_font_size tron_blue_color">
										{sending_tx_node}
									</div>
									<div className="label py-2 force_meta">
										{sending_tx_node_label}
									</div>
								</div>
							</div>
							<div className="center aligned column pr-0">
								<div className="ui statistic">
									<div className="label py-2">
										fetching transactions (solidity)
									</div>
									<div className="value nodeinfo_font_size tron_blue_color">
										{fetch_tx_node}
									</div>
									<div className="label py-2 force_meta">
										{fetch_tx_node_label}
									</div>
								</div>
							</div>
						</div>
						<div className="two column row">
							<div className="center aligned column pl-0">
								<div className="ui statistic">
									<div className="label py-2">
										fetching account info
									</div>
									<div className="value nodeinfo_font_size tron_blue_color">
										{account_node}
									</div>
									<div className="label py-2 force_meta">
										{account_node_label}
									</div>
								</div>
							</div>
							<div className="center aligned column pr-0">
								<div className="ui statistic">
									<div className="label py-2">
										non-account specific info
									</div>
									<div className="value nodeinfo_font_size tron_blue_color">
										{non_account_node}
									</div>
									<div className="label py-2 force_meta">
										{non_account_node_label}
									</div>
								</div>
							</div>
						</div>
					</div> 

					<div className="center_button actions my-2">
						<div className="ui green ok inverted vertical button">
							Okay
						</div>
					</div>
				</div>
			</div>
		);	
	}
}

NodesReadMeModal.defaultProps={
	nodeInfo: {
		accountNode: "0.0.0.0",
		sendingTxNode: "0.0.0.0",
		fetchTxNode: "0.0.0.0",
		nonAccountNode: "0.0.0.0",
	}
}
