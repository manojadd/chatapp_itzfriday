import React, {PropTypes,Component} from 'react';
import {List, ListItem,makeSelectable} from 'material-ui/List';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Badge from 'material-ui/Badge';
let SelectableList = makeSelectable(List);
injectTapEventPlugin();

export default class ChannelList extends React.Component{
  constructor(props){
    super(props);
    this.handleChange=this.handleChange.bind(this);
    console.log("inside channelList");
  }

  handleChange(item){
    console.log("setCurrentChannel", item);
    var temp=this.props.currentChannel;
    this.props.setCurrentChannel(item,temp);
    //this.props.
   // console.log("currentChannel emit to socket : ",item);
  }
  
  render(){
    console.log('this.props.currentChannel', this.props.currentChannel,this.props.channelList,this.props.unreadCount);
    // this.props.unreadCount.map((item,i)=>{
    //   console.log(item,"mmmmm");
    // });
    return(
      <div>
      <h4>Channels</h4s>
      <SelectableList  value={this.props.currentChannel}>
      {
          this.props.channelList.map((item,index)=>{
              return(
              <ListItem key={index} value={item}  primaryText={item}  onTouchTap={this.handleChange.bind(this,item)} rightIcon={<Badge badgeContent={this.props.unreadCount[item]} primary={true}></Badge>}/>
              );
          },this)
        }
      </SelectableList>
      </div>
    );
  }
}
