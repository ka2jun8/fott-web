import * as ReactDOM from "react-dom";
import * as React from "react";
import { Media, Button, Image, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import * as _ from "underscore";
import {ListInfo, AllTextMap, TextInfo, EditTextInfo} from "./firebase";
import {SelectList} from "./select-list";
import {Star} from "./star";

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

  onEdit(item: TextInfo) {
    const edtiItem: EditTextInfo = _.assign({}, {listId: this.props.selectedListId}, item);
    this.props.emitter.emit("edit", edtiItem);
  }

  onDelete(_id: string) {
    this.props.emitter.emit("delete", this.props.selectedListId, _id);
  }

  onSelectList(listId) {
    this.props.emitter.emit("select-list", listId);
  }

  onChangeList(itemId, oldListId, newListId) {
    this.props.emitter.emit("change-list", itemId, oldListId, newListId);
  }

  render() {
    const mediaList = this.props.selectedTextList && this.props.selectedTextList.map((item, i) => {
      return (
        <Media key={i} style={{margin: 5, height: 200}}>
          <Media.Left>
            <div style={{width: 100, cursor: "pointer", margin: 5}} onClick={this.onClick.bind(this, item.url)}>
            <Image src={item.image} responsive />
            </div>
          </Media.Left>
          <Media.Body>
            <Media.Heading>{item.title}</Media.Heading>
            <div style={{margin: 5}}>
              <p>{item.text}</p>
              <Star star={item.star} disable={true} />
              <SelectList lists={this.props.lists} selectedId={this.props.selectedListId} onSelect={this.onChangeList.bind(this, item.__id, this.props.selectedListId)} nonTitle={true}/>
              <div style={{display: "flex", flexDirection: "row"}}>
                <Button onClick={this.onEdit.bind(this, item)}>編集</Button>
                <Button onClick={this.onDelete.bind(this, item.__id)}>削除</Button>
              </div>
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

    return (
      <div>
        <div>
          <SelectList lists={this.props.lists} selectedId={this.props.selectedListId} onSelect={this.onSelectList.bind(this)}/>
        </div>
        <div>
          {textView}
        </div>
      </div>
    );
  }

}