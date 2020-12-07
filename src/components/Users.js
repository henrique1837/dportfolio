import React,{Component} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Row,
  Col,
  Spinner
} from 'reactstrap';
//import * as Box from '3box';
import {Link} from 'react-router-dom';
import ProfileHover from 'profile-hover';




const Box = require('3box');
const Config = require('../config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin



class Users extends Component {

  state = {
    users: [],
    box: null,
    coinbase: null,
    userPage: <div></div>
  }

  constructor(props){
    super(props);
    this.filterPosts = this.filterPosts.bind(this);
  }

  componentDidMount = async () => {

    try{
      await this.setState({
        box: this.props.box,
        space: this.props.space,
        coinbase: this.props.coinbase
      });

      if(!this.state.space){
        const posts = await Box.getThread(AppName, usersRegistered, admin,false)
        const postsFiltered = await this.filterPosts(posts);
        console.log(postsFiltered)
        await this.setState({
          posts: postsFiltered
        });
        return;
      }

      const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin,members: false});
      await this.setState({
        thread: thread
      })
      const posts = await this.state.thread.getPosts();
      console.log(await Box.getThread(AppName,usersRegistered,admin,false));
      const postsFiltered = await this.filterPosts(posts);
      console.log(postsFiltered)
      await this.setState({
        posts: postsFiltered,
      });

      this.state.thread.onUpdate(async()=> {
         const posts = await this.state.thread.getPosts();
         console.log(await Box.getThread(AppName,usersRegistered,admin,false));
         const postsFiltered = await this.filterPosts(posts);
         console.log(postsFiltered)
         await this.setState({
           posts: postsFiltered,
         });
       });
      return;
    } catch(err){
      console.log(err)
    }

  };


  filterPosts = async function(posts){
    const added = []
    const postsFiltered = [];
    for(var i=posts.length-1;i>=0;i--){
        const post = posts[i];
        const profile = post.message;

        if(!added.includes(profile.address) && profile.address){
          added.push(profile.address)
          postsFiltered.push(post);
          this.state.users.push(post);
          this.forceUpdate();
        }
    }
    return(postsFiltered);
  }



  render(){

    if(!this.state.posts){
      return(
        <center style={{paddingTop:'40px'}}>
          <Spinner color="primary" />
          <p>Loading ...</p>
        </center>
      );
    }
    return(
      <div style={{paddingTop:'40px'}}>
        <Card className="shadow">

          <CardBody>
            <CardTitle>
              <h4>Users</h4>
            </CardTitle>
            <CardText>
              <Row>

              {
                this.state.posts.map(function(post){
                  const profile = post.message
                  //}
                  return(



                          <Col className={"div_profile div_"+profile.address}
                               lg={4}
                               style={{
                                 display:'flex',
                                 flexDirection:'column',
                                 justifyContent:'space-between',
                                 paddingBottom: '100px'
                               }}>
                              <div>
                                  <ProfileHover
                                    address={profile.address}
                                    orientation="bottom"
                                    noCoverImg
                                  />
                              </div>

                              <div>
                                    <p><small>Decentralized portfolio profile</small></p>
                                    <p>Techs: {profile.techs}</p>
                              </div>
                              <div>
                                <Link to={"/user/"+profile.address} style={{all: 'unset'}}>
                                  <Button color="primary">Portfolio</Button>
                                </Link>
                              </div>
                          </Col>


                  )
                })
              }
              </Row>
            </CardText>
          </CardBody>


        </Card>
      </div>
    )
  }
}

export default Users;
