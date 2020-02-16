import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar,Card,Modal,Collapse} from 'react-bootstrap';
//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import "./App.css";
const Box = require('3box');
const AppName = 'DecentralizedPortfolio_test0';
const usersRegistered = 'users_registered';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";



class UserPage extends Component {
  state = {
    confidentialThreadName: null,
    threadAdmin: null,
    messages: null
  }
  constructor(props){
    super(props);
    this.addContact = this.addContact.bind(this);
  }
  componentDidMount = async function(){

    if(this.props.box){
      const space = await this.props.box.openSpace(AppName);
      await space.syncDone;
      console.log("contacts_"+this.props.profile.address)
      console.log(this.props.coinbase)
      const isContact = await space.private.get("contact_"+this.props.profile.address);
      console.log(isContact);
      if(!isContact){
        const thread = await space.joinThread("contacts_"+this.props.profile.address,{firstModerator:this.props.profile.address});
        const postId = await thread.post(this.props.coinbase);
        await space.private.set("contact_"+this.props.profile.address,postId);
      }
      const userProfile = await Box.getSpace(this.props.profile.address,AppName);
      const threadAddressByUser = userProfile['contactThread_'+this.props.coinbase];
      console.log(threadAddressByUser);
      if(threadAddressByUser){
        const confidentialThreadNameByUser = "contact_"+this.props.profile.address+"_"+this.props.coinbase;
        await space.public.set('contactThread_'+this.props.profile.address,threadAddressByUser);
        const thread = await space.joinThreadByAddress(threadAddressByUser)
        console.log(await thread.getPosts());
        this.setState({
          confidentialThreadName: confidentialThreadNameByUser,
          threadAdmin: this.props.profile.address
        });
      } else {
        const confidentialThreadName = "contact_"+this.props.coinbase+"_"+this.props.profile.address;
        let threadAddress = await space.public.get('contactThread_'+this.props.profile.address);
        console.log(threadAddress)
        if(!threadAddress){
          //const thread = await space.createConfidentialThread(confidentialThreadName,{firstModerator:this.props.coinbase,members: true});
          const thread = await space.joinThread(confidentialThreadName,{firstModerator:this.props.coinbase,members: true});
          const members = await thread.listMembers();

          if(members.length == 0){
            await thread.addMember(this.props.profile.address);
            console.log("member added");
          }
          threadAddress = thread.address

          await space.public.set('contactThread_'+this.props.profile.address,threadAddress);

        }


        this.setState({
          confidentialThreadName: confidentialThreadName,
          threadAdmin: this.props.coinbase
        });
      }

    }

  }
  addContact = async function(){
    const space = await this.props.box.openSpace(AppName);
    await space.syncDone;
    console.log("contacts_"+this.props.profile.address)
    await space.private.remove("contactAdded_"+this.props.profile.address);
    const isContactAdded = await space.private.get("contactAdded_"+this.props.profile.address);
    console.log(isContactAdded)
    console.log("contactsAdded_"+this.props.coinbase);
    if(!isContactAdded){
      const thread = await space.joinThread("contactsAdded_"+this.props.coinbase,{firstModerator:this.props.coinbase});
      const postId = await thread.post(this.props.profile.address);
      await space.private.set("contactAdded_"+this.props.profile.address,postId);
    }
    alert('saved')
    return
  }

  render(){
    const itens = this.props.itens
    const profile = this.props.profile
    console.log(this.state);
    if(this.state.confidentialThreadName){

      return(
        <div>
              <Tabs defaultActiveKey="portfolio">
                <Tab eventKey="portfolio" title="Portfolio" style={{paddingTop:'10px'}}>
                  <h5>{profile.name} portfolio</h5>
                  {
                    itens.map(function(item){
                      if(!item.img){
                        return(
                          <div>
                            <hr />
                            <div>
                              <p>Name: {item.name}</p>
                              <p>Description: {item.description}</p>
                              <p>URI: {item.uri}</p>
                            </div>
                          </div>
                        )
                      }
                      return(
                        <div>
                          <hr />
                          <div>
                            <p>Name: {item.name}</p>
                            <p>Description: {item.description}</p>
                            <p>URI: {item.uri}</p>
                            <p><img style={{maxWidth: '400px'}} src={item.img}/></p>
                          </div>
                        </div>
                      )
                    })
                  }
                  <Button variant="primary" onClick={this.addContact}>Add contact</Button>
                </Tab>
                <Tab eventKey="privMessage" title="Private message" style={{paddingTop:'10px'}}>
                  <h5>Private message</h5>

                  <ThreeBoxComments
                                        // required
                                        spaceName={AppName}
                                        threadName={this.state.confidentialThreadName}
                                        adminEthAddr={this.state.threadAdmin}


                                        // Required props for context A) & B)
                                        box={this.props.box}
                                        currentUserAddr={this.props.coinbase}

                                        // Required prop for context B)
                                        //loginFunction={handleLogin}

                                        // Required prop for context C)
                                        //ethereum={ethereum}
                                        // optional
                                        members={true}

                  />



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
             <h5>{profile.name} portfolio</h5>
             {
               itens.map(function(item){
                 return(
                   <div>
                     <hr />
                     <div>
                       <p>Name: {item.name}</p>
                       <p>Description: {item.description}</p>
                       <p>URI: {item.uri}</p>
                       <p><img style={{maxWidth: '400px'}} src={item.img}/></p>
                     </div>
                   </div>
                 )
               })
             }
             </div>
    )
  }
}

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
    const posts = await Box.getThread(AppName, usersRegistered, admin, false)

    /*
    const space = await this.props.box.openSpace(AppName);
    const thread = await space.joinThread(usersRegistered,{firstModerator:admin});
    const p = await thread.getPosts();
    console.log(p)
    for(const a of p){
       await thread.deletePost(a.postId)
    }
    alert('deleted')
    return
    */
    console.log(posts)
    //const added = {}

    for(const post of posts){
        const profile = post.message;
        this.state.users.push(profile);
        this.forceUpdate();
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

    const profile = this.props.profile;
    await space.syncDone;
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
          <Tabs defaultActiveKey="itensadded" id="uncontrolled-tab-example">
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

class Profile extends Component {
  state = {
    box: null,
    space: null,
    coinbase: null,
    views: [],
    contacts: [],
    page: <div></div>
  }
  constructor(props){
    super(props)
    this.profileSaved = this.profileSaved.bind(this);
    this.chatPage = this.chatPage.bind(this);
    this.contactPage = this.contactPage.bind(this);
  }

  componentWillMount = async function(){

    const profile = await this.props.space.public.all();
    console.log("contacts_"+profile.address)
    const threadC = await this.state.space.joinThread("contacts_"+profile.address,{firstModerator:profile.address})
    //const posts = await Box.getThread(AppName, "contacts_"+profile.address,profile.address)
    const posts = await threadC.getPosts();
    console.log(posts)
    const views = [];
    for(const post of posts){
        //const did = post.author;
        //const prof = await Box.getSpace(did,AppName)
        /*const prof = {
          address: post.message
        }*/
        const addr = post.message
        console.log(addr)
        if(addr){
          await this.state.space.syncDone;
          const userProfile = await Box.getSpace(addr,AppName);
          const threadName = 'contactThread_'+this.props.coinbase;
          const threadAddress =  userProfile[threadName];
          console.log(threadAddress);
          if(threadAddress){
            let thread = await this.state.space.joinThreadByAddress(threadAddress);
            console.log(thread);
            let members = await thread.listMembers();
            //let posts = await thread.getPosts();
            if(members.length > 0){
              this.state.views.push(addr);
              this.forceUpdate();
            }
          }

        }

    }
    const contacts = [];
    const threadContacts = await this.state.space.joinThread("contactsAdded_"+profile.address,{firstModerator:profile.address})
    const postsContacts = await threadContacts.getPosts();
    console.log("contactsAdded_"+profile.address)
    console.log(postsContacts)
    for(const post of postsContacts){
        const address = post.message;


        if(address){
          this.state.contacts.push(address);
          this.forceUpdate();
        }
    }



  }
  componentDidMount = async function(){
    this.setState({
      box: this.props.box,
      space: this.props.space,
      coinbase: this.props.coinbase
    });
    await this.props.space.syncDone;
  }

  profileSaved = async function() {
    await this.state.space.syncDone
    const profile = await this.state.space.public.all();
    const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
    const oldPostId = await this.state.space.private.get('reg_postId');
    const postId = await thread.post(profile);
    await this.state.space.private.set('reg_postId',postId);
    //await thread.deletePost(oldPostId);
    alert("saved");
  };
  chatPage = async function(addr){

    const removed = ReactDOM.unmountComponentAtNode(document.getElementById("chatPage"));
    //const space = await this.props.box.openSpace(AppName);
    const isContact = await this.state.space.private.get("contact_"+addr);
    console.log(isContact)
    if(!isContact){
        const thread = await this.state.space.joinThread("contacts_"+addr,{firstModerator:addr});
        const postId = await thread.post(this.state.space.address);
        await this.state.space.private.set("contact_"+addr,postId);
    }
    const profile = await Box.getSpace(addr,AppName);
    console.log(profile);
    const threadName = 'contactThread_'+this.state.coinbase;
    const threadAddress =  profile[threadName];
    console.log(threadAddress);
    await this.state.space.syncDone;
    if(threadAddress){
      const thread = await this.state.space.joinThreadByAddress(threadAddress);
      const members = await thread.listMembers();
      console.log(members)
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
      ReactDOM.render(
        <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} itens={itens} />
        /*<ThreeBoxComments
                              // required
                              spaceName={AppName}
                              threadName={"contact_"+addr+"_"+this.props.coinbase}
                              adminEthAddr={addr}


                              // Required props for context A) & B)
                              box={this.props.box}
                              currentUserAddr={this.props.coinbase}

                              // Required prop for context B)
                              //loginFunction={handleLogin}

                              // Required prop for context C)
                              //ethereum={ethereum}

                              // optional
        />*/,
        document.getElementById('chatPage')
      );
      return
    }


    ReactDOM.render(
        <p>No messages to you</p>,
        document.getElementById('chatPage')
    );
    return


  }


  contactPage = async function(addr){
    const removed = ReactDOM.unmountComponentAtNode(document.getElementById("contactPage"));

    const space = await this.props.box.openSpace(AppName);
    const isContact = await this.state.space.private.get("contactAdded_"+addr);
    console.log(isContact)
    if(!isContact){
        const thread = await this.state.space.joinThread("contacts_"+addr,{firstModerator:addr});
        const postId = await thread.post(this.state.space.address);
        await this.state.space.private.set("contact_"+addr,postId);
    }
    let thread = await this.state.space.joinThread("contact_"+this.state.coinbase+"_"+addr,{firstModerator:this.state.coinbase,members:true,ghost: false});
    await this.state.space.syncDone;
    let members = await thread.listMembers();
    let posts = await thread.getPosts();
    console.log(members)
    console.log(posts)
    console.log(members.length)
    //if(members.length > 0){
      const itens = [];
      const profile = await Box.getSpace(addr, AppName);
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
      ReactDOM.render(

        <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} itens={itens} />,
        document.getElementById('contactPage')
      )
      return
    //}
    /*
    ReactDOM.render(
        <p>No messages to you</p>,
        document.getElementById('contactPage')
    );
    return
    */
  }
  render() {
    if(!this.state.box){
      return(
        <div>Loading ...</div>
      )
    }
    const that = this;
    return(
        <Tabs defaultActiveKey="editProfile">


            <Tab eventKey="editProfile" title="Edit Profile" style={{paddingTop:'10px'}}>
              <EditProfile
                      // required
                      box={this.state.box}
                      space={this.state.space}
                      currentUserAddr={this.state.coinbase}

                      // optional
                      //customFields={this.state.fields}
                      redirectFn={this.profileSaved}
                  />
            </Tab>
            <Tab eventKey="comments" title="Comments" style={{paddingTop:'10px'}}>
              <ThreeBoxComments
                                    // required
                                    spaceName={AppName}
                                    threadName={"job_offers_"+this.state.coinbase}
                                    adminEthAddr={this.state.coinbase}


                                    // Required props for context A) & B)
                                    box={this.state.box}
                                    currentUserAddr={this.state.coinbase}

                                    // Required prop for context B)
                                    //loginFunction={handleLogin}

                                    // Required prop for context C)
                                    //ethereum={ethereum}

                                    // optional
                                    members={false}
              />
            </Tab>
            <Tab eventKey="messages" title="Messages" style={{paddingTop:'10px'}}>
              <Row>
                <Col lg={4} style={{height: '500px',overflowY:'scroll'}}>
                  {
                    this.state.views.map(function(addr){
                      console.log(addr);
                      return(
                        <Row>
                          <Col lg={8} >
                            <ProfileHover
                              address={addr}
                              orientation="bottom"
                              noCoverImg
                            />
                          </Col>
                          <Col lg={4}>
                            <Button variant="primary" onClick={()=>{that.chatPage(addr)}}>Messages</Button>
                          </Col>
                        </Row>
                      );
                    })
                  }
                </Col>
                <Col lg={8} id='chatPage'>

                </Col>
              </Row>
            </Tab>
            <Tab eventKey="contacts" title="Contacts" style={{paddingTop:'10px'}}>
              <Row>
                <Col lg={4} style={{height: '500px',overflowY:'scroll'}}>
                  {
                    this.state.contacts.map(function(addr){
                      console.log(addr);
                      return(
                        <Row>
                          <Col lg={8} >
                            <ProfileHover
                              address={addr}
                              orientation="bottom"
                              noCoverImg
                            />
                          </Col>
                          <Col lg={4}>
                            <Button variant="primary" onClick={()=>{that.contactPage(addr)}}>Messages</Button>
                          </Col>
                        </Row>
                      );
                    })
                  }
                </Col>
                <Col lg={8} id='contactPage'>

                </Col>
              </Row>
            </Tab>
          </Tabs>
      );


  }
}

class App extends Component {
  state = {
    hasWeb3:false,
    web3: null,
    coinbase: null,
    box: null,
    space: null,
    doingLogin:false,
    page: <Container></Container>,
    footer: <footer style={{marginTop: '20px'}}>
              <Row>
                <Col lg={4}>
                  <p>Proudly done using <a href="https://3box.com" target='_blank' title='3Box'>3Box</a></p>
                </Col>
                <Col lg={4}>
                  <p>Support by using <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a> or donating</p>
                </Col>
                <Col lg={4}>
                  <p>Use a private,fast and secure browser</p>
                  <p>Earn rewards in BAT token while browsing</p>
                  <p>Install <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a></p>
                </Col>
              </Row>
            </footer>
   };
  constructor(props){
    super(props)

    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.editProfilePage = this.editProfilePage.bind(this);

    this.usersPage = this.usersPage.bind(this);
    this.homePage = this.homePage.bind(this);
    this.portfolioPage= this.portfolioPage.bind(this);
    this.loginPageNoWeb3 = this.loginPageNoWeb3.bind(this);
    this.offersPage = this.offersPage.bind(this);
    this.tutorialPage = this.tutorialPage.bind(this);

    this.openSpace = this.openSpace.bind(this);
  }
  componentDidMount = async () => {
    this.homePage();
    if(window.ethereum){
      this.setState({
        hasWeb3:true
      })
      await this.login();

    }

  };

  login = async function(){
    try {
      // Get network provider and web3 instance.
      await window.ethereum.enable();
      this.setState({
        doingLogin: true
      });

      const web3 = new Web3(window.ethereum);
      console.log(web3)
      // Use web3 to get the user's coinbase.
      const coinbase = await web3.eth.getCoinbase();
      console.log(coinbase);
      ReactDOM.render(
        <p>Aprove access to your 3Box account</p>,
        document.getElementById("loading_status")
      );
      const box = await Box.openBox(coinbase,window.ethereum);
      //const space = await box.openSpace(AppName);
      ReactDOM.render(
        <p>Syncing your profile</p>,
        document.getElementById("loading_status")
      );
      await box.syncDone;

      this.setState({
        web3:web3,
        coinbase:coinbase,
        box: box,
        doingLogin: false
      });
    } catch (error) {
      // Catch any errors for any of the above operations.

      this.setState({
        doingLogin: false
      });
      console.error(error);
    }
  }
  logout = async function(){
    await this.state.box.logout();
    this.setState({
      web3Err:false,
      web3: null,
      coinbase: null,
      box: null,
      space: null
    })
    this.homePage();
  };
  homePage = function() {
    this.setState({
      page:  <Container>

              <Card>
              <Card.Header as="h3">Welcome to decentralized portfolio</Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={4}>
                    <Card>
                      {/*<Card.Img variant="top" src="./imgs/ipfs.png" />*/}
                      <Card.Body>
                        <Card.Title>Decentralized storage</Card.Title>
                        <Card.Text>Everything is stored in <a href='https://ipfs.io' target='_blank' title='Interplanetary File System'>IPFS</a> using <a href='https://orbitdb.org/' target='_blank' title='OrbitDB'>OrbitDB</a> and linked to your decentralized identity thanks to <a href="https://3box.com" target='_blank' title='3Box'>3Box</a></Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={4}>
                    <Card>
                      {/*<Card.Img variant="top" src="./imgs/ipfs.png" />*/}
                      <Card.Body>
                        <Card.Title>Share same data in multiple dapps</Card.Title>
                        <Card.Text>Every dapp that uses 3Box can request same data you input here.</Card.Text>
                      </Card.Body>
                    </Card>
                    <h4></h4>

                  </Col>
                  <Col sm={4}>
                  <Card>
                    {/*<Card.Img variant="top" src="./imgs/ipfs.png" />*/}
                    <Card.Body>
                      <Card.Title>Receive jobs offers</Card.Title>
                      <Card.Text>Talk directly with employers with no middleman! No fees to use it for both parties!</Card.Text>
                    </Card.Body>
                  </Card>

                  </Col>
                </Row>
              </Card.Body>
              </Card>
              <hr/>
              <Card>
              <Card.Header as="h3">Informations</Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={6}>
                    <Card>
                      {/*<Card.Img variant="top" src="./imgs/ipfs.png" />*/}
                      <Card.Body>
                        <Card.Title>How to use it?</Card.Title>
                        <Card.Text>Step by step on how to use DecentralizedPortfolio</Card.Text>
                        <Button variant="primary" onClick={this.tutorialPage}>Tutorial</Button>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/*<Col sm={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Roadmap</Card.Title>
                      <Card.Text>What will be the future of that dapp?</Card.Text>
                      <Button variant="primary">Roadmap</Button>
                    </Card.Body>
                  </Card>

                  </Col>*/}
                </Row>
              </Card.Body>
              </Card>
            </Container>
    })
    return
  }

  editProfilePage = async function() {

    if(!this.state.space){
      await this.openSpace();
    }
    this.setState({
      page: <Profile box={this.state.box} space={this.state.space} coinbase={this.state.coinbase} />
    })
    return
  }
  usersPage = function() {
    const that = this;
    this.setState({
      page: <Users box={this.state.box} coinbase={this.state.coinbase} />
    })
    return
  }

  portfolioPage = async function(){
    if(!this.state.space){
      await this.openSpace();
    }
    console.log(this.state.profile);
    this.setState({
      page: <Portfolio
                  web3 = {this.state.web3}
                  coinbase = {this.state.coinbase}
                  box = {this.state.box}
                  space = {this.state.space}
                  profile = {this.state.profile}
            />
    })
    return
  }
  offersPage = async function() {
    if(!this.state.coinbase){
      this.setState({
        page:   <ThreeBoxComments
                 // required
                 spaceName={AppName}
                 threadName={"job_offers"}
                 adminEthAddr={admin}


                 // Required props for context A) & B)
                 //box={this.state.box}
                 //currentUserAddr={this.state.coinbase}

                 // Required prop for context B)
                 //loginFunction={handleLogin}

                 // Required prop for context C)
                 ethereum={null}

                 // optional
                 members={false}
             />
      });
      return;
    }
    await this.state.box.syncDone;
    this.setState({
      page:
                        <ThreeBoxComments
                             // required
                             spaceName={AppName}
                             threadName={"job_offers"}
                             adminEthAddr={admin}


                             // Required props for context A) & B)
                             box={this.state.box}
                             currentUserAddr={this.state.coinbase}

                             // Required prop for context B)
                             //loginFunction={handleLogin}

                             // Required prop for context C)
                             //ethereum={ethereum}

                             // optional
                             members={false}
                         />

    });
    return
  }
  tutorialPage = async() =>{
    this.setState({
      page:      <Card>
                  <Card.Header as="h3">Tutorial</Card.Header>
                  <Card.Body>
                    <Card.Title>How to use this dapp?</Card.Title>
                    <Card.Text>
                    <ol>
                      <li>Install <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a></li>
                      <li>
                        Create your ethereum wallet (or import existing one) <br/>
                        <img src={require('./imgs/brave_Crypto0.png')} style={{maxWidth:' 60%'}}/> <br/>
                        <img src={require('./imgs/brave_Crypto1.png')} style={{maxWidth:' 60%'}}/> <br/>
                        <img src={require('./imgs/brave_Crypto2.png')} style={{maxWidth:' 60%'}}/>
                      </li>
                      <li>
                        Accept wallet connection, 3box login/sign up and open DecentralizedPortfolio space <br/>
                        <img src={require('./imgs/brave_3box.png')} style={{maxWidth:' 60%'}}/> <br/>
                      </li>
                      {/*<li>
                        Fill your profile <br/>
                        <img src={require('./imgs/brave_3boxProfiles.png')} style={{maxWidth:' 60%'}}/> <br/>
                      </li>*/}

                    </ol>

                     </Card.Text>
                    <Button variant='primary' onClick={this.homePage}>HomePage</Button>
                  </Card.Body>
                 </Card>
    })
    return
  }
  loginPageNoWeb3 = function(){
    this.setState({
      page: <p>Use <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a></p>
    });
    return
  }

  openSpace = async function(){
    const coinbase = this.state.coinbase;
    const box = this.state.box;

    ReactDOM.render(
      <p>Aprove access to open your Decentralized Portfolio Space</p>,
      document.getElementById("loading_status")
    );
    $("#alert_info").show();
    const space = await box.openSpace(AppName);
    await space.syncDone;
    ReactDOM.render(
      <p>Opening your profile</p>,
      document.getElementById("loading_status")
    );
    await space.public.set('address',coinbase);
    const profile = await space.public.all();
    const registered = await space.private.get('registered');
    console.log(profile)
    if(!registered){
      const thread = await space.joinThread(usersRegistered,{firstModerator:admin});
      const postId = await thread.post(profile);
      await space.private.set('registered',true);
      await space.private.set('reg_postId',postId)
    }

    this.setState({
      profile: profile,
      space: space
    });
    $("#alert_info").hide();
    return;
  }
  render() {

    if (!this.state.hasWeb3) {
      return (
        <div>
          <Container className="themed-container" fluid={true}>
          <Navbar bg="primary" variant="dark">
            <Navbar.Brand href="#home">Decentralized Portfolio</Navbar.Brand>
            <Navbar.Toggle />
            <Nav className="mr-auto">
              <Nav.Link href="#home" onClick={this.homePage}>Home</Nav.Link>
              <Nav.Link href="#users" onClick={this.usersPage}>Users</Nav.Link>
              <Nav.Link href="#job_offers" onClick={this.offersPage}>Jobs Offers</Nav.Link>
              <Nav.Link href="#login" onClick={this.loginPageNoWeb3}>Login</Nav.Link>
            </Nav>
          </Navbar>
          <Container>
          {
            this.state.page
          }
          </Container>
          {
            this.state.footer
          }
          </Container>

        </div>
      );
    }
    if((!this.state.doingLogin) && (this.state.hasWeb3) && (!this.state.coinbase)){
      return (
        <div>
          <Container className="themed-container" fluid={true}>
            <Navbar bg="primary" variant="dark">
              <Navbar.Brand href="#home">Decentralized Portfolio</Navbar.Brand>
              <Navbar.Toggle />
              <Nav className="mr-auto">
                <Nav.Link href="#home" onClick={this.homePage}>Home</Nav.Link>
                <Nav.Link href="#users" onClick={this.usersPage}>Users</Nav.Link>
                <Nav.Link href="#job_offers" onClick={this.offersPage}>Jobs Offers</Nav.Link>
                <Nav.Link href="#login" onClick={this.login}>Login</Nav.Link>
              </Nav>
            </Navbar>
            <Container>
            {
              this.state.page
            }
            </Container>
            {
              this.state.footer
            }
          </Container>

        </div>
      );
    }
    if(this.state.doingLogin){

      return(
        <div>
          <Container className="themed-container" fluid={true}>
            <Navbar bg="primary" variant="dark">
              <Navbar.Brand href="#home">Decentralized Portfolio</Navbar.Brand>
              <Navbar.Toggle />
            </Navbar>
            <Alert variant="info" style={{textAlign: "center"}}>
              <h4>Loading dapp ...</h4>
              <div id="loading_status"></div>
              <div><i className="fas fa-sync-alt fa-spin fa-2x"></i></div>
            </Alert>
            <Container>
            {
              this.state.page
            }
            </Container>
            {
              this.state.footer
            }
          </Container>

        </div>
      );
    }

    return (
      <div>
        <Container className="themed-container" fluid={true}>
          <Navbar bg="primary" variant="dark">
            <Navbar.Brand href="#home">Decentralized Portfolio</Navbar.Brand>
            <Navbar.Toggle />
            <Nav className="mr-auto">
              <Nav.Link href="#home" onClick={this.homePage}>Home</Nav.Link>
              <Nav.Link href="#profile" onClick={this.editProfilePage}>Profile</Nav.Link>
              <Nav.Link href="#portfolio" onClick={this.portfolioPage}>Portfolio</Nav.Link>
              <Nav.Link href="#users" onClick={this.usersPage}>Users</Nav.Link>
              <Nav.Link href="#job_offers" onClick={this.offersPage}>Jobs Offers</Nav.Link>
              <Nav.Link href="#logout" onClick={this.logout}>Logout</Nav.Link>
            </Nav>
          </Navbar>
          <Alert variant="info" style={{textAlign: "center",display:"none"}} id='alert_info'>
            <h4>Loading dapp ...</h4>
            <div id="loading_status"></div>
            <div><i className="fas fa-sync-alt fa-spin fa-2x"></i></div>
          </Alert>
          <Container>
          {
            this.state.page
          }
          </Container>
          {
            this.state.footer
          }
          <div style={{height: '10px'}}>
            <ChatBox
                // required
                spaceName={AppName}
                threadName="public_chat"


                // Required props for context A) & B)
                box={this.state.box}
                currentUserAddr={this.state.coinbase}
                // optional
                popupChat
                showEmoji
            />
          </div>
        </Container>

      </div>
    );

  }
}

export default App;
