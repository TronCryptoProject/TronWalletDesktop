import React from "react";
import Equal from "deep-equal";
import FrozenBalanceOdometer from "./FrozenBalanceOdometer.js";
import BandwidthOdometer from "./BandwidthOdometer.js";
import SharesOdometer from "./SharesOdometer.js";
import ExpireOdometer from "./ExpireOdometer.js";
import FreezeCard from "./FreezeCard.js";
import UnfreezeCard from "./UnfreezeCard.js";
import FreezeReadMeModal from "./FreezeReadMeModal.js";
import FrozenComparisonCard from "./FrozenComparisonCard.js";


export default class Freeze extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			modalOpened: props.modalOpened,
			data: props.data,

			newFrozenBalanceValue: props.data.frozenBalance,
			newSharesValue: props.data.shares,
			newBandwidthValue: props.data.bandwidth,
			newTrxBalance: props.data.trxBalance,
			frozenBalanceDirty: false,
			sharesDirty: false,
			bandwidthDirty: false
		};

		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
		this.getExpireOdometer = this.getExpireOdometer.bind(this);
		this.renderFrozenTabMenu = this.renderFrozenTabMenu.bind(this);
		this.handleFreezeClick = this.handleFreezeClick.bind(this);
		this.handleUnfreezeClick = this.handleUnfreezeClick.bind(this);
		this.handleReadMoreClick = this.handleReadMoreClick.bind(this);
		this.handleFreezeAmountInputChange = this.handleFreezeAmountInputChange.bind(this);
		this.freezeMenuClick = this.freezeMenuClick.bind(this);
		this.unfreezeMenuClick = this.unfreezeMenuClick.bind(this);
	}

	componentDidMount(){
		$('.ui.dropdown').dropdown();
		$("#freeze_readme_modal").modal({
			allowMultiple: true,
			closable: true
		});
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {}
		if(this.props.modalOpened != nextProps.modalOpened){
			tmp_dict.modalOpened = nextProps.modalOpened;
		}

		if(!Equal(nextProps.data, this.state.data)){
			tmp_dict.data = nextProps.data;
		}

		tmp_dict = Object.assign(this.state, tmp_dict);

		this.setState(tmp_dict,()=>{
			let freeze_amt_val = $("#freeze_amt_input").val().trim();
			this.handleFreezeAmountInputChange(freeze_amt_val == "" ? -1: parseInt(freeze_amt_val));
		});
	}

	handleFreezeClick(amount){

	}

	handleUnfreezeClick(){

	}

	handleFreezeAmountInputChange(newAmount){
		//value was added to input
		if (newAmount != -1){
			let calculated_bandwidth = this.state.data.bandwidth + (3 * newAmount);
			let dirty = false;
			if (!this.state.frozenBalanceDirty){
				dirty = true;
			}

			this.setState({
				newTrxBalance: this.state.data.trxBalance - newAmount,
				newFrozenBalanceValue: this.state.data.frozenBalance + newAmount,
				newSharesValue: this.state.data.shares + newAmount,
				newBandwidthValue: calculated_bandwidth,
				frozenBalanceDirty: true,
				sharesDirty: true,
				bandwidthDirty: true
			},()=>{
				if (dirty){
					$("#freeze_frozen_balance_value").transition("swing down in");
					$("#freeze_shares_value").transition("swing down in");
					$("#freeze_bandwidth_value").transition("swing down in");
					$("#freeze_trx_balance_value").transition("swing down in");
				}
			});
		}else{
			if (this.state.frozenBalanceDirty){
				$("#freeze_frozen_balance_value").transition("swing down out");
				$("#freeze_shares_value").transition("swing down out");
				$("#freeze_bandwidth_value").transition("swing down out");
				$("#freeze_trx_balance_value").transition("swing down out");
			}
			

			//reset
			this.setState({
				newFrozenBalanceValue: this.state.data.frozenBalance,
				newSharesValue: this.state.data.shares,
				newBandwidthValue: this.state.data.bandwidth,
				frozenBalanceDirty: false,
				sharesDirty: false,
				bandwidthDirty: false
			});
		}
	}


	handleReadMoreClick(){
		$("#freeze_readme_modal")
		.modal({
			allowMultiple: true,
			onShow:()=>{
				$("#freeze_modal").addClass("blur");
			},
			onHidden:()=>{
				$("#freeze_modal").removeClass("blur");
			}
		})
		.modal("show");
	}

	handleCloseButtonClick(){
		this.props.handleDockClick(false, "#freeze_modal");
	}

	getExpireOdometer(){
		if (this.state.data.frozenBalance != 0){
			return (
				<div className="ui mini statistic width_fit_content">
					<ExpireOdometer expirationTime={this.state.data.expirationTime}/>
					<div className="label statistic_balances">
						Expiration Time Left
					</div>
				</div>
			);
		}
	}

	freezeMenuClick(){
		$("#hot_wallet_unfreeze_segment").transition("scale out");
		$("#hot_wallet_freeze_segment").transition("scale in");
	}

	unfreezeMenuClick(){
		$("#hot_wallet_freeze_segment").transition("scale out");
		$("#hot_wallet_unfreeze_segment").transition("scale in");
	}

	renderFrozenTabMenu(){
		return(
			<div className="ui card m-auto send_receive_card" id="frozen_card">
				<div className="content">
					<div className="ui top attached tabular two item menu">
						<div className="item send_receive_card_item active" data-tab="freeze"
							onClick={this.freezeMenuClick}>
	    					FREEZE
	  					</div>
	  					<div className="item send_receive_card_item" data-tab="unfreeze"
	  						onClick={this.unfreezeMenuClick}>
	    					UNFREEZE
	  					</div>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment active m-0" data-tab="freeze">
						<FreezeCard handleFreezeClick={this.handleFreezeClick} 
							handleFreezeAmountInputChange={this.handleFreezeAmountInputChange}/>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment" data-tab="unfreeze">
						<UnfreezeCard handleUnfreezeClick={this.handleUnfreezeClick}
							frozenBalance={this.state.frozenBalance}/>
					</div>
				</div>
			</div>
		);
	}

	render(){
		return(
			<div className="ui fullscreen modal fullscreen_modal clearfix" id="freeze_modal">
				<div className="ui blurring segment fullscreen_modal_segment clearfix" id="freeze_snow">					
					<div className="content">
						<div className="ui centered grid">
							<div className="three column row">
								<div className="four wide column">
									<button className="circular medium ui icon button" onClick={this.handleCloseButtonClick}>
										<i className="close icon"/>
									</button>
								</div>
								<div className="eight wide column">
									<div className="ui center aligned icon header freeze_top_header mt-0">
										<i className="snowflake icon freeze_top_header_icon"></i>
										<div className="freeze_header_title">
											Freeze/Unfreeze Your Balance
										</div>							
									</div>
								</div>
								<div className="four wide right aligned column">
									<div className="ui label cursor_pointer" onClick={this.handleReadMoreClick}>
										Read More
									</div>
								</div>
							</div>
						</div>
						
					</div>


					<div className="content mt-3">
						<div className="ui stackable centered page equal width grid p-0">
							<div className="middle center aligned column">
								<FrozenComparisonCard title="Active Balance" value={this.state.newTrxBalance}
									rawValue={this.props.data.trxBalance}
									id="freeze_trx_balance_value"/>
							</div>
							<div className="middle center aligned column">
								<FrozenComparisonCard title="Frozen Balance" value={this.state.newFrozenBalanceValue}
									rawValue={this.state.data.frozenBalance} 
									id="freeze_frozen_balance_value"/>
							</div>
							<div className="middle center aligned column">
								<FrozenComparisonCard title="Entropy" value={this.state.newBandwidthValue}
									rawValue={this.state.data.bandwidth}
									id={"freeze_bandwidth_value"}/>
							</div>
							<div className="middle center aligned column">
								<FrozenComparisonCard title="TronPower" value={this.state.newSharesValue}
									rawValue={this.state.data.shares}
									id={"freeze_shares_value"}/>
							</div>
							{this.getExpireOdometer()}
						</div>
					</div>

					<div className="content p-4">
						{this.renderFrozenTabMenu()}
					</div>

					<div className="content p-4">
						<div className="proxima_semibold width_80 text_align_center mx-auto width_80">
							Calculate and compare below what your future Entropy & Tron Power would be once you freeze 
							a specific amount. Enter a value in the amount input field. 
						</div>
					</div>
					<div className="extra freeze_description px-5 pb-5 mb-5">
						Tron utilizes Entropy in order to limit invalid, high frequency transactions. Freezing
						your balance generates Entropy, allowing you to send more than 1 transaction every 5 minutes
						and gives you Tron Power to vote for witnesses. Unfreezing will transfer funds back into your
						active account.
					</div>
				</div>
				<FreezeReadMeModal/>
			</div>
		);
	}
}

Freeze.defaulProps={
	modalOpened: false,
	handleDockClick: (function(){}),
	data: {}
}