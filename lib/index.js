'use strict';
var utils = require('./nontree');
var gbv = require('geojson-bounding-volume');
function format(coords){
  // transform from gbv which gives [[min1, min2, ...],[max1, max2, ...]]
  //to rbush which wants [min1, min2, max1, max2]
  return [coords[0][0], coords[0][1], coords[1][0], coords[1][1]];
}
module.exports = NonTree;
function NonTree(options) {
  options = options || {};
  this.range = options.range || [-180, -90, 180, 90];
  this.precision = options.precision || 10;
  this.maxPieces = options.maxPieces || 20;
}

NonTree.prototype.encode = function (point) {
  if (point.length === 2) {
    return utils.toNon(point, this.precision, this.range);
  } else if (point.length === 4) {
    return this.cover(point);
  } else {
    throw new TypeError('need 2 or 4 items in the array, instead got ' + point.length);
  }
};
NonTree.prototype.decode = function (hash, midpoint) {
  var bbox = utils.fromNon(hash, this.range);
  if (!midpoint) {
    return bbox;
  } else {
    return [(bbox[0] + bbox[2])/2, (bbox[1] + bbox[3])/2];
  }
};
var types = [
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection'
];
NonTree.prototype.encodeFeature = function (feature) {
  var geometry;
  if (feature.type === 'Feature') {
    feature = feature.geometry;
  }
  if (~types.indexOf(feature.type)) {
    geometry = feature;
  } else {
    throw new TypeError('invalid geometry type');
  }
  var type = geometry.type;
  switch (type) {
    case 'Point': 
      return [this.encode(geometry.coordinates)];
    case 'MultiPoint':
      return geometry.coordinates.map(this.encode, this);
    default:
      return this.cover(format(gbv(geometry)));
  }
};
NonTree.prototype.cover = function (bbox) {
  return utils.extent(bbox, this.range, this.maxPieces, this.precision);
};
NonTree.prototype.toRange = function (array, hash) {
  if (typeof array === 'string') {
    array = [array];
  } else {
    // lets not modify their array;
    array = array.slice();
  }
  // we sort
  return array.sort().map(function(v){
    // we divide into pairs to cover the range
    return {
      start: v,
      end: utils.next(v)
    };
  }).reduce(function(a, b){
    // this stitches together adjasent ranges
    if(!a.length){
      return [b];
    }
    var prev = a[a.length - 1];
    if (prev.end === utils.deA(b.start)) {
      prev.end = b.end;
    } else {
      a.push(b);
    }
    return a;
  }, []);
};
NonTree.prototype.query = function (array, hash) {
  return this.toRange(array).some(function (item) {
    return !item.start || (hash >= item.start && hash < item.end);
  });
};