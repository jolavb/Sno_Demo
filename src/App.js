import React, { Component } from 'react';
import './App.css';
import OpenLayersMap from './components/OpenLayersMap';

class App extends Component {
  render() {
    return (
      <div className="App">
        <OpenLayersMap />
      </div>
    );
  }
}

export default App;
