import React from "react";
import Equal from "deep-equal";
import axios from "axios";
import config from "../config/config.js";

export default class TransactionsCard extends React.Component{
	constructor(props){
		super(props);
		this.getTransactions = this.getTransactions.bind(this);
		this.fetchTransactions = this.fetchTransactions.bind(this);
		let txs_list = [
				{
					"from": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"to": "27UJ8qgmW8e2vx2Cev7s76eFX3tuKHtF21E",
					"amount": 45924,
					"timestamp": 2903849823572
				},
				{
					"from": "27XSDWdW218f3n24w3X9zsrizfTHyty6gLy",
					"to": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"amount": 4594,
					"timestamp": 2903849823272
				},
				{
					"from": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"to": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"amount": 4593242324,
					"timestamp": 290384523572
				},
				{
					"from": "27XSDWdW218f3neNw3X9zsrizfTHyty6gLy",
					"to": "27UJ8qgmW8e2vx2Cev7s26eFX3tuKHtF21E",
					"amount": 424.24,
					"timestamp": 2903829823572
				}
			];
		this.state = {
			txsList: txs_list,
			accInfo: this.props.accInfo
		};
	}

	componentDidMount(){
		$("#txscard").transition("hide");
		setTimeout(()=>{
			$("#txscard").transition({
				animation: "scale in",
			 	duration  : 1000
			});
		},200);

		this.fetchTransactions(this.props);
		//this.setState({txsList: 
		//});
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {}

		if (!Equal(this.props.accInfo, nextProps.accInfo)){
			tmp_dict.accInfo = nextProps.accInfo;
		}
		tmp_dict = Object.assign(this.state, tmp_dict);
		this.setState(tmp_dict);

	}

	fetchTransactions(props){
		axios.get(`${config.API_URL}/api/txs/` + this.props.accInfo.pubAddress)
		.then((res)=>{
			let json_obj = res.data;
			if (json_obj && "result" in json_obj){
				if (json_obj.result == config.constants.SUCCESS){
					this.setState({txsList: json_obj.transactions});
				}else{
					//fetch failed
					console.log("tx failed");
				}
			}
		})
		.catch((error)=>{
			console.log(error);
		});
	}

	getTransactions(){
		let txs_list = [];

		if (this.state.txsList.length > 0){
			for (let tx of this.state.txsList){
				let acc_from = tx.from;
				let acc_to = tx.to;
				let amt = tx.amount;
				let timestamp = tx.timestamp;

				//outgoing transaction
				let from_me = true;

				//incoming transaction
				if (acc_from != this.state.accInfo.pubAddress){
					from_me = false;
				}

				let imgsrc = "client/images/txin.png";
				let header = "From";
				let address = acc_from;
				if (from_me){
					imgsrc = "client/images/txout.png";
					header = "To";
					address = acc_to;
				}

				txs_list.push(
					<div className="pl-0 item" key={timestamp}>
						<img className="ui left floated image m-0" width="40" height="40"
							src={imgsrc}/>
						<div className="right floated content">
							<div className="right aligned header">Amount</div>
							<div className="right aligned description">{amt}</div>
						</div>
						
						<div className="left aligned floated content p-0">
							<div className="header">{header}</div>
							<div className="description tx_list_address">{address}</div>
							<div className="extra tx_list_timestamp">{timestamp}</div>
						</div>
						
					</div>
				);
			}
		}else{
			txs_list.push(
				<div className="item" key="no_txs_found">
					<div className="center aligned content">
						No transactions found
					</div>
				</div>
			);
		}
		
		return txs_list;
	}

	render(){
		let title = "Recent Transactions";
		if (this.state.txsList.length > 0){
			title += ` (${this.state.txsList.length})`;
		}

		return(
			<div className="ui fluid centered raised doubling card txs_card" id="txscard">
				<div className="content clearfix height_100">
					<div className="ui small m-0 center aligned header">{title}</div>
					<div className="ui middle aligned selection list">
						{this.getTransactions()}
					</div>
					<div className="faded_bottom"/>
				</div>
			</div>
		);
	}
}

TransactionsCard.defaultProps = {
	accInfo: {
		accountName : "",
		pubAddress: ""
	}
}