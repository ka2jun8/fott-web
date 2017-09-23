import * as ReactDOM from "react-dom";
import * as React from "react";
import {Button} from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import * as _ from "underscore";
import { FirebaseWrapper, UserProfile, TextInfo } from "./firebase";
import {Login} from "./login";
import {Content} from "./content";
const Config = require("../setting.json");

export interface MainState {
  fb: FirebaseWrapper,
  emitter: EventEmitter,
  userProfile: UserProfile,
  tabContent: number,
  textList: TextInfo[],
  logined: boolean,
}

export enum TabContent {
  LIST = 1,
  ADD,
  USER,
}

export class Main extends React.Component<any, MainState> {
  constructor(){
    super();
  }

  state: MainState = {
    fb: new FirebaseWrapper(Config),
    emitter: new EventEmitter(),
    userProfile: null, 
    tabContent: TabContent.LIST,
    textList: [],
    logined: false,
  }

  style: any = {
    main: {
      display: "flex",
      flexDirection: "column",
      margin: 20,
    },
  }

  componentDidMount() {
    const userProfileStr = localStorage.getItem("userProfile");
    if(userProfileStr) {
      const userProfile = JSON.parse(userProfileStr);
      this.setState({userProfile, logined: true});
      setTimeout(this.updateTextList.bind(this), 0);
    }

    this.state.emitter.on("add", (state: TextInfo)=>{
      const _id = this.state.fb.generateId(this.state.userProfile);
      this.state.fb.pushText(this.state.userProfile, _id, state).then(()=>{
        this.updateTextList();
        this.setState({tabContent: TabContent.LIST});
      }).catch((error)=>{
        console.error(error);
      });
    }).on("delete", (_id: string)=>{
      this.state.fb.deleteTextInfo(this.state.userProfile, _id).then(()=>{
        this.updateTextList();
        this.setState({tabContent: TabContent.LIST});
      }).catch((error)=>{
        console.error(error);
      });
    }).on("tab", (id: number)=>{
      this.setState({tabContent: id});
    });
  }

  updateTextList() {
    this.state.fb.getText(this.state.userProfile).then((text)=>{
      const textList = text ? Object.keys(text).map((id)=>{
        return _.assign({}, text[id], {__id: id});
      }) : [];
      this.setState({textList});
    }).catch((error)=>{
      console.error(error);
    });
  }

  onLogin(userProfile: UserProfile) {
    if(userProfile) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      this.updateTextList();
      this.setState({userProfile, logined: true});
    }
  }

  onLogout() {
    localStorage.removeItem("userProfile");
    this.setState({logined: false});
  }

  render() {
    let contents = <div/>;
    if(!this.state.logined) {
      contents = <Login fb={this.state.fb} onLogin={this.onLogin.bind(this)}/>
    }else {
      contents =<div><Content tabContent={this.state.tabContent} fb={this.state.fb} emitter={this.state.emitter} textList={this.state.textList} onLogout={this.onLogout.bind(this)} /></div>
    }

    return (
      <div style={this.style.main}>{contents}</div>
    );
  }

}