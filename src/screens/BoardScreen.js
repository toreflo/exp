import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ListView,
  Dimensions,
  Image,
} from 'react-native';
import { 
  Container,
  Content,
  Fab,
  List,
  Spinner,
  Text,
  Button,
  Icon,
  Card,
  CardItem,
  Body,
  H1,
} from 'native-base';
import moment from 'moment';
import 'moment/locale/it';
import firebase from 'firebase';
import { connect } from 'react-redux';
import Lightbox from 'react-native-lightbox';

import * as gbl from '../gbl';
import * as fileStorage from '../lib/fileStorage';

const LIST_PADDING = 15;
const ITEM_PADDING = 5;
const IMAGE_WIDTH = Dimensions.get('window').width - 2 * (LIST_PADDING + ITEM_PADDING);

class BoardScreen extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = { fabActive: false };
    this.db = firebase.database();
    this.goToDetails = this.goToDetails.bind(this);
    this.sortMessages = this.sortMessages.bind(this);
    this.togglePinned = this.togglePinned.bind(this);
    this.showIfActive = this.showIfActive.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({title: 'Bacheca'});
  }

  togglePinned(data) {
    this.db.ref().update({['/messages/board/' + data.key + '/pinned/']: !data.pinned})
      .catch((error) => {
        console.log(JSON.stringify(error));
        alert(`${error.name}: ${error.message}`);
      });
  }

  sortMessages(a, b) {
    if (a.pinned === b.pinned) return (b.creationTime - a.creationTime);
    if (a.pinned) return -1;
    return 1;
  }

  goToDetails(message) {
    this.props.navigation.navigate(
      'MessageDetailsScreen',
      { message, admin: this.props.admin },
    );
  }

  navigate(screen) {
    this.setState({ fabActive: false });
    this.props.navigation.navigate(screen);
  }

  upload = async ({ uri }) => {
    const timeNow = Date.now();
    const { key } = firebase.database().ref(`/messages/board/`).push();
    const message = {
      creationTime: firebase.database.ServerValue.TIMESTAMP,
      pinned: false,
      image: key,
    };
    const updates = {
      [`/messages/board/${key}`]: message,
      [`/images/board/${key}`]: timeNow,
    };

    try {
      this.setState({ uploading: true });
      await fileStorage.uploadImageAsync(uri, `/images/board/${key}`); 
      await fileStorage.saveFile(uri, 'image', key);
      await firebase.database().ref().update(updates);
      this.setState({ uploading: false });
    } catch (error) {
      this.setState({ uploading: false });
      alert(`${error.name}: ${error.message}`);
    }
  }

  pickFromGallery = async () => {
    this.setState({ fabActive: false });
    await fileStorage.pickFromGallery({
      imageManipulatorActions: [{ resize: { width: 900 }}],
      imageManipulatorSaveOptions: { compress: 0 },
    }, this.upload);
  }

  showIfActive(component) {
    if (this.state.fabActive) return component;
    return null;
  }

  render() {
    const MAX_LEN = 100;
    const fab = this.props.admin ? (
      <Fab
        active={this.state.fabActive}
        direction="up"
        containerStyle={{ }}
        style={{ backgroundColor: '#5067FF' }}
        position="bottomRight"
        onPress={() => this.setState((prevState) => ({ fabActive: !prevState.fabActive }))}
      >
        <Icon type="Ionicons" name="ios-add" />
        {this.showIfActive(
          <Button
            style={{ backgroundColor: '#34A34F' }}
            onPress={() => this.navigate('WriteMessageScreen')}
          >
            <Icon type="FontAwesome" name="pencil" />
          </Button>
        )}
        {this.showIfActive(
          <Button
            style={{ backgroundColor: '#3B5998' }}
            onPress={() => this.pickFromGallery()}
          >
            <Icon type="FontAwesome" name="image" />
          </Button>
        )}
      </Fab>
    ) : null;

    const content = (
      <Content>
        <ListView
          removeClippedSubviews={false}
          enableEmptySections
          style={{ paddingLeft: LIST_PADDING, paddingRight: LIST_PADDING, paddingBottom: 75 }}
          dataSource={this.ds.cloneWithRows(this.props.messages.sort(this.sortMessages))}
          renderRow={(data) => {
            let body = null;
            if (data.body) {
              const text = data.body.length > MAX_LEN ?
                data.body.substring(0, MAX_LEN) + '...' :
                data.body; 
              body = <Text> {text} </Text>
            } else {
              if (!this.props.images) return null;

              const imageUri = this.props.images[data.image];
              if (!imageUri) return null;
              
              body = (
                <View>
                  <Lightbox
                    springConfig={{ tension: 100000, friction: 100000 }}
                    activeProps={{
                      style: {
                        flex: 1,
                        resizeMode: 'contain',
                      },
                    }}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      // width={IMAGE_WIDTH}
                      style={{
                        borderRadius: 10,
                        width: IMAGE_WIDTH,
                        height: IMAGE_WIDTH,
                        resizeMode: 'cover',
                      }}
                    />
                  </Lightbox>
                </View>
              );
            }
            const right = (
              <Button
                transparent
                warning={data.pinned}
                light={!data.pinned}
                onPress={() => {
                  if (this.props.admin) this.togglePinned(data);
                }}
              >
                <Icon type="Ionicons" name="ios-star" style={{fontSize: 20}}/>
              </Button>
            );
  
            return (
              <Card
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  paddingLeft: 0,
                  marginLeft: 0,
                  paddingRight: 0,
                  marginRight: 0,
                }}>
                <CardItem header>
                  <Body style={{alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                    <H1> {data.title ? data.title : 'Image'} </H1>
                  </Body>
                  {right}
                </CardItem>
                <CardItem
                  button
                  onPress={ () => this.goToDetails(data) }
                  style={{
                    paddingLeft: ITEM_PADDING,
                    marginLeft: 0,
                    paddingRight: ITEM_PADDING,
                    marginRight: 0,
                    paddingTop: 10,
                    paddingBottom: 10
                  }}
                >
                  {body}
                </CardItem>
                <CardItem style={{justifyContent: 'flex-end'}}>
                  <Text style={{fontSize: 10}}>
                    {moment.unix(data.creationTime/1000).format('LLL')} 
                  </Text>
                </CardItem>
              </Card>
            );
          }}
        />
      </Content>
    );
    return (
      <Container style={{ backgroundColor: gbl.backgroundColor }}>
        <View style={{ flex: 1 }}>
          {content}
          {fab}
        </View>
      </Container>
    );
  }
}
const mapStateToProps = (state) => ({
  admin: state.info.admin,
  messages: state.boardMessages,
  images: state.images['board'],
});

export default connect(mapStateToProps)(BoardScreen);
