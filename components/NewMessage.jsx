import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {Grid, Row, Col} from 'react-flexbox-grid/lib';

export default class NewMessage extends Component {
	constructor(props){
		super(props);
		this.state = {
			userInput:""
		};
	}

	handleChange(e){
		this.props.psocket.emit('typing',this.props.name,this.props.channelId);	//emit the name of user typing.
		this.setState({userInput:e.target.value});
	}
	handleClick(){
		if(this.state.userInput!=="")
		{this.props.psocket.emit("send message",this.props.name,this.props.channelId,this.state.userInput);
				this.setState({userInput:""});}
	}
	
	render() {
		console.log(this.state.userInput,"here");
		return (
			<div>
			<Grid fluid={true}>
			<Row>
			<Col lg={11}>
				<TextField value={this.state.userInput} hintText="Type Message" 
				fullWidth={true} multiLine={true} rowsMax={4} 
				 onChange={this.handleChange.bind(this)}/>
			</Col>
			<Col lg={1}>
				 <RaisedButton label="SEND" primary={true} onClick={this.handleClick.bind(this)} />
			</Col>
			
			</Row>
			</Grid>
			</div>
		);
	}
	
}

