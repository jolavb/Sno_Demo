import React from 'react';
import _ from 'lodash';
import Map from 'ol/map';
import View from 'ol/view';
import Collection from 'ol/collection';
import TileLayer from 'ol/layer/tile';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import Draw from 'ol/interaction/draw';
import Modify from 'ol/interaction/modify';
import Snap from 'ol/interaction/snap';
//import Geocoder from 'ol-geocoder';
import { getMapStyle } from '../utils/mapUtils';
import OSM from 'ol/source/osm';

class OpenLayersMap extends React.Component {
  constructor(props) {
    super(props);
    this.syncFeatures = this.syncFeatures.bind(this);
    this.updateInteractions = this.updateInteractions.bind(this);
    this.state = {
      source: new SourceVector({ wrapX: false }),
      map: null,
      mapInteractions: [],
    };
  }

  componentDidMount() {
    this.setupMap();
  }

  componentWillReceiveProps(nextProps) {
    const { trails, hydrants } = nextProps;
    // first sync to add externally-uploaded features or remove deleted ones
    this.syncFeatures(trails, hydrants);
  }

  componentDidUpdate(prevProps) {
    const { selectedTrail, trails, interaction, hydrants } = this.props;
    const { map } = this.state;

    // update interactions
    if (
      interaction !== prevProps.interaction ||
      selectedTrail !== prevProps.selectedTrail ||
      hydrants.size !== prevProps.hydrants.size ||
      (selectedTrail === prevProps.selectedTrail &&
        trails.getIn([selectedTrail, 'features'], []).length !== prevProps.trails.getIn([selectedTrail, 'features'], []).length)) {
      this.updateInteractions();
    }

    // pan to new selectedTrail
    if (selectedTrail !== prevProps.selectedTrail && selectedTrail) {

      try {
        const firstTrailGeom = trails.getIn([selectedTrail, 'features'])[0].getGeometry()
        const geomExtent = firstTrailGeom.getExtent()
        const view = map.getView()
        const zoomResolution = view.getResolutionForExtent(geomExtent)
        const zoomLevel = view.getZoomForResolution(zoomResolution)

        const firstCoords = firstTrailGeom.getInteriorPoint().getCoordinates();
        map.getView().animate({
          center: firstCoords,
          duration: 500,
          zoom: zoomLevel,
        });
        // Instead of Panning the below code will jerk to the trail
        // and will fit the trail but is not as smooth.
        // map.getView().fit(firstTrailGeom, map.getSize());
      } catch (err) {
        console.log('No coordinates found for this trail');
      }
    }
  }

  setupMap() {
    const { source } = this.state;
    const { hydrantSelected } = this.props;

    const bingMapsLayer = new TileLayer({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        hidpi: false,
        key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
        imagerySet: 'Aerial',
        maxZoom: 19,
      })
    });


    /*const geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'en',
      placeholder: 'Search for ...',
      limit: 5,
      keepOpen: true,
      autoComplete: true,
    });

    geocoder.setTarget(document.getElementById('searchLocations'));*/

    const resortLayer = new LayerVector({
      source,
      style: getMapStyle,
    });

    // Orientation
    const projection = Projection.get('EPSG:3857');
    const centerCoords = [-106.553668, 39.612616];

    // Map
    const map = new Map({
      loadTilesWhileInteracting: false,
      target: 'map-container',
      layers: [bingMapsLayer, resortLayer],
      view: new View({
        projection,
        center: Projection.fromLonLat(centerCoords),
        zoom: 14.2,
      }),
    });

    // Controls
    // map.addControl(geocoder);
    map.on('click', this.onMapClick);
    this.setState({ map });
  }

  updateInteractions() {
    const {
      trails, hydrants,
      selectedTrail, interaction,
      modifyEnd,
    } = this.props;
    const { source, map, mapInteractions } = this.state;
    _.each(mapInteractions, i => map.removeInteraction(i));

    const newInteractions = [];
    // create new draw or modify interactions
    let type = null;
    const modifiable = new Collection([]);
    if (interaction === 'DRAW_MODIFY_TRAIL' && selectedTrail) {
      type = 'Polygon';
      _.each(trails.getIn([selectedTrail, 'features']), f => modifiable.push(f));
    } else if (interaction === 'DRAW_MODIFY_HYDRANTS') {
      type = 'Point';
      hydrants.filter(h => h.get('trail') === selectedTrail)
        .forEach(h => modifiable.push(h.get('feature')));
    }
    if (type) {
      const draw = new Draw({
        source, type, geometryName: type,
      });
      draw.on('drawend', this.drawEnd);
      newInteractions.push(draw);
    }
    if (modifiable.getLength()) {
      const modify = new Modify({ features: modifiable });
      modify.on('modifyend', modifyEnd);
      modify.on('modifystart', this.modifyStart);
      newInteractions.push(modify);
    }

    if (interaction === 'DRAW_MODIFY_TRAIL') {
      const snap = new Snap({
        source,
        pixelTolerance: 5,
      });
      newInteractions.push(snap);
    }

    _.each(newInteractions, i => map.addInteraction(i));
    this.setState({ mapInteractions: newInteractions });
  }

  drawEnd = (e) => {
    const { drawEnd, interaction, hydrantSelected } = this.props;
    const { map } = this.state;
    if (interaction === 'DRAW_MODIFY_HYDRANTS') {
      const coords = e.feature.getGeometry().getCoordinates();
      const pixel = map.getPixelFromCoordinate(coords);
      const features = map.getFeaturesAtPixel(pixel);
      if (features) {
        const match = _.reduce(features, (curr, f) => {
          if (curr) {
            return curr;
          } else {
            const featureId = f.getId() || '';
            const [type, hydrantId, number] = featureId.split('-');
            return type === 'h' ? hydrantId : curr;
          }
        }, null);
        if (match) {
          return;
        }
      }
    }
    return drawEnd(e.feature);
  }

  modifyStart = (e) => {
    const { interaction, hydrantSelected } = this.props;
    const { map } = this.state;
    if (interaction === 'DRAW_MODIFY_HYDRANTS') {
      const pixel = e.target.lastPixel_;
      const features = map.getFeaturesAtPixel(pixel);
      if (features) {
        const match = _.reduce(features, (curr, f) => {
          if (curr) {
            return curr;
          } else {
            const featureId = f.getId() || '';
            const [type, hydrantId, number] = featureId.split('-');
            return type === 'h' ? hydrantId : curr;
          }
        }, null);
        if (match) {
          hydrantSelected(match);
        }
      }
    }
  }

  onMapClick = (e) => {
    const { interaction, hydrantSelected } = this.props;
    const { map } = this.state;
    const features = map.getFeaturesAtPixel(e.pixel);
    if (features && interaction === 'DRAW_MODIFY_HYDRANTS') {
      const match = _.find(features, f => f.getId() && f.getId()[0] === 'h');
      if (match) {
        hydrantSelected(match.getId().split('-')[1]);
      }
    }
  }

  syncFeatures(trails, hydrants) {
    const { source } = this.state;
    const totalFeatures = trails.reduce((features, t) => {
      return features + t.get('features').length;
    }, 0) + hydrants.size;
    if (source.getFeatures().length !== totalFeatures) {
      // add new features if needed
      const newFeatures = [];
      trails.forEach((trail) => {
        _.each(trail.get('features'), (feature) => {
          if (!source.getFeatureById(feature.getId())) {
            newFeatures.push(feature);
          }
        });
      });
      hydrants.forEach((hydrant) => {
        if (!source.getFeatureById(`h${hydrant.get('id')}`)) {
          newFeatures.push(hydrant.get('feature'));
        }
      });
      if (newFeatures.length) {
        source.addFeatures(newFeatures);
      }

      // remove deleted features if needed
      _.map(source.getFeatures(), (feature) => {
        const featureId = feature.getId() || '';
        const [type, id, number] = featureId.split('-');
        if (type === 't') {
          if (!trails.has(id) || !_.find(trails.get(id).features, f => f.getId() === featureId)) {
            source.removeFeature(feature);
          }
        }
        else if (type === 'h' && !hydrants.has(id)) {
          source.removeFeature(feature);
        }
      });
    }
  }

  render() {
    return <div id="map-container" />;
  }
}

export default OpenLayersMap;
