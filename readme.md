NonTree
===

An experiment in spatial indexing ternary geohash in other words instead of a quad tree, a nontree.  Instead of using a 2x2 grid each level we use a 3x3 one we use a modified hilbert curve which I'll be calling a 'hilbertish curve'.

Points are storied by finding the full key for the point, multipoints have a key inserted for each point, and line and polygon features are broken up into a number of bboxen which cover it.

According to wikipedia this is actuall a varient on the [Peano curve](https://en.wikipedia.org/wiki/Peano_curve).

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
nonTree.toRange(array);
 ```

Takes a hash or array of geohashes and returns the ranges they represent in the form of an array of object with `start` and `end` prosperities note that the end is noninclusive, so `nonTree.toRange('ab');` returns `[{start: 'ab', end: 'ac'}]`.  Adjastent ranges are merged so `nonTree.toRange(['ab', 'di', ac]);` would return `[[{start: 'ab', end: 'ad'}, {start: 'di', end: 'e'}]`



 ```js
nonTree.query(array, hash);
 ```

Takes an array of hashes and a hash, tests if the has is covered by any of the hashes in the array, returns a boolean.

 
Hibertish Curves
====

A basic set of 9 tiles is arranged as follows

```
1  2  3
6  5  4
7  8  9
```

you can think of this as a set of directions 

```
⟶  ⟶  ↓
↓   ⟵  ⟵
⟶  ⟶  ⟶
```

you want it to line up so that the first tile of the next block lines up with the last one of this one, so the next tile needs to be

```
⟶  ⟶  ↓    ⟶  ⟶  ⟶
↓   ⟵  ⟵   ↑   ⟵  ⟵
⟶  ⟶  ⟶   ⟶  ⟶   ↑
```
for a whole set of 9 blocks is 

```
⟶  ⟶   ↓   ⟶  ⟶  ⟶   ⟶  ⟶   ↓   
↓   ⟵  ⟵   ↑   ⟵  ⟵   ↓   ⟵  ⟵
⟶  ⟶  ⟶   ⟶  ⟶   ↑   ⟶  ⟶   ↓

↓   ⟵  ⟵   ⟵  ⟵  ⟵   ↓   ⟵  ⟵   
⟶  ⟶   ↓   ⟶  ⟶   ↑   ⟶  ⟶   ↓
↓   ⟵  ⟵   ↑   ⟵  ⟵   ⟵  ⟵  ⟵

⟶  ⟶   ↓   ⟶  ⟶  ⟶   ⟶  ⟶   ↓   
↓   ⟵  ⟵   ↑   ⟵  ⟵   ↓   ⟵  ⟵
⟶  ⟶  ⟶   ⟶  ⟶   ↑   ⟶  ⟶   ↓
```

you can represent this more compactly by symbolizing each block as an arrow

```
↘↗↘
↙↖↙
↘↗↘
```

and this pattern extends all the way down by the simple rule of flipping the middle column on it's horizontal axis and flipping the middle row on its vertical axis, the middle square ends up getting flipped twice (equivalent to being rotated 180 degrees).

```
↘↗↘  ↗↘↗⟶↘↗↘
↙↖↙  ↖↙↖  ↙↖↙
↘↗↘⟶↗↘↗  ↘↗↘
             ↓
↙↖↙⟵↖↙↖  ↙↖↙
↘↗↘  ↗↘↗  ↘↗↘
↙↖↙  ↖↙↖⟵↙↖↙
↓
↘↗↘  ↗↘↗⟶↘↗↘
↙↖↙  ↖↙↖  ↙↖↙
↘↗↘⟶↗↘↗  ↘↗↘
```
