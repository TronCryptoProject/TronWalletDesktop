import React from "react";
import jetpack from "fs-jetpack";
import config from "../config/config.js";
import axios from "axios";
import WorldMap from "./WorldMap.js";
import NodesList from "./NodesList.js";
import ConfModal from "./ConfModal.js";
import Equal from "deep-equal";
import NodesReadMeModal from "./NodesReadMeModal.js";
import {BlowfishSingleton} from "Utils.js";

export default class Nodes extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			nodeList: [],
			modalOpened: false,
			currNode: props.currNode,
			nodeInfo: props.nodeInfo,
			selectListItem: "",
			confModalParams: {},
			nodeData: [],
			modalId: "nodes_conf_modal",
			nonAccountNode: "0.0.0.0"
		};
		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
		this.getMapLineLayers = this.getMapLineLayers.bind(this);
		this.getNodeData = this.getNodeData.bind(this);
		this.handleNodeItemClick = this.handleNodeItemClick.bind(this);
		this.handleConfModalParams = this.handleConfModalParams.bind(this);
		this.handleConfModalOpen = this.handleConfModalOpen.bind(this);
		this.handleReadMoreClick = this.handleReadMoreClick.bind(this);
		
		this.fetchRemoteNodes = this.fetchRemoteNodes.bind(this);
		this.fetchlock = false;
		this.tofetch = false;
	}


	componentWillUnmount(){
		this.tofetch = false;
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};

		if(this.props.modalOpened != nextProps.modalOpened){
			tmp_dict.modalOpened = nextProps.modalOpened;

			if (nextProps.modalOpened){
				this.tofetch = true;
				this.fetchRemoteNodes();
			}else{
				this.tofetch = false;
			}
		}
		if (this.state.currNode != nextProps.currNode){
			console.log("NEXT PROPS CURRNODE: " + nextProps.currNode);
			tmp_dict.currNode = nextProps.currNode;
		}
		if (this.state.nodeInfo != nextProps.nodeInfo){
			console.log("NODE INFO PROPS: " + nextProps.nodeInfo);
			tmp_dict.nodeInfo = nextProps.nodeInfo;
		}

		this.setState(tmp_dict);
	}

	fetchRemoteNodes(){
		let url = BlowfishSingleton.createPostURL(config.views.HOTWALLET, "GET","nodes",{});

		axios.get(url)
		.then((res)=>{
			let data = res.data;
			let res_json = BlowfishSingleton.decryptToJSON(data);
			if (res_json.result == config.constants.SUCCESS){
				let flattenDict = (tmp_list)=>{
					let res_list = [];
					for (let inner_dict of tmp_list){
						res_list.push(inner_dict.host + ":" + inner_dict.port);
					}
					return res_list;
				}

				this.setState({
					nodeData:flattenDict(res_json.nodes),
					nonAccountNode: res_json.fullnode
				},()=>{
					this.getNodeData(this.state.nodeData);
				});
			}
		})
		.catch((error)=>{
			console.log(error);
		});
	}

	handleConfModalParams(params_dict, isSuccess){
		params_dict.id = this.state.modalId;
		params_dict.headerClass = (isSuccess) ? "color_green": "color_red";
		this.setState({confModalParams: params_dict},()=>{
			this.handleConfModalOpen();
			if (isSuccess){
				this.props.handleNodeConnect(this.state.selectListItem);
			}
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

	handleCloseButtonClick(){
		this.props.handleDockClick(false, "#nodes_modal");
	}

	handleNodeItemClick(node_item){
		this.setState({selectListItem: node_item});
	}

	handleReadMoreClick(){
		$("#nodes_readme_modal")
		.modal({
			allowMultiple: true,
			closable: true,
			onShow:()=>{
				$("#nodes_modal").addClass("blur");
			},
			onHidden:()=>{
				$("#nodes_modal").removeClass("blur");
			}
		})
		.modal("show");
	}

	getNodeData(node_list){
		console.log("GETTING NODE DATA");
		let read_data = {nodes:{}};
		let nodes_fetch_list = [];

		if (jetpack.exists(config.walletConfigFile) == "file"){
			let in_data = jetpack.read(config.walletConfigFile, "json");
			if (in_data){
				if("nodes" in in_data){
					read_data = in_data;
					for (let r_node of node_list){
						if (!(r_node in in_data.nodes)){
							nodes_fetch_list.push(r_node);
						}
					}
				}else{
					read_data = Object.assign(in_data, read_data);
					nodes_fetch_list = node_list;
				}
			}else{
				nodes_fetch_list = node_list;
			} 
		}else{
			nodes_fetch_list = node_list;
		}

		let fetchIpInfo = async (ip)=>{
    		let json = await axios.get("http://gd.geobytes.com/GetCityDetails?fqcn=" + ip);
		    return json;
		}

		let allDoneFetch = (data_dict)=>{
			let transformToDict = (tmp_list)=>{
				let res_dict = {};
				for (let item_host of tmp_list){
					res_dict[item_host] = "";
				}
				return res_dict;
			}
			let node_dict = transformToDict(node_list);

			let all_nodes = Object.assign({}, data_dict, read_data.nodes);

			let tmp_nodes = $.extend(true, {}, all_nodes);
			for(let node_host in tmp_nodes){
				if (!(node_host in node_dict)){
					console.log("deleting: " + node_host);
					delete all_nodes[node_host];
				}
			}

			read_data.nodes = all_nodes;
			jetpack.write(config.walletConfigFile, read_data, { atomic: true });
			this.getMapLineLayers(read_data.nodes);
		}

		let promise_dict = {};
		if (nodes_fetch_list.length != 0){
			for (let r_node of nodes_fetch_list){	
				fetchIpInfo(r_node.split(":")[0])
				.then((res)=>{
					let json_obj = res.data;
					let lat = json_obj.geobyteslatitude;
					let long = json_obj.geobyteslongitude;
					let location = json_obj.geobytesfqcn;
					promise_dict[r_node] = {
						lat: lat,
						long: long,
						location: location
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
				let node_arr = node.split(":");
				let host = node_arr[0];
				let port = node_arr[1];
				let data = {
					coordinates: [parseFloat(ipinfo.long),parseFloat(ipinfo.lat)],
					host: host,
					port: port
				};
				data_list.push(data);
			}catch(error){
				console.log(error);
			}
			
		}

		data_list.sort(function(a, b){
		    if(a.host < b.host) return -1;
		    if(a.host > b.host) return 1;
		    return 0;
		});

		this.setState({nodeList: data_list},()=>{
			setTimeout(()=>{
				if (this.tofetch){
					this.fetchRemoteNodes();
				}
			},12000);
		});
	}

	render(){
		let appended_node_info = this.state.nodeInfo;
		appended_node_info.nonAccountNode = this.state.nonAccountNode;

		return(
			<div className="ui fullscreen modal fullscreen_modal" id="nodes_modal">
				<div className="ui blurring segment fullscreen_modal_segment">
					<div className="content">
						<div className="ui centered grid">
							<div className="three column row">
								<div className="four wide column">
									<button className="circular medium ui icon button" onClick={this.handleCloseButtonClick}>
										<i className="close icon"/>
									</button>
								</div>
								<div className="eight wide column">
									<div className="ui centered large header map_header_color mt-0">
										All Unique Active Nodes
									</div>
								</div>
								<div className="four wide right aligned column">
									<div className="ui label button button_tron_blue cursor_pointer right aligned" onClick={this.handleReadMoreClick}>
										IP Info
									</div>
								</div>
							</div>
						</div>
						
					</div>


					<div className="content mt-3">
						<div className="description custom_map_description">
							You wallet is automatically configured for smart auto selection of node. It 
							connects to the most synced and smallest latency node in the network on every
							request, which means your transactions are fast and will never fail. If a node 
							doesn't return requested data, another node is automatically tried with the same 
							request.
						</div>
					</div>
					<div className="center aligned content p-4 center_button">
						<div className="ui labeled button mx-4">
							<div className="ui orange button">
								Total Unique Nodes
							</div>
							<span className="ui basic left pointing orange label">
								{this.state.nodeData.length}
							</span>
						</div>

						<div className="ui labeled button mx-4">
							<div className="ui yellow button"
								data-tooltip="Will not be updated if node doesn't respond" 
							  		data-position="bottom center" data-variation="mini"
							  		id="connected_btn_label">
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
							handleConfModalParams={this.handleConfModalParams}
							pubAddress={this.props.pubAddress} view={this.props.view}/>
					</div>
				</div>
				<ConfModal {...this.state.confModalParams}>
				</ConfModal>
				<NodesReadMeModal nodeInfo={appended_node_info}/>
			</div>
		);
	}
}

Nodes.defaultProps={
	handleDockClick: (function(){}),
	handleNodeConnect: (function(){}),
	currNode: "0.0.0.0",
	pubAddress: "",
	view: config.views.HOTWALLET,
	nodeInfo: {
		accountNode: "0.0.0.0",
		sendingTxNode: "0.0.0.0",
		fetchTxNode: "0.0.0.0"
	}
}