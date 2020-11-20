import React,{Component} from 'react';
import {
  Button,
  Row,
  Col,
  Spinner,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Label
} from 'reactstrap';

import ProfileHover from 'profile-hover';

const Box = require('3box');

const Config = require('../config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin



class PrivateChat extends Component {
  state = {
    space: null,
    thread: null,
    posts: []
  }

  constructor(props){
    super(props);
    this.addMsg = this.addMsg.bind(this);
  }


  componentDidMount = async ()  => {
    try{
      const thread = await this.props.space.joinThreadByAddress(this.props.threadAddress);

      this.setState({
        thread: thread,
        space: this.props.space
      })
      await this.state.syncDone;
      const posts = await this.state.thread.getPosts();
      this.setState({posts});
      console.log(posts)
       await this.state.thread.onUpdate(async()=> {
         const posts = await this.state.thread.getPosts();
         this.setState({posts});
       });
    } catch(err){
      console.log(err)
    }
  };
  addMsg = async function(){
    const msg = {
      from: this.props.coinbase,
      content: this.state.input_msg
    };
    await this.state.thread.post(msg);
    return;
  };

  handleOnChange = e => {
    this.setState({
      input_msg: e.target.value
    })
  }

  render(){

    if(this.state.thread){
      return(
        <div>
                <h4>Messages</h4>
                <div style={{height: '300px',overflowY:'scroll'}}>
                  {
                    this.state.posts.map(function(post){
                      const msg = post.message;
                      const from = msg.from;
                      const content = msg.content;
                      return(
                        <div>
                          <Row>
                            <Col lg={4}>
                              <ProfileHover
                                      address={from}
                                      orientation="bottom"
                                      noCoverImg
                              />

                            </Col>
                            <Col lg={8}>
                              {content}
                            </Col>

                          </Row>
                        </div>
                      )

                    })
                  }
                </div>
                <div>
                  <FormGroup>
                    <InputGroup className="input-group-alternative mb-4">
                    <Label>Message</Label>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-zoom-split-in" />
                        </InputGroupText>
                      </InputGroupAddon>

                      <Input
                        className="form-control-alternative"
                        placeholder="Message"
                        type="text"
                        id='input_msg'
                        name="input_msg"
                        value={this.state.input_msg}
                        onChange={this.handleOnChange}
                      />
                    </InputGroup>
                    <Button onClick={this.addMsg}>Send</Button>
                  </FormGroup>

                </div>
        </div>
      )
    }
    return(
      <center style={{paddingTop:'40px'}}>
        <Spinner color="primary" />
        <p>Loading ...</p>
      </center>
    )
  }

}

export default PrivateChat;
