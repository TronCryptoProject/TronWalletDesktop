import React, { Component } from "react"
import {ComposableMap,ZoomableGroup,Geographies,Geography,Markers,Marker} from "react-simple-maps";
import Equal from "deep-equal";

class ToolTip extends Component{
		constructor(props){
				super(props);
		}
		render(){
				let style = {
						left: this.props.x,
						top: this.props.y - 25
				};
				if (this.props.text != ""){
						return(
						<div className="map_tooltip" style={style}>
							{this.props.text}
						</div>
				);
				}else{
						return(<div/>);
				}
		}
}

export default class WorldMap extends Component {
	constructor(props) {
		super(props)
		this.handleHoverEnter = this.handleHoverEnter.bind(this);
		this.handleHoverLeave = this.handleHoverLeave.bind(this);
		this.renderNodes = this.renderNodes.bind(this);
		this.state = {
			x: 0,
			y: 0,
			text: "",
			nodes: [],
			selectListItem: ""
		}
	}
	componentWillReceiveProps(nextProps){
		let tmp_dict = {};
		if (!Equal(nextProps.nodes, this.props.nodes)){
			tmp_dict.nodes = nextProps.nodes;
		}
		if (!Equal(nextProps.selectListItem, this.props.selectListItem)){
			tmp_dict.selectListItem = nextProps.selectListItem;
		}
		this.setState(tmp_dict);
	}
	handleHoverEnter(ipinfo, evt) {
			this.setState({x: evt.clientX, y: evt.clientY, text: `${ipinfo.host} (${ipinfo.port})`});
	}
	handleHoverLeave() {
			this.setState({x:0,y:0,text:""});
	}

	renderNodes(){
		let nodes = [];

		for (let i = 0; i < this.state.nodes.length; i++){
			let node_dict = this.state.nodes[i];
			if (node_dict.host == this.state.selectListItem){
				nodes.push(
					<Marker onMouseMove={this.handleHoverEnter} onMouseLeave={this.handleHoverLeave}
						key={i} marker={node_dict}
						style={{
							default: { fill: "#75c156" },
							hover: { fill: "#75c156" },
							pressed: { fill: "#75c156" },
						}}
						>
						<circle cx={0} cy={0} r={20} style={{
								stroke: "#75c156",
								strokeWidth: 2,
								opacity: 0.9,
								zIndex: 100000
							}}
						/>
					</Marker>
				);
			}else{
				nodes.push(
					<Marker onMouseMove={this.handleHoverEnter} onMouseLeave={this.handleHoverLeave}
						key={i} marker={node_dict}
						style={{
							default: { fill: "#FF5722" },
							hover: { fill: "#FFFFFF" },
							pressed: { fill: "#FF5722" },
						}}
						>
						<circle cx={0} cy={0} r={5} style={{
								stroke: "#FF5722",
								strokeWidth: 2,
								opacity: 0.9,
							}}
						/>
					</Marker>
				);
			}
			
		}
		
		return nodes;
	}

	render() {
		return (
			<div className="left floated map_div">
				<ComposableMap
			          style={{
			            width: "80vw",
			            height: "60vh"
			          }}>
					<ZoomableGroup>
						<Geographies geography="client/config/world-50m.json">
							{(geos, proj) =>
								geos.map((geography,i) => (
									<Geography
										key={i}
										geography={geography}
										projection={proj}
										style={{
											default: {
												fill: "#ECEFF1",
												stroke: "#607D8B",
												strokeWidth: 0.75,
												outline: "none",
											},
											hover: {
												fill: "#607D8B",
												stroke: "#607D8B",
												strokeWidth: 0.75,
												outline: "none",
											},
											pressed: {
												fill: "#FF5722",
												stroke: "#607D8B",
												strokeWidth: 0.75,
												outline: "none",
											},
										}}
									/>
								))
							}
						</Geographies>
						<Markers>
							{this.renderNodes()}
						</Markers>
					</ZoomableGroup>
				</ComposableMap>
				<ToolTip x={this.state.x} y={this.state.y} text={this.state.text}/>
			</div>
		)
	}
}
WorldMap.defaultProps = {
	selectListItem: ""
}