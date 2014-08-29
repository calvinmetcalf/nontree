NonTree
===

An experiment in spatial indexing ternary geohash in other words instead of a quad tree, a nontree.  Instead of using a 2x2 grid each level we use a 3x3 one we use a modified hilbert curve which I'll be calling a 'hilbertish curve'.

Points are storied by finding the full key for the point, multipoints have a key inserted for each point, and line and polygon features are broken up into a number of bboxen which cover it.

References 
===

- [Spatial indexing with Quadtrees and Hilbert Curves](http://blog.notdot.net/2009/11/Damn-Cool-Algorithms-Spatial-indexing-with-Quadtrees-and-Hilbert-Curves)
- [relevant xkcd](http://xkcd.com/195/)

API
===

```js
var NonTree = require(nontree);
var nonTree = new NonTree({
  range: [-180, -90, 180, 90]
  precision: 10
  maxPieces: 20;
})
```

- range is the size of the coordinates space to divide up, defaults to the world, change it if your not using lat longs
- precision refers to the number of digits in length the hash should be
- maxPieces refers to the maximum number of pieces that a polygon or line should be broken up into.

```js
nonTree.encode([x, y]);
```

takes an point expressed in geojson style [x, y] (e.g. [lng, lat]) returns a geohash.

```js
nonTree.decode(hash, returnMidpoint);
```

Takes a hash and an optional argument returnMidpoint, if `returnMidpoint` is falsy or absent then
 a bbox of the form `[xmin, ymin, xmax, ymax]` which the hash represents is returned. If `returnMidpoint` is truthy then a point of the form `[x, y]` which represents the midpoint of the geohash is returned.

 ```js
nonTree.encodeFeature(feature);
 ```

Takes a geojson feature or geometry and returns an array of hashes.

 ```js
nonTree.query(array, hash);
 ```

 Takes an array of hashes and a hash, tests if the has is covered by any of the hashes in the array, returns a boolean.
 
Hibertish Curves
====

A basic set of 9 tiles is arranged as follows

```
a  b  c
f  e  d
g  h  i
```

in other words it's direction is

```
⟶  ⟶  ↓
↓   ⟵  ⟵
⟶  ⟶  ⟶
```

and the blocks direction can be described as ↘, the next level down to get the blocks to line up we need to get them into this pattern

```
↘↗↘
↙↖↙
↘↗↘
```

which we can do by flipping the middle column on it's horizontal axis and flipping the middle row on its vertical axis, the middle square ends up getting flipped twice (equivalent to being rotated 180 degrees).