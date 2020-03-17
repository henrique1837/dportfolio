import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner} from 'react-bootstrap';
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
    this.filterPosts = this.filterPosts.bind(this);
  }

  componentDidMount = async () => {
    await this.setState({
      box: this.props.box,
      space: this.props.space,
      coinbase: this.props.coinbase
    });

    if(!this.state.space){
      const posts = await Box.getThread(AppName, usersRegistered, admin,false)
      const postsFiltered = await this.filterPosts(posts);
      await this.setState({
        posts: postsFiltered
      });
      return;
    }
    const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin,members: false});
    await this.setState({
      thread: thread
    })
    const posts = await this.state.thread.getPosts();
    const postsFiltered = await this.filterPosts(posts);
    console.log(postsFiltered)
    await this.setState({
      posts: postsFiltered
    });

    this.state.thread.onUpdate(async()=> {
       const posts = await this.state.thread.getPosts();
       const postsFiltered = await this.filterPosts(posts);
       await this.setState({
         posts: postsFiltered
       });
     });
    return;

  };


  filterPosts = async function(posts){
    const added = []
    const postsFiltered = [];
    for(var i=posts.length-1;i>=0;i--){
        const post = posts[i];
        const profile = post.message;

        if(!added.includes(profile.address)){
          added.push(profile.address)
          postsFiltered.push(post);
          this.state.users.push(post);
          this.forceUpdate();
        }
    }
    return(postsFiltered);
  }

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
    if(!this.state.posts){
      return(
        <center>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Loading ...</p>
        </center>
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
          this.state.posts.map(function(post){
            const profile = post.message;
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
