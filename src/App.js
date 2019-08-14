import React, { Component } from 'react';
import List from './components/List';
import HeadsUpDisplay from './components/Hud';

class App extends Component {
  render() {
    return (
      <div>
        <h1 className="title">Click Reactor</h1>
        <HeadsUpDisplay />
        <List />
      </div>
    );
  }
}
export default App;