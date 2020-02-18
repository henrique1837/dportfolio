import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar,Card,Modal} from 'react-bootstrap';
//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import "./App.css";
const Box = require('3box');
const AppName = 'DecentralizedPortifolio';
const usersRegistered = 'users_registered';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";

class UserPage extends Component {

  constructor(props){
    super(props);

  }

  render() {
    const profile = this.props.profile;
    const itens = this.props.itens;
    console.log("job_offers_"+profile.address)
    return(
      <div>
             <Tabs defaultActiveKey="portifolio">
               <Tab eventKey="portifolio" title="Portifolio" style={{paddingTop:'10px'}}>
                 <h5>{profile.name} portifolio</h5>
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
               </Tab>
               {/*<Tab eventKey="chat" title="Chat" style={{paddingTop:'10px'}}>



                                   <ChatBox
                                       // required
                                       spaceName={AppName}
                                       threadName={"chat_"+this.props.coinbase+"_"+profile.address}


                                       // Required props for context A) & B)
                                       box={this.props.box}
                                       currentUserAddr={this.props.coinbase}

                                       // optional
                                       threadOpts={
                                         {
                                           firstModerator:this.props.coinbase,
                                           members: [profile.address]
                                         }
                                       }

                                   />
               </Tab>*/}
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
}

class Users extends Component {
  state = {
    users: [],
    itens: {},
    box: null,
    coinbase: null,
    page: <div></div>
  }

  constructor(props){
    super(props);
    this.renderUserPage = this.renderUserPage.bind(this);
  }

  componentDidMount = async () => {
    console.log(this.props)
    const posts = await Box.getThread(AppName, usersRegistered, admin, false)
    console.log(posts)
    //const added = {}

    for(const post of posts){
        const profile = post.message;
        this.state.users.push(profile);
        this.forceUpdate();
    }
  };



  renderUserPage = async(profile) => {
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
      console.log(profile)
      if(this.props.coinbase){
        this.setState({
          page: <UserPage box={this.props.box} coinbase={this.props.coinbase} profile={profile} itens={itens}/>
        })

      } else {

        this.setState({
          page: <div>
                  <h5>{profile.name} portifolio</h5>
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
        })
      }

    }


    return
  };

  render(){
    const that = this;
    return(
      <div>
        <h4>Users</h4>
        <Row>
          <Col lg={4}>
        {
          this.state.users.map(function(profile){
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
                      <p><small>Decentralized portifolio profile</small></p>
                      <p>Name: {profile.name}</p>
                      <p>Description: {profile.description}</p>
                      <Button variant="primary" href={"#user_"+profile.address} onClick={()=>{ that.renderUserPage(profile) }}>Portifolio</Button>
                      </Col>

                    </Row>
                    <hr/>
                </div>
            )
          })
        }
          </Col>
          <Col lg={8}>


            {this.state.page}

          </Col>
        </Row>


      </div>
    )
  }
}


class Portifolio extends Component {
  state = {
    web3: null,
    coinbase:null,
    box:null,
    profile: null,
    space: null,
    fields:[{ // for a field with a textarea input
              inputType: 'textarea',
              key: 'portifolio',
              field: 'Portifolio'
            }],
    itens: []
  }

  constructor(props){
    super(props);
    this.addItem = this.addItem.bind(this);
    this.refreshItems = this.refreshItems.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  componentWillMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = this.props.web3;

      // Use web3 to get the user's coinbase.
      const coinbase = this.props.coinbase
      const box = this.props.box;
      const space = this.props.space;

      const profile = this.props.profile;

      console.log(profile);
      this.setState({
        web3: web3,
        space: space,
        coinbase: coinbase,
        box: box,
        profile: profile
      });

    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
    }

  };
  componentDidMount = () => {
    this.refreshItems();
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

    this.state.itens = [];
    this.forceUpdate();

    for(const item of Object.values(this.state.profile)){
      if((item.uri) &&
          !this.state.itens.includes(item)){

          this.state.itens.push(item)
          this.forceUpdate();
      }

    }
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
    this.profileSaved = this.profileSaved.bind(this);
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.editProfilePage = this.editProfilePage.bind(this);

    this.usersPage = this.usersPage.bind(this);
    this.homePage = this.homePage.bind(this);
    this.portifolioPage= this.portifolioPage.bind(this);
    this.loginPageNoWeb3 = this.loginPageNoWeb3.bind(this);
    this.offersPage = this.offersPage.bind(this);
    this.tutorialPage = this.tutorialPage.bind(this);

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
  profileSaved = async function() {
    await this.state.space.syncDone
    const profile = await this.state.space.public.all();
    const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
    const oldPostId = await this.state.space.private.get('reg_postId');
    const postId = await thread.post(profile);
    await this.state.space.private.set('reg_postId',postId);
    await thread.deletePost(oldPostId);
    this.setState({
      profile: profile
    })
    alert("saved");
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
      ReactDOM.render(
        <p>Aprove access to open your Decentralized Portifolio Space</p>,
        document.getElementById("loading_status")
      );
      const space = await box.openSpace(AppName);
      ReactDOM.render(
        <p>Syncing your profile</p>,
        document.getElementById("loading_status")
      );
      await space.syncDone;
      ReactDOM.render(
        <p>Opening your profile</p>,
        document.getElementById("loading_status")
      );
      await space.public.set('address',coinbase);
      const profile = await space.public.all();
      const registered = await space.private.get('registered');
      if(!registered){
        const thread = await space.joinThread(usersRegistered,{firstModerator:admin});
        const postId = await thread.post(profile);
        await space.private.set('registered',true);
        await space.private.set('reg_postId',postId)
      }
      this.setState({
        web3:web3,
        coinbase:coinbase,
        box: box,
        space:space,
        profile: profile,
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
  };
  homePage = function() {
    this.setState({
      page:  <Container>

              <Card>
              <Card.Header as="h3">Welcome to decentralized portifolio</Card.Header>
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
                      <Card.Text>Talk directly with empoloyes with no middleman! No fees to use it for both parties!</Card.Text>
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
                        <Card.Text>Step by step on how to use DecentralizedPortifolio</Card.Text>
                        <Button variant="primary" onClick={this.tutorialPage}>Go somewhere</Button>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col sm={6}>
                  <Card>
                    {/*<Card.Img variant="top" src="./imgs/ipfs.png" />*/}
                    <Card.Body>
                      <Card.Title>Roadmap</Card.Title>
                      <Card.Text>What will be the future of that dapp?</Card.Text>
                      <Button variant="primary">Go somewhere</Button>
                    </Card.Body>
                  </Card>

                  </Col>
                </Row>
              </Card.Body>
              </Card>
            </Container>
    })
    return
  }

  editProfilePage = function() {
    this.setState({
      page:<EditProfile
                // required
                box={this.state.box}
                space={this.state.space}
                currentUserAddr={this.state.coinbase}

                // optional
                //customFields={this.state.fields}
                redirectFn={this.profileSaved}
            />
    })
    return
  }
  usersPage = function() {
    this.setState({
      page: <Container>
              <Row>
                <Col sm={12}>
                  <Users
                    space={this.state.space}
                    box={this.state.box}
                    coinbase={this.state.coinbase}
                  />
                </Col>
              </Row>
            </Container>
    })
    return
  }
  portifolioPage = function(){
    this.setState({
      page: <Portifolio
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
    await this.state.space.syncDone;
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
                    <Card.Title>What is a dapp?</Card.Title>
                    <Card.Text>Decentralized applications</Card.Text>
                    <Card.Title>How to use this dapp?</Card.Title>
                    <Card.Text>Decentralized applications</Card.Text>
                    <Card.Title>Brave Browser</Card.Title>
                    <Card.Text>Secure,private, earn rewards, cryptowallet</Card.Text>
                    <Card.Title>We do not hold you data</Card.Title>
                    <Card.Text>Awesome!</Card.Text>
                    <Button variant='primary' onClick={this.homePage}>HomePage</Button>
                  </Card.Body>
                 </Card>
    })
    return
  }
  loginPageNoWeb3 = function(){
    this.setState({
      page: <p>Use metamask or brave browser</p>
    });
    return
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
              <Nav.Link href="#portifolio" onClick={this.portifolioPage}>Portifolio</Nav.Link>
              <Nav.Link href="#users" onClick={this.usersPage}>Users</Nav.Link>
              <Nav.Link href="#job_offers" onClick={this.offersPage}>Jobs Offers</Nav.Link>
              <Nav.Link href="#logout" onClick={this.logout}>Logout</Nav.Link>
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
