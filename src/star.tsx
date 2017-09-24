import * as ReactDOM from "react-dom";
import * as React from "react";
import { Tabs, Tab, FormGroup, ControlLabel, FormControl, HelpBlock, Button, Radio } from "react-bootstrap";
import {EventEmitter} from "eventemitter3";

export const STAR = {
  T: "★",
  F: "☆"
}

export interface StarProps {
  star: number, // <= 5
  disable?: boolean,
  onClick?: (star: number)=>void,
}

export class Star extends React.Component<StarProps, any> {
  constructor() {
    super();
  }

  style: any = {
    view: {
      display: "flex",
      flexDirection: "row",
    },
    item: {
      fontSize: 20,
      cursor: "pointer",
    },
    itemDisabled: {
      fontSize: 20,
    },
  }

  onClick(star) {
    if(!this.props.disable && this.props.onClick){
      this.props.onClick(star);
    }
  }

  render() {
    const starsView = [];
    for(let i=1; i<=5; i++) {
      if(i <= this.props.star) {
        starsView.push(
          <div key={i} style={this.props.disable ? this.style.itemDisabled : this.style.item} onClick={this.onClick.bind(this, i)}>{STAR.T}</div>
        );
      }else {
        starsView.push(
          <div key={i} style={this.props.disable ? this.style.itemDisabled : this.style.item} onClick={this.onClick.bind(this, i)}>{STAR.F}</div>
        );
      }
    }

    return (
      <div style={this.style.view}>
        {starsView}
      </div>
    );
  }

}
