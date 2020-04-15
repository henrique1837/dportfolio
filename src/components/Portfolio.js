import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {
  Button,
  Card,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  TabContent,
  TabPane,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  ListGroupItem,
  ListGroup,
  Spinner
} from 'reactstrap';
import ReactFileReader from 'react-file-reader';
import Papa from 'papaparse';
import classnames from "classnames";
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


const axios = require('axios');
const cheerio = require('cheerio');


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
    images: [],
    videos: [],
    tabs: "Items"
  }

  constructor(props){
    super(props);
    this.addItem = this.addItem.bind(this);
    this.saveItem = this.saveItem.bind(this);
    this.removeItem = this.removeItem.bind(this);

    this.clear = this.clear.bind(this);

    this.scrapInstagram = this.scrapInstagram.bind(this);
    this.scrapYoutube = this.scrapYoutube.bind(this);
  }


  componentDidMount = async ()  => {
    if(!this.props.space){
      return
    }
    await this.props.space.syncDone;
    const profile = await this.props.space.public.all();
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
       profile: profile
     });
     return
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
     } else if(type === 4){
       for(const img of this.state.images){
         await this.state.thread.post(img)
       }
     } else if(type === 5){
       for(const vid of this.state.videos){
         await this.state.thread.post(vid)
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
  scrapInstagram = async function(){
    try {
      const username = this.state.profile.instagram;
      console.log(username)
      if(!username){
        return
      }
      let url
      if(username.includes('https://www.instagram.com')){
        url = username
      } else {
        url  = `https://www.instagram.com/${username}/` ;
      }
      const config = {
        headers: {
          'access-control-allow-origin': '*'
        }
      }
      const response = await axios.get(url,config);
      const dom = cheerio.load(response.data)
      let script = dom('script').eq(4).html();
      /* Traverse through the JSON of instagram response */
      let { entry_data: { ProfilePage : {[0] : { graphql : {user} }} } } = JSON.parse(/window\._sharedData = (.+);/g.exec(script)[1]);

      /* Output the data */
      console.log(user.edge_owner_to_timeline_media.edges);
      for(const post of user.edge_owner_to_timeline_media.edges){
        console.log(post.node)
        const item = {
          description: post.node.accessibility_caption,
          uri:post.node.display_url,
          type:4
        }
        await this.state.images.push(item);
        await this.forceUpdate();
      }
    } catch(err){
      console.log(err)
    }
  }
  scrapYoutube = async function(){
    try {
      const channel = this.state.profile.youtube;
      console.log(channel)
      if(!channel){
        return
      }
      let url = channel;
      if(!url.includes('https://www.youtube.com/channel/')){
        url = `https://www.youtube.com/channel/${channel}`
      } else {
        //url = url.split('https://www.youtube.com')[1];
        url = channel;
      }
      console.log(url)
      const config = {
        headers: {
          'access-control-allow-origin': '*'
        }
      }
      //url = 'https://cors-anywhere.herokuapp.com/https://www.youtube.com/channel/UCeMbEZBp1OedIZwKqq8h2lQ'
      const response = await axios.get(url,config);
      const dom = cheerio.load(response.data)
      const script = dom('script').eq(10).html();
      console.log(script)
      const items = JSON.parse(script).itemListElement[0].item.itemListElement

      for(const post of items){
        const item = {
          uri:post.url,
          type:5
        }
        await this.state.videos.push(item);
        await this.forceUpdate();
      }
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
    }  else if(type === 2){
      await this.setState({
        experience: []
      });
    }  else if(type === 3){
      await this.setState({
        publications: []
      });
    }  else if(type === 4){
      await this.setState({
        images: []
      });
    }  else if(type === 5){
      await this.setState({
        videos: []
      });
    }

  }
  toggleNavs = (e,tab) => {
    e.preventDefault();
    this.setState({
      tabs: tab
    });
  };
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
          <div className="nav-wrapper">
            <Nav
              className="nav-fill flex-column flex-md-row"
              id="tabs-icons-text"
              pills
              role="tablist"
            >
              <NavItem>
                <NavLink
                  aria-selected={this.state.tabs === 'Items'}
                  className={classnames("mb-sm-6 mb-md-0", {
                    active: this.state.tabs === 'Items'
                  })}
                  onClick={e => this.toggleNavs(e, 'Items')}
                  href="#Items"
                  role="tab"
                >
                  <i className="ni ni-cloud-upload-96 mr-2" />
                  Items
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  aria-selected={this.state.tabs === 'AddItem'}
                  className={classnames("mb-sm-6 mb-md-0", {
                    active: this.state.tabs === 'AddItem'
                  })}
                  onClick={e => this.toggleNavs(e,'AddItem')}
                  href="#AddItem"
                  role="tab"
                >
                  <i className="ni ni-bell-55 mr-2" />
                  Add item
                </NavLink>
              </NavItem>
            </Nav>
          </div>
          <Card className="shadow">
            <CardBody>
              <TabContent activeTab={this.state.tabs}>
                <TabPane tabId="Items">
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
                            <ListGroupItem>
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
                                  <Button onClick={()=>{ that.removeItem(postId)}} color="danger">Remove Item</Button>
                                </Col>
                              </Row>

                            </ListGroupItem>
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
                            <ListGroupItem>
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
                                  <Button onClick={()=>{ that.removeItem(postId)}} color="danger">Remove Item</Button>
                                </Col>
                              </Row>
                            </ListGroupItem>
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
                            <ListGroupItem>
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
                                  <Button onClick={()=>{ that.removeItem(postId)}} color="danger">Remove Item</Button>
                                </Col>
                              </Row>
                            </ListGroupItem>
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
                            <ListGroupItem>
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
                                  <Button onClick={()=>{ that.removeItem(postId)}} color="danger">Remove Item</Button>
                                </Col>
                              </Row>
                            </ListGroupItem>
                          )
                        }

                      })
                    }
                    </ListGroup>
                    <h5>Images</h5>
                    <Row>
                    {
                      this.state.posts.map(function(post){
                        const item = post.message;
                        const postId = post.postId;
                        if(item.type === 4){
                          return(
                            <Col
                              lg={4}
                              style={{
                                display:'flex',
                                flexDirection:'column',
                                justifyContent:'space-between',
                                paddingBottom: '100px'
                              }}>
                              <Card>
                                <CardBody>
                                  <center>
                                    <img src={item.uri} caption={item.description} style={{width:'100%'}}/>
                                  </center>
                                  <Button onClick={()=>{ that.removeItem(postId)}} color="danger">Remove Item</Button>
                                </CardBody>
                              </Card>
                            </Col>
                          )
                        }

                      })
                    }
                    </Row>
                    <h5>Videos</h5>
                    <Row>
                    {
                      this.state.posts.map(function(post){
                        const item = post.message;
                        const postId = post.postId;

                        if(item.type === 5){
                          const uri = `https://www.youtube.com/embed/${item.uri.split('http://www.youtube.com/watch?v=',1)[1]}`;
                          return(
                            <Col
                              lg={4}
                              style={{
                                display:'flex',
                                flexDirection:'column',
                                justifyContent:'space-between',
                                paddingBottom: '100px'
                              }}>
                              <Card>
                                <CardBody>
                                  <center>
                                    <iframe src={uri} style={{width:'100%'}}
                                        frameborder="0"
                                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                                        allowfullscreen>
                                    </iframe>
                                  </center>
                                  <Button onClick={()=>{ that.removeItem(postId)}} color="danger">Remove Item</Button>
                                </CardBody>
                              </Card>
                            </Col>
                          )
                        }

                      })
                    }
                    </Row>
                  </div>
                </TabPane>
                <TabPane tabId="AddItem">
                  <div>
                    <div style={{paddingTop:'40px'}}>
                      <h4>Education</h4>
                      <p><small>Optional: Import education data from linkedin (Education.csv)</small></p>
                      <ReactFileReader handleFiles={this.educationUpload} fileTypes={'.csv'}>
                          <Button color="primary">Upload</Button>
                      </ReactFileReader>
                      <FormGroup>
                          <Label>School Name</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Name" id='education_school'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Course</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Description" id='education_course'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Description</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Description" id='education_description'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Uri</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Uri" id='education_uri'/>
                      </FormGroup>
                      <Button onClick={()=>{that.addItem(0)}} color="primary">Add item</Button>
                      <h5>Education items</h5>
                      <ListGroup>
                      {
                        this.state.education.map(function(item){
                          return(
                            <ListGroupItem>
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
                            </ListGroupItem>
                          )
                        })
                      }
                      </ListGroup>
                      <Button onClick={()=>{that.saveItem(0)}} color="primary">Save</Button>
                      <Button onClick={()=>{this.clear(0)}} color="danger">Clear</Button>
                    </div>
                    <div style={{paddingTop:'40px'}}>
                      <h4>Projects</h4>
                      <p><small>Optional: Import projects data from linkedin (Projects.csv) or from Github (repositories_*.json)</small></p>
                      <ReactFileReader handleFiles={this.projectsUpload} fileTypes={'.csv'}>
                          <Button color="primary">Upload from Linkedin file</Button>
                      </ReactFileReader>
                      <ReactFileReader handleFiles={this.projectsUploadGit} fileTypes={'.json'}>
                          <Button color="primary">Upload from Github file</Button>
                      </ReactFileReader>
                      <FormGroup>
                          <Label>Title</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Title" id='project_title'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Description</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Description" id='project_description'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Uri</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Uri" id='project_uri'/>
                      </FormGroup>
                      <Button onClick={()=>{that.addItem(1)}} color="primary">Add item</Button>
                      <ListGroup>
                      {
                        this.state.projects.map(function(item){
                          return(
                            <ListGroupItem>
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
                            </ListGroupItem>
                          )
                        })
                      }
                      </ListGroup>
                      <Button onClick={()=>{that.saveItem(1)}} color="primary">Save</Button>
                      <Button onClick={()=>{that.clear(1)}} color="danger">Clear</Button>
                    </div>
                    <div style={{paddingTop:'40px'}}>
                      <h4>Experience</h4>
                      <p><small>Optional: Import projects data from linkedin (Positions.csv)</small></p>
                      <ReactFileReader handleFiles={this.experienceUpload} fileTypes={'Positions.csv'}>
                          <Button color="primary">Upload</Button>
                      </ReactFileReader>
                      <FormGroup>
                          <Label>Company</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Title" id='experience_company'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Title</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Title" id='experience_title'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Description</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Description" id='experience_description'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Location</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Uri" id='experience_location'/>
                      </FormGroup>
                      <Button onClick={()=>{that.addItem(2)}} color="primary">Add item</Button>
                      <ListGroup>
                      {
                        this.state.experience.map(function(item){
                          return(
                            <ListGroupItem>
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
                            </ListGroupItem>
                          )
                        })
                      }
                      </ListGroup>
                      <Button onClick={()=>{that.saveItem(2)}} color="primary">Save</Button>
                      <Button onClick={()=>{that.clear(2)}} color="danger">Clear</Button>
                    </div>
                    <div style={{paddingTop:'40px'}}>
                      <h4>Publications</h4>
                      <p><small>Optional: Import publications data from linkedin (Publications.csv)</small></p>
                      <ReactFileReader handleFiles={this.publicationUpload} fileTypes={'.csv'}>
                          <Button color="primary">Upload</Button>
                      </ReactFileReader>
                      <FormGroup>
                          <Label>Name</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Name" id='publication_name'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Publication date</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Publication date" id='publication_date'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Description</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Description" id='publication_description'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Uri</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Uri" id='publication_uri'/>
                      </FormGroup>
                      <Button onClick={()=>{that.addItem(3)}} color="primary">Add item</Button>
                      <ListGroup>
                      {
                        this.state.publications.map(function(item){
                          return(
                            <ListGroupItem>
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
                            </ListGroupItem>
                          )
                        })
                      }
                      </ListGroup>
                      <Button onClick={()=>{that.saveItem(3)}} color="primary">Save</Button>
                      <Button onClick={()=>{that.clear(3)}} color="danger">Clear</Button>
                    </div>
                    <div style={{paddingTop:'40px'}}>
                      <h4>Images</h4>
                      <p><small>Optional: Import images data from instagram</small></p>
                      <Button color="primary" onClick={this.scrapInstagram}>Get from Instagram</Button>
                      <FormGroup>
                          <Label>Image</Label>
                          <ReactFileReader fileTypes={'.jpg .png .jpeg'}>
                              <Button color="primary">Upload file</Button>
                          </ReactFileReader>
                      </FormGroup>

                      <FormGroup>
                          <Label>Description</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Description" id='image_description'/>
                      </FormGroup>
                      <FormGroup>
                          <Label>Uri</Label>
                          <Input className="form-control-alternative" type="text" placeholder="Uri" id='image_uri'/>
                      </FormGroup>
                      <Button onClick={()=>{that.addItem(4)}} color="primary">Add item</Button>
                      <Row>
                      {
                        this.state.images.map(function(item){
                          return(
                            <Col
                              lg={4}
                              style={{
                                display:'flex',
                                flexDirection:'column',
                                justifyContent:'space-between',
                                paddingBottom: '100px'
                              }}>
                              <Card>
                                <CardBody>
                                  <center>
                                    <img src={item.uri} caption={item.description} style={{width:'100%'}}/>
                                  </center>
                                </CardBody>
                              </Card>
                            </Col>
                          )
                        })
                      }
                      </Row>
                      <Button onClick={()=>{that.saveItem(4)}} color="primary">Save</Button>
                      <Button onClick={()=>{that.clear(4)}} color="danger">Clear</Button>
                    </div>
                    <div style={{paddingTop:'40px'}}>
                      <h4>Videos</h4>
                      <p><small>Optional: Import videos data from youtube channel</small></p>
                      <Button color="primary" onClick={this.scrapYoutube}>Get from Youtube</Button>

                      <Row>
                      {
                        this.state.videos.map(function(item){
                          const uri = `https://www.youtube.com/embed/${item.uri.split('http://www.youtube.com/watch?v=',1)[1]}`
                          return(
                            <Col
                              lg={4}
                              style={{
                                display:'flex',
                                flexDirection:'column',
                                justifyContent:'space-between',
                                paddingBottom: '100px'
                              }}>
                              <Card>
                                <CardBody>
                                  <center>
                                    <iframe src={uri} style={{width:'100%'}}
                                        frameborder="0"
                                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                                        allowfullscreen>
                                    </iframe>
                                  </center>
                                </CardBody>
                              </Card>
                            </Col>
                          )
                        })
                      }
                      </Row>
                      <Button onClick={()=>{that.saveItem(5)}} color="primary">Save</Button>
                      <Button onClick={()=>{that.clear(5)}} color="danger">Clear</Button>
                    </div>
                  </div>
                </TabPane>
              </TabContent>
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

export default Portfolio;
