import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';

import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner} from 'react-bootstrap';//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import UserPage from './UserPage.js';

const Box = require('3box');


const Config = require('../config.js');
const AppName = Config.AppName
const jobsThread = Config.jobsThread;
const admin = Config.admin



class Jobs extends Component {
  state = {
    posts: null,
    box: null,
    coinbase: null,
    userPage: <div></div>
  }

  constructor(props){
    super(props);
    this.renderUserPage = this.renderUserPage.bind(this);
    this.filterJobs = this.filterJobs.bind(this);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  componentDidMount = async () => {
    await this.setState({
      box: this.props.box,
      coinbase: this.props.coinbase,
      space: this.props.space
    });

    let posts
    if(!this.state.space){
      posts = await Box.getThread(AppName, jobsThread, admin,false)
      this.setState({
        posts:posts
      });
      return
    }
    await this.state.space.syncDone;
    const thread = await this.state.space.joinThread(jobsThread,{firstModerator:admin,members: false});
    await this.setState({
      thread: thread
    })
    posts = await this.state.thread.getPosts();

    await this.setState({posts});

    this.state.thread.onUpdate(async()=> {
       const posts = await this.state.thread.getPosts();
       this.setState({posts});
     });
    return;


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

  filterJobs = async function(){
    try{
      if(!$("#input_filter").val().replace(/\s/g, '')){
        $(".div_job").show();
        return
      }
      const values = $("#input_filter").val().replace(/\s/g, '').toLowerCase().split(',');

      $(".div_job").hide();
      console.log(values)
      const posts = this.state.posts;
      const filteredPosts = [];
      for(var i=posts.length-1;i>=0;i--){
        const post = posts[i];
        console.log(post)
        const techs = post.message.techs;
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
            filteredPosts.push(post.postId);
          }

        }
      }
      console.log(filteredPosts);
      if(filteredPosts.length>0){
        for(const filteredPost of filteredPosts){
            $(".div_job.div_"+filteredPost).show();
        }
      }


    } catch(err){
      console.log(err)
      $(".div_job").show();
    }


    return
  };
  addItem = async function(){
    const profile = await this.state.space.public.all();
    const  item = {
        from: profile,
        name: $("#item_name").val(),
        description: $("#item_description").val(),
        techs: $("#item_techs").val()
    }
    await this.state.thread.post(item);
    alert('Item saved');
    return;
  };
  removeItem = async function(postId){
    try{
      await this.state.thread.deletePost(postId);
      alert("removed");
    } catch(err){
      alert(err)
    }

  };
  render(){
    const that = this;
    console.log(this.state)
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
    let jobs_offer =
      <div>
        No Job offers
      </div>
    if(this.state.posts.length > 0){
      jobs_offer =
        <div>
          <Row>
            <h4>Jobs offers</h4>
          </Row>
          <Row>
            <Form.Group>
              <Form.Label>Techs</Form.Label>
              <Form.Control placeholder="Techs" id='input_filter' onChange={this.filterJobs}/>
            </Form.Group>
          </Row>
          <Row>
            <Col lg={4} style={{height: '500px',overflowY:'scroll'}}>
              {
                this.state.posts.map(function(post){
                  const postId = post.postId;
                  const job = post.message;
                  const from = job.from;
                  let div_job = <div></div>
                  if(job.name && job.description){
                    div_job = <div>
                                          <p><small>Job description</small></p>
                                          <p>Name: {job.name}</p>
                                          <p>Description: {job.description}</p>
                                          <p>Techs: {job.techs}</p>
                                        </div>
                  }
                  return(


                      <div>
                          <Row className={"div_job div_"+postId}>
                          <Col lg={12}>
                            <ProfileHover
                              address={from.address}
                              orientation="bottom"
                              noCoverImg
                            />
                          </Col>
                            <Col lg={12}>
                            {div_job}
                            <Button variant="primary" href={"#user_"+from.address} onClick={()=>{ that.renderUserPage(from) }}>Contact</Button>
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

    }

    if(!this.state.box){
      return(jobs_offer)
    }
    return(
      <div>
      <Tabs defaultActiveKey="jobs_open" className="nav-fill flex-column flex-md-row">
        <Tab eventKey="jobs_open" title="Jobs open">
          {jobs_offer}
        </Tab>
        <Tab eventKey="addJob" title="Add Job">
          <div>
            <Form>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control placeholder="Name" id='item_name'/>
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control placeholder="Description" id='item_description'/>
              </Form.Group>
              <Form.Group>
                <Form.Label>Techs</Form.Label>
                <Form.Control placeholder="Techs" id='item_techs'/>
              </Form.Group>
            </Form>
            <Button onClick={this.addItem} variant="primary">Add item</Button>
            <hr/>
            <h4>Jobs posted by you</h4>
            {
              this.state.posts.map(function(post){
                const postId = post.postId;
                const job = post.message;
                const from = job.from;
                if(from.address==that.state.coinbase){
                  return(
                    <div>
                      <p><small>Job description</small></p>
                      <p>Name: {job.name}</p>
                      <p>Description: {job.description}</p>
                      <p>Techs: {job.techs}</p>
                      <Button onClick={()=>{that.removeItem(postId)}}>Remove</Button>
                      <hr/>
                    </div>
                  )
                }
              })
            }
          </div>
        </Tab>
      </Tabs>



      </div>
    )
  }
}

export default Jobs;
