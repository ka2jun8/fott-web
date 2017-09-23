import * as ReactDOM from "react-dom";
import * as React from "react";
import { Media, Button, Image, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import {ListInfo, AllTextMap, TextInfo} from "./firebase";

export interface TextsProps {
  emitter: EventEmitter,
  lists: ListInfo[],
  selectedListId: string,
  selectedTextList: TextInfo[],
}

export class Texts extends React.Component<TextsProps, any> {
  constructor() {
    super();
  }

  onClick(url: string) {
    window.open(url, "_blank");
  }

  onDelete(_id: string) {
    this.props.emitter.emit("delete", this.props.selectedListId, _id);
  }

  onChangeList(e) {
    this.props.emitter.emit("select-list", e.target.value);
  }

  render() {
    const mediaList = this.props.selectedTextList && this.props.selectedTextList.map((item, i) => {
      return (
        <Media key={i} style={{margin: 5, height: 150}}>
          <Media.Left>
            <div style={{width: 100, cursor: "pointer", margin: 5}} onClick={this.onClick.bind(this, item.url)}>
            <Image src={item.image} responsive />
            </div>
          </Media.Left>
          <Media.Body>
            <Media.Heading>{item.title}</Media.Heading>
            <div style={{margin: 5}}>
              <p>{item.text}</p>
              <Button onClick={this.onDelete.bind(this, item.__id)}>削除</Button>
            </div>
          </Media.Body>
       </Media>
     );
    });

    const textView = this.props.selectedTextList.length>0 ? (
      <div>
        {mediaList}
      </div>
    ): (
      <div>何も表示するものがないよん</div>
    );

    const lists = this.props.lists.map((list, i)=>{
      return <option key={i} value={list.__id}>{list.title}</option>;
    });
    const selectListView = (
      <FormGroup controlId="formControlsSelect2">
        <ControlLabel>List Select</ControlLabel>
        <FormControl value={this.props.selectedListId} onChange={this.onChangeList.bind(this)} componentClass="select">
          {lists}
        </FormControl>
      </FormGroup>
    );

    return (
      <div>
        <div>
          {selectListView}
        </div>
        <div>
          {textView}
        </div>
      </div>
    );
  }

}