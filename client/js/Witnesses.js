import React from "react";
import axios from "axios";
import config from "../config/config.js";
import Equal from "deep-equal";
import Spinner from "./Spinner.js";
import SharesOdometer from "./SharesOdometer.js";
import BlockModal from "./BlockModal.js";

export default class Witnesses extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			modalOpened: false,
			rawShares: props.shares,
			shares: props.shares,
			witnessData: [],
			persistWitnessData: [],
			voteHistory: this.props.voteHistory,
			persistVoteHistory: this.props.voteHistory,
			isLoading: false,
			selectedBlockNum: -1
		};

		this.renderAllWitnesses = this.renderAllWitnesses.bind(this);
		this.renderVoteHistory = this.renderVoteHistory.bind(this);
		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
		this.fetchAllWitnessData = this.fetchAllWitnessData.bind(this);
		this.renderAllWitnessRows = this.renderAllWitnessRows.bind(this);
		this.handleSubmitVotes = this.handleSubmitVotes.bind(this);
		this.onWitnessSearchChange = this.onWitnessSearchChange.bind(this);
		this.onVoteHistorySearchChange = this.onVoteHistorySearchChange.bind(this);
		this.renderVoteHistoryRows = this.renderVoteHistoryRows.bind(this);
		this.handleVoteChange = this.handleVoteChange.bind(this);
		this.adjustVotes = this.adjustVotes.bind(this);
		this.handleBlockNumClick = this.handleBlockNumClick.bind(this);

		this.witness_user_votes = {};
		this.total_votes = 0;
		this.error_lock = false;
	}

	componentDidMount(){
		let v = [
			{
			  voteAddress: "27hTbUJePwyAeeAycCMhA6zVXcQi7eBNAYF",
			  voteCount: 100
			},
			{
			  voteAddress: "27fcHxDR7BxYnjjpDqn2mNrdUvkYUAVYyHf",
			  voteCount: 10
			}
		];
		this.setState({voteHistory:v,
		persistVoteHistory: v});

		$("#block_modal").modal({
			blurring: true,
			centered: true,
			transition: "scale",
			closable: true,
			duration: 100,
			onHidden:()=>{
				$("#witnesses_modal").modal("show");
			}
		});
		this.adjustVotes();
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		let modal_toggle = false;
		if(this.props.modalOpened != nextProps.modalOpened){
			tmp_dict.modalOpened = nextProps.modalOpened;
			if (nextProps.modalOpened){
				modal_toggle = true;
			}
		}

		if (this.props.shares != nextProps.shares){
			tmp_dict.rawShares = nextProps.shares;
			tmp_dict.shares = nextProps.shares;
		}

		if (!Equal(this.props.voteHistory, nextProps.voteHistory)){
			tmp_dict.voteHistory = nextProps.voteHistory;
		}

		tmp_dict = Object.assign(this.state, tmp_dict);

		this.setState(tmp_dict,()=>{
			if (modal_toggle){
				console.log("modalOpened called");
				setTimeout(()=>{
					$("#witness_sticky_content").addClass("all_witness_top_header");
				}, 500);
				
				this.fetchAllWitnessData();
			}
		});
	}

	handleSubmitVotes(){

	}

	adjustVotes(){
		if (Object.keys(this.witness_user_votes).length > 0){
			if (this.total_votes > this.state.rawShares){
				let array = [];
				for (let k of Object.keys(this.witness_user_votes)){
					array.push([k, this.witness_user_votes[k]]);
				};

				array.sort((item1,item2)=>{
					return item1[1].votes - item2[1].votes;
				});

				let total_votes = this.total_votes;
				for(let arr_item of array){
					let vote_dict = arr_item[1];
					if (total_votes > this.state.rawShares){
						this.total_votes -= vote_dict.votes;
						delete this.witness_user_votes[arr_item[0]];
						$(vote_dict.target).val("");
						$(vote_dict.target).transition("flash");
					}else{
						break;
					}
				}
			}
			
			this.setState({shares: this.state.rawShares - this.total_votes});
		}
		
	}

	onVoteHistorySearchChange(e){
		let search_value = e.target.value.toLowerCase();

		if (search_value != ""){
			let tmp_list = [];
			for(let witness of this.state.persistVoteHistory){
				if (witness.voteAddress.toLowerCase().indexOf(search_value) >= 0){
					tmp_list.push(witness);
				}
			}
			this.setState({voteHistory: tmp_list});
		}else{
			this.setState({voteHistory: this.state.persistVoteHistory});
		}
	}

	onWitnessSearchChange(e){
		let search_value = e.target.value.toLowerCase();

		if (search_value != ""){
			let tmp_list = [];
			for(let witness of this.state.persistWitnessData){
				if (witness.url.toLowerCase().indexOf(search_value) >= 0 ||
					witness.pubAddress.toLowerCase().indexOf(search_value) >= 0){
					tmp_list.push(witness);
				}
			}
			this.setState({witnessData: tmp_list});
		}else{
			this.setState({witnessData: this.state.persistWitnessData});
		}
		
	}

	fetchAllWitnessData(){
		this.setState({isLoading: true});
		axios.get(`${config.API_URL}/api/witnesses`)
		.then((res)=>{
			let json_obj = res.data;
			if (json_obj != null && json_obj != undefined && "witnessList" in json_obj){
				this.setState({
					witnessData:json_obj.witnessList,
					persistWitnessData: json_obj.witnessList,
					isLoading: false
				});
			}
		})
		.catch((error)=>{
			console.log(error);
			this.setState({isLoading: false});
		});
	}

	handleCloseButtonClick(){
		this.props.handleDockClick(false, "#witnesses_modal");
	}

	handleVoteChange(e,witness_dict){
		e.persist();
		let value = parseInt(e.target.value);
		if (isNaN(value)){
			value = 0;
		}
		let currvotes = 0;
		let proj_total_votes = this.total_votes;

		if (witness_dict.pubAddress in this.witness_user_votes){
			currvotes = this.witness_user_votes[witness_dict.pubAddress].votes;
		}
		proj_total_votes -= currvotes;
		proj_total_votes += value;


		if (proj_total_votes > this.state.rawShares){
			//cap it
			this.total_votes -= currvotes;
			let votes_left = this.state.rawShares - this.total_votes;
			if (votes_left > 0){
				$(e.target).val(votes_left);
				$(e.target).transition('flash');
				this.witness_user_votes[witness_dict.pubAddress] = {
					votes: votes_left,
					target: e.target
				};
				this.total_votes += votes_left;
			}else{
				$(e.target).val("");
				$(e.target).parent().addClass("error");
				setTimeout(()=>{
					$(e.target).parent().removeClass("error");
				},300);

			}
			
			this.setState({shares: this.state.rawShares - this.total_votes});
		}else{
			if (value > 0){
				this.witness_user_votes[witness_dict.pubAddress] = {
					votes: value,
					target: e.target
				};
			}else{
				delete this.witness_user_votes[witness_dict.pubAddress];
			}
			
			this.total_votes = proj_total_votes;
			this.setState({shares: this.state.rawShares - this.total_votes});
		}

	}

	handleBlockNumClick(e,blockNum){
		this.setState({selectedBlockNum: blockNum},()=>{
			$("#block_modal").modal("show");
		});
	}

	renderAllWitnessRows(){
		let tr_list = [];
		for(let witness_dict of this.state.witnessData){
			let td_list = [];
			let key = witness_dict.pubAddress;
			//witness url
			td_list.push(
				<td key={key}>
					<h4 className="ui header">
						<div className="content all_witness_table_row_content">
				            {witness_dict.url}
				        	<div className="sub header ellipse_text">
				        		{witness_dict.pubAddress}
				        	</div>
				        </div>
					</h4>
				</td>
			);

			key += witness_dict.latestBlockNum
			//latest block
			if (witness_dict.latestBlockNum != 0){
				td_list.push(
					<td key={key}>
						<a href="#" onClick={(e)=>{this.handleBlockNumClick(e,witness_dict.latestBlockNum)}}>
							{witness_dict.latestBlockNum}
						</a>
					</td>
				);
			}else{
				td_list.push(
					<td key={key}>{witness_dict.latestBlockNum}</td>
				);
			}
			

			key += witness_dict.totalMissed
			//blocks missed
			td_list.push(
				<td key={key}>{witness_dict.totalMissed}</td>
			);

			key += witness_dict.totalProduced
			//blocks created
			td_list.push(
				<td key={key}>{witness_dict.totalProduced}</td>
			);

			key += witness_dict.voteCount
			//total votes
			td_list.push(
				<td key={key}>{witness_dict.voteCount}</td>
			);

			let input_val = "";
			if(witness_dict.pubAddress in this.witness_user_votes){
				input_val = this.witness_user_votes[witness_dict.pubAddress].votes;
			}

			td_list.push(
				<td key={witness_dict.pubAddress+"_input"}>
					<div className="ui input vote_input_div">
						<input className="text_align_center vote_input" type="number" placeholder="0"
							onChange={(e)=>{this.handleVoteChange(e,witness_dict)}}
							min="0" step="1" value={input_val}/>
						
					</div>
				</td>
			);

			tr_list.push(
				<tr key={"tr_"+key}>
					{td_list}
				</tr>
			);
		}
		return tr_list;
	}

	renderAllWitnesses(){
		return(
			<div>
				<div className="ui center_button search p-2 left floated">
					<div className="ui icon input">
						<input className="prompt" type="text" placeholder="Search witness..."
							id="search_witness" onChange={(e)=>{this.onWitnessSearchChange(e)}}/>
    						<i className="search icon"></i>
					</div>
					<div className="results"></div>
				</div>

				<div className="p-2 center_button right floated">
					<button className="ui right labeled icon green button" onClick={this.handleSubmitVotes}>
						<i className="paperplane icon "/>
						Submit Votes
					</button>
				</div>

				<table className="ui very basic selectable collapsing striped table all_witness_table">
					<thead>
						<tr>
							<th className="five wide all_witness_table_header">Witness</th>
							<th className="two wide all_witness_table_header">Latest Block</th>
							<th className="two wide all_witness_table_header">Blocks Missed</th>
							<th className="two wide all_witness_table_header">Blocks Created</th>
							<th className="two wide all_witness_table_header">Total Votes</th>
							<th className="three wide all_witness_table_header">
								<img className="px-1" width="28" height="25" src="client/images/tronmoney.png"/>
								Place Vote
							</th>
						</tr>
					</thead>
					<tbody>
						{this.renderAllWitnessRows()}
					</tbody>
				</table>
				<Spinner show={this.state.isLoading} size="huge" colorClass="witness_title_color"/>
			</div>
		);
	}

	renderVoteHistoryRows(){
		let tr_list = [];

		if (this.state.voteHistory.length != 0){
			for(let vote_history_dict of this.state.voteHistory){
				let td_list = [];
				let key = vote_history_dict.voteAddress;
				//witness pub address
				td_list.push(
					<td key={key}>
						<h4 className="ui sub header all_witness_table_row_content">
							{vote_history_dict.voteAddress}
						</h4>
					</td>
				);

				key += vote_history_dict.voteCount.toString();
				//vote count
				td_list.push(
					<td className="text_align_right" key={key}>{vote_history_dict.voteCount}</td>
				);

				tr_list.push(
					<tr key={"tr_"+key}>
						{td_list}
					</tr>
				);
			}
		}else{
			tr_list.push(
				<tr key="key_empty_history">
					<td colSpan="2">
						<div className="center aligned content">
							<div className="meta">
								You haven't voted yet
							</div>
						</div>
					</td>
				</tr>
			);
		}
		
		return tr_list;
	}

	renderVoteHistory(){
		return(
			<div>
				<div className="ui center_button search p-2">
					<div className="ui icon input">
						<input className="prompt" type="text" placeholder="Search witness..."
							id="search_vote" onChange={(e)=>{this.onVoteHistorySearchChange(e)}}/>
    						<i className="search icon"></i>
					</div>
					<div className="results"></div>
				</div>


				<table className="ui very basic selectable collapsing striped table all_witness_table">
					<thead>
						<tr>
							<th className="eight wide all_witness_table_header">Vote Address</th>
							<th className="eight wide text_align_right all_witness_table_header">Vote Count</th>
						</tr>
					</thead>
					<tbody>
						{this.renderVoteHistoryRows()}
					</tbody>
				</table>
			</div>
		);
	}

	render(){
		return(

			<div className="ui fullscreen modal fullscreen_modal clearfix" id="witnesses_modal">
				<div className="ui blurring segment fullscreen_modal_segment">
					<div className="content" id="witness_sticky_content">

						<div className="ui centered grid">
							<div className="three column row">
								<div className="four wide column">
									<button className="circular medium ui icon button" onClick={this.handleCloseButtonClick}>
										<i className="close icon"/>
									</button>
								</div>
								<div className="eight wide column center aligned">
									<h4 className="ui center aligned large image header
										all_witnesses_header_title mt-0">
										<i className="linkify icon"/>	
										Witnesses						
									</h4>
								</div>
								<div className="four wide right aligned column m-auto">
									<SharesOdometer shares={this.state.shares} id="witness_shares_odo"/>
								</div>
							</div>
						</div>
						
					</div>

					<div className="content p-5">
						<div className="extra all_witnesses_description">
							You can vote for Super Representatives as much as you have shares in your account. Your 
							number of shares equals the number of TRX you have frozen. You can vote as many times as you want,
							however, only your last vote will count. All previous votes expire after unfreezing. 
							<br/>
							<br/>
							<div className="text_align_center">
								Voting results are tallied every 4 hours. 
							</div>
						</div>
					</div>

					<div className="content">
						<div className="ui card m-auto all_witness_card" id="witnesses_card">
							<div className="content pt-0">
								<div className="ui top attached tabular two item menu">
									<div className="item send_receive_card_item active" data-tab="allwitnesses">
				    					All Witnesses
				  					</div>
				  					<div className="item send_receive_card_item" data-tab="votehistory">
				    					Vote History
				  					</div>
								</div>
								<div className="ui bottom attached tab segment send_receive_card_segment active" data-tab="allwitnesses">
									{this.renderAllWitnesses()}
								</div>
								<div className="ui bottom attached tab segment send_receive_card_segment" data-tab="votehistory">
									{this.renderVoteHistory()}
								</div>
							</div>
						</div>
					</div>
					
				</div>
				<BlockModal blockNum={this.state.selectedBlockNum}/>
			</div>
			
		);
	}
}

Witnesses.defaultProps = {
	handleDockClick: (function(){}),
	modalOpened: false,
	shares: 0,
	voteHistory: []
}