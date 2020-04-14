import React,{Component} from 'react';
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardHeader
} from 'reactstrap';
class Home extends Component {
  state = {
    tutorial: false
  }

  render(){
    if(this.state.tutorial){
      return(
        <Card>
              <CardHeader as="h3">Tutorial</CardHeader>
              <CardBody>
                <CardTitle>How to use this dapp?</CardTitle>
                <CardText>
                <ol>
                  <li>Install <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a></li>
                  <li>
                    Create your ethereum wallet (or import existing one) <br/>
                    <img src={require('../imgs/brave_Crypto0.png')} style={{maxWidth:' 60%'}}/> <br/>
                    <img src={require('../imgs/brave_Crypto1.png')} style={{maxWidth:' 60%'}}/> <br/>
                    <img src={require('../imgs/brave_Crypto2.png')} style={{maxWidth:' 60%'}}/>
                  </li>
                  <li>
                    Accept wallet connection, 3box login/sign up and open DecentralizedPortfolio space <br/>
                    <img src={require('../imgs/brave_3box.png')} style={{maxWidth:' 60%'}}/> <br/>
                  </li>

                </ol>

                 </CardText>
                <Button variant='primary' onClick={()=>{
                  window.scrollTo(0, 0);
                  this.setState({
                    tutorial: false
                  });
                }}>HomePage</Button>
              </CardBody>
             </Card>
      );
    }
    return(
      <Container>

            <Card>
            <CardHeader as="h3">Welcome to decentralized portfolio</CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <Card>
                    <CardBody>
                      <CardTitle>Mount your decentralized portfolio</CardTitle>
                      <CardText>Start mounting your career or artist portfolio now. You can import data from others websites and keep data with yourself to use it in the way you want.</CardText>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col sm={4}>
                  <Card>
                    {/*<Card.Img variant="top" src="./imgs/ipfs.png" />*/}
                    <CardBody>
                      <CardTitle>Decentralized storage</CardTitle>
                      <CardText>Everything is stored in <a href='https://ipfs.io' target='_blank' title='Interplanetary File System'>IPFS</a> using <a href='https://orbitdb.org/' target='_blank' title='OrbitDB'>OrbitDB</a> and linked to your decentralized identity thanks to <a href="https://3box.com" target='_blank' title='3Box'>3Box</a></CardText>
                    </CardBody>
                  </Card>
                </Col>
                <Col sm={4}>
                  <Card>
                    {/*<Card.Img variant="top" src="./imgs/ipfs.png" />*/}
                    <CardBody>
                      <CardTitle>Share same data in multiple dapps</CardTitle>
                      <CardText>Every dapp that uses 3Box can request same data you input here.</CardText>
                    </CardBody>
                  </Card>
                  <h4></h4>

                </Col>
                <Col sm={4}>
                <Card>
                  {/*<Card.Img variant="top" src="./imgs/ipfs.png" />*/}
                  <CardBody>
                    <CardTitle>Receive jobs offers</CardTitle>
                    <CardText>Talk directly with employers with no middleman! No fees to use it for both parties!</CardText>
                  </CardBody>
                </Card>

                </Col>
              </Row>
            </CardBody>
            </Card>
            <hr/>
            <Card>
            <CardHeader as="h3">Informations</CardHeader>
            <CardBody>
              <Row>
                <Col sm={6}>
                  <Card>

                    <CardBody>
                      <CardTitle>How to use it?</CardTitle>
                      <CardText>Step by step on how to use DecentralizedPortfolio</CardText>
                      <Button variant="primary" onClick={()=>{
                        window.scrollTo(0, 0);
                        this.setState({
                          tutorial: true
                        });
                      }}>Tutorial</Button>
                    </CardBody>
                  </Card>
                </Col>
                {/*
                <Col sm={6}>
                  <Card>

                    <CardBody>
                      <CardTitle>Import data from github,linkedin and more</CardTitle>
                      <CardText>How to import your data from some websites</CardText>
                      <Button variant="primary" onClick={()=>{
                        window.scrollTo(0, 0);
                        this.setState({
                          tutorial: true
                        });
                      }}>Tutorial</Button>
                    </CardBody>
                  </Card>
                </Col>
                */}
              </Row>
            </CardBody>
            </Card>
          </Container>
    )
  }
}
export default Home;
