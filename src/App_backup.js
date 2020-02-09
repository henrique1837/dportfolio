import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';
import LociiRecordsArtifact from './contracts/LociiRecords.json';
//import getWeb3 from './components/getWeb3.js';
import Web3 from 'web3';
import contracts from './components/contractsHelper.js';
import encryptHelper from './components/encryptHelper.js';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar} from 'react-bootstrap';

//const API_URL = "https://d8vp9cqre2.execute-api.ap-southeast-2.amazonaws.com/v2";
const API_URL = "http://localhost:3000";
//const API_URL = "https://d8vp9cqre2.execute-api.ap-southeast-2.amazonaws.com/v2"
//const web3 = new Web3('wss://goerli.infura.io/ws/v3/946ef1ac897f4ad6a6a6cb426595d3a0');

const web3 = new Web3('wss://locii.blockchain.azure.com:3300/SqK-CF4dc48Dc5WrIIhsFwof');
//const web3 = new Web3('ws://localhost:8545');
const CHAIN_ID = "*"




class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: this.props.wallet,
      title: "Data consent POC"
    };

  }
  render(){
    if(!this.state.wallet){
      return(
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">{this.state.title}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#CreateWallet">Create Wallet</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      );
    }
    return(
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">{this.state.title}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#AddRecord">Add Record</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

async function storeData(records){
  var result = await $.post(API_URL+'/records',JSON.stringify({
                         records: records
                      }));
  var result = result.data
  return(result);
}

class RecordsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: this.props.web3,
      wallet: this.props.wallet,
      contracts: this.props.contracts,
      keys: this.props.keys
    };
    this.addRecord = this.addRecord.bind(this);

  }

  componentDidMount = function(){
    const LociiRecordsArtifact = this.state.contracts.LociiRecordsArtifact
    this.state.contracts.lociiRecordsFactory.events.RecordCreated({
       filter:{
         owner:this.state.wallet.address
       },
       fromBlock: 0,
       toBlock: 'latest'
     },async function(err,event){
       console.log(event)


       const lociiRecord = new web3.eth.Contract(LociiRecordsArtifact.abi, event.returnValues.record);
       const metadata = await lociiRecord.methods.metadata().call();
       const datahash = await lociiRecord.methods.datahash().call();
       $("#div_eventRecords").prepend("<div class='div_event'>"+
                                       "<hr>"+
                                       "<p>Datahash: "+datahash+"</p>"+
                                       "<p>Record address: "+event.returnValues.record+"</p>"+
                                       "<p>Metadata: "+metadata+"</p>"+
                                       "<p>CategoryId: "+event.returnValues.categoryId+"</p>"+
                                       "<p>DatapodId: "+event.returnValues.datapodId+"</p>"+
                                       "<p>Date: "+new Date(Number(event.returnValues.timestamp*1000)).toUTCString()+"</p>"+
                                     "</div>")
     })
  }

  addRecord = async function(){
    try {
      var contents = [
        JSON.stringify({
          name: $("#input_name").val(),
          lastname: $("#input_lastname").val()
        }),
        JSON.stringify({
          birthday: $("#input_birthday").val(),
        }),
        JSON.stringify({
          gender: $("#input_gender :selected").val(),
        }),
        JSON.stringify({
          mobilePrefix: $("#input_mobPrefix").val(),
          mobileNumber: $("#input_mobPrefix").val()
        }),
        JSON.stringify({
          street: $("#input_street").val(),
        }),
        JSON.stringify({
          email: $('#input_email').val()
        }),
        JSON.stringify({
          facebook: $('#input_facebook').val()
        }),
        JSON.stringify({
          driver_license: $('#input_driver').val()
        })
      ];
      var binaries = [{
        fileType: null,
        fileName: null
      },{
        fileType: null,
        fileName: null
      },{
        fileType: null,
        fileName: null
      },{
        fileType: null,
        fileName: null
      },{
        fileType: null,
        fileName: null
      },{
        fileType: null,
        fileName: null
      },{
        fileType: null,
        fileName: null
      },
      JSON.parse($('#file_content').html())];
      var binary = JSON.parse($('#file_content').html());
      var metadata = JSON.stringify({
        categoryId: 1,
        category: "Identity"
      });

      var mts = [{
        categoryId: 1,
        category: "Identity",
        dataset: "Name"
      },{
        categoryId: 1,
        category: "Identity",
        dataset: "Birthday",
        range: null
      },{
        categoryId: 1,
        category: "Identity",
        dataset: "Gender"
      },{
        categoryId: 1,
        category: "Identity",
        dataset: "Mobile"
      },{
        categoryId: 1,
        category: "Identity",
        dataset: "Address",
        country: $("input_country").val(),
        city:  $("input_city").val(),
        postcode: $("input_postcode").val()
      },{
        categoryId: 1,
        category: "Identity",
        dataset: "Email"
      },{
        categoryId: 1,
        category: "Identity",
        dataset: "Social"
      },{
        categoryId: 1,
        category: "Identity",
        dataset: "Driver license"
      }];
      console.log([metadata,mt]);
      //$('#file_content').html("");
      const web3 = this.state.web3;
      const contracts = this.state.contracts;
      const wallet = this.state.wallet;
      const keys = this.state.keys
      const lociiRecordsFactory = contracts.lociiRecordsFactory;
      console.log(content);
      var records = [];
      var txHashes = [];
      ReactDOM.render(
        <Alert variant="info" dismissible>
          <Alert.Heading>Preparing data to be stored</Alert.Heading>
          <p><i className='fa fa-refresh fa-spin'></i></p>
        </Alert>,
        document.getElementById('div_result')
      );
      for(var i=0;i<contents.length;i++){
        var content = contents[i];
        var binary = binaries[i];
        var mt = mts[i];

        var sign = web3.eth.accounts.sign(web3.utils.sha3(content),wallet.privateKey);
        console.log(sign)
        var encryptedContent = await encryptHelper.encrypt_a(keys.publicKey,content);

        console.log(encryptedContent)
        var datahash = web3.utils.sha3(JSON.stringify(content))
        console.log(datahash)

        var datapodId = web3.utils.sha3(JSON.stringify({
          owner: wallet.address,
          category: "Personal data",
          categoryId: 1
        }))
        console.log(datapodId)
        var categoryId = 1;
        console.log(categoryId)

        var gas = await lociiRecordsFactory.methods.createRecord(datahash,
                                                                 metadata,
                                                                 datapodId,
                                                                 categoryId,
                                                                 sign.signature).estimateGas({from:wallet.address});

         var data =  lociiRecordsFactory.methods.createRecord(datahash,
                                                              metadata,
                                                              datapodId,
                                                              categoryId,
                                                              sign.signature).encodeABI();

         var nonce = await web3.eth.getTransactionCount(wallet.address,'pending');
         var gasPrice = await web3.eth.getGasPrice();
         var gasPrice = gasPrice*2;
         var txRaw = {from:wallet.address,
                     to: lociiRecordsFactory.address,
                     value: 0,
                     data: data,
                     chainId:CHAIN_ID,
                     gas:gas,
                     gasPrice: gasPrice,
                     nonce: nonce} ;
        var txSigned = await web3.eth.accounts.signTransaction(txRaw,wallet.privateKey);
        var serializedTx= txSigned.rawTransaction;

        var txHash = new Promise((resolve,reject)=>{
          web3.eth.sendSignedTransaction(serializedTx)
               .once('transactionHash', async function(hash){
                 ReactDOM.render(
                   <Alert variant="success" dismissible>
                     <Alert.Heading>Transaction sent</Alert.Heading>
                     <p>Transaction hash: {hash} <i className='fa fa-refresh fa-spin'></i></p>

                   </Alert>,
                   document.getElementById('div_result'));
               })
               .once('confirmation', async function(confirmationNumber, receipt){
                 var hash = receipt.transactionHash;
                 console.log(hash);
                 const sign = await web3.eth.accounts.sign(hash,wallet.privateKey);
                 resolve({
                   hash:hash,
                   sign: sign
                 });
               })
               .once('error',function(err){
                 ReactDOM.render(
                   <Alert variant="danger" dismissible>
                     <Alert.Heading>Error</Alert.Heading>
                     <p>{err.message}</p>
                   </Alert>,
                   document.getElementById('div_result')
                 );
                 reject(err)
               })
        });
        txHashes.push(txHash);

      }
      var hashes = await Promise.all(txHashes);
      for(var i=0;i<hashes.length;i++){
        var hash_sign = hashes[i];
        var hash = hash_sign.hash;
        var sign = hash_sign.sign;
        records.push({
            content: encryptedContent,
            binary: {
              fileType: binaries[i].fileType,
              fileName: binaries[i].fileName
            },
            metadata: mts[i],
            hash: hash,
            signature: sign.signature
        });
      }
      var result = await storeData(records);
      ReactDOM.render(
        <Alert variant="success" dismissible>
          <Alert.Heading>Data stored</Alert.Heading>
          <p>Datapod api response:</p>
          <div  style={{'overflowX': 'auto'}}> {JSON.stringify(result)}</div>
        </Alert>,
        document.getElementById('div_result')
      );

      for(var i=0;i<result.length;i++){
        console.log(binary)
        if(result[i].stored.record.binary.signedUrl!=null){
          console.log(binary.content)
          var encryptedContentBinary = await encryptHelper.encrypt_a(keys.publicKey,binary.content);
          console.log(encryptedContentBinary)
          console.log(result[i].stored.record.binary.signedUrl);
          await    $.ajax({
                          url : result[i].stored.record.binary.signedUrl,
                          type : "PUT",
                          data : JSON.stringify(encryptedContentBinary),
                          dataType : "text",
                          cache : false,
                          contentType : binary.fileType,
                          processData : false
                      })
        }
      }

      return

    } catch(err){
      ReactDOM.render(
        <Alert variant="danger" dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>{err.message}</p>
        </Alert>,
        document.getElementById('div_result')
      );
    }
  }
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
        $("#file_content").html(JSON.stringify({
          fileName: fileName,
          fileType: fileType,
          content: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } catch(err){
      console.log(err)
      $("#file_content").html(JSON.stringify({
        fileName: null,
        fileType: null,
        content: null
      }));
    }
  }
  render(){
    return(

      <div>

        <div style={{paddingTop: "50px"}}>
              <Form>
                <h5>Dataset Name</h5>
                <Form.Group>
                  <Form.Label>First name</Form.Label>
                  <Form.Control placeholder="Name" id='input_name'/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Last name</Form.Label>
                  <Form.Control placeholder="Name" id='input_lastname'/>
                </Form.Group>
              </Form>

        </div>
        <div style={{paddingTop: "50px"}}>
              <Form>
                <h5>Dataset Date of Birthday</h5>
                <Form.Group>
                  <Form.Label>Birthday</Form.Label>
                  {/*<Form.Control placeholder="Birthday" as="date" id='input_birthday'/>*/}
                  <input type="date" name="birthday" id="input_birthday" />
                </Form.Group>
              </Form>
        </div>
        <div style={{paddingTop: "50px"}}>
              <Form>
                <h5>Dataset Gender</h5>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Control as="select" id="input_gender">
                    <option selected>Male</option>
                    <option>Female</option>
                  </Form.Control>
                </Form.Group>
              </Form>
        </div>
        <div style={{paddingTop: "50px"}}>
              <Form>
                <h5>Dataset Address</h5>
                <Form.Group>
                  <Form.Label>Street address</Form.Label>
                  <Form.Control placeholder="Street" id='input_street'/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <Form.Control placeholder="Country" id='input_country'/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control placeholder="City" id='input_city'/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Postcode</Form.Label>
                  <Form.Control placeholder="Postcode" id='input_postcode'/>
                </Form.Group>
              </Form>
        </div>

        <div style={{paddingTop: "50px"}}>
              <Form>
                <h5>Dataset Mobile</h5>
                <Form.Group>
                  <Form.Label>Mobile number country prefix</Form.Label>
                  <Form.Control placeholder="Country" id='input_mobPrefix'/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Mobile number</Form.Label>
                  <Form.Control placeholder="Country" id='input_mobNumber'/>
                </Form.Group>
              </Form>
        </div>
        <div style={{paddingTop: "50px"}}>
              <Form>
                <h5>Dataset Email</h5>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control placeholder="Email" id='input_email'/>
                </Form.Group>
              </Form>
        </div>

        <div style={{paddingTop: "50px"}}>
              <Form>
                <h5>Dataset Social</h5>
                <Form.Group>
                  <Form.Label>Facebook username</Form.Label>
                  <Form.Control placeholder="Facebook" id='input_facebook'/>
                </Form.Group>
              </Form>
        </div>

        <div style={{paddingTop: "50px"}}>
            <Form>
              <h5>Dataset Driver license</h5>
              <Form.Group>
                <Form.Label>Driver license number</Form.Label>
                <Form.Control placeholder="Driver license number" id='input_driver'/>
              </Form.Group>
              <Form.Group>
                <Form.Label>Driver license file</Form.Label>
                <input type='file' label='Upload' ref='fileUpload' id='input_file' onChange={this.fileUpload}/>
                <div id='file_content' style={{display:"none"}}></div>
              </Form.Group>
            </Form>
        </div>
        <div>
          <Button onClick={this.addRecord} variant="primary">Add Record and store encrypted data</Button>
        </div>
        <div id='div_result' style={{paddingTop: "50px"}}></div>
        <div>
            <h4>Your records</h4>
        </div>
        <div id='div_eventRecords'></div>
      </div>
      );

  }
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: this.props.web3,
      wallet: this.props.wallet,
      contracts: this.props.contracts,
      keys: this.props.keys
    };
    this.genWalletAndKeys = this.genWalletAndKeys.bind(this);

  }

  genWalletAndKeys = function(){
    const web3 = this.state.web3;
    const wallet = web3.eth.accounts.create();
    const keys = encryptHelper.genKeyPair();
    this.setState({
      wallet: wallet,
      keys: keys
    });
    sessionStorage.wallet = JSON.stringify({
      address: wallet.address,
      privateKey: wallet.privateKey
    });
    sessionStorage.keys = JSON.stringify(keys);
  }



  render(){

    if(!this.state.wallet){
      return(
        <div>
          <div>
            <h4>Generate assymetric encrypt keys and ethereum wallet</h4>
            <p>Your wallet and assymetric encrypt keys will be generated and saved in your session</p>
          </div>
          <div>
            <Button onClick={this.genWalletAndKeys} variant="primary">Generate encrypt keys</Button>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div>
          <h4>Your ethereum wallet</h4>
          <p>Address: {this.state.wallet.address}</p>
          <p>Private key: {this.state.wallet.privateKey}</p>
          {/*<p>You can get 0.05 ether at <a href='https://goerli-faucet.slock.it/' target='_blank'>https://goerli-faucet.slock.it/</a></p>*/}
        </div>
        <div>
          <h4>Your encrypt keys</h4>
          <p>Your assymetric encrypt public key: {this.state.keys.publicKey}</p>
          <p>Your assymetric encrypt private key: {this.state.keys.privateKey}</p>
        </div>
        <RecordsPage web3={this.state.web3} wallet={this.state.wallet} keys={this.state.keys} contracts={this.state.contracts}/>
      </div>
    );

  }
}

class App extends Component {

  state = {
    web3: null,
    wallet: null,
    contracts: null,
    keys: null,
    isUser: null,
  };

  componentDidMount = async function(){

    var wallet = null
    var keys = null
    if(sessionStorage.wallet){
      var wallet = JSON.parse(sessionStorage.wallet);
      var keys = JSON.parse(sessionStorage.keys);
    }
    this.setState({
        web3: web3,
        wallet: wallet,
        keys: keys,
        contracts: contracts
     });
    }


  render(){
    if (!this.state.web3 || !this.state.contracts) {
      return (<div>Loading Web3, and contract...</div>);
    }
    return (
      <div>
        <header>
          <Container>
            <Menu wallet={this.state.wallet}/ >
          </Container>
        </header>
        <Container id='container_app'>
          <Dashboard web3={this.state.web3} wallet={this.state.wallet} keys={this.state.keys} contracts={this.state.contracts}/>
        </Container>
      </div>
    );

  }

}

export default App;
