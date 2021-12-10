import React, { Component } from 'react'

class AllEvents extends Component {
  render() {
    let data = JSON.parse(localStorage.getItem("events"));
    return (<div style={{textAlign:'left', backgroundColor:'white'}}><pre>{JSON.stringify(data, null, 4) }</pre></div>);
  }
}
export default AllEvents;