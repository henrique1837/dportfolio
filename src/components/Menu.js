import React,{Component} from 'react';

import {Link} from 'react-router-dom';
import {
  Form,
  Container,
  Row,
  Col,
  UncontrolledCollapse,
  Nav,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink
} from 'reactstrap';
class Menu extends Component {
  state = {
    box: null,
    space: null,
    hasWeb3: null,
    isLoggedIn: null
  }

  constructor(props){
    super(props)
    this.setLoginItem = this.setLoginItem.bind(this);
    this.logout = this.logout.bind(this);
  }
  componentDidMount = function(){
    this.setState({
      box: this.props.box,
      space: this.props.space,
      doingLogin: this.props.doingLogin
    })
  }

  setLoginItem = function(){
    if(!window.ethereum){
      return(
        <Link to={"/loginNoWeb3"} >
          <NavLink>
          <i className="ni ni-lock-circle-open" />
            Login
          </NavLink>
        </Link>
      )
    }
    if(this.state.doingLogin){
      return
    }
    return(

      <Link to={"#"}>
        <NavLink onClick={this.props.login}>
        <i className="ni ni-lock-circle-open" />
          Login
        </NavLink>
      </Link>
    )
  }
  logout = async function(){
    await this.state.box.logout();
    this.setState({
      box: null,
      space: null,
      hasWeb3: this.props.hasWeb3,
      isLoggedIn: null
    })
    return;
  }

  render(){

    return(
      <Navbar
        className="navbar-horizontal mt-4 navbar-dark bg-default"
        expand="lg"
      >
        <Container>
          <NavbarBrand href="#DecentralizedPortfolio">
              DecentralizedPortfolio Beta
          </NavbarBrand>
          <button
            aria-controls="navbar-primary"
            aria-expanded={false}
            aria-label="Toggle navigation"
            className="navbar-toggler"
            data-target="#navbar-primary"
            data-toggle="collapse"
            id="navbar-primary"
            type="button"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <UncontrolledCollapse navbar toggler="#navbar-primary">
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <NavbarBrand style={{color: "#172b4d"}} href="#DecentralizedPortfolio">
                      DecentralizedPortfolio Beta
                  </NavbarBrand>
                </Col>
                <Col className="collapse-close" xs="6">
                  <button
                    aria-controls="navbar-primary"
                    aria-expanded={false}
                    aria-label="Toggle navigation"
                    className="navbar-toggler"
                    data-target="#navbar-primary"
                    data-toggle="collapse"
                    id="navbar-primary"
                    type="button"
                  >
                    <span />
                    <span />
                  </button>
                </Col>
              </Row>
            </div>

            {
              (
                !this.state.box &&
                (
                  <Nav className="ml-lg-auto" navbar>
                    <NavItem>
                      <Link to={"/home"}>
                        <NavLink>
                        <i className="ni ni-atom" />
                          Home
                        </NavLink>
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to={"/users"}>
                        <NavLink>
                        <i className="ni ni-circle-08" />
                          Users
                        </NavLink>
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to={"/jobs"}>
                        <NavLink>
                        <i className="ni ni-single-copy-04" />
                          Jobs
                        </NavLink>
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to={"/comments"}>
                        <NavLink>
                        <i className="ni ni-chat-round" />
                          Comments
                        </NavLink>
                      </Link>
                    </NavItem>
                    <NavItem>
                    {
                      this.setLoginItem()
                    }
                    </NavItem>
                  </Nav>
                )
              )
            }
            {
              (
                this.state.box &&
                (
                  <Nav className="ml-lg-auto" navbar>
                    <NavItem>
                       <Link to={"/home"}>
                         <NavLink>
                         <i className="ni ni-atom" />
                           Home
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/profile"}>
                         <NavLink>
                         <i className="ni ni-badge" />
                           Profile
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/portfolio"}>
                         <NavLink>
                         <i className="ni ni-briefcase-24" />
                           Portfolio
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/users"}>
                         <NavLink>
                         <i className="ni ni-circle-08" />
                           Users
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/jobs"}>
                         <NavLink>
                         <i className="ni ni-single-copy-04" />
                           Jobs
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/comments"}>
                         <NavLink>
                         <i className="ni ni-chat-round" />
                           Comments
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                         <Link to={"/logout"} onClick={this.logout}>
                           <NavLink>
                           <i className="ni ni-user-run" />
                             Logout
                           </NavLink>
                         </Link>
                     </NavItem>
                  </Nav>

                )
              )
            }

          </UncontrolledCollapse>
        </Container>
      </Navbar>
    )
  }
}
export default Menu;
