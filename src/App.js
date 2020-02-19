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

import Profile from './components/Profile.js';
import Portfolio from './components/Portfolio.js';
import Users from './components/Users.js';
import "./App.css";
import "./assets/scss/argon-dashboard-react.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Box = require('3box');
const AppName = 'DecentralizedPortfolio_test2';
const usersRegistered = 'users_registered';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";



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

    ReactDOM.render(
      <p>Opening your profile</p>,
      document.getElementById("loading_status")
    );
    await space.public.set('address',coinbase);
    await space.syncDone;
    const profile = await space.public.all();
    console.log(profile)
    const thread = await space.joinThread(usersRegistered,{firstModerator:admin});
    const postId = await thread.post(profile);

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
          <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
            <Navbar.Brand href="#home" onClick={this.homePage}>Decentralized Portfolio</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link href="#home" onClick={this.homePage}>Home</Nav.Link>
                <Nav.Link href="#users" onClick={this.usersPage}>Users</Nav.Link>
                <Nav.Link href="#job_offers" onClick={this.offersPage}>Jobs Offers</Nav.Link>
                <Nav.Link href="#login" onClick={this.loginPageNoWeb3}>Login</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Container className="themed-container" fluid={true}>

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
          <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
            <Navbar.Brand href="#home" onClick={this.homePage}>Decentralized Portfolio</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link href="#home" onClick={this.homePage}>Home</Nav.Link>
                <Nav.Link href="#users" onClick={this.usersPage}>Users</Nav.Link>
                <Nav.Link href="#job_offers" onClick={this.offersPage}>Jobs Offers</Nav.Link>
                <Nav.Link href="#login" onClick={this.login}>Login</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Container className="themed-container" fluid={true}>

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
          <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark" >
            <Navbar.Brand href="#home">Decentralized Portfolio</Navbar.Brand>
            <Navbar.Toggle />
          </Navbar>
          <Container className="themed-container" fluid={true}>

            <Alert variant="default" style={{textAlign: "center"}}>
              <h4>Loading dapp ...</h4>
              <div id="loading_status"></div>

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
        <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
          <Navbar.Brand href="#home" onClick={this.homePage}>Decentralized Portfolio</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#home" onClick={this.homePage}>Home</Nav.Link>
              <Nav.Link href="#profile" onClick={this.editProfilePage}>Profile</Nav.Link>
              <Nav.Link href="#portfolio" onClick={this.portfolioPage}>Portfolio</Nav.Link>
              <Nav.Link href="#users" onClick={this.usersPage}>Users</Nav.Link>
              <Nav.Link href="#job_offers" onClick={this.offersPage}>Jobs Offers</Nav.Link>
              <Nav.Link href="#logout" onClick={this.logout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Container className="themed-container" fluid={true}>

          <Alert variant="default" style={{textAlign: "center",display:"none"}} id='alert_info'>
            <h4>Loading dapp ...</h4>
            <div id="loading_status"></div>

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
