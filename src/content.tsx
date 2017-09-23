import * as ReactDOM from "react-dom";
import * as React from "react";
import { Tabs, Tab, Button } from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import { FirebaseWrapper, TextInfo } from "./firebase";
import {Add} from "./add";
import {List} from "./list";

export interface ContentProps {
  fb: FirebaseWrapper,
  emitter: EventEmitter,
  tabContent: number,
  textList: TextInfo[],
  onLogout: () => void,
}

export class Content extends React.Component<ContentProps, any> {
  constructor() {
    super();
  }

  state: any = {
  }

  style: any = {
    view: {
      margin: 10,
    }
  }

  onLogout() {
    this.props.fb.signOut().then(() => {
      console.log("logout!")
      this.props.onLogout();
    }).catch((error) => {
      console.error(error);
    });
  }

  onTabChange(key) {
    this.props.emitter.emit("tab", key);
  }

  render() {
    const listView = (
      <div style={this.style.view}><List emitter={this.props.emitter} textList={this.props.textList}/></div>
    );

    const addView = (
      <div style={this.style.view}><Add emitter={this.props.emitter}/></div>
    );

    const userView = (
      <div style={this.style.view}><Button onClick={this.onLogout.bind(this)}>Logout!</Button></div>
    );

    return (
      <div>
        <Tabs defaultActiveKey={this.props.tabContent} id="uncontrolled-tab-example" onSelect={this.onTabChange.bind(this)}>
          <Tab eventKey={1} title="List">{listView}</Tab>
          <Tab eventKey={2} title="Add">{addView}</Tab>
          <Tab eventKey={3} title="User">{userView}</Tab>
        </Tabs>
      </div>
    );
  }

}