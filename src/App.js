import React, { Component } from 'react';
import List from './components/List';
import Hud from './components/Hud';

class App extends Component {
  render() {
    return (
      <div>
        <h1 className="title">Click Reactor</h1>
        <Hud />
        <List />
      </div>
    );
  }
}
export default App;