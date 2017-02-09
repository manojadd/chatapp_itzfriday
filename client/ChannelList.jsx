import React, {PropTypes,Component} from 'react';
import {List, ListItem,makeSelectable} from 'material-ui/List';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Badge from 'material-ui/Badge';
import { Grid, Row, Col} from 'react-flexbox-grid/lib';

let SelectableList = makeSelectable(List);
injectTapEventPlugin();

export default class ChannelList extends React.Component{
  constructor(props){
    super(props);
    this.handleChange=this.handleChange.bind(this);
  }

  handleChange(item){
    var temp=this.props.currentChannel;
    this.props.setCurrentChannel(item,temp);
  }

  render(){
    return(
      <div style={{height:'100%'}}>
        <Grid style={{height:'100%',width:"100%"}}>
          <Row style={{width:"100%"}}>
            <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
              <h4>Channels</h4>
            </Col>
          </Row>
          <Row style={{width:"100%"}}>
            <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
              <SelectableList  value={this.props.currentChannel}>
                {
                  this.props.channelList.map((item,index)=>{
                    return(
                      <ListItem key={index} value={item}  primaryText={item}  onTouchTap={this.handleChange.bind(this,item)} rightIcon={<Badge badgeContent={this.props.unreadCount[item]} primary={true}></Badge>}/>
                    );
                  },this)
                }
              </SelectableList>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
