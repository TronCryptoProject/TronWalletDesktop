import React from "react";
import jetpack from "fs-jetpack";
import stomp from "./Socket.js";
import config from "../config/config.js";
import axios from "axios";
import WorldMap from "./WorldMap.js";
import NodesList from "./NodesList.js";
import ConfModal from "./ConfModal.js";

export default class Nodes extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			nodeList: [],
			modalOpened: false,
			currNode: this.props.currNode,
			selectListItem: "",
			confModalParams: {},
			modalId: "nodes_conf_modal"
		};
		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
		this.getMapLineLayers = this.getMapLineLayers.bind(this);
		this.getNodeData = this.getNodeData.bind(this);
		this.subscribeToSocket = this.subscribeToSocket.bind(this);
		this.unsubscribeToSocket = this.unsubscribeToSocket.bind(this);
		this.handleNodeItemClick = this.handleNodeItemClick.bind(this);
		this.handleConfModalParams = this.handleConfModalParams.bind(this);
		this.handleConfModalOpen = this.handleConfModalOpen.bind(this);
		this.node_stomp = null;
		this.SUCCESS = "success";
	}

	componentDidMount(){
		
	}

	componentWillReceiveProps(nextProps){
		if(this.props.modalOpened != nextProps.modalOpened){
			if (nextProps.modalOpened){
				this.setState({modalOpened: nextProps.modalOpened},()=>{
					this.subscribeToSocket();
					
				});
			}else{
				this.unsubscribeToSocket();
			}
		}
		if (this.props.currNode != nextProps.currNode){
			this.setState({currNode: nextProps.currNode});
		}
	}

	handleConfModalParams(params_dict, isSuccess){
		params_dict.id = this.state.modalId;
		params_dict.headerClass = (isSuccess) ? "color_green": "color_red";
		this.setState({confModalParams: params_dict},()=>{
			this.handleConfModalOpen();
		});
	}

	handleConfModalOpen(){
		$("#" + this.state.modalId).modal({
			blurring: true,
			centered: true,
			inverted: true,
			transition: "scale",
			allowMultiple: true
		})
		.modal("show");
	}

	subscribeToSocket(){
		this.node_stomp = stomp.subscribe("/persist/nodes",(data)=>{
			let body = data.body.trim();
			if (body != ""){
				let res_json = JSON.parse(data.body.trim());
				if (res_json.result == this.SUCCESS){
					let node_list = [];
					let node_set = new Set([]);
					for (let node of res_json.nodes){
						if (!node_set.has(node.host)){
							node_set.add(node.host);
							node_list.push(node);
						}
					}
					this.getNodeData(node_list);
				}
			}
		});

	}

	unsubscribeToSocket(){
		if (this.node_stomp){
			this.node_stomp.unsubscribe();
		}
	}

	handleCloseButtonClick(){
		this.props.handleDockClick(false, "#nodes_modal");
	}

	handleNodeItemClick(node_item){
		this.setState({selectListItem: node_item});
	}

	getNodeData(node_list){
		let read_data = {nodes:{}};
		let nodes_fetch_list = [];

		if (jetpack.exists(config.walletConfigFile) == "file"){
			let in_data = jetpack.read(config.walletConfigFile, "json");
			if (in_data && "nodes" in in_data){
				read_data = in_data;
				for (let r_node_dict of node_list){
					if (!(r_node_dict.host in in_data.nodes)){
						nodes_fetch_list.push(r_node_dict);
					}
				}

			}
		}

		let fetchIpInfo = async (ip)=>{
    		let json = await axios.get("http://gd.geobytes.com/GetCityDetails?fqcn=" + ip);
		    return json;
		}

		let allDoneFetch = (data_dict)=>{
			console.log("data:" + JSON.stringify(data_dict));
			let all_nodes = Object.assign({}, data_dict, read_data.nodes);
			read_data.nodes = all_nodes;
			jetpack.write(config.walletConfigFile, read_data, { atomic: true });
			this.getMapLineLayers(read_data.nodes);
		}

		let promise_dict = {};
		if (nodes_fetch_list.length != 0){
			for (let r_node_dict of nodes_fetch_list){	
				fetchIpInfo(r_node_dict.host)
				.then((res)=>{
					let json_obj = res.data;
					let lat = json_obj.geobyteslatitude;
					let long = json_obj.geobyteslongitude;
					let location = json_obj.geobytesfqcn;
					promise_dict[r_node_dict.host] = {
						lat: lat,
						long: long,
						location: location,
						port: r_node_dict.port
					};
					if (Object.keys(promise_dict).length == nodes_fetch_list.length){
						allDoneFetch(promise_dict);
					}
				})
				.catch((error)=>{
					console.log(JSON.stringify(error));
				});
			}
		}else{
			allDoneFetch(promise_dict);
		}
		
	}

	getMapLineLayers(node_dict){
		let data_list = [];
		for(let node in node_dict){
			let ipinfo = node_dict[node];
			let dirty = false;
			for (let x in ipinfo){
				if (ipinfo[x] == null || ipinfo[x] == ""){
					dirty = true;
					break;
				}
			}
			if (dirty || node == null || node == ""){
				continue;
			}
			try{
				let data = {
					coordinates: [parseFloat(ipinfo.long),parseFloat(ipinfo.lat)],
					host: node,
					port: ipinfo.port
				};
				data_list.push(data);
			}catch(error){
				console.log(error);
			}
			
		}

		this.setState({nodeList: data_list},()=>{
			setTimeout(()=>{
				stomp.send("/persist/nodes");
			},15000);
		});
	}

	render(){
		return(
			<div className="ui fullscreen modal fullscreen_modal" id="nodes_modal">
				<div className="ui blurring segment fullscreen_modal_segment">
					<div className="content">
						<button className="circular medium ui icon button" onClick={this.handleCloseButtonClick}>
							<i className="close icon"/>
						</button>
						<div className="ui centered large header map_header_color mt-0">
							All Nodes Available
						</div>
						<div className="description custom_map_description">
							You wallet is automatically configured for auto selection of node. It 
							connects to the most synced and smallest latency node in the network on every
							request, which means your transactions are fast and will never fail! 
						</div>
					</div>
					<div className="center aligned content p-4 center_button">
						<div className="ui labeled button mx-4">
							<div className="ui orange button">
								Total Nodes
							</div>
							<span className="ui basic left pointing orange label">
								{this.state.nodeList.length}
							</span>
						</div>

						<div className="ui labeled button mx-4">
							<div className="ui yellow button">
								Connected Node
							</div>
							<span className="ui basic left pointing yellow label">
								{this.state.currNode}
							</span>
							
						</div>
					</div>
					<div className="content pt-4 clearfix display_inline_flex width_100">
						<WorldMap nodes={this.state.nodeList} selectListItem={this.state.selectListItem}/>
						<NodesList nodes={this.state.nodeList} handleNodeItemClick={this.handleNodeItemClick}
							handleConfModalParams={this.handleConfModalParams}/>
					</div>
				</div>
				<ConfModal {...this.state.confModalParams}>
				</ConfModal>
			</div>
		);
	}
}

Nodes.defaultProps={
	handleDockClick: (function(){}),
	currNode: "0.0.0.0"
}