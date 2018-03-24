import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

class MapControls extends React.Component{

  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this)
  };

  handleClick(e){
    this.props.removeInteractions()
    this.props.onClick(e.target.id)
  }

  render(){
    let style= {
      position: 'fixed',
      top: '0',
      left: '30%',
      zIndex: 99
    }

    return (
      <div>
      <ButtonGroup style= {style} >
        <Button bsStyle="primary" id='Trail' onClick={this.handleClick}>Trail</Button>
        <Button bsStyle="primary" id='Hydrant' onClick={this.handleClick}>Hydrant</Button>
        <Button bsStyle="primary" id='HydrantLine' onClick={this.handleClick}>Hydrant Line</Button>
        <Button bsStyle="primary" id='HydrantTrail' onClick={this.handleClick}>Hydrant Trail</Button>
        <Button bsStyle="success" onClick={this.handleClick}>Save</Button>
      </ButtonGroup>
      </div>
    )
  }
}

export default MapControls;