import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner} from 'react-bootstrap';
//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import {Link} from 'react-router-dom';
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
    web3:null,
    threadContacts: null,
    threadViews: null,
    page: <div></div>,
    fields: [
      { // for a field with a text input
        inputType: 'text',
        key: 'techs', // the key used to save the value
        field: 'Techs' // how to display the key in the UI
      },
      { // for a field with a text input
        inputType: 'text',
        key: 'gitcoin', // the key used to save the value
        field: 'Gitcoin' // how to display the key in the UI
      },
      { // for a field with a text input
        inputType: 'text',
        key: 'pinterest', // the key used to save the value
        field: 'Pinterest' // how to display the key in the UI
      }
    ]
  }
  constructor(props){
    super(props)
    this.profileSaved = this.profileSaved.bind(this);

    this.getContacts = this.getContacts.bind(this);
    this.getViews = this.getViews.bind(this);

  }

  componentDidMount = async function(){
    await this.setState({
      box: this.props.box,
      space: this.props.space,
      coinbase: this.props.coinbase,
      web3: this.props.web3
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
      threadContacts: threadContacts
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
    console.log(profile)
    const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
    let oldPostId = await this.state.space.private.get('registration');
    if(oldPostId){
      await thread.deletePost(oldPostId);
    }
    const postProfile = {
      name: profile.name,
      emoji: profile.emoji,
      description: profile.description,
      techs: profile.techs,
      address: profile.address ,
      pinterest: profile.pinterest,
      github: profile.github,
    }
    const postId = await thread.post(postProfile);
    await this.state.space.private.set('registration',postId);
    alert("saved");
  };



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

                  {
                    this.state.views.map(function(post){
                      const addr = post.message
                      return(
                        <Col lg={4}
                             style={{
                               display:'flex',
                               flexDirection:'column',
                               justifyContent:'space-between',
                               paddingBottom: '100px'
                             }}>
                            <div>
                                <ProfileHover
                                  address={addr}
                                  orientation="bottom"
                                  noCoverImg
                                />
                            </div>
                            <div>
                              <Link to={"/user/"+addr} style={{all: 'unset'}}>
                                <Button variant="primary">Portfolio</Button>
                              </Link>
                            </div>
                        </Col>
                      );
                    })
                  }
              </Row>
            </Tab>
            <Tab eventKey="contacts" title="Contacts" style={{paddingTop:'10px'}}>
              <Row>
                {/*<Col lg={4} style={{height: '500px',overflowY:'scroll'}}>*/}
                  {
                    this.state.contacts.map(function(post){
                      const addr = post.message
                      console.log(addr);
                      return(
                        <Col lg={4}
                             style={{
                               display:'flex',
                               flexDirection:'column',
                               justifyContent:'space-between',
                               paddingBottom: '100px'
                             }}>
                            <div>
                                <ProfileHover
                                  address={addr}
                                  orientation="bottom"
                                  noCoverImg
                                />
                            </div>
                            <div>
                              <Link to={"/user/"+addr} style={{all: 'unset'}}>
                                <Button variant="primary">Portfolio</Button>
                              </Link>
                            </div>
                        </Col>
                      )
                      /*return(
                        <Row>
                          <Col lg={8} >
                            <ProfileHover
                              address={addr}
                              orientation="bottom"
                              noCoverImg
                            />
                          </Col>
                          <Col lg={4}>
                            <Link to={"/user/"+addr} style={{all: 'unset'}}>
                              <Button variant="primary">Messages</Button>
                            </Link>
                          </Col>
                        </Row>
                      );*/
                    })
                  }
                {/*</Col>*/}
              </Row>
            </Tab>
          </Tabs>
      );


  }
}



export default Profile;
