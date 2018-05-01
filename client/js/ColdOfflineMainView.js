import React from "react";
import config from "../config/config.js";
import jetpack from "fs-jetpack";
import ReactCodeInput from "react-code-input";

export default class ColdOfflineMainView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			
		}
		this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
		this.renderHeader = this.renderHeader.bind(this);
		this.renderMenu = this.renderMenu.bind(this);
		this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
		this.getAllAccounts = this.getAllAccounts.bind(this);
		this.onCodeChangeHandler = this.onCodeChangeHandler.bind(this);
	}

	componentDidMount(){
		 $("#" + config.coldOfflineMenuItems.IMPORT).addClass("menu_item_active");
		 $("#" + config.coldOfflineMenuItems.REGISTER).addClass("right_border_tabular_menu");
		 $("#" + config.coldOfflineMenuItems.PAPERWALLET).addClass("right_border_tabular_menu");
	}

	handleBackButtonClick(){
		this.props.handleBackButtonClick();
	}

	handleMenuItemClick(e){
		for (let id in config.coldOfflineMenuItems){
			if (id == e.target.id){
				$("#" + id).addClass("menu_item_active");
				$("#" + id).removeClass("right_border_tabular_menu");
			}else{
				$("#" + id).removeClass("menu_item_active");
				$("#" + id).addClass("right_border_tabular_menu");
			}
		}
		
	}

	onCodeChangeHandler(){

	}

	getAllAccounts(){
		let read_data = jetpack.read(config.walletConfigFile, "json");
		if (!read_data || !("accounts" in read_data) || read_data.accounts.length == 0){
			return(
				<div className="item">
					<div className="content">
						<div className="header">
							No Accounts Found
						</div>
					</div>
				</div>
			);
		}else{
			let res_list = [];
			let color_ptr = "";

			for(let acc_dict of read_data.accounts){
				let acc_name = acc_dict.accName;
				let pub_address = acc_dict.accPubAddress;
				
				let getAccountInit = (name)=>{
					if (name == ""){
						return "NA"
					}else{
						return name[0].toUpperCase();
					}
				};

				let getAccountLabelColor = ()=>{
					let colors = ["violet_label", "light_blue_label", "gray_purple_label", "magenta_label"];
					let color_picked = colors[Math.floor(Math.random() * colors.length)];
					while (color_picked == color_ptr){
						color_picked = colors[Math.floor(Math.random() * colors.length)];
					}
					color_ptr = color_picked;
					return color_picked;
				}

				let classname = "ui left floated circular large label " + getAccountLabelColor();

				res_list.push(
					<div className="item" key={pub_address}>
						<span className={classname}>{getAccountInit(acc_name)}</span>
						<div className="left floated content">
							<div className="left aligned header">
								{acc_name == "" ? "no name found" : acc_name}
							</div>
							<div className="meta">
								{pub_address}
							</div>
						</div>
					</div>
				);

			}
			return res_list;
		}
	}

	renderHeader(){
		return(
			<div className="three column row">
				<div className="two wide column">
					<button className="circular medium ui icon button" onClick={this.handleBackButtonClick}>
						<i className="arrow left icon"/>
					</button>
				</div>

				<div className="thirteen wide column">
					<div className="ui one column page centered padded grid">
						<div className="two column row">
							<div className="four wide column">
								<img className="ui right floated image" src="client/images/tronbluefat.png"
									width="80" height="80"/>
							</div>
							<div className="twelve wide column">
								<div className= "ui label header_label_div">
									<div className="cold_offline_header_title">COLD OFFLINE</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="one wide column"/>
			</div>
		);
	}

	renderMenu(){
		let code_input_props = {
			inputStyle: {
				fontFamily: "monospace",
			    borderRadius: "50px",
			    border: "3px solid rgba(53, 86, 212, 0.74)",
			    boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 10px 0px",
			    margin: "4px",
			    width: "50px",
			    height: "50px",
			    fontSize: "32px",
			    boxSizing: "border-box",
			    color: "#3316c5",
			    fontWeight: "bolder",
			    textAlign: "center",
			    backgroundColor: "transparent"
			}
		};

		return(
			<div className="ui one column page centered padded grid">
				<div className="two column row m-0">
					<div className="four wide column">
						<div className="ui vertical fluid tabular stackable menu borderless_tabular_menu">
							<a className="item" id={config.coldOfflineMenuItems.IMPORT}
								onClick={(e)=>{this.handleMenuItemClick(e)}}>
								Import
							</a>
							<a className="item" id={config.coldOfflineMenuItems.REGISTER} 
								onClick={(e)=>{this.handleMenuItemClick(e)}}>
								Register
							</a>
							<a className="item" id={config.coldOfflineMenuItems.PAPERWALLET}
								onClick={(e)=>{this.handleMenuItemClick(e)}}>
								Paper Wallet
							</a>
						</div>
					</div>
					<div className="twelve wide stretched column">
							<div className="ui m-auto shape">
								<div className="centered sides">
									<div className="side active">
										<div className="ui raised card width_height_fit_content
											cold_offline_import_card">

											<div className="center aligned content">
												<div className="ui header">Accounts</div>
												<div className="description">Please select one</div>
												<div className="ui middle aligned selection animated list">
													{this.getAllAccounts()}
												</div>
												
												<div className="ui header">Wallet Passcode</div>
												<div className="py-3">
													<ReactCodeInput type="number" fields={6} {...code_input_props}
														onChange={this.onCodeChangeHandler}/>
												</div>
											</div>
											<div className="ui bottom attached button cold_offline_import_btn">
										    	IMPORT
										    </div>
										</div>
									</div>

								</div>
							</div>
					
					</div>
				
				</div>
			</div>
		);
	}

	render(){
		return(
			<div className="draggable blue_gradient_background" id="coldofflinemainview">
				<div className="ui grid">
					{this.renderHeader()}
					<div className="row px-5">
						{this.renderMenu()}
					</div>
				</div>
			</div>


				
		);
	
	}
}

ColdOfflineMainView.defaultProps = {
	handleBackButtonClick: (function(){})
}
