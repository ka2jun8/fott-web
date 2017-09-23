import * as ReactDOM from "react-dom";
import * as React from "react";
import { Media, Button, Image } from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import {TextInfo} from "./firebase";

export interface ListProps {
  emitter: EventEmitter,
  textList: TextInfo[],
}

export class List extends React.Component<ListProps, any> {
  constructor() {
    super();
  }

  state: any = {
  }

  onClick(url: string) {
    window.open(url, "_blank");
  }

  onDelete(_id: string) {
    this.props.emitter.emit("delete", _id);
  }

  render() {
    const mediaList = this.props.textList && this.props.textList.map((item, i) => {
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

    const textView = this.props.textList.length>0 ? (
      <div>
        {mediaList}
      </div>
    ): (
      <div>何も表示するものがないよん</div>
    );

    return (
      <div>
        {textView}
      </div>
    );
  }

}