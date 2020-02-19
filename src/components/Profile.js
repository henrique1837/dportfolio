import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar,Card,Modal,Collapse} from 'react-bootstrap';
//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import UserPage from './UserPage.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const Box = require('3box');
const AppName = 'DecentralizedPortfolio_test2';
const usersRegistered = 'users_registered';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";



class Profile extends Component {
  state = {
    box: null,
    space: null,
    coinbase: null,
    views: [],
    contacts: [],
    page: <div></div>
  }
  constructor(props){
    super(props)
    this.profileSaved = this.profileSaved.bind(this);
    this.chatPage = this.chatPage.bind(this);
    this.contactPage = this.contactPage.bind(this);
  }

  componentWillMount = async function(){

    await this.props.space.syncDone;
    const profile = await this.props.space.public.all();
    console.log("contacts_"+profile.address)
    const threadC = await this.state.space.joinThread("contacts_"+profile.address,{firstModerator:profile.address})
    //const posts = await Box.getThread(AppName, "contacts_"+profile.address,profile.address)
    const posts = await threadC.getPosts();
    console.log(posts)
    const views = [];
    for(const post of posts){
        //const did = post.author;
        //const prof = await Box.getSpace(did,AppName)
        /*const prof = {
          address: post.message
        }*/
        const addr = post.message
        console.log(addr)
        if(addr){
          await this.state.space.syncDone;
          const userProfile = await Box.getSpace(addr,AppName);
          const threadName = 'contactThread_'+this.props.coinbase;
          const threadAddress =  userProfile[threadName];
          console.log(threadAddress);
          if(threadAddress){
            let thread = await this.state.space.joinThreadByAddress(threadAddress);
            console.log(thread);
            let members = await thread.listMembers();
            //let posts = await thread.getPosts();
            if(members.length > 0){
              this.state.views.push(addr);
              this.forceUpdate();
            }
          }

        }

    }
    const contacts = [];
    const threadContacts = await this.state.space.joinThread("contactsAdded_"+profile.address,{firstModerator:profile.address})
    const postsContacts = await threadContacts.getPosts();
    console.log("contactsAdded_"+profile.address)
    console.log(postsContacts)
    for(const post of postsContacts){
        const address = post.message;


        if(address){
          this.state.contacts.push(address);
          this.forceUpdate();
        }
    }
    await this.props.space.syncDone;



  }
  componentDidMount = async function(){
    this.setState({
      box: this.props.box,
      space: this.props.space,
      coinbase: this.props.coinbase
    });
    try{
      const profile = await this.state.space.public.all();
      const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
      const postId = await thread.post(profile);
    } catch(err){
      console.log(err)
    }
  }

  profileSaved = async function() {
    await this.props.space.syncDone;
    const profile = await this.state.space.public.all();
    const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
    const postId = await thread.post(profile);
    alert("saved");
  };
  chatPage = async function(addr){
    await this.props.space.syncDone;
    const removed = ReactDOM.unmountComponentAtNode(document.getElementById("chatPage"));
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
      const members = await thread.listMembers();
      console.log(members)
      const itens = [];
      for(const item of Object.values(profile)){

        console.log(item)
        if(item.uri && item.img){
          itens.push({
            name: item.name,
            description: item.description,
            uri: item.uri,
            img: item.img
          });
        } else if(item.uri){
          itens.push({
            name: item.name,
            description: item.description,
            uri: item.uri
          });
        }

      }
      await this.props.space.syncDone;
      ReactDOM.render(
        <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} itens={itens} />
        /*<ThreeBoxComments
                              // required
                              spaceName={AppName}
                              threadName={"contact_"+addr+"_"+this.props.coinbase}
                              adminEthAddr={addr}


                              // Required props for context A) & B)
                              box={this.props.box}
                              currentUserAddr={this.props.coinbase}

                              // Required prop for context B)
                              //loginFunction={handleLogin}

                              // Required prop for context C)
                              //ethereum={ethereum}

                              // optional
        />*/,
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
    const removed = ReactDOM.unmountComponentAtNode(document.getElementById("contactPage"));

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
    //if(members.length > 0){
      const itens = [];
      const profile = await Box.getSpace(addr, AppName);
      /*for(const item of Object.values(profile)){

        console.log(item)
        if(item.uri && item.img){
          itens.push({
            name: item.name,
            description: item.description,
            uri: item.uri,
            img: item.img
          });
        } else if(item.uri){
          itens.push({
            name: item.name,
            description: item.description,
            uri: item.uri
          });
        }

      }*/
      ReactDOM.render(

        <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} />,
        document.getElementById('contactPage')
      )
      return
    //}
    /*
    ReactDOM.render(
        <p>No messages to you</p>,
        document.getElementById('contactPage')
    );
    return
    */
  }
  render() {
    if(!this.state.box){
      return(
        <div>Loading ...</div>
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
                      //customFields={this.state.fields}
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
            <Tab eventKey="messages" title="Messages" style={{paddingTop:'10px'}}>
              <Row>
                <Col lg={4} style={{height: '500px',overflowY:'scroll'}}>
                  {
                    this.state.views.map(function(addr){
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
                    this.state.contacts.map(function(addr){
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
