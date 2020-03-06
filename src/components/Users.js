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

const Box = require('3box');
const AppName = 'DecentralizedPortfolio_test2';
const usersRegistered = 'users_registered';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";



class Users extends Component {
  state = {
    users: [],
    box: null,
    coinbase: null,
    userPage: <div></div>
  }

  constructor(props){
    super(props);
    this.renderUserPage = this.renderUserPage.bind(this);
    this.filterUsers = this.filterUsers.bind(this);
  }

  componentDidMount = async () => {
    this.setState({
      box: this.props.box,
      coinbase: this.props.coinbase
    });
    console.log(this.state)

    const posts = await Box.getThread(AppName, usersRegistered, admin,false)

    console.log(posts)

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

    console.log(profile);

    ReactDOM.render(
      <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} />,
      document.getElementById('userPage')
    );

    return
  };

  filterUsers = async function(){
    try{
      if(!$("#input_filter").val().replace(/\s/g, '')){
        $(".div_profile").show();
        return
      }
      const values = $("#input_filter").val().replace(/\s/g, '').toLowerCase().split(',');

      $(".div_profile").hide();
      console.log(values)
      const users = this.state.users;
      const filteredUsers = [];
      console.log(values)
      console.log(users)
      for(var i=users.length-1;i>=0;i--){
        const user = users[i];
        console.log(user)
        const techs = user.techs;
        const allTrue = [];
        if(techs){
          const treatedTechs = techs.toLowerCase().replace(/\s/g, '').split(',');
          console.log(treatedTechs)
          for(const value of values){
            if(treatedTechs.includes(value)){
                allTrue.push(true);
            } else {
                allTrue.push(false)
            }

          }
        }
        if(allTrue.length>0){
          const isFiltered = allTrue.every(function(isTrue){
              return isTrue == true
          });
          console.log(isFiltered)
          if(isFiltered){
            filteredUsers.push(user.address);
          }

        }
      }
      console.log(filteredUsers);
      if(filteredUsers.length>0){
        for(const filteredUser of filteredUsers){
            $(".div_profile.div_"+filteredUser).show();
        }
      }


    } catch(err){
      console.log(err)
      $(".div_profile").show();
    }


    return
  };

  render(){
    const that = this;
    if(this.state.users.length == 0){
      return(
        <div>Loading ... </div>
      );
    }
    return(
      <div>
        <Row>
          <h4>Users</h4>
        </Row>
        <Row>
          <Form.Group>
            <Form.Label>Techs</Form.Label>
            <Form.Control placeholder="Techs" id='input_filter' onChange={this.filterUsers}/>
          </Form.Group>
        </Row>
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
                                    <p>Techs: {profile.techs}</p>
                                  </div>
            }
            return(


                <div>
                    <Row className={"div_profile div_"+profile.address}>
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
                    <hr/>
                    </Row>

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
