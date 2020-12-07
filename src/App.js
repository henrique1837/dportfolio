import React,{Component} from 'react';
import Web3 from "web3";
import {
  Button,
  Container,
  Row,
  Col,
  UncontrolledAlert,
  Alert,
  Spinner
} from 'reactstrap';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import ChatBox from '3box-chatbox-react';

import Home from './components/Home.js';
import Menu from './components/Menu.js';
import CommentBox from './components/CommentBox.js'
import Footer from './components/Footers/AdminFooter.js'
import Profile from './components/Profile.js';
import Portfolio from './components/Portfolio.js';
import Users from './components/Users.js';
import UserPage from './components/UserPage.js';
import Jobs from './components/Jobs.js';
import "./assets/plugins/nucleo/css/nucleo.css";
import "./assets/plugins/fontawesome/css/all.css";
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
    super(props);

    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);


    this.openSpace = this.openSpace.bind(this);

  }
  componentDidMount = async () => {

    if(window.ethereum){
      await this.setState({
        hasWeb3:true
      })
      // await this.login();

    }

  };



  login = async function(){
    try {
      this.setState({
        loginError: null
      })
      if(!(await window.ethereum._metamask.isUnlocked())){
        this.setState({
          doingLogin: false,
          loading_status: <div>
                            <h2 style={{color: 'white'}}>Unblock your wallet</h2>
                            <p>Please unblock your wallet first</p>
                          </div>
        });
        return;
      }
      this.setState({
        doingLogin: true,
        loading_status: <div>
                          <h2 style={{color: 'white'}}>Loading dapp ...</h2>
                          <Spinner color="secondary" />
                          <p>Connect metamask</p>
                        </div>
      })
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const web3 = new Web3(window.ethereum);
      // Use web3 to get the user's coinbase.
      const coinbase = await web3.eth.getCoinbase();
      console.log(coinbase);
      this.setState({
        loading_status: <div>
                          <h2 style={{color: 'white'}}>Loading dapp ...</h2>
                          <Spinner color="secondary" />
                          <p>Aprove access to your 3Box account</p>
                        </div>
      })
      const box = await Box.create()
      await this.setState({
        web3:web3,
        coinbase:coinbase,
        box: box
      });
      await this.openSpace(box);

    } catch (err) {
      if (err.code === 4001) {
      // EIP-1193 userRejectedRequest error
      // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
        this.setState({
          doingLogin: false,
          loginError: <div>
                            <h2 style={{color: 'white'}}>Error</h2>
                            <p>Please connect to MetaMask.</p>
                      </div>
        });
      } else {
        console.error(err);
        this.setState({
          doingLogin: false,
          loginError: <div>
                            <h2 style={{color: 'white'}}>Error</h2>
                            <p>{err.message}</p>
                            <p>Please reload page and try again</p>
                      </div>
        });
      }
      // Catch any errors for any of the above operations.
      this.setState({
        loading_status: null,
        web3:null,
        coinbase:null,
        box: null,
        profile: null,
        space: null
      });
      console.error(err);
    }
  }
  logout = async function(){
    await this.state.box.logout();
    this.setState({
      coinbase: null,
      box: null,
      space: null
    })
    return
  };




  openSpace = async function(box){

    const spaces = [AppName];
    console.log("Auth")
    this.setState({
      loading_status: <div>
                        <h2 style={{color: 'white'}}>Loading dapp ...</h2>
                        <Spinner color="secondary" />
                        <p>Opening your Decentralized Portfolio Space</p>
                      </div>
    })
    await box.auth(spaces, { address: this.state.coinbase, provider: window.ethereum });
    console.log("Sync box")
    await box.syncDone;
    console.log("Open space")
    const space = await box.openSpace(AppName);
    console.log("Sync space")
    await space.syncDone;
    console.log("Get profile")
    if(window.ethereum.isStatus) {
      // we are running in Status
      let code = await space.public.get('status');
      if(!code){
        code = await window.ethereum.status.getContactCode();
        await space.public.set('status',code);
      }
    }
    const profile = await space.public.all();
    this.setState({
      profile: profile,
      space: space,
      doingLogin: false,
      loading_status: null
    });
    return;
  }


  render() {


    return (
      <div>
        <Router>

          {
            (
              this.state.doingLogin &&
               (
                <Menu box={null}
                      space={null}
                      doingLogin={this.state.doingLogin} />
               )

            )
          }
          {
            (
              !this.state.doingLogin &&
              (
                <Menu box={this.state.box}
                      space={this.state.space}
                      doingLogin={this.state.doingLogin}
                      login={this.login} />
              )
            )

          }
          <div className="themed-container" fluid={true}>
            {
              (this.state.loading_status &&
                (
                  <Container className="themed-container" fluid={false}>
                          <Alert color="info" style={{textAlign: "center",
                                                marginTop:'20px'}}>
                              {this.state.loading_status}
                          </Alert>
                  </Container>
                )
              )
             }

             {
               (this.state.loginError &&
                 (
                   <Container className="themed-container" fluid={false} >
                           <UncontrolledAlert color="danger" style={{textAlign: "center",
                                                                     marginTop:'20px'}} >
                               {this.state.loginError}
                           </UncontrolledAlert>
                   </Container>
                 )
               )
              }

            <Switch>
                  <Route path={"/home"} component={Home} />

                  <Route path={"/profile"} render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      )
                    }
                    return(
                      <Container fluid={false}>
                        <Profile web3={this.state.web3}
                                 box={this.state.box}
                                 space={this.state.space}
                                 coinbase={this.state.coinbase} />
                      </Container>
                    )
                  }} />

                  <Route path={"/portfolio"} render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      )
                    }
                    return(
                      <Container fluid={false}>
                        <Portfolio
                                   web3 = {this.state.web3}
                                   coinbase = {this.state.coinbase}
                                   box = {this.state.box}
                                   space = {this.state.space}
                             />
                      </Container>

                    )
                  }} />

                  <Route path={"/users"} render={() => {

                    return(
                      <Container fluid={false}>
                        <Users box={this.state.box} space={this.state.space} coinbase={this.state.coinbase} />
                      </Container>
                    )
                    }} />

                  <Route path={"/user/:addr"} render={(props) => {

                      if(!this.state.space){
                        return(
                          <Container fluid={false}>
                            <UserPage {...props} />
                          </Container>
                        )
                      }
                      return(
                        <Container fluid={false}>
                          <UserPage box={this.state.box}
                                    space={this.state.space}
                                    coinbase={this.state.coinbase}
                                    {...props} />
                        </Container>
                      )
                  }} />

                  <Route path={"/jobs"} render={() => {
                    if(!this.state.space){
                      return(
                        <Container fluid={false}>
                          <Jobs/>
                        </Container>
                      )
                    }

                    return(
                        <Container fluid={false}>
                          <Jobs box={this.state.box} coinbase={this.state.coinbase} space={this.state.space} />
                        </Container>
                    )
                  }} />
                  <Route path={"/comments"} render={() => {
                    if(!this.state.space){
                      return(
                        <Container fluid={false}>
                           <CommentBox
                                   space={this.state.space}
                                   threadName={"comments"}
                           />


                         </Container>
                      );
                    }

                    return(
                      <Container fluid={false}>
                         <CommentBox
                                 coinbase={this.state.coinbase}
                                 space={this.state.space}
                                 threadName={"comments"}
                         />
                       </Container>

                    );
                  }} />
                  <Route path={"/loginNoWeb3"} render={() => {
                    if(window.ethereum){
                      return(
                        <Redirect to={"/login"} />
                      );
                    }
                    return(
                      <Container fluid={false}>
                        <center style={{paddingTop: '50px',paddingBottom:'50px'}}>
                           <p>Use <a href="https://metamask.io/" target="_blank">Metamask</a> (PC and Mobile) , <a href="https://alphawallet.com/" target="_blank">Alpha Wallet</a> (Mobile) or <a href="https://status.im/" target="_blank">Status</a> (Mobile)</p>
                        </center>
                      </Container>
                    )
                  }} />
                  <Route path={"/login"} render={() => {
                    if(this.state.space){
                      return(
                        <Redirect to={"/profile"} />
                      );
                    }
                    if(!this.state.hasWeb3){
                      return(
                        <Redirect to={"/loginNoWeb3"} />
                      );
                    }

                    return(
                      <Container fluid={false}>
                        {
                          (
                            !this.state.doingLogin &&
                            (
                              <Row style={{paddingTop: '50px'}}>
                                  <Col lg={3}>
                                    <Button variant="primary" onClick={this.login}>Login with injected web3</Button>
                                  </Col>
                              </Row>
                            )
                          )
                        }
                      </Container>
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

          </div>
        </Router>
        {

        (
          this.state.space &&
          (
            <ChatBox
                // required
                spaceName={AppName}
                threadName="chat"


                // Required props for context A) & B)
                box={this.state.box}
                currentUserAddr={this.state.coinbase}

                // optional
                userProfileURL={address => `#/user/${address}`}
                mute={false}
                popupChat
            />
          )
        )

        }
        <Container fluid={false}>
          <Footer style={{maeginTop: '20px'}}/>
        </Container>
      </div>
    );


  }
}

export default App;
