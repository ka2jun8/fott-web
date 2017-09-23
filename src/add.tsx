import * as ReactDOM from "react-dom";
import * as React from "react";
import { Tabs, Tab, FormGroup, ControlLabel, FormControl, HelpBlock, Button } from "react-bootstrap";
import {EventEmitter} from "eventemitter3";
import {TextInfo} from "./firebase";

export interface AddProps {
  emitter: EventEmitter,
}

export interface AddState extends TextInfo {
}

export class Add extends React.Component<AddProps, AddState> {
  constructor() {
    super();
  }

  state: AddState = {
    title: "",
    image: "",
    text: "",
    url: "",
  }

  style: any = {
    view: {
      margin: 5,
    }
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
    });
  }

  render() {
    const formView = (
      <div style={this.style.view}>
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