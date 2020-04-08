import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner} from 'react-bootstrap';
//import * as Box from '3box';
import {withRouter} from 'react-router-dom';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import PrivateChat from './PrivateChat.js'

const Box = require('3box');

const Config = require('../config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin



class UserPage extends Component {
  state = {
    confidentialThreadName: null,
    threadAdmin: null,
    items: null,
    space: null,
    coinbase: null,
  }
  constructor(props){
    super(props);
    this.addContact = this.addContact.bind(this);
    this.setItems = this.setItems.bind(this);
    this.setChannel = this.setChannel.bind(this);
  }
  componentDidMount = async function(){
    console.log(this.props);
    await this.setState({
      user_address: this.props.match.params.addr
    })
    await this.setItems();
    if(this.props.box){
      await this.setState({
        box: this.props.box,
        space: this.props.space,
        coinbase: this.props.coinbase
      });
      await this.setChannel();
    }

  }
  setChannel = async function(){

    await this.state.space.syncDone;
    const space = this.state.space;
    console.log("contacts_"+this.state.user_address)
    console.log(this.state.coinbase)
    const isContact = await space.private.get("contact_"+this.state.user_address);
    console.log(isContact);
    if(!isContact){
      const thread = await space.joinThread("contacts_"+this.state.user_address,{firstModerator:this.state.user_address});
      const postId = await thread.post(this.state.coinbase);
      await space.private.set("contact_"+this.state.user_address,postId);
    }
    const userProfile = await Box.getSpace(this.state.user_address,AppName);
    const threadAddressByUser = userProfile['contactThread_'+this.state.coinbase];
    console.log(threadAddressByUser);
    if(threadAddressByUser){
      const confidentialThreadNameByUser = "contact_"+this.state.user_address+"_"+this.state.coinbase;
      await space.public.set('contactThread_'+this.state.user_address,threadAddressByUser);
      const thread = await space.joinThreadByAddress(threadAddressByUser)
      //console.log(await thread.getPosts());
      await space.syncDone;
      await this.setState({
        confidentialThreadName: confidentialThreadNameByUser,
        threadAdmin: this.state.user_address,
        threadAddress: thread.address
      });
    } else {
      const confidentialThreadName = "contact_"+this.state.coinbase+"_"+this.state.user_address;
      let threadAddress = await space.public.get('contactThread_'+this.state.user_address);
      console.log(threadAddress)
      if(!threadAddress){
        const thread = await space.createConfidentialThread(confidentialThreadName);
        //const thread = await space.joinThread(confidentialThreadName,{firstModerator:this.state.coinbase,members: true});
        const members = await thread.listMembers();

        if(members.length == 0){
          await thread.addMember(this.state.user_address);
          console.log("member added");
        }
        threadAddress = thread.address

        await space.public.set('contactThread_'+this.state.user_address,threadAddress);

      }


      await this.setState({
        confidentialThreadName: confidentialThreadName,
        threadAdmin: this.state.coinbase,
        threadAddress: threadAddress
      });
    }
    return
  }
  setItems = async function(){
    let profile = this.state.profile;
    if(!profile){
      profile = await Box.getSpace(this.state.user_address,AppName);
    }
    await this.setState({
      profile: profile
    });
    const posts = await Box.getThread(AppName,"items_"+this.state.user_address,this.state.user_address,true);
    const items = [];
    for(const post of posts){
      const item = post.message;
      console.log(item)
      items.push({
          name: item.name,
          description: item.description,
          uri: item.uri,
          img: item.img
      });
    }
    this.setState({
      items: items
    });
    return
  }
  addContact = async function(){
    const space = await this.state.space;
    await space.syncDone;
    console.log("contacts_"+this.state.user_address)

    const isContactAdded = await space.private.get("contactAdded_"+this.state.user_address);
    console.log(isContactAdded)
    console.log("contactsAdded_"+this.state.coinbase);
    if(!isContactAdded){
      const thread = await space.joinThread("contactsAdded_"+this.states.coinbase,{firstModerator:this.state.coinbase});
      const postId = await thread.post(this.state.user_address);
      await space.private.set("contactAdded_"+this.state.user_address,postId);
      alert('saved')
    } else {
      alert('contact already saved')
    }
    await space.syncDone;
    return
  }

  render(){
    if(this.state.profile && this.state.items){
      const profile = this.state.profile
      console.log(this.state);
      const items = this.state.items
      if(this.state.confidentialThreadName){

        return(
          <div>
                <Tabs defaultActiveKey="portfolio" className="nav-fill flex-column flex-md-row">
                  <Tab eventKey="portfolio" title="Portfolio" style={{paddingTop:'10px'}}>
                    <div>
                      <Row style={{paddingTop:'20px'}}>
                        <ProfileHover
                          address={profile.address}
                          orientation="bottom"
                          noCoverImg
                        />
                      </Row>
                      <Row style={{paddingTop:'40px'}}>
                        <h5>Portfolio</h5>
                      </Row>
                      <Row style={{paddingTop:'20px'}}>


                        {
                          items.map(function(item){
                            if(!item.img){
                              return(
                                <Col lg={4}
                                     style={{
                                       display:'flex',
                                       flexDirection:'column',
                                       justifyContent:'space-between',
                                       paddingBottom: '100px'
                                     }}>
                                    <p>Name: {item.name}</p>
                                    <p>Description: {item.description}</p>
                                    <p>URI: {item.uri}</p>
                                </Col>
                              )
                            }
                            return(
                              <Col lg={4}
                                   style={{
                                     display:'flex',
                                     flexDirection:'column',
                                     justifyContent:'space-between',
                                     paddingBottom: '100px'
                                   }}>
                                  <p>Name: {item.name}</p>
                                  <p>Description: {item.description}</p>
                                  <p>URI: {item.uri}</p>
                                  <p><img style={{maxWidth: '400px'}} src={item.img}/></p>
                              </Col>
                            )
                          })
                        }
                      </Row>
                      <Row>
                        <Button variant="primary" onClick={this.addContact}>Add contact</Button>
                      </Row>
                     </div>
                    </Tab>
                    <Tab eventKey="privMessage" title="Private message" style={{paddingTop:'10px'}}>
                      <h5>Private message</h5>
                      <PrivateChat threadAddress={this.state.threadAddress} space={this.state.space} coinbase={this.state.coinbase} />


                  </Tab>
                  <Tab eventKey="comments" title="Comments" style={{paddingTop:'10px'}}>
                    <h5>Comments</h5>

                    <ThreeBoxComments
                                          // required
                                          spaceName={AppName}
                                          threadName={"job_offers_"+profile.address}
                                          adminEthAddr={profile.address}


                                          // Required props for context A) & B)
                                          box={this.props.box}
                                          currentUserAddr={this.props.coinbase}

                                          // Required prop for context B)
                                          //loginFunction={handleLogin}

                                          // Required prop for context C)
                                          //ethereum={ethereum}

                                          // optional
                                          members={false}
                    />



                  </Tab>
                </Tabs>
          </div>
        )
      }
      return(
        <div>
          <Row style={{paddingTop:'20px'}}>
            <ProfileHover
              address={profile.address}
              orientation="bottom"
              noCoverImg
            />
          </Row>
          <Row>
            <h5>Portfolio</h5>
          </Row>
          <Row style={{paddingTop:'20px'}}>


            {
              items.map(function(item){
                if(!item.img){
                  return(
                    <Col lg={4}
                         style={{
                           display:'flex',
                           flexDirection:'column',
                           justifyContent:'space-between',
                           paddingBottom: '100px'
                         }}>
                        <p>Name: {item.name}</p>
                        <p>Description: {item.description}</p>
                        <p>URI: {item.uri}</p>
                    </Col>
                  )
                }
                return(
                  <Col lg={4}
                       style={{
                         display:'flex',
                         flexDirection:'column',
                         justifyContent:'space-between',
                         paddingBottom: '100px'
                       }}>
                      <p>Name: {item.name}</p>
                      <p>Description: {item.description}</p>
                      <p>URI: {item.uri}</p>
                      <p><img style={{maxWidth: '400px'}} src={item.img}/></p>
                  </Col>
                )
              })
            }
          </Row>
         </div>
      )
    }
    return(
      <center>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        <p>Loading ...</p>
      </center>
    )
  }
}

export default withRouter(UserPage);
