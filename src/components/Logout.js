import React,{Component} from 'react';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar,Card,Modal,Collapse} from 'react-bootstrap';
import {Link,Redirect} from 'react-router-dom';
class Logout extends Component {
  state = {
    isLoggedOut: false
  }

  constructor(props){
    super(props)
  }
  componentDidMount = async function(){
    await this.props.box.logout();
    this.setState({
      isLoggedOut: true
    })
  }
  render(){
    if(this.state.isLoggedOut){
      return(
        <Redirect to='/home' />
      )
    }
    return(
      <h4>Loggin out ... </h4>
    )
  }

}
export default Logout;
