import React from 'react'
import _ from 'lodash';
import { Table } from 'react-bootstrap'

class TrailList extends React.Component {

  constructor(props){
    super(props);
    // this will be populated by something in props later
    this.state = {
      trails: [{
        id: 1, name: 'First Trail', guns: 8
      }, {
        id: 2, name: 'Second Trail', guns: 12
      }, {
        id: 3, name: 'Third Trail', guns: 15
      }]
    };
  }

  render(){
    let style = {
      width: '20%',
      backgroundColor: '#ffffff66',
      position: 'absolute',
      zIndex: '99',
      top: '50%'
    }

    const {trails} = this.state;

    return (
      <Table style={style}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Trail Name</th>
            <th>Guns</th>
          </tr>
        </thead>
        <tbody>
          {_.map(trails, (trail) => {
            return (
              <tr>
                <td>{trail.id}</td>
                <td>{trail.name}</td>
                <td>{trail.guns}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    )
  }
}

export default TrailList;