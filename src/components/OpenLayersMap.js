import React from 'react';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import Draw from 'ol/interaction/draw';
import MapControls from './MapControls';
import Modify from 'ol/interaction/modify';
import TrailList from './TrailList';
import Style from 'ol/style/style';
import RegularShape from 'ol/style/regularshape';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Circle from 'ol/style/circle';
import Text from 'ol/style/text';

class OpenLayersMap extends React.Component{
  constructor(props){
    super(props);
    this.state = {DrawType: false, map: {}, hydrentIndex: 1};
    this.togglePolyTool = this.togglePolyTool.bind(this)
    this.removeAllInteractions = this.removeAllInteractions.bind(this)
  };

//Defines Types Of Interactions to Add
  styles = {
  square: new Style({
       image: new RegularShape({
         fill: new Fill({color: 'red'}),
         stroke: new Stroke({color: 'black', width: 2}),
         points: 4,
         radius: 10,
         angle: Math.PI / 4
       })
     }),
}

  drawTypes = {
    "Trail": ['Polygon'],
    "Hydrant": ['Point'],
    "HydrantLine": ['LineString', 'Point'],
    "HydrantTrail": ['Polygon','Point']
  }



//Sets PolyOn to True which defines whether interaction is added
  togglePolyTool(type){
    this.setState({
      DrawType: this.drawTypes[type]
    });
  };
// Removes Interactions
  removeAllInteractions(){
    let map = this.state.map
    map.getInteractions().forEach(function (interaction) {
      if(interaction instanceof Draw) {
        map.removeInteraction(interaction)
      }
    });
  }

  componentDidMount(){

    let source = new SourceVector({
      wrapX: false});

    let vector = new LayerVector({
            source: source,
            style: function(feature){
              if (feature.geometryName_ === 'Point'){
                return new Style({
                     image: new RegularShape({
                       fill: new Fill({color: 'red'}),
                       stroke: new Stroke({color: 'black', width: 2}),
                       points: 4,
                       radius: 10,
                       angle: Math.PI / 4
                     }),
                     text: new Text({
                       text: String(feature.ol_uid),
                       stroke: new Stroke({
                         color: '#3399CC',
                         width: 1.25
                       })
                   })
                   })
              } else {
                var fill = new Fill({
                   color: 'rgba(255,255,255,0.4)'
                 });
                 var stroke = new Stroke({
                   color: '#3399CC',
                   width: 1.25
                 });
                 return [new Style({
                     image: new Circle({
                       fill: fill,
                       stroke: stroke,
                       radius: 5
                     }),
                     fill: fill,
                     stroke: stroke
                   })]
              }
            }
          });

    // Layers & Interaction
    this.addDraw = function(type) {
      //Creates New Drawing Interaction
     let draw = new Draw({
              source: source,
              type: type,
              geometryName: type
            });


      // Adds Drawing Interaction
      map.addInteraction(draw)
    }

    function endDraw(feature){
      /// Trigger when Layer is Done
    }

    let bingLayer = new TileLayer ({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        hidpi: true,
        key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
        imagerySet: 'AerialWithLabels'
      })
    })

   // Orientation
    var projection = Projection.get('EPSG:3857');
    var killingtonCoords = [-72.803584,43.619210];
    var killingtonCoordsWebMercator = Projection.fromLonLat(killingtonCoords);

   // Map
      let map = new Map({
          loadTilesWhileInteracting: true,
          target: 'map-container',
          layers: [bingLayer, vector],
          view: new View({
            projection: projection,
            center: killingtonCoordsWebMercator,
            zoom: 14.2,
            rotation: 2.4
          })
        });
      // Modifications
      let modify = new Modify({source: source})
      map.addInteraction(modify);
      this.setState({map: map})
    }


  render() {
    if (this.state.DrawType){
      this.removeAllInteractions()
      this.state.DrawType.forEach(t=> {
        this.addDraw(t);
      })
    }
    return (
    <div id='map-container'>
      <MapControls
        drawTypes={this.drawTypes}
        onClick={this.togglePolyTool}
        polyOn={this.state.polyOn}
        removeInteractions = {this.removeAllInteractions}
      />
      <TrailList />
    </div>
  )
  }
}

export default OpenLayersMap;