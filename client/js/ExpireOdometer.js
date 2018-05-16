import React from "react";
import Odometer from "./odometer.js";

export default class ExpireOdometer extends React.Component{
	constructor(props){
		super(props);
		this.updateExpireOdometer = this.updateExpireOdometer.bind(this);
		this.parseDate = this.parseDate.bind(this);
		this.startTimer = this.startTimer.bind(this);
		this.endTimer = this.endTimer.bind(this);

		this.state = {
			expirationTime: props.expirationTime,
			timeLeft: 0
		};
		this.hr_odometer = null;
		this.min_odometer = null;
		this.sec_odometer = null;
		this.timer = null;
	}

	componentDidMount(){
		console.log("MOUTED TIME: " + this.props.expirationTime);
		this.setState({timeLeft: this.parseDate(this.props.expirationTime)});
		this.updateExpireOdometer();
		this.startTimer();
	}

	componentWillUnmount(){
		this.endTimer();
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.expirationTime != this.state.expirationTime){
			let time_left = this.parseDate(nextProps.expirationTime);
			this.setState({
				expirationTime: nextProps.expirationTime,
				timeLeft: time_left
			},()=>{
				this.updateExpireOdometer();
				this.startTimer();
			});
		}
	}

	parseDate(date_str){
		console.log("str: " + date_str);
		let date = new Date(date_str);
		console.log(date.getTime());
		let date_secs = Math.ceil(date.getTime() / 1000);
		let curr_date = Math.ceil(Date.now() / 1000);
		let time_left = date_secs - curr_date;
		console.log("time_left: " + time_left);
		let hrs = Math.ceil(time_left / 3600);
		let mins = Math.ceil((time_left%3600)/60);
		let secs = Math.ceil(time_left%60);
		console.log("hr: " + hrs + " min: " + mins + " secs: " + secs);
		return {
			hr: hrs,
			min: mins,
			sec: secs
		};
	}

	startTimer(){
		if (!this.timer){
			this.timer = setInterval(()=>{
				let t = this.state.timeLeft;
				if (t.hr == 0 && t.min == 0 && t.sec == 0){
					this.endTimer();
				}else{
					if (t.sec > 0){
						t.sec = t.sec - 1;
					}else if (t.sec == 0){
						if (t.min > 0){
							t.min = t.min - 1;
							t.sec = 59;
						}else if (t.min == 0){
							if (t.hr > 0){
								t.min = 59;
								t.sec = 59;
							}
						}
					}
					this.setState({timeLeft: t}, ()=>{
						this.updateExpireOdometer();
					});
				}
			},1000);
		}
	}

	endTimer(){
		if (this.timer){
			clearInterval(this.timer);
		}
	}

	updateExpireOdometer(){
		if (this.hr_odometer == null){
			this.hr_odometer = new Odometer({
				el: $("#hotwallet_exp_hr_odo")[0],
				value: this.state.timeLeft.hr,
				theme: "minimal",
				format: "d"
			})
			this.hr_odometer.render();
		}else{
			this.hr_odometer.update(this.state.timeLeft.hr);
		}

		if (this.min_odometer == null){
			this.min_odometer = new Odometer({
				el: $("#hotwallet_exp_min_odo")[0],
				value: this.state.timeLeft.min,
				theme: "minimal",
				format: "d"
			})
			this.min_odometer.render();
		}else{
			this.min_odometer.update(this.state.timeLeft.min);
		}

		if (this.sec_odometer == null){
			this.sec_odometer = new Odometer({
				el: $("#hotwallet_exp_sec_odo")[0],
				value: this.state.timeLeft.sec,
				theme: "minimal",
				format: "d"
			})
			this.sec_odometer.render();
		}else{
			this.sec_odometer.update(this.state.timeLeft.sec);
		}
	}


	render(){
		return(
			<div className="ui grid">
				<div className="three column row">
					<div className="column pr-0">
						<div className="ui mini statistic width_fit_content">
							<div className="value statistic_value_purple text_align_right">
								<span className="height_0" id="hotwallet_exp_hr_odo">
									{this.state.usdBalance}
								</span>
							</div>
							<div className="label statistic_balances text_align_right timer_odometer_label">
								Hr
							</div>
						</div>
					</div>

					<div className="column pr-0">
						<div className="ui mini statistic width_fit_content">
							<div className="value statistic_value_purple text_align_right">
								<span className="height_0" id="hotwallet_exp_min_odo">
									{this.state.usdBalance}
								</span>
							</div>
							<div className="label statistic_balances text_align_right timer_odometer_label">
								Min
							</div>
						</div>
					</div>

					<div className="column">
						<div className="ui mini statistic width_fit_content">
							<div className="value statistic_value_purple text_align_right">
								<span className="height_0" id="hotwallet_exp_sec_odo">
									{this.state.usdBalance}
								</span>
							</div>
							<div className="label statistic_balances text_align_right timer_odometer_label">
								Sec
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

ExpireOdometer.defaultProps = {
	expirationTime: "" //ex: "Thu May 17 00:02:15 PDT 2018"
}