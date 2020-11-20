import React,{Component} from 'react';

import {
  Button,
  Form,
  Card,
  CardBody,
  Label,
  FormGroup,
  TabContent,
  TabPane,
  Row,
  Col,
  Spinner,
  Input,
  NavItem,
  NavLink,
  Nav
} from 'reactstrap';
//import * as Box from '3box';
import {Link} from 'react-router-dom';

import ProfileHover from 'profile-hover';
import classnames from "classnames";

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
    tabs: 'Jobs'
  }

  constructor(props){
    super(props);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  componentDidMount = async () => {

    try{
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
      //await this.state.space.syncDone;
      const thread = await this.state.space.joinThread(jobsThread,{firstModerator:admin,members: false});
      await this.setState({
        thread: thread
      })
      posts = await this.state.thread.getPosts();
      this.setState({
        posts:posts
      });

      this.state.thread.onUpdate(async()=> {
         const posts = await this.state.thread.getPosts();
         this.setState({
           posts:posts
         });
       });
      return;
    } catch(err){
      console.log(err)
    }


  };


  addItem = async function(){
    const profile = await this.state.space.public.all();
    if(profile.address){
      const  item = {
          from: profile,
          name: this.state.item_name,
          description: this.state.item_description,
          techs: this.state.item_techs
      }
      await this.state.thread.post(item);
      alert('Item saved');
    } else {
      alert("Need to save your profile first")
    }
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
  toggleNavs = (e,tab) => {
    e.preventDefault();
    this.setState({
      tabs: tab
    });
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

              {
                this.state.posts.map(function(post){
                  const job = post.message
                  const from = job.from;
                  if(!from){
                    return;
                  }
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
                        <Col
                              lg={4}
                              style={{
                                display:'flex',
                                flexDirection:'column',
                                justifyContent:'space-between',
                                paddingBottom: '100px'
                              }}>
                          <div>
                            <ProfileHover
                              address={from.address}
                              orientation="bottom"
                              noCoverImg
                            />
                          </div>
                          <Col lg={12}>
                            {div_job}
                            <Link to={"/user/"+from.address} style={{all: 'unset'}}>
                              <Button variant="primary">Contact</Button>
                            </Link>
                          </Col>
                        </Col>
                  )
                })
              }
          </Row>
        </div>

    }

    if(!this.state.box){
      return(jobs_offer)
    }
    return(
      <div>
        <div className="nav-wrapper">
          <Nav
            className="nav-fill flex-column flex-md-row"
            id="tabs-icons-text"
            pills
            role="tablist"
          >
            <NavItem>
              <NavLink
                aria-selected={this.state.tabs === 'Jobs'}
                className={classnames("mb-sm-6 mb-md-0", {
                  active: this.state.tabs === 'Jobs'
                })}
                onClick={e => this.toggleNavs(e, 'Jobs')}
                href="#Jobs"
                role="tab"
              >
                <i className="ni ni-cloud-upload-96 mr-2" />
                Jobs
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                aria-selected={this.state.tabs === 'AddJob'}
                className={classnames("mb-sm-6 mb-md-0", {
                  active: this.state.tabs === 'AddJob'
                })}
                onClick={e => this.toggleNavs(e,'AddJob')}
                href="#AddJob"
                role="tab"
              >
                <i className="ni ni-bell-55 mr-2" />
                Add job
              </NavLink>
            </NavItem>
          </Nav>
        </div>
        <Card className="shadow">
          <CardBody>
            <TabContent activeTab={this.state.tabs}>
              <TabPane tabId="Jobs">
                {jobs_offer}
              </TabPane>

              <TabPane tabId="AddJob">
                <div>
                  <FormGroup>
                      <Label>Name</Label>
                      <Input className="form-control-alternative" type="text" placeholder="Name" id='item_name'/>
                  </FormGroup>
                  <FormGroup>
                      <Label>Description</Label>
                      <Input className="form-control-alternative" type="text" placeholder="Description" id='item_description'/>
                  </FormGroup>
                  <FormGroup>
                      <Label>Techs</Label>
                      <Input className="form-control-alternative" type="text" placeholder="Techs" id='item_techs'/>
                  </FormGroup>
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
              </TabPane>

            </TabContent>
          </CardBody>
        </Card>




      </div>
    )
  }
}

export default Jobs;
