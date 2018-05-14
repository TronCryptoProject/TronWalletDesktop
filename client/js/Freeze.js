import React from "react";

export default class Freeze extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			modalOpened: false
		};

		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {}
		if(this.props.modalOpened != nextProps.modalOpened){
			if (nextProps.modalOpened){
				tmp_dict.modalOpened = nextProps.modalOpened;
			}
		}

		this.setState(tmp_dict,()=>{
		});
	}


	handleCloseButtonClick(){
		this.props.handleDockClick(false, "#freeze_modal");
	}

	render(){
		return(
			<div className="ui fullscreen modal fullscreen_modal clearfix" id="freeze_modal">
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
									<h4 className="ui center aligned small icon header map_header_color mt-0">
										<i className="snowflake icon"></i>
										Freeze/Unfreeze Your Balance							
									</h4>
								</div>
								<div className="four wide right middle aligned column">
									<div className="ui mini statistic width_fit_content">
										<div className="value statistic_value_green text_align_right">
											{this.state.shares}
										</div>
										<div className="label statistic_balances">
											Voting Shares Left
										</div>
									</div>
								</div>
							</div>
						</div>
						
					</div>

					<div className="content p-5">
						<div className="extra">
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
			</div>
		);
	}
}

Freeze.defaulProps={

}