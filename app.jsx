import React, { Component } from 'react';
import io from 'socket.io-client';

let socket=null;
export default class App extends Component {

  constructor(props){
    super(props);
    this.state={
    username:""
    }
    this.handlechange=this.handlechange.bind(this);
    this.listenHandler=this.listenHandler.bind(this);
  }
  componentDidMount(){
    socket=io('http://localhost:8000');
    socket.on('channelList', function (list) {
      let projects = [];
      for (var i = 0; i < list.length; i++) {
        let a=list[i].split('#');
        projects.push(a[0]);
      }
      let projectset = new Set(projects);
      console.log(projectset);
    });
  }
  handlechange(e){
    console.log("logged in");
    this.setState({
      username:e.target.value
    })
  }
  listenHandler(e){
    socket.emit("login",this.state.username);
  }
  render() {
    //console.log(this.state.key1);
    return (
    <div>
        <label>Username</label>
        <input type="text" value={this.state.username} onChange={this.handlechange}/>
        <button onClick={this.listenHandler}>submit</button>

    </div>
    );
  }
}
