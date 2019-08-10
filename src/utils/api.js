import _ from 'lodash';
import axios from 'axios';

export const mapquestApi = {
  fetchElevationForCoords: (coordsArray) => {
    // args: [[lat, lon]. [lat, lon], ...]
    // return: [{lat, lon, elevation}, {lat, lon, elevation}, ...]
    const key = 'Rnodo0GTN0IK8fpaVlRuTh3H0vX7yX6T';
    // split up coordinates into chunks so the URI isn't too long
    const coordsChunks = _.chunk(coordsArray, 50);
    const promises = _.map(coordsChunks, (coords) => {
      const coordsStr = _.reduce(coords, (curr, coordPair) => `${curr}${coordPair.join(',')},`, '');
      return axios.get('https://open.mapquestapi.com/elevation/v1/profile', {
        params: {
          key,
          unit: 'f',
          shapeFormat: 'raw',
          latLngCollection: coordsStr,
        },
      });
    });
    return axios.all(promises).then(allResp => {
      console.log(allResp)
      // make array of {lat, lon, elevation} objects from
      // promise responses if they all succeed
      if (_.reduce(allResp, (failedRequest, resp) => failedRequest || resp.status !== 200, false)) {
        console.log("At least one request failed. Problem! ");
        return [];
      }
      const mappedResponses = _.map(allResp, resp => {
        return _.map(resp.data.elevationProfile, (pt, index) => {
          // when the mapquestapi can't calculate elevation it return -32768
          // let's correct it to null
          const elevation = pt.height === -32768 ? null : pt.height;
          const latitude = resp.data.shapePoints[index*2];
          const longitude = resp.data.shapePoints[index*2 + 1];
          return { elevation, latitude, longitude };
        });
      });
      return _.flatten(mappedResponses);
    });
  }
}
