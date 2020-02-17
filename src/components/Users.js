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



class Users extends Component {
  state = {
    users: [],
    itens: {},
    box: null,
    coinbase: null,
    userPage: <div></div>
  }

  constructor(props){
    super(props);
    this.renderUserPage = this.renderUserPage.bind(this);
  }

  componentDidMount = async () => {
    this.setState({
      box: this.props.box,
      coinbase: this.props.coinbase
    });
    console.log(this.state)
    const posts = await Box.getThread(AppName, usersRegistered, admin,false)
    //const posts = await thread.getPosts();
    /*
    const space = await this.props.box.openSpace(AppName);
    const thread = await space.joinThread(usersRegistered,{firstModerator:admin});
    const p = await thread.getPosts();
    console.log(p)
    //for(const a of p){
      // await thread.deletePost("zdpuAx9zkQ4PSgSz9oYvkxkG25URySVfiZWndyU4FYAvkMUh6")
    //}
    //alert('deleted')
    //return
    */
    console.log(posts)
    //const added = {}
    const added = []
    for(var i=posts.length-1;i>=0;i--){
        const post = posts[i];
        const profile = post.message;

        if(!added.includes(profile.address)){
          added.push(profile.address)
          this.state.users.push(profile);
          this.forceUpdate();
        }
    }
  };



  renderUserPage = async(profile) => {
    const removed = ReactDOM.unmountComponentAtNode(document.getElementById("userPage"))

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

    console.log(profile);

    ReactDOM.render(
      <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} itens={itens} />,
      document.getElementById('userPage')
    );

    return
  };

  render(){
    const that = this;
    return(
      <div>
        <h4>Users</h4>
        <Row>
          <Col lg={4} style={{height: '500px',overflowY:'scroll'}}>
        {
          this.state.users.map(function(profile){
            console.log(profile)
            let div_profile = <div></div>
            if(profile.name && profile.description){
              div_profile = <div>
                                    <p><small>Decentralized portfolio profile</small></p>
                                    <p>Name: {profile.name}</p>
                                    <p>Description: {profile.description}</p>
                                  </div>
            }
            return(


                <div>
                    <Row>
                    <Col lg={12}>
                      <ProfileHover
                        address={profile.address}
                        orientation="bottom"
                        noCoverImg
                      />
                    </Col>
                      <Col lg={12}>
                      {div_profile}
                      <Button variant="primary" href={"#user_"+profile.address} onClick={()=>{ that.renderUserPage(profile) }}>Portfolio</Button>
                      </Col>

                    </Row>
                    <hr/>
                </div>
            )
          })
        }
          </Col>
          <Col lg={8} id='userPage' >


            {this.state.userPage}

          </Col>
        </Row>


      </div>
    )
  }
}

export default Users;
