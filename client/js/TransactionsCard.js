import React from "react";
import Equal from "deep-equal";
import axios from "axios";
import config from "../config/config.js";
import {BlowfishSingleton} from "Utils.js";

export default class TransactionsCard extends React.Component{
	constructor(props){
		super(props);
		this.getTransactions = this.getTransactions.bind(this);
		this.fetchTransactions = this.fetchTransactions.bind(this);
		this.state = {
			txsList: [],
			accInfo: props.accInfo,
			view: props.view,
			toUpdate: props.toUpdate
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
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {}
		let dirty = false;
		if (!Equal(this.props.accInfo, nextProps.accInfo)){
			tmp_dict.accInfo = nextProps.accInfo;
			dirty = true;
		}
		if (!Equal(this.props.toUpdate, nextProps.toUpdate)){
			tmp_dict.toUpdate = nextProps.toUpdate;
			if (this.state.toUpdate == false && nextProps.toUpdate == true){
				dirty = true;
			}
		}
		tmp_dict = Object.assign(this.state, tmp_dict);
		this.setState(tmp_dict, ()=>{
			if (dirty){
				this.fetchTransactions(nextProps);
			}
		});

	}

	fetchTransactions(props){
		let url = BlowfishSingleton.createPostURL(this.state.view, "GET","txs",{
			pubAddress: this.props.accInfo.pubAddress
		});

		axios.get(url)
		.then((res)=>{
			let data = res.data;
			data = BlowfishSingleton.decryptToJSON(data);

			if (data.result == config.constants.SUCCESS){
				this.setState({txsList: data.txs});
			}else{
				//TODO error handling
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
				<div className="item font_size_large" key="no_txs_found">
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
		let card_class = "txs_card";
		if (this.state.view == config.views.COLDWALLET){
			title = "Recently Signed Transactions";
			card_class = "sign_txs_card";
		}
		if (this.state.txsList.length > 0){
			title += ` (${this.state.txsList.length})`;
		}


		return(
			<div className={"ui fluid centered raised doubling card pb-3 " + card_class}
				id="txscard">
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
	},
	view: config.views.HOTWALLET,
	toUpdate: false
}