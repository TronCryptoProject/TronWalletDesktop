// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const React = require('react');
const ReactDOM = require('react-dom');

import MainView from './MainView.js';

class IndexPage extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
    	return(
    		<div>
    			<MainView/>
    		</div>
    	);
    }
}
ReactDOM.render(<IndexPage />, document.getElementById('root_renderer'));