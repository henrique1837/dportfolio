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
  Label,
  Card,
  CardBody
} from 'reactstrap';

import ProfileHover from 'profile-hover';

const Box = require('3box');

const Config = require('../config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin



class CommentBox extends Component {
  state = {
    space: null,
    thread: null,
    posts: []
  }

  constructor(props){
    super(props);
    this.addMsg = this.addMsg.bind(this);
    this.rmMsg = this.rmMsg.bind(this);
  }


  componentDidMount = async ()  => {
    try{
      let thread;
      let posts;
      if(this.props.space){
        thread = await this.props.space.joinThread(this.props.threadName,{firstModerator:admin,members:false});
        await this.state.syncDone;
        posts = await thread.getPosts();
        console.log(posts)
        this.setState({
          posts:posts,
          thread: thread
        });
        this.state.thread.onUpdate(async()=> {
           const posts = await this.state.thread.getPosts();
           this.setState({posts});
        });
      } else {
        posts = await Box.getThread(AppName,this.props.threadName,admin,false);
      }

      this.setState({
        thread: thread,
        posts: posts,
        space: this.props.space,
        coinbase: this.props.coinbase
      })

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
  rmMsg = async function(postId){
    await this.state.thread.deletePost(postId);
    return;
  };

  handleOnChange = e => {
    this.setState({
      input_msg: e.target.value
    })
  }

  render(){
    const that = this;
    if(this.state.posts){
      return(
        <div style={{paddingTop: '40px'}}>
          <Card>
            <CardBody>
              <h4>Comments</h4>
              <p>Use this space to give feedback or suggestion for nexts versions of this dapp</p>
              <hr/>
              <h4>Messages</h4>
              <div style={{height: '300px',overflowY:'scroll'}}>
                {
                  this.state.posts.map(function(post){
                    const msg = post.message;
                    const from = msg.from;
                    const content = msg.content;
                    return(
                      <div style={{paddingBottom:"50px"}}>
                        <Row>
                          <Col lg={4}>
                            <ProfileHover
                                    address={from}
                                    orientation="bottom"
                                    noCoverImg
                            />

                          </Col>
                          <Col lg={6}>
                            {content}
                          </Col>
                          {
                            (
                              that.state.space &&
                              (that.state.space.user.DID == post.author) &&
                              (
                                <Col lg={2}>
                                  <Button color="danger" onClick={()=>{that.rmMsg(post.postId)}}>Delete</Button>
                                </Col>
                              )
                            )
                          }


                        </Row>
                      </div>
                    )

                  })
                }
              </div>
              <div>
              {
                (
                  this.state.space &&
                  (
                    <FormGroup onSubmit={this.addMsg}>
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
                  )
                )
              }
              </div>
            </CardBody>
          </Card>
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

export default CommentBox;
