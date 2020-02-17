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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const Box = require('3box');
const AppName = 'DecentralizedPortfolio_test2';
const usersRegistered = 'users_registered';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";



class Portfolio extends Component {
  state = {
    web3: null,
    coinbase:null,
    box:null,
    profile: null,
    space: null,
    fields:[{ // for a field with a textarea input
              inputType: 'textarea',
              key: 'portfolio',
              field: 'Portfolio'
            }],
    itens: []
  }

  constructor(props){
    super(props);
    this.addItem = this.addItem.bind(this);
    this.refreshItems = this.refreshItems.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }


  componentDidMount = async ()  => {
    await this.refreshItems();
  };
  addItem = async function(){
    let item;
    if($("#item_img").html()!= ""){
      item = {
        name: $("#item_name").val(),
        description: $("#item_description").val(),
        uri: $("#item_uri").val(),
        img: JSON.parse($("#item_img").html()).content,
        isItem: true
      }
    } else {
      item = {
        name: $("#item_name").val(),
        description: $("#item_description").val(),
        uri: $("#item_uri").val(),
        isItem: true
      }
    }

    await this.state.space.public.set($("#item_name").val(), item);
    await this.state.space.syncDone
    const profile = await this.state.space.public.all()
    console.log(profile)
    const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
    const oldPostId = await this.state.space.private.get('reg_postId');
    await thread.deletePost(oldPostId);
    const postId = await thread.post(profile);
    await this.state.space.private.set('reg_postId',postId);
    this.setState({
      profile:profile
    });
    await this.refreshItems();
    alert('Item saved');
    return;
  };
  removeItem = async function(){
    try{
      await this.state.space.public.remove($("#s_remove :selected").val());
      await this.state.space.syncDone
      const profile = await this.state.space.public.all()
      const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
      const oldPostId = await this.state.space.private.get('reg_postId');
      await thread.deletePost(oldPostId);
      const postId = await thread.post(profile);
      await this.state.space.private.set('reg_postId',postId);
      this.setState({
        profile: profile
      });

      await this.refreshItems();
      alert("removed");
    } catch(err){
      alert(err)
    }

  };
  refreshItems = async function(){
    const web3 = this.props.web3;

    // Use web3 to get the user's coinbase.
    const coinbase = this.props.coinbase
    const box = this.props.box;
    const space = this.props.space;
    await space.syncDone;
    const profile = await this.props.space.public.all()

    console.log(profile);


    this.state.itens = [];
    this.forceUpdate();

    for(const item of Object.values(profile)){
      if((item.uri) &&
          !this.state.itens.includes(item)){

          this.state.itens.push(item)
          this.forceUpdate();
      }

    }
    this.setState({
      web3: web3,
      space: space,
      coinbase: coinbase,
      box: box,
      profile: profile
    });
    return
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

    if(this.state.profile){
      return(
        <div>
          <div>
            <h3>Your public informations</h3>
            <p>Wallet address: {this.state.coinbase}</p>
            <p>Name: {this.state.profile.name}</p>
            <p>Description: {this.state.profile.description}</p>
          </div>
          <hr/>
          <Tabs defaultActiveKey="itensadded" className="nav-fill flex-column flex-md-row">
            <Tab eventKey="itensadded" title="Itens">
              <div>
                <h4>Itens added</h4>
                {

                  this.state.itens.map(function(item){
                    if(item.img){
                      return(
                        <div>
                          <hr/>
                          <p>Name: {item.name}</p>
                          <p>Description: {item.description}</p>
                          <p>URI: {item.uri}</p>
                          <p><img src={item.img} style={{maxWidth: '400px'}} /></p>
                        </div>
                      )
                    }
                    return(
                      <div>
                        <hr/>
                        <p>Name: {item.name}</p>
                        <p>Description: {item.description}</p>
                        <p>URI: {item.uri}</p>
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
            <Tab eventKey="removeItem" title="Remove Item">
              <div>
                <h4>Remove Item</h4>
                <Form.Group controlId="exampleForm.ControlSelect1">
                  <Form.Label>Select</Form.Label>
                  <Form.Control id='s_remove' as="select">
                      {
                        this.state.itens.map(function(item){
                          return(
                            <option value={item.name}>{item.name}</option>
                          )
                        })
                      }
                  </Form.Control>
                </Form.Group>
                <Button onClick={this.removeItem} type="primary">Remove</Button>
              </div>
            </Tab>
          </Tabs>
        </div>
      )
    }
    return(
      <div>Loading ...</div>
    )
  }

}

export default Portfolio;
