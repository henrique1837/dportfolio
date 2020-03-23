import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner} from 'react-bootstrap';
//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import UserPage from './UserPage.js';

const Box = require('3box');

const Config = require('../config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin

class Profile extends Component {
  state = {
    box: null,
    space: null,
    coinbase: null,
    threadContacts: null,
    threadViews: null,
    page: <div></div>,
    fields: [
      { // for a field with a text input
        inputType: 'text',
        key: 'techs', // the key used to save the value
        field: 'Techs' // how to display the key in the UI
      }
    ]
  }
  constructor(props){
    super(props)
    this.profileSaved = this.profileSaved.bind(this);
    this.chatPage = this.chatPage.bind(this);
    this.contactPage = this.contactPage.bind(this);

    this.getContacts = this.getContacts.bind(this);
    this.getViews = this.getViews.bind(this);
  }

  componentDidMount = async function(){
    await this.setState({
      box: this.props.box,
      space: this.props.space,
      coinbase: this.props.coinbase
    });
    console.log(this.state)
    await this.state.space.syncDone;
    await this.getContacts();
    await this.getViews();
    await this.setState({
      loaded: true
    });
    return;
  }

  getContacts = async function(){
    const coinbase = this.state.coinbase;
    const threadContacts = await this.state.space.joinThread("contactsAdded_"+coinbase,{firstModerator:coinbase})
    await this.setState({
      threadContacts: threadContacts,
      space: this.props.space
    })
    const contacts = await this.state.threadContacts.getPosts();
    console.log(contacts)
    this.setState({contacts});
    this.state.threadContacts.onUpdate(async () => {
       const contacts = await this.state.threadContacts.getPosts();
       this.setState({contacts});
    });
    return;
  }

  getViews = async function(){

    const coinbase = this.state.coinbase
    console.log("contacts_"+coinbase)
    const threadViews = await this.state.space.joinThread("contacts_"+coinbase,{firstModerator:coinbase});
    await this.setState({
      threadViews: threadViews
    })
    const views = await threadViews.getPosts();
    console.log(views)
    this.setState({views});
    this.state.threadViews.onUpdate(async()=> {
       const views = await this.state.threadViews.getPosts();
       this.setState({views});
    });
    return;
  }

  profileSaved = async function() {
    await this.props.space.syncDone;
    const profile = await this.state.space.public.all();
    const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
    let oldPostId = await this.state.space.private.get('registration');
    if(oldPostId){
      await thread.deletePost(oldPostId);
    }
    const postId = await thread.post(profile);
    await this.state.space.private.set('registration',postId);
    alert("saved");
  };
  chatPage = async function(addr){
    ReactDOM.unmountComponentAtNode(document.getElementById("contactPage"));
    ReactDOM.render(
        <div></div>,
        document.getElementById('contactPage')
    );
    await this.props.space.syncDone;
    const removed = ReactDOM.unmountComponentAtNode(document.getElementById("chatPage"));
    ReactDOM.render(
        <center>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Loading ...</p>
        </center>,
        document.getElementById('chatPage')
    );
    //const space = await this.props.box.openSpace(AppName);
    const isContact = await this.state.space.private.get("contact_"+addr);
    console.log(isContact)
    if(!isContact){
        const thread = await this.state.space.joinThread("contacts_"+addr,{firstModerator:addr});
        const postId = await thread.post(this.state.space.address);
        await this.state.space.private.set("contact_"+addr,postId);
    }
    const profile = await Box.getSpace(addr,AppName);
    console.log(profile);
    const threadName = 'contactThread_'+this.state.coinbase;
    const threadAddress =  profile[threadName];
    console.log(threadAddress);
    await this.state.space.syncDone;
    if(threadAddress){
      const thread = await this.state.space.joinThreadByAddress(threadAddress);
      await this.props.space.syncDone;
      ReactDOM.render(
        <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} />,
        document.getElementById('chatPage')
      );
      return
    }


    ReactDOM.render(
        <p>No messages to you</p>,
        document.getElementById('chatPage')
    );
    return


  }


  contactPage = async function(addr){
    ReactDOM.unmountComponentAtNode(document.getElementById("chatPage"));
    ReactDOM.render(
        <div></div>,
        document.getElementById('chatPage')
    );
    const removed = ReactDOM.unmountComponentAtNode(document.getElementById("contactPage"));
    ReactDOM.render(
        <center>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Loading ...</p>
        </center>,
        document.getElementById('contactPage')
    );
    const space = await this.props.box.openSpace(AppName);
    const isContact = await this.state.space.private.get("contactAdded_"+addr);
    console.log(isContact)
    if(!isContact){
        const thread = await this.state.space.joinThread("contacts_"+addr,{firstModerator:addr});
        const postId = await thread.post(this.state.space.address);
        await this.state.space.private.set("contact_"+addr,postId);
    }
    let thread = await this.state.space.joinThread("contact_"+this.state.coinbase+"_"+addr,{firstModerator:this.state.coinbase,members:true,ghost: false});
    await this.state.space.syncDone;
    let members = await thread.listMembers();
    let posts = await thread.getPosts();
    console.log(members)
    console.log(posts)
    console.log(members.length)

    const itens = [];
    const profile = await Box.getSpace(addr, AppName);
    ReactDOM.render(

        <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} />,
        document.getElementById('contactPage')
    )
    return
  }
  render() {
    if(!this.state.loaded){
      return(
        <center>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Loading ...</p>
        </center>
      )
    }
    const that = this;
    return(
        <Tabs defaultActiveKey="editProfile">


            <Tab eventKey="editProfile" title="Edit Profile" style={{paddingTop:'10px'}}>
              <EditProfile
                      // required
                      box={this.state.box}
                      space={this.state.space}
                      currentUserAddr={this.state.coinbase}

                      // optional
                      customFields={this.state.fields}
                      redirectFn={this.profileSaved}
                  />
            </Tab>
            <Tab eventKey="comments" title="Comments" style={{paddingTop:'10px'}}>
              <ThreeBoxComments
                                    // required
                                    spaceName={AppName}
                                    threadName={"job_offers_"+this.state.coinbase}
                                    adminEthAddr={this.state.coinbase}


                                    // Required props for context A) & B)
                                    box={this.state.box}
                                    currentUserAddr={this.state.coinbase}

                                    // Required prop for context B)
                                    //loginFunction={handleLogin}

                                    // Required prop for context C)
                                    //ethereum={ethereum}

                                    // optional
                                    members={false}
              />
            </Tab>
            <Tab eventKey="messages" title="Views" style={{paddingTop:'10px'}}>
              <Row>
                <Col lg={4} style={{height: '500px',overflowY:'scroll'}}>
                  {
                    this.state.views.map(function(post){
                      const addr = post.message
                      return(
                        <Row>
                          <Col lg={8} >
                            <ProfileHover
                              address={addr}
                              orientation="bottom"
                              noCoverImg
                            />
                          </Col>
                          <Col lg={4}>
                            <Button variant="primary" onClick={()=>{that.chatPage(addr)}}>Messages</Button>
                          </Col>
                        </Row>
                      );
                    })
                  }
                </Col>
                <Col lg={8} id='chatPage'>

                </Col>
              </Row>
            </Tab>
            <Tab eventKey="contacts" title="Contacts" style={{paddingTop:'10px'}}>
              <Row>
                <Col lg={4} style={{height: '500px',overflowY:'scroll'}}>
                  {
                    this.state.contacts.map(function(post){
                      const addr = post.message
                      console.log(addr);
                      return(
                        <Row>
                          <Col lg={8} >
                            <ProfileHover
                              address={addr}
                              orientation="bottom"
                              noCoverImg
                            />
                          </Col>
                          <Col lg={4}>
                            <Button variant="primary" onClick={()=>{that.contactPage(addr)}}>Messages</Button>
                          </Col>
                        </Row>
                      );
                    })
                  }
                </Col>
                <Col lg={8} id='contactPage'>

                </Col>
              </Row>
            </Tab>
          </Tabs>
      );


  }
}



export default Profile;
