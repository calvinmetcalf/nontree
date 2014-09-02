'use strict';
var NonTree = require('../lib');
var chai = require("chai");
/*var should = */chai.should();

describe('tree',function(){
  it ('should work', function () {
    var tree = new NonTree();
    tree.decode('a').should.deep.equal([-180, 30, -60, 90]);
  });
  it ('should work return a point', function () {
    var tree = new NonTree();
    tree.decode('a', true).should.deep.equal([-120 , 60]);
  });
  it ('should work the other way', function () {
    var tree = new NonTree();
    tree.encode([-120 , 60]).should.deep.equal('aeeeeeeeee');
  });
  it ('should work the other way with a precision', function () {
    var tree = new NonTree({
      precision: 3
    });
    tree.encode([-120 , 60]).should.deep.equal('aee');
  });
  it('should be able to encode a bbox', function () {
    var tree = new NonTree();
    tree.encode([-180, 30, -60, 90]).should.deep.equal(['a']);
  });
  it('should throw on somethign weird', function () {
    var tree = new NonTree();
    tree.encode.bind(tree, [-180, 30, -60]).should.throw(TypeError);
  });
  it ('should be able to encode geojson', function () {
    var tree = new NonTree({
      precision: 3,
      maxPieces: 4
    });
    tree.encodeFeature({
      type: 'Point',
      coordinates: [-120 , 60]
    }).should.deep.equal(['aee']);
    tree.encodeFeature({
      geometry: {
        type: 'Point',
        coordinates: [-120 , 60]
      },
      properties: {},
      type: 'Feature'
    }).should.deep.equal(['aee']);
    tree.encodeFeature({
      geometry: {
        type: 'MultiPoint',
        coordinates: [[-120 , 60], [120 , 60], [120 , -60], [-120 , -60]]
      },
      properties: {},
      type: 'Feature'
    }).should.deep.equal(['aee', 'cee', 'iee', 'gee']);
    tree.encodeFeature({
      geometry: {
        type: 'LineString',
        coordinates: [[-100 , 850], [100 , 85]]
      },
      properties: {},
      type: 'Feature'
    }).should.deep.equal([
      'b',
      "aca",
      "acb",
      "acc",
      "ca"
    ]);
    tree.encodeFeature.bind(tree, {
      geometry: {
        type: 'Pint',
        coordinates: [-120 , 60]
      },
      properties: {},
      type: 'Feature'
  }).should.throw(TypeError);
  });
  it('should be able to query', function () {
    var tree = new NonTree();
    tree.query('a', 'aa').should.equal(true);
    tree.query(['aeeei','aeefa','gggg'], 'aeeeig').should.equal(true);
  });
  it('should be able to query with weird data', function () {
    var tree = new NonTree();
    tree.query('', 'aa').should.equal(true);
    tree.query.bind(tree, ['aeeei','aeefy','gggg'], 'aeeeig').should.throw(Error);
    tree.query.bind(tree, ['aeeya','aee','gggg', 'a', 'aa'], 'aeeeig').should.not.throw(Error);
    tree.query.bind(tree, ['aeeyi','aee','gggg'], 'aeeeig').should.throw(Error);
  });
});