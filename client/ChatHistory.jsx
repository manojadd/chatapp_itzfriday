import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';

export default class ChatHistory extends Component {
	constructor(props){
		super(props);
		this.state={historyEnded:false};
	}

	componentDidMount(){
		this.props.psocket.on('historyEmpty',(msg)=>{
			this.handleHistoryEmpty(msg);
		});

		let msg = {"pageNo":"initial_primary","channelName":this.props.channelId};//increment the pages displayed currently.
		this.props.psocket.emit('receiveChatHistory',msg);
	}

	handleHistoryEmpty(msg){
		this.setState({historyEnded:true});
	}
	getEarlierMessages(){
		let msg = {"pageNo":(this.props.next),"channelName":this.props.channelId};
		this.props.psocket.emit('receiveChatHistory',msg);
	}

	render() {
		let lem;
		if(this.state.historyEnded)
		lem = null;
		else
		lem = (<FlatButton label="Load Earlier Messages" primary={true} onClick={this.getEarlierMessages.bind(this)}/>);

		let messageList = this.props.chatHistory.map((message,i)=>{
			if(this.props.username !== message.sender)
			return (<Row key={i} start="xs"><Col xs={10} sm={10} md={10} lg={10} style={{marginTop:'2vh',marginBottom:'2vh',maxWidth:'80%'}}><Card >
			<CardTitle title={message.sender} subtitle={message.TimeStamp}  />
			<CardText style={{overflow:"hidden"}}>{message.msg}</CardText>
		</Card></Col></Row>);
		else
		return (<Row key={i} end="xs"><Col xs={10} sm={10} md={10} lg={10} style={{marginTop:'2vh',marginBottom:'2vh',maxWidth:'80%'}}><Card >
		<CardTitle title={message.sender} subtitle={message.TimeStamp}  />
		<CardText style={{overflow:"hidden"}}>{message.msg}</CardText>
	</Card></Col></Row>);
});
return (

	<div style={{ height:'100%'}}>
		{lem}
		{messageList}
	</div>
);
}
}
