import * as ReactDOM from "react-dom";
import * as React from "react";
import {Button} from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import * as _ from "underscore";
import { FirebaseWrapper, UserProfile, ListInfo, AllTextMap, TextInfo, PathMap, __DefaultList } from "./firebase";
import {Login} from "./login";
import {Content} from "./content";
import {AddState} from "./add";
import {AddListState} from "./add-list";
const Config = require("../setting.json");

export interface MainState {
  fb: FirebaseWrapper,
  emitter: EventEmitter,
  userProfile: UserProfile,
  tabContent: number,
  lists: ListInfo[],
  textList: AllTextMap,
  selectedListId: string,
  selectedTextList: TextInfo[],
  logined: boolean,
}

export enum TabContent {
  TEXTS = 1,
  ADD,
  ADDLIST,
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
    tabContent: TabContent.TEXTS,
    lists: [],
    textList: {},
    selectedListId: __DefaultList,
    selectedTextList: [],
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
      setTimeout(()=>{
        this.updateListInfo().then(()=>{
          return this.updateTextList();
        }).then(()=>{
          // console.log("Initialize Success");
        });
      }, 0);
    }

    this.state.emitter.on("add", (state: AddState)=>{
      const _id = this.state.fb.generateId(this.state.userProfile, PathMap.Text+"/"+state.listId);
      this.state.fb.pushText(this.state.userProfile, state.listId, _id, state).then(()=>{
        setTimeout(this.updateTextList.bind(this), 0);
        this.setState({tabContent: TabContent.TEXTS});
      }).catch((error)=>{
        console.error(error);
      });
    }).on("delete", (listId: string, _id: string)=>{
      this.state.fb.deleteTextInfo(this.state.userProfile, listId, _id).then(()=>{
        setTimeout(this.updateTextList.bind(this), 0);
        this.setState({tabContent: TabContent.TEXTS});
      }).catch((error)=>{
        console.error(error);
      });
    }).on("add-list", (state: AddListState)=>{
      const _id = this.state.fb.generateId(this.state.userProfile, PathMap.List);
      this.state.fb.createList(this.state.userProfile, _id, state).then(()=>{
        setTimeout(this.updateListInfo.bind(this), 0);
        this.setState({tabContent: TabContent.ADDLIST});
      }).catch((error)=>{
        console.error(error);
      });
    }).on("delete-list", (id: string)=>{
      this.state.fb.deleteList(this.state.userProfile, id).then(()=>{
        setTimeout(this.updateListInfo.bind(this), 0);
        this.setState({tabContent: TabContent.TEXTS});
      }).catch((error)=>{
        console.error(error);
      });
    }).on("select-list", (id: string)=> {
      this.setState({
        selectedListId: id,
        selectedTextList: this.state.textList[id] || [],
      });
    }).on("tab", (id: number)=>{
      this.setState({tabContent: id});
    });
  }

  updateListInfo(): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.state.fb.getList(this.state.userProfile).then((result)=>{
        if(result.length > 0) {
          this.setState({lists: result});
        }else {
          this.state.fb.createList(this.state.userProfile, __DefaultList, {
            title: "Your Text List",
          }).then(()=>{
            this.setState({lists: [{
              __id: __DefaultList,
              title: "Your Text List",
            }]});
          }).catch((error)=>console.error);
        }
        resolve();
      }).catch((error)=>{
        console.error(error);
        reject();
      });
    });
  }

  updateTextList(): Promise<any> {
    return new Promise<any>((resolve, reject)=>{
      this.state.fb.getTexts(this.state.userProfile).then((result)=>{
        const selectedTextList = result[this.state.selectedListId] || [];
        this.setState({textList: result, selectedTextList});
        resolve();
      }).catch((error)=>{
        console.error(error);
        reject();
      });
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
      contents =<div><Content onLogout={this.onLogout.bind(this)} {...this.state} /></div>
    }

    return (
      <div style={this.style.main}>{contents}</div>
    );
  }

}