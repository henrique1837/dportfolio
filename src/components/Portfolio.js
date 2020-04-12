import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner,ListGroup} from 'react-bootstrap';
import ReactFileReader from 'react-file-reader';
import Papa from 'papaparse';
//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';

const Box = require('3box');

const Config = require('../config.js');
const AppName = Config.AppName
const admin = Config.admin



class Portfolio extends Component {
  state = {
    coinbase:null,
    box:null,
    profile: null,
    space: null,
    thread: null,
    education: [],
    projects: [],
    experience: [],
    publications:[],
  }

  constructor(props){
    super(props);
    this.addItem = this.addItem.bind(this);
    this.saveItem = this.saveItem.bind(this);
    this.removeItem = this.removeItem.bind(this);

    this.clear = this.clear.bind(this);
  }


  componentDidMount = async ()  => {
    await this.props.space.syncDone;
    const thread = await this.props.space.joinThread("items_"+this.props.coinbase,{firstModerator:this.props.coinbase,members: true});
    await this.setState({
      thread: thread
    })
    const posts = await this.state.thread.getPosts();
    await this.setState({posts});

     await this.state.thread.onUpdate(async()=> {
       const posts = await this.state.thread.getPosts();
       await this.setState({posts});
     });
     await this.setState({
       profile: this.props.profile
     });
  };
  addItem = async function(type){
    // Education item //
    let item;

    if(type === 0){
      item = {
        school_name: $("#education_school").val(),
        course: $("#education_course").val(),
        start_date: $("#education_start_date").val(),
        end_date: $("#education_end_date").val(),
        description: $("#education_description").val(),
        uri: $("#education_uri").val(),
        type: type
      }
      await this.state.education.push(item);
      await this.forceUpdate();
    } else if(type === 1){
      // Projects //
      item = {
        title: $("#project_title").val(),
        description: $("#project_description").val(),
        start_date: $("#project_start").val(),
        end_date: $("#project_end").val(),
        uri: $("#project_uri").val(),
        type: type
      }
      await this.state.projects.push(item);
      await this.forceUpdate();
    } else if(type === 2){
       // Experience //
       item = {
         company: $("#experience_company").val(),
         title: $("#experience_title").val(),
         description: $("#experience_description").val(),
         location: $('#experience_location').val(),
         start_date: $("#experience_start").val(),
         end_date: $("#experience_end").val(),
         type: type
       }
       await this.state.experience.push(item);
       await this.forceUpdate();
     } else if(type === 3){
      // Publications //
      item = {
            name: $("#publication_name").val(),
            description: $("#experience_description").val(),
            date: $("#publication_date").val(),
            uri: $("#publication_uri").val(),
            type: type
      }
      await this.state.publications.push(item);
      await this.forceUpdate();
    }

    return;
  };

  saveItem = async function(type){
    if(type === 0){
      for(const edu of this.state.education){
        await this.state.thread.post(edu)
      }
    } else if(type === 1){
      for(const project of this.state.projects){
        await this.state.thread.post(project)
      }
    } else if(type === 2){
     for(const experience of this.state.experience){
       await this.state.thread.post(experience)
     }
   } else if(type === 3){
     for(const pub of this.state.publications){
       await this.state.thread.post(pub)
     }
   }
    this.clear(type)
    alert('Items saved');
    return
  }
  removeItem = async function(postId){
    try{
      await this.state.thread.deletePost(postId);
    } catch(err){
      alert(err)
    }

  };
  educationUpload = files => {
    try{
      const file = files[0];
      const that = this;
      const reader  = new FileReader();
      const fileName = file.name;
      const fileType = file.type;
      console.log(file)
      reader.onload = async function(f) {
        // The file's text will be printed here
        console.log(reader.result)
        const csv = Papa.parse(reader.result);
        for(var i=1;i<csv.data.length;i++){
          const data = csv.data[i]
          if(data.length > 0){
            const item = {
              school_name: data[0],
              course: null,
              start_date: data[1],
              end_date: data[2],
              description: data[3],
              uri: null,
              type:0
            }
            await that.state.education.push(item);
            await that.forceUpdate();
          }
        }
      };
      reader.readAsText(file);
    } catch(err){
      console.log(err)
    }
  }
  projectsUpload = files => {
    try{
      const file = files[0];
      const that = this;
      const reader  = new FileReader();
      const fileName = file.name;
      const fileType = file.type;
      console.log(file)
      reader.onload = async function(f) {
        // The file's text will be printed here
        console.log(reader.result)
        const csv = Papa.parse(reader.result);
        for(var i=1;i<csv.data.length;i++){
          const data = csv.data[i]
          if(data.length > 0 || data!=''){
            const item = {
              title: data[0],
              description: data[1],
              start_date: data[3],
              end_date: data[4],
              uri: data[2],
              type:1
            }
            await that.state.projects.push(item);
            await that.forceUpdate();
          }
        }
      };
      reader.readAsText(file);
    } catch(err){
      console.log(err)
    }
  }
  projectsUploadGit = files => {
    try{
      const file = files[0];
      const that = this;
      const reader  = new FileReader();
      const fileName = file.name;
      const fileType = file.type;
      console.log(file)
      reader.onload = async function(f) {
        // The file's text will be printed here
        console.log(reader.result)
        const arr = JSON.parse(reader.result);
        for(const project of arr){
          const item = {
            title: project.name,
            description: project.description,
            start_date: null,
            end_date: null,
            uri: project.url,
            type:1
          }
          await that.state.projects.push(item);
          await that.forceUpdate();
        }
      };
      reader.readAsText(file);
    } catch(err){
      console.log(err)
    }
  }
  experienceUpload = files => {
    try{
      const file = files[0];
      const that = this;
      const reader  = new FileReader();
      const fileName = file.name;
      const fileType = file.type;
      console.log(file)
      reader.onload = async function(f) {
        // The file's text will be printed here
        console.log(reader.result)
        const csv = Papa.parse(reader.result);
        for(var i=1;i<csv.data.length;i++){
          const data = csv.data[i]
          if(data.length > 0 || data!=''){
            const item = {
              company: data[0],
              title: data[1],
              description: data[2],
              start_date: data[4],
              end_date: data[5],
              location: data[3],
              type:2
            }
            await that.state.experience.push(item);
            await that.forceUpdate();
          }
        }
      };
      reader.readAsText(file);
    } catch(err){
      console.log(err)
    }
  }
  publicationUpload = files => {
    try{
      const file = files[0];
      const that = this;
      const reader  = new FileReader();
      const fileName = file.name;
      const fileType = file.type;
      console.log(file)
      reader.onload = async function(f) {
        // The file's text will be printed here
        console.log(reader.result)
        const csv = Papa.parse(reader.result);
        for(var i=1;i<csv.data.length;i++){
          const data = csv.data[i]
          if(data.length > 0 || data!=''){
            const item = {
              name: data[0],
              date: data[1],
              description: data[2],
              uri: null,
              type: 3
            }
            await that.state.publications.push(item);
            await that.forceUpdate();
          }
        }
      };
      reader.readAsText(file);
    } catch(err){
      console.log(err)
    }
  }
  clear = async function(type){
    if(type === 0) {
      await this.setState({
        education: []
      });
    } else if(type === 1){
      await this.setState({
        projects: []
      });
    }

  }

  render(){
    const that = this;
    if(this.state.profile){
      return(
        <div>
          <div>
            <h3>Your public informations</h3>
            <p>Wallet address: {this.state.profile.address}</p>
            <p>Name: {this.state.profile.name}</p>
            <p>Description: {this.state.profile.description}</p>
          </div>
          <hr/>
          <Tabs defaultActiveKey="itemsadded" className="nav-fill flex-column flex-md-row">
            <Tab eventKey="itemsadded" title="Items">
              <div>
                <h4>Items added</h4>
                <h5>Education</h5>
                <ListGroup>
                {

                  this.state.posts.map(function(post){
                    const item = post.message;
                    const postId = post.postId;
                    if(item.type === 0){
                      return(
                        <ListGroup.Item>
                          <Row>
                            <Col lg={4}>
                              <h5>{item.school_name}</h5>
                              <h6>{item.course}</h6>
                              <p><small>From {item.start_date} to {item.end_date}</small></p>
                              <p><a href={item.uri} target="_blank">{item.uri}</a></p>
                            </Col>
                            <Col lg={6}>
                              <p>{item.description}</p>
                            </Col>
                            <Col lg={2}>
                              <Button onClick={()=>{ that.removeItem(postId)}} variant="danger">Remove Item</Button>
                            </Col>
                          </Row>

                        </ListGroup.Item>
                      )
                    }

                  })
                }
                </ListGroup>
                <h5>Projects</h5>
                <ListGroup>
                {
                  this.state.posts.map(function(post){
                    const item = post.message;
                    const postId = post.postId;
                    if(item.type === 1){
                      return(
                        <ListGroup.Item>
                          <Row>
                            <Col lg={4}>
                              <h5>{item.title}</h5>
                              <p><small>From {item.start_date} to {item.end_date}</small></p>
                              <p><a href={item.uri} target="_blank">{item.uri}</a></p>
                            </Col>
                            <Col lg={6}>
                              <p>{item.description}</p>
                            </Col>
                            <Col lg={2}>
                              <Button onClick={()=>{ that.removeItem(postId)}} variant="danger">Remove Item</Button>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      )
                    }

                  })
                }
                </ListGroup>
                <h5>Experience</h5>
                <ListGroup>
                {
                  this.state.posts.map(function(post){
                    const item = post.message;
                    const postId = post.postId;
                    if(item.type === 2){
                      return(
                        <ListGroup.Item>
                          <Row>
                            <Col lg={4}>
                              <h5>{item.company}</h5>
                              <h6>{item.title}</h6>
                              <p><small>From {item.start_date} to {item.end_date}</small></p>
                              <p><small>{item.location}</small></p>
                            </Col>
                            <Col lg={6}>
                              <p>{item.description}</p>
                            </Col>
                            <Col lg={2}>
                              <Button onClick={()=>{ that.removeItem(postId)}} variant="danger">Remove Item</Button>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      )
                    }

                  })
                }
                </ListGroup>
                <h5>Publications</h5>
                <ListGroup>
                {
                  this.state.posts.map(function(post){
                    const item = post.message;
                    const postId = post.postId;
                    if(item.type === 3){
                      return(
                        <ListGroup.Item>
                          <Row>
                            <Col lg={4}>
                              <h5>{item.name}</h5>
                              <p><small>Published on {item.date}</small></p>
                              <p><small><a href={item.uri} target='_blank'>{item.uri}</a></small></p>
                            </Col>
                            <Col lg={6}>
                              <p>{item.description}</p>
                            </Col>
                            <Col lg={2}>
                              <Button onClick={()=>{ that.removeItem(postId)}} variant="danger">Remove Item</Button>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      )
                    }

                  })
                }
                </ListGroup>
              </div>
            </Tab>
            <Tab eventKey="addItem" title="Add Item">
              <div>
                <div style={{paddingTop:'40px'}}>
                  <h4>Education</h4>
                  <p><small>Optional: Import education data from linkedin (Education.csv)</small></p>
                  <ReactFileReader handleFiles={this.educationUpload} fileTypes={'.csv'}>
                      <Button variant="primary">Upload</Button>
                  </ReactFileReader>
                  <Form.Group>
                      <Form.Label>School Name</Form.Label>
                      <Form.Control placeholder="Name" id='education_school'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Course</Form.Label>
                      <Form.Control placeholder="Description" id='education_course'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control placeholder="Description" id='education_description'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Uri</Form.Label>
                      <Form.Control placeholder="Uri" id='education_uri'/>
                  </Form.Group>
                  <Button onClick={()=>{that.addItem(0)}} variant="primary">Add item</Button>
                  <h5>Education items</h5>
                  <ListGroup>
                  {
                    this.state.education.map(function(item){
                      return(
                        <ListGroup.Item>
                          <div>
                            <Row>
                              <Col lg={6}>
                                <h5>{item.school_name}</h5>
                                <h6>{item.course}</h6>
                                <p><a href={item.uri} target='_blank'>{item.uri}</a></p>
                                <p><small>From {item.start_date} to {item.end_date}</small></p>
                              </Col>
                              <Col lg={6}>
                                <p>
                                {
                                  item.description
                                }
                                </p>
                              </Col>
                            </Row>
                          </div>
                        </ListGroup.Item>
                      )
                    })
                  }
                  </ListGroup>
                  <Button onClick={()=>{that.saveItem(0)}} variant="primary">Save</Button>
                  <Button onClick={()=>{this.clear(0)}} variant="danger">Clear</Button>
                </div>
                <div style={{paddingTop:'40px'}}>
                  <h4>Projects</h4>
                  <p><small>Optional: Import projects data from linkedin (Projects.csv) or from Github (repositories_*.json)</small></p>
                  <ReactFileReader handleFiles={this.projectsUpload} fileTypes={'.csv'}>
                      <Button variant="primary">Upload from Linkedin file</Button>
                  </ReactFileReader>
                  <ReactFileReader handleFiles={this.projectsUploadGit} fileTypes={'.json'}>
                      <Button variant="primary">Upload from Github file</Button>
                  </ReactFileReader>
                  <Form.Group>
                      <Form.Label>Title</Form.Label>
                      <Form.Control placeholder="Title" id='project_title'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control placeholder="Description" id='project_description'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Uri</Form.Label>
                      <Form.Control placeholder="Uri" id='project_uri'/>
                  </Form.Group>
                  <Button onClick={()=>{that.addItem(1)}} variant="primary">Add item</Button>
                  <ListGroup>
                  {
                    this.state.projects.map(function(item){
                      return(
                        <ListGroup.Item>
                          <div>
                            <Row>
                              <Col lg={6}>
                                <h5>{item.title}</h5>
                                <p><a href={item.uri} target='_blank'>{item.uri}</a></p>
                                <p><small>From {item.start_date} to {item.end_date}</small></p>
                              </Col>
                              <Col lg={6}>
                                <p>
                                {
                                  item.description
                                }
                                </p>
                              </Col>
                            </Row>
                          </div>
                        </ListGroup.Item>
                      )
                    })
                  }
                  </ListGroup>
                  <Button onClick={()=>{that.saveItem(1)}} variant="primary">Save</Button>
                  <Button onClick={()=>{that.clear(1)}} variant="danger">Clear</Button>
                </div>
                <div style={{paddingTop:'40px'}}>
                  <h4>Experience</h4>
                  <p><small>Optional: Import projects data from linkedin (Positions.csv)</small></p>
                  <ReactFileReader handleFiles={this.experienceUpload} fileTypes={'Positions.csv'}>
                      <Button variant="primary">Upload</Button>
                  </ReactFileReader>
                  <Form.Group>
                      <Form.Label>Company</Form.Label>
                      <Form.Control placeholder="Title" id='experience_company'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Title</Form.Label>
                      <Form.Control placeholder="Title" id='experience_title'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control placeholder="Description" id='experience_description'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Location</Form.Label>
                      <Form.Control placeholder="Uri" id='experience_location'/>
                  </Form.Group>
                  <Button onClick={()=>{that.addItem(2)}} variant="primary">Add item</Button>
                  <ListGroup>
                  {
                    this.state.experience.map(function(item){
                      return(
                        <ListGroup.Item>
                          <div>
                            <Row>
                              <Col lg={6}>
                                <h5>{item.company}</h5>
                                <h6>{item.title}</h6>
                                <p><small>{item.location}</small></p>
                                <p><small>From {item.start_date} to {item.end_date}</small></p>
                              </Col>
                              <Col lg={6}>
                                <p>
                                {
                                  item.description
                                }
                                </p>
                              </Col>
                            </Row>
                          </div>
                        </ListGroup.Item>
                      )
                    })
                  }
                  </ListGroup>
                  <Button onClick={()=>{that.saveItem(2)}} variant="primary">Save</Button>
                  <Button onClick={()=>{that.clear(2)}} variant="danger">Clear</Button>
                </div>
                <div style={{paddingTop:'40px'}}>
                  <h4>Publications</h4>
                  <p><small>Optional: Import publications data from linkedin (Publications.csv)</small></p>
                  <ReactFileReader handleFiles={this.publicationUpload} fileTypes={'.csv'}>
                      <Button variant="primary">Upload</Button>
                  </ReactFileReader>
                  <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control placeholder="Name" id='publication_name'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Publication date</Form.Label>
                      <Form.Control placeholder="Publication date" id='publication_date'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control placeholder="Description" id='publication_description'/>
                  </Form.Group>
                  <Form.Group>
                      <Form.Label>Uri</Form.Label>
                      <Form.Control placeholder="Uri" id='publication_uri'/>
                  </Form.Group>
                  <Button onClick={()=>{that.addItem(3)}} variant="primary">Add item</Button>
                  <ListGroup>
                  {
                    this.state.publications.map(function(item){
                      return(
                        <ListGroup.Item>
                          <div>
                            <Row>
                              <Col lg={6}>
                                <h5>{item.name}</h5>
                                <p><small>Published on {item.date}</small></p>
                                <p><small><a href={item.uri} target='_blank'>{item.uri}</a></small></p>
                              </Col>
                              <Col lg={6}>
                                <p>
                                {
                                  item.description
                                }
                                </p>
                              </Col>
                            </Row>
                          </div>
                        </ListGroup.Item>
                      )
                    })
                  }
                  </ListGroup>
                  <Button onClick={()=>{that.saveItem(3)}} variant="primary">Save</Button>
                  <Button onClick={()=>{that.clear(3)}} variant="danger">Clear</Button>
                </div>
              </div>
            </Tab>
          </Tabs>
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

export default Portfolio;
