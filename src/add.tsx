import * as ReactDOM from "react-dom";
import * as React from "react";
import { Tabs, Tab, FormGroup, ControlLabel, FormControl, HelpBlock, Button, Radio } from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import {ListInfo, TextInfo, __DefaultList} from "./firebase";

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

  onChangeList(e) {
    this.setState({listId: e.target.value});
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
    const lists = this.props.lists.map((list, i)=>{
      return <option key={i} value={list.__id}>{list.title}</option>;
    });
    const selectListView = (
      <FormGroup controlId="formControlsSelect1">
        <ControlLabel>List Select</ControlLabel>
        <FormControl onChange={this.onChangeList.bind(this)} componentClass="select">
          {lists}
        </FormControl>
      </FormGroup>
    );

    //TODO 星型に変える
    const selectStarView = (
      <FormGroup>
        <Radio name="radioGroup" inline>
          1
        </Radio>
        <Radio name="radioGroup" inline>
          2
        </Radio>
        <Radio name="radioGroup" inline>
          3
        </Radio>
        <Radio name="radioGroup" inline>
          4
        </Radio>
        <Radio name="radioGroup" inline>
          5
        </Radio>
      </FormGroup>
    );

    const formView = (
      <div style={this.style.view}>
        {selectListView}
        <FieldGroup
          id="formControlsText"
          type="text"
          label="title"
          placeholder="Enter Title"
          value={this.state.title}
          onChange={this.onChangeTitle.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="image url"
          placeholder="Enter Image URL"
          value={this.state.image}
          onChange={this.onChangeImage.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="reference url"
          placeholder="Enter URL"
          value={this.state.url}
          onChange={this.onChangeUrl.bind(this)}
        />
        <FieldGroup
          id="formControlsText"
          type="text"
          label="your text"
          placeholder="Enter Text"
          value={this.state.text}
          onChange={this.onChangeText.bind(this)}
        />
        {selectStarView}
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