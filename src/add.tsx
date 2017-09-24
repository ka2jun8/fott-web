import * as ReactDOM from "react-dom";
import * as React from "react";
import { Tabs, Tab, FormGroup, ControlLabel, FormControl, HelpBlock, Button, Radio } from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import {ListInfo, TextInfo, __DefaultList} from "./firebase";
import {Star} from "./star";
import {SelectList} from "./select-list";

export interface AddProps {
  lists: ListInfo[],
  emitter: EventEmitter,
}

export interface AddState extends TextInfo {
  listId: string,
}

export class Add extends React.Component<AddProps, AddState> {
  constructor() {
    super();
  }

  state: AddState = {
    listId: __DefaultList,
    title: "",
    image: "",
    text: "",
    url: "",
    star: 3, 
    public: false,
  }

  style: any = {
    view: {
      margin: 5,
    }
  }

  onChangeList(listId) {
    this.setState({listId});
  }

  onChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  onChangeImage(e) {
    this.setState({ image: e.target.value });
  }

  onChangeUrl(e) {
    this.setState({ url: e.target.value });
  }

  onChangeText(e) {
    this.setState({ text: e.target.value });
  }

  onChangeStar(star) {
    this.setState({star});
  }

  onAdd() {
    this.props.emitter.emit("add", this.state);
    this.setState({
      title: "",
      image: "",
      text: "",
      url: "", 
      star: 3,
      public: false, 
    });
  }

  render() {
    const selectStarView = (
      <FormGroup>
        <Star star={this.state.star} onClick={this.onChangeStar.bind(this)}/>
      </FormGroup>
    );

    const formView = (
      <div style={this.style.view}>
        <SelectList lists={this.props.lists} selectedId={this.state.listId} onSelect={this.onChangeList.bind(this)} />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Title"
          placeholder="Enter Title"
          value={this.state.title}
          onChange={this.onChangeTitle.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Image url"
          placeholder="Enter Image URL"
          value={this.state.image}
          onChange={this.onChangeImage.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Reference url"
          placeholder="Enter URL"
          value={this.state.url}
          onChange={this.onChangeUrl.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Text"
          placeholder="Enter Text"
          value={this.state.text}
          onChange={this.onChangeText.bind(this)}
        />
        <FormGroup controlId={"SelectStar"}>
          <ControlLabel>{"Star"}</ControlLabel>
          {selectStarView}
        </FormGroup>
        <Button onClick={this.onAdd.bind(this)}>Add</Button>
      </div>
    );
    return (
      <div>
        {formView}
      </div>
    );
  }

}

function FieldGroup({ id, label, help, validationState, ...props }: any) {
  return (
    <FormGroup controlId={id} validationState={validationState}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}