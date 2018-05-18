import React from "react";
import Equal from "deep-equal";
import FrozenBalanceOdometer from "./FrozenBalanceOdometer.js";
import BandwidthOdometer from "./BandwidthOdometer.js";
import SharesOdometer from "./SharesOdometer.js";
import ExpireOdometer from "./ExpireOdometer.js";
import FreezeCard from "./FreezeCard.js";
import UnfreezeCard from "./UnfreezeCard.js";

require("particles.js");

export default class Freeze extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			modalOpened: props.modalOpened,
			data: props.data
		};

		this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
		this.getExpireOdometer = this.getExpireOdometer.bind(this);
		this.renderFrozenTabMenu = this.renderFrozenTabMenu.bind(this);
		this.handleFreezeClick = this.handleFreezeClick.bind(this);
		this.handleUnfreezeClick = this.handleUnfreezeClick.bind(this);
	}

	componentDidMount(){
		$('.ui.dropdown').dropdown();
	}

	componentWillReceiveProps(nextProps){
		let tmp_dict = {}
		if(this.props.modalOpened != nextProps.modalOpened){
			tmp_dict.modalOpened = nextProps.modalOpened;
			if (nextProps.modalOpened){
				particlesJS.load("freeze_snow", "client/config/FreezeParticles.json", ()=>{
					console.log('callback - particles.js config loaded');
				});
			}
		}
		if(!Equal(nextProps.data, this.state.data)){
			tmp_dict.data = nextProps.data;
		}

		tmp_dict = Object.assign(this.state, tmp_dict);

		this.setState(tmp_dict,()=>{
		});
	}


	handleCloseButtonClick(){
		this.props.handleDockClick(false, "#freeze_modal");
	}

	handleFreezeClick(amount){

	}

	handleUnfreezeClick(){

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

	renderFrozenTabMenu(){
		return(
			<div className="ui card m-auto send_receive_card" id="frozen_card">
				<div className="content">
					<div className="ui top attached tabular two item menu">
						<div className="item send_receive_card_item active" data-tab="freeze">
	    					FREEZE
	  					</div>
	  					<div className="item send_receive_card_item" data-tab="unfreeze">
	    					UNFREEZE
	  					</div>
					</div>
					<div className="ui bottom attached tab segment send_receive_card_segment active m-0" data-tab="freeze">
						<FreezeCard handleFreezeClick={this.handleFreezeClick}/>
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
				<div className="ui blurring segment fullscreen_modal_segment" id="freeze_snow">					
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
										<i className="snowflake icon"></i>
										<div className="freeze_header_title">
											Freeze/Unfreeze Your Balance
										</div>							
									</div>
								</div>
								<div className="four wide right middle aligned column">
								</div>
							</div>
						</div>
						
					</div>

					<div className="content p-4">
						<div className="extra freeze_description">
							Tron utilizes Entropy in order to limit invalid, high frequency transactions. Freezing
							your balance generates Entropy, allowing you to send more than 1 transaction every 5 minutes
							and gives you Tron Power to vote for witnesses. Unfreezing will transfer funds back into your
							active account. 
						</div>
					</div>

					<div className="content">
						<div className="ui stackable centered page equal width grid p-0">
							<div className="middle center aligned column">
								<FrozenBalanceOdometer frozenBalance={this.state.data.frozenBalance}/>
							</div>
							<div className="middle center aligned column">
								<BandwidthOdometer bandwidth={this.state.data.bandwidth}/>
							</div>
							<div className="middle center aligned column">
								<SharesOdometer shares={this.state.data.shares}/>
							</div>
							{this.getExpireOdometer()}
						</div>
					</div>

					<div className="content p-5">
						{this.renderFrozenTabMenu()}
					</div>
				</div>
			</div>
		);
	}
}

Freeze.defaulProps={
	modalOpened: false,
	handleDockClick: (function(){}),
	data: {}
}