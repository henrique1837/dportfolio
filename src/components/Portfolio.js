import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner} from 'react-bootstrap';
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
    fields:[{ // for a field with a textarea input
              inputType: 'textarea',
              key: 'portfolio',
              field: 'Portfolio'
            }],
    thread: null
  }

  constructor(props){
    super(props);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
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
  addItem = async function(){
    let item;
    if($("#item_img").html()!= ""){
      item = {
        name: $("#item_name").val(),
        description: $("#item_description").val(),
        uri: $("#item_uri").val(),
        img: JSON.parse($("#item_img").html()).content
      }
    } else {
      item = {
        name: $("#item_name").val(),
        description: $("#item_description").val(),
        uri: $("#item_uri").val()
      }
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



  fileUpload = function(){
    try{
      var file = $("#input_file")[0].files[0];
      var reader  = new FileReader();
      var fileName = file.name;
      var fileType = file.type;
      console.log(file)
      reader.onload = function(e) {
        // The file's text will be printed here
        console.log(e.target.result);
        $("#item_img").html(JSON.stringify({
          fileName: fileName,
          fileType: fileType,
          content: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } catch(err){
      console.log(err)
      $("#item_img").html("");
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
                {

                  this.state.posts.map(function(post){
                    const item = post.message;
                    const postId = post.postId;
                    if(item.img){
                      return(
                        <div>
                          <hr/>
                          <p>Name: {item.name}</p>
                          <p>Description: {item.description}</p>
                          <p>URI: <a href={item.uri} target="_blank">{item.uri}</a></p>
                          <p><img src={item.img} style={{maxWidth: '300px'}} /></p>
                          <Button onClick={()=>{ that.removeItem(postId)}} type="primary">Remove Item</Button>
                        </div>
                      )
                    }
                    return(
                      <div>
                        <hr/>
                        <p>Name: {item.name}</p>
                        <p>Description: {item.description}</p>
                        <p>URI: <a href={item.uri} target="_blank">{item.uri}</a></p>
                        <Button onClick={()=>{ that.removeItem(postId)}} type="primary">Remove Item</Button>
                      </div>
                    )

                  })
                }
              </div>
            </Tab>
            <Tab eventKey="addItem" title="Add Item">
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
                    <Form.Label>Uri</Form.Label>
                    <Form.Control placeholder="Uri" id='item_uri'/>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Image</Form.Label>
                    <input type="file" id='input_file' onChange={this.fileUpload} />
                  </Form.Group>
                </Form>
                <div id='item_img' style={{display: 'none'}}></div>
                <Button onClick={this.addItem} variant="primary">Add item</Button>
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
