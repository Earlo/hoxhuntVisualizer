import React, { Component } from 'react';
import colormap from 'colormap';
import Client from './Client';
import Hex /*, { gridPoints } */ from 'react-hex';
import { flatGridPoints } from './FlatPointGrid';

const N_SHADES = 100;

let colors = colormap({
  colormap: 'bluered',
  nshades: N_SHADES,
  format: 'hex',
  alpha: 1,
});

class DrawHex extends Component {
  render() {
    const { type, x, y, size, value } = this.props;
    const colorIndex = Math.floor(value * N_SHADES);
    var c = colors[colorIndex]
    return (
      <Hex type={type} x={x} y={y} size={size} fill={ c } />
    );
  }
}

class Grid extends React.Component {
  state = {
    groups: [],
    usersByGroup: {},
    canvasX: 1500,
    canvasY: 1000,
    resolution: 1000,
  };

  componentWillMount = () => {
    const { resolution } = this.state;
    var usersByGroup = {}
    Client.departments(departments => {
      this.setState({
        groups: departments,
      })
      for (var i = 0; i < departments.length; i++) {
        const dep = departments[i]
        Client.search(users => {
          usersByGroup[dep] = users
          //Kind of ugly
          this.forceUpdate()
        }, dep, resolution)
      }
      this.setState({
        usersByGroup,
      })
    })
  }

  render() {
    const {resolution, groups, usersByGroup, canvasX, canvasY } = this.state;
    if ( Object.keys(usersByGroup).length === 0 || ( groups.length !== Object.keys(usersByGroup).length )) {
      console.log("waiting for userdata...")
      return null;
    }

    console.log("done")
    var Hexes = []

    const type = 'pointy-topped'
    const size = 5
    const gSize = size*(Math.sqrt(3))

    var oX = 40
    var oY = 40
    var dx = 0
    var dy = 0

    for (var i = 0; i < groups.length; i++) {
      const dep = groups[i]
      const users = usersByGroup[dep]
      const dimension = Math.ceil(Math.sqrt(resolution))

      const gDim = dimension * gSize
      oX += dx
      if (oX+gDim > canvasX){
        oX = 40
        oY += dy
        dy = 0
      }
      dy = Math.max( gDim, dy )
      dx = gDim + 40


      Hexes.push( flatGridPoints(
        type,
        oX,
        oY,
        size,
        dimension, //w
        dimension, //h
      ).map(({ props, gridX, gridY }, index) => {
        if (index >= resolution /*lenght*/) {
          return null;
        }
        return (
          <DrawHex
            key={`${gridX}-${gridY}`}
            {...props}
            value={ users[index] }
          /> 
        )
      }))
    }

    return (
      <div id="Grid">
        <svg id="canvas" width={canvasX} height={canvasY}>
          {Hexes}
        </svg>
      </div>
    );
  }
}

export default Grid;
