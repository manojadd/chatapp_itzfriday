import React from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';


export default class Form extends React.Component{
  constructor(props) {
    super(props);
    this.state = {sender:"",channelID:"",msg:"",socket:null};
    this.senderHandleChange=this.senderHandleChange.bind(this);
    this.channelIDHandleChange=this.channelIDHandleChange.bind(this);
    this.msgHandleChange=this.msgHandleChange.bind(this);
    this.handleClick=this.handleClick.bind(this);
  }
  componentDidMount() {
    this.setState({socket:this.props.socket})
    console.log('connected to server _ logged from form.jsx');

  }
  senderHandleChange(e){
    this.setState({sender:e.target.value})
  }
  channelIDHandleChange(e){
    this.setState({channelID:e.target.value})
  }
  msgHandleChange(e){
    this.setState({msg:e.target.value})
  }
  handleClick(e){
    console.log('message emitted __ logged from from.jsx->handleClick');
    this.state.socket.emit("send message", this.state.sender, this.state.channelID, this.state.msg);
    this.setState({sender:"", channelID:"", msg:""});
    console.log('reset state : ', this.state.sender, this.state.channelID, this.state.msg);
  }
  render() {
    return(
      <div>
        Name:<input type="text" value={this.state.sender} onChange={this.senderHandleChange}/><br/>
        ChannelID:<input type="text" value={this.state.channelID} onChange={this.channelIDHandleChange}/><br/>
        Message:<input type="text" value={this.state.msg} onChange={this.msgHandleChange}/><br/>
        <input type="submit" onClick={this.handleClick}/>
      </div>
    )
  }
  // render() {
  //   return (
  //     <div>
  //     <MuiThemeProvider>
  //       Sender : <TextField hint="sender" value={this.state.sender} onChange={this.senderHandleChange}/>
  //       Receiver : <TextField hint="channelID" value={this.state.sender} onChange={this.senderHandleChange}/>
  //       Message : <TextField hint="Message" value={this.state.sender} onChange={this.senderHandleChange}/>
  //     </MuiThemeProvider>
  //     </div>
  //   )
  // }
}
