import React from "react";

export default class TransactionViewerModal extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			txData: props.txData
		};
	}

	componentWillReceiveProps(nextProps){
		if (this.props.txData != nextProps.txData){
			this.setState({txData: nextProps.txData});
		}
	}

	render(){
		return(
			<div className="ui modal rounded_corners" id="tx_viewer_modal">
				<div className="p-5">
					<div className="ui center aligned large header witness_title_color">
						<i className="list alternate icon"></i>
						Transaction Info
				  	</div>
			  		<div className="ui one column centered padded grid">
						<div className="two column row">
							<div className="ten wide column">
								<div className="ui one column grid">
									<div className="row pb-0">
										<div className="content">
											<div className="ui header">
												FROM:
											</div>
											<div className="meta">
												{this.state.txData.from}
											</div>
										</div>
									</div>
									<div className="row">
										<div className="content">
											<div className="ui header">
												To:
											</div>
											<div className="meta">
												{this.state.txData.to}
											</div>
										</div>
									</div>
								</div>
								
								
							</div>
							<div className="six wide middle aligned column">

								<div className="ui statistic m-0">
									<div className="label">
										Amount
									</div>
									<div className="value statistic_value_green">
										{this.state.txData.amount ? this.state.txData.amount : 0}
									</div>
									<div className="label statistic_value_green">
										TRX
									</div>
								</div>
							</div>
						</div>
					</div>
				  	<table className="ui single line definition stackable table rounded_corners">
						<tbody>
							<tr>
								<td>
									Raw Transaction Data
								</td>
								<td>
									{this.state.txData.data}
								</td>
							</tr>
							<tr>
								<td>
									Timestamp
								</td>
								<td>
									{this.state.txData.timestamp}
								</td>
							</tr>
							<tr>
								<td>
									Transaction Hash
								</td>
								<td>
									{this.state.txData.txhash}
								</td>
							</tr>
							<tr>
								<td>
									Signatures
								</td>
								<td>
									{this.state.txData.signatures}
								</td>
							</tr>
							<tr>
								<td>
									Status
								</td>
								<td>
									{this.state.txData.result}
								</td>
							</tr>
						</tbody>
					</table>
					<div className="center_button actions mt-5">
						<div className="ui red deny inverted vertical icon left labeled button">
							Cancel
							<i className="remove icon"/>
						</div>
						<div className="ui green ok inverted vertical icon right labeled button">
							Sign Transaction
							<i className="pencil alternate icon"/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

TransactionViewerModal.defaultProps = {
	txData: {}
}