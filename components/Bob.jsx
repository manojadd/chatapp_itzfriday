import React from 'react';
import ChannelList from './ChannelList.jsx';
import io from 'socket.io-client';
import async from 'async';
import {List, ListItem,makeSelectable} from 'material-ui/List';
import Chat from './ChatArea.jsx';
import Header from './Header.jsx';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Grid, Row, Col} from 'react-flexbox-grid/lib';

export default class Bob extends React.Component{
  constructor(props){
    super(props);
    this.state={
      userName:"",
      channelsList:[],
      projectsList:[],
      currentChannel:'',
      unreadCount:{},
      lat:{},
      socket:io('http://localhost:8000'),
      loggedIn:false
    };
    this.toggleCurrentChannel=this.toggleCurrentChannel.bind(this);
    this.handleChange=this.handleChange.bind(this);
    this.handleClick=this.handleClick.bind(this);
    this.resetCurrentChannelUnread=this.resetCurrentChannelUnread.bind(this);
    this.getProjectList=this.getProjectList.bind(this);
    this.getChannelsInProject=this.getChannelsInProject.bind(this);
  }
  componentDidMount(){
    //socket=io('http://localhost:8000');
    let that=this;
    this.state.socket.on('channelList', function (list,unreadCount,lat) {
      that.setState({channelsList:list,unreadCount:unreadCount,lat:lat});
      that.resetCurrentChannelUnread(that.state.unreadCount);

    });

    this.state.socket.on("updateUnread",function(currentChannel,prevChannel,d){
      let temp=that.state.lat;
      let unread=that.state.unreadCount;
      temp[prevChannel]=d;
      unread[prevChannel]=0;
      console.log(currentChannel,"bbbbbb");
      //unread[that.state.currentChannel]=0;
      that.setState({lat:temp,unreadCount:unread})
      that.resetCurrentChannelUnread(that.state.unreadCount);
    })

    this.state.socket.on("listenToMessage",function(channelList,channelName){
      //console.log(channelList,"aaaa");
      if(channelList.indexOf(channelName)!=-1){
        var temp=that.state.unreadCount;
        temp[channelName]++;
        that.setState({unreadCount:temp});
      }

      that.resetCurrentChannelUnread(that.state.unreadCount);
    })

  }

  resetCurrentChannelUnread(unreadCount){
    var temp=unreadCount;
    var channel=this.state.currentChannel;
    console.log(temp[channel],"temp");
    let that=this;
    setTimeout(function(){
      temp[channel]=0
      console.log(temp);
      that.setState({unreadCount:temp});
    }.bind(this),500);

  }

  getProjectList() {
    let list=this.state.channelsList;
    let projects = [];
    for (var i = 0,j=0; i < list.length; i++) {
      let a=list[i].split('#');
      if(projects.indexOf(a[0])==-1){
        projects[j]=a[0];
        j++;
      }
    }
    return projects;
  }

  getChannelsInProject(projectName) {
    let a=projectName.length;
    let name="";
    if(projectName=='bob'){
      name=projectName+"#general";}
      else{
        name=projectName+"#UI";
      }
      this.setState({currentChannel:name})
      let b=[];
      let that=this;
      let j=0;
      this.state.channelsList.map((item,i)=>{
        if(item.substring(0,a)==projectName){
          b[j]=item;
          j++;
        }
      })
      this.setState({projectsList:b,loggedIn:true})
    }


    handleChange(e){
      this.setState({userName:e.target.value})
    }

    handleClick(){
      this.state.socket.emit("login",this.state.userName);
    }

    toggleCurrentChannel(item,prevChannel){
      console.log("Inside the bob ",item);
      this.setState({
        currentChannel:item
      });
      this.state.socket.emit('currentChannel', item,prevChannel,this.state.userName);
    }

    handleLiveUnreadCount(channelID){
      this.setState((prevState,props)=>{
        return prevState.unreadCount[channelID]++;
      });
    }

    render(){
      let a=this.getProjectList();
      let chatArea;
      if(this.state.loggedIn){
        console.log(this.state.currentChannel,"current Channel");

        chatArea=(
          <Grid  style={{height:"100vh"}}>
            <Row style={{height:"100%"}}>
              <Col xs={12} sm={3} md={3} lg={3} style={{height:"100%"}}>
                <ChannelList channelList={this.state.projectsList} currentChannel={this.state.currentChannel} unreadCount={this.state.unreadCount} setCurrentChannel={this.toggleCurrentChannel}/>
              </Col>
              <Col xs={12} sm={9} md={9} lg={9} style={{height:"100%"}}>
                <Chat style={{height:"100%"}} channelID={this.state.currentChannel} socket={this.state.socket} LiveUnreadCount={this.handleLiveUnreadCount.bind(this)} userName={this.state.userName}/>
              </Col>
            </Row>
          </Grid>);
        }
        else
        {
          chatArea=null;
        }
        //console.log(a);
        return(
          <div>
            <Header/>
            <TextField hintText="UserName" floatingLabelText="UserName" value={this.state.userName} onChange={this.handleChange}/>
            <RaisedButton label="LOG IN" primary={true} onClick={this.handleClick} />
            <Grid style={{height:'100%',width:"100%"}}>
              <Row style={{width:"100%"}}>
                <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
                  <List>
                    {
                      a.map((item,i)=>{
                        return(<ListItem key={i} onTouchTap={this.getChannelsInProject.bind(this,item)}>{item}</ListItem>)
                      })
                    }
                  </List>
                </Col>
              </Row>
              <Row style={{width:"100%"}}>
                <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>

                  {chatArea}
                </Col>
              </Row>
            </Grid>
          </div>
        );
      }
    }
