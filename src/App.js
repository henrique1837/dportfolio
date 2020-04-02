import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import Authereum from 'authereum'
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner} from 'react-bootstrap';
import {
  HashRouter as Router,
  Link,
  Route,
  Switch,
  Redirect,
  withRouter
} from 'react-router-dom';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';

import Home from './components/Home.js';
import Menu from './components/Menu.js';
import Profile from './components/Profile.js';
import Portfolio from './components/Portfolio.js';
import Users from './components/Users.js';
import UserPage from './components/UserPage.js';
import Jobs from './components/Jobs.js';
import "./assets/scss/argon-dashboard-react.scss";
import "./App.css";

const Box = require('3box');
const Config = require('./config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin


class App extends Component {
  state = {
    hasWeb3:false,
    web3: null,
    coinbase: null,
    box: null,
    space: null,
    doingLogin:false
   };
  constructor(props){
    super(props)

    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);


    this.openSpace = this.openSpace.bind(this);


    this.setRedirect = this.setRedirect.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
    this.chatBox = this.chatBox.bind(this);
  }
  componentDidMount = async () => {

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
      let web3;
      if(window.ethereum){
        await window.ethereum.enable();
        web3 = new Web3(window.ethereum);
      } else {
        const authereum = new Authereum('mainnet');
        const provider = await authereum.getProvider()
        web3 = new Web3(provider);
        await provider.enable()
      }

      this.setState({
        doingLogin: true
      });

      // Use web3 to get the user's coinbase.
      const coinbase = await web3.eth.getCoinbase();
      console.log(coinbase);
      ReactDOM.render(
        <div>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Aprove access to your 3Box account</p>
        </div>,
        document.getElementById("loading_status")
      );
      const box = await Box.openBox(coinbase,window.ethereum);
      //const space = await box.openSpace(AppName);
      ReactDOM.render(
        <div>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Syncing your profile</p>
        </div>,
        document.getElementById("loading_status")
      );
      await box.syncDone;

      this.setState({
        web3:web3,
        coinbase:coinbase,
        box: box
      });
      await this.openSpace();
    } catch (error) {
      // Catch any errors for any of the above operations.

      this.setState({
        doingLogin: false
      });
      console.error(error);
    }
  }
  logout = function(){
    this.setState({
      coinbase: null,
      box: null,
      space: null
    })
    return
  };


  loginPageNoWeb3 = function(){
    this.setState({
      page: <div>
               <p>Use <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a> or login with <a href="#auth_login" onClick={this.login}>authereum</a></p>
            </div>
    });
    return
  }

  openSpace = async function(){
    const coinbase = this.state.coinbase;
    const box = this.state.box;

    ReactDOM.render(
      <div>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
      <p>Aprove access to open your Decentralized Portfolio Space</p>
      </div>,
      document.getElementById("loading_status")
    );
    $("#alert_info").show();
    const space = await box.openSpace(AppName);

    ReactDOM.render(
      <div>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
      <p>Opening your profile</p>
      </div>,
      document.getElementById("loading_status")
    );
    await space.syncDone;
    const profile = await space.public.all();
    console.log(profile)
    const thread = await space.joinThread(usersRegistered,{firstModerator:admin,members: false});
    console.log(thread)
    let oldPostId = await space.private.get('registration');
    console.log(oldPostId)
    if(oldPostId){
      await thread.deletePost(oldPostId);
    } else {
      await space.public.set('address',coinbase);
    }
    const postId = await thread.post(profile);
    console.log(postId)
    await space.private.set('registration',postId);

    $("#alert_info").hide();
    this.setRedirect();
    this.setState({
      profile: profile,
      space: space,
      doingLogin: false
    });
    return;
  }


  setRedirect = () => {
    this.setState({
      redirect: true
    })
  }
  renderRedirect = () => {
    if (this.state.redirect) {
      return(
        <Redirect to={'/home'} />
      );
    }
  }
  chatBox = function(){
    if(!this.state.space){
      return
    }
    return(
      <ChatBox
          // required
          spaceName={AppName}
          threadName="chat"


          // Required props for context A) & B)
          box={this.state.box}
          currentUserAddr={this.state.coinbase}

          // optional
          mute={false}
          popupChat
      />
    )
  }
  render() {
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
          </Container>
          <footer style={{marginTop: '20px'}}>
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
        </div>
      );
    }

    return (
      <div>
        <Router>
          {this.renderRedirect()}
          <Menu box={this.state.box}
                space={this.state.space}
                hasWeb3={this.state.hasWeb3}
                doingLogin={this.state.doingLogin} />

          <Container className="themed-container" fluid={true}>

           <Alert variant="default" style={{textAlign: "center",display:"none"}} id='alert_info'>
                <h4>Loading dapp ...</h4>
                <div id="loading_status"></div>
            </Alert>

            <Switch>
                  <Route path={"/home"} component={Home} />
                  <Route path={"/profile"} render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      )
                    }
                    return(
                      <Profile box={this.state.box} space={this.state.space} coinbase={this.state.coinbase} />
                    )
                  }} />
                  <Route path={"/portfolio"} render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      )
                    }
                    return(
                      <Portfolio
                                 web3 = {this.state.web3}
                                 coinbase = {this.state.coinbase}
                                 box = {this.state.box}
                                 space = {this.state.space}
                                 profile = {this.state.profile}
                           />
                    )
                  }} />
                  <Route path={"/users"} render={() => {

                    return(
                      <Users box={this.state.box} space={this.state.space} coinbase={this.state.coinbase} />
                    )
                    }} />
                  <Route path={"/user/:addr"} render={(props) => {

                      return(
                        <UserPage box={this.state.box}
                                  coinbase={this.state.coinbase}
                                  {...props} />
                      )
                  }} />
                  <Route path={"/jobs"} render={() => {
                    if(!this.state.coinbase ){
                      return(
                        <Jobs/>
                      )
                    }
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      )
                    }
                    return(
                        <Jobs box={this.state.box} coinbase={this.state.coinbase} space={this.state.space} />
                    )
                  }} />
                  <Route path={"/comments"} render={() => {
                    if(!this.state.coinbase){
                      return(
                        <div>
                           <h4>Comments</h4>
                           <p>Feedbacks or suggestion for nexts versions of this dapp</p>
                           <hr/>
                           <ThreeBoxComments
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


                         </div>
                      );
                    }
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      );
                    }

                    return(
                      <div>
                         <h4>Comments</h4>
                         <p>Use this space to give feedback or suggestion for nexts versions of this dapp</p>
                         <hr/>
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
                       </div>

                    );
                  }} />
                  <Route path={"/loginNoWeb3"} render={() => {
                    return(
                      <center style={{paddingTop: '50px'}}>
                         <p>Use <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a> or login with <a href="#auth_login" onClick={this.login}>authereum</a></p>
                      </center>
                    )
                  }} />
                  <Route path={"/login"} render={() => {
                    if(!this.state.hasWeb3){
                      return(
                        <Redirect to={"/loginNoWeb3"} />
                      );
                    }

                    return(
                      <Row style={{paddingTop: '50px'}}>
                          <Col lg={3}>
                            <Button variant="primary" onClick={this.login}>Login with injected web3</Button>
                          </Col>
                      </Row>
                    )
                  }} />
                  <Route path={"/logout"} render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      );
                    }
                    return(
                      this.logout()
                    );
                  }}/>

                  <Route render={() => {
                    return(
                      <Redirect to={"/home"} />
                    );
                  }} />
            </Switch>

          </Container>
        </Router>
        {
          this.chatBox()
        }
        <footer style={{marginTop: '50px'}}>
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
      </div>
    );


  }
}

export default App;
