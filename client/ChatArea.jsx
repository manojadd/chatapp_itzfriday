import React from 'react';
import io from 'socket.io-client';
import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';
import ChatHistory from './ChatHistory.jsx';
import NewMessage from './NewMessage.jsx';
import Chip from 'material-ui/Chip';

let socket;
export default class Chat extends React.Component{
	constructor(props) {
		super(props);
		this.state={typing:[],chatHistory:[],pagesDisplayed:0,next:""};
		socket=this.props.socket;
	}

	componentDidMount() {

		socket.on('someoneAdded',(name)=>{ //Sent when a user subscribes to the channel.
		this.handleSomeoneAdded(name);
	});

	socket.on('takeMessage',(channelID,msg)=>{ //Sent from socket server when a message is published in the redis channel.
	this.handleTakeMessage(channelID,msg);
});

socket.on('chatHistory',(msg,next)=>{ //msg is an array of objects having messages from a page in mongodb.
this.handleChatHistory(msg,next);
});
socket.on('pempty',(msg)=>{
	this.handlePempty(msg);
});

}

componentWillReceiveProps(nextProps){
	if(this.props.channelID!=nextProps.channelID){
		let msg = {"pageNo":"initial_primary","channelName":nextProps.channelID};//increment the pages displayed currently.
		nextProps.socket.emit('receiveChatHistory',msg);
		this.setState({chatHistory:[]});

	}
}

handleSomeoneAdded(msg){
	//currently empty.
}

handleTakeMessage(channelId,msg){
	if(channelId===this.props.channelID){

		if(msg.hasOwnProperty('typer')){
			this.handleTyping(msg.typer);
		}

		else
		{
			msg = this.handleTime(msg);
			this.setState((prevState,props)=>{
				prevState.chatHistory.push(msg);
				return {chatHistory:prevState.chatHistory};
			});
		}
	}
	else{
		if(msg.hasOwnProperty('typer')){
		}
		else
		{this.props.LiveUnreadCount(channelId);}
	}
}
handleChatHistory(msg,next){
	let mess = this.state.chatHistory;
	msg.forEach((msgob)=>{

		msgob = this.handleTime(msgob);
		mess.unshift(msgob);
	});
	this.setState((prevState,props)=>{ return {chatHistory:mess,pagesDisplayed:prevState.pagesDisplayed+1,next:next};});
}
handleTime(msg){
	let date= new Date(msg.TimeStamp);
	date = date.toLocaleTimeString().split(':');
	date = date[0]+":"+date[1]+" "+date[2].slice(-3);
	msg.TimeStamp = date;
	return msg;
}
handleTyping(name){
	if(!this.state.typing.includes(name))
	{
		this.setState((prevState,props)=>{prevState.typing.push(name); return {typing:prevState.typing};  });
		setTimeout(()=>{this.setState((prevState,props)=>{prevState.typing.shift(); return {typing:prevState.typing};  });},1000);
	} //show user is typing for 1000 milliseconds.
}

handlePempty(msg){
	let msg1 = {
		"pageNo":msg,
		"channelName":this.props.channelId
	};
	socket.emit('receiveChatHistory',msg1);
}

render(){
	let typ;
	if(this.state.typing.length===1){
		typ = <Chip>{this.state.typing + " is typing"}</Chip>;
		}
		else if(this.state.typing.length>1 && this.state.typing.length<6)
		typ = <Chip>{this.state.typing + " are typing"}</Chip>;
			else if(this.state.typing.length>1)
			{
				typ = <Chip>{this.state.typing.slice(0,5) + " and others are typing"}</Chip>
			}
			else
			{
				typ = null;
			}
			return(
				<center style={{height:"100%"}}>
					<div style={{height:"100%"}}>
						<Grid  style={{height:'100%', width:"100%"}}>
							<Row style={{ height:'6%',overflow:'hidden',width:"100%"}}>
								<Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
									{typ}
								</Col>
							</Row>
							<Row style={{height:'84%',overflow:'auto',width:"100%"}}>
								<Col xs={12} sm={12} md={12} lg={12}>
									<ChatHistory channelId={this.props.channelID} psocket={socket} next={this.state.next} username={this.props.userName} chatHistory={this.state.chatHistory}/>
								</Col>
							</Row>
							<Row bottom="lg" style={{height: '10%',width:'100%'}}>
								<Col xs={12} sm={12} md={12} lg={12}>
									<NewMessage channelId={this.props.channelID} psocket={socket} name={this.props.userName}/>
								</Col>
							</Row>
						</Grid>
					</div>
				</center>
			);
		}
	}
