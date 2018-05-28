import React from "react";
import axios from "axios";
import config from "../config/config.js";
import {BlowfishSingleton} from "Utils.js";

export default class BlockModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			blockNum: props.blockNum,
			blockData: {}
		}

		this.fetchBlockData = this.fetchBlockData.bind(this);
	}

	componentWillReceiveProps(nextProps){
		if (this.props.blockNum != nextProps.blockNum){
			this.setState({blockNum: nextProps.blockNum},()=>{
				console.log("fetching block data");
				this.fetchBlockData();
			});
		}
	}

	fetchBlockData(){
		let blockNum = (this.state.blockNum != 0)? this.state.blockNum: -1;
		
		let url = BlowfishSingleton.createPostURL(config.views.HOTWALLET, "GET","block",{
			blockNum: blockNum.toString()
		});

		axios.get(url)
		.then((res)=>{
			let data = res.data;
			let json_obj = BlowfishSingleton.decryptToJSON(data);

			if (json_obj.result == config.constants.SUCCESS){
				this.setState({blockData: json_obj});
			}else if ("reason" in json_obj){
				console.log("block fetch failed: " + json_obj.reason);
			}
			
		})
		.catch((error)=>{
			console.log(error);
		})
	}

	render(){
		return(
			<div className="ui modal rounded_corners" id="block_modal">
				<div className="p-5">
					<div className="ui icon center aligned header witness_title_color">
						<i className="cube icon"></i>
						Block {this.state.blockNum}
				  	</div>
					<table className="ui single line definition stackable table rounded_corners">
						<tbody>
							<tr>
								<td>
									Block Hash
								</td>
								<td>
									{this.state.blockData.blockHash}
								</td>
							</tr>
							<tr>
								<td>
									Block Size
								</td>
								<td>
									{this.state.blockData.blockSize}
								</td>
							</tr>
							<tr>
								<td>
									Witness Address
								</td>
								<td>
									{this.state.blockData.witnessAddress}
								</td>
							</tr>
							<tr>
								<td>
									Total Transactions
								</td>
								<td>
									{this.state.blockData.txCount}
								</td>
							</tr>
							<tr>
								<td>
									Transaction Trie Root
								</td>
								<td>
									{this.state.blockData.txTrieRoot}
								</td>
							</tr>
							<tr>
								<td>
									Parent Hash
								</td>
								<td>
									{this.state.blockData.parentHash}
								</td>
							</tr>
							<tr>
								<td>
									Date
								</td>
								<td>
									{this.state.blockData.timestamp}
								</td>
							</tr>
						</tbody>
					</table>
					<div className="center_button actions">
						<div className="ui green ok inverted vertical button">
							Okay
						</div>
					</div>
				</div>
			</div>
		);	
	}
}
BlockModal.defaultProps = {
	blockNum: 0
}
