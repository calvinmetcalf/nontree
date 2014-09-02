'use strict';

function getMid(box) {
  var dif = [(box[2]-box[0])/3,(box[3]-box[1])/3];
  return [[box[0]+dif[0],box[1]+dif[1]],[box[2]-dif[0],box[3]-dif[1]]];
}
var tiles = [
  ['a','b','c'],
  ['f','e','d'],
  ['g','h','i']
];
function whichNon(coord, mid, prev) {
  var x,y;
  if (coord[0] < mid[0][0]) {
    x = 0;
  } else if (coord[0] > mid[1][0]) {
    x = 2;
  } else{
    x = 1;
  }
  if (coord[1] < mid[0][1]) {
    y = 2;
  } else if (coord[1] > mid[1][1]) {
    y = 0;
  } else{
    y = 1;
  }
  return normilize(prev, tiles[y][x]);
}
function normilize(prev, current) {
  var flipx = 0;
  var flipy = 0;
  var i = 0;
  var len = prev.length;
  while(i<len) {
    if (~['b','e','h'].indexOf(prev[i])) {
      flipy+=1;
    }
    if (~['f','e','d'].indexOf(prev[i])) {
      flipx+=1;
    }
    i++;
  }
  return normalization[Boolean(flipx % 2)][Boolean(flipy % 2)][current];
}
function newBox(non, oldBox, mid, prev) {
  var out = [0,0,0,0];
  var normilizedNon = normilize(prev, non);
  if (~['a','b','c'].indexOf(normilizedNon)) {
    out[1]=mid[1][1];
    out[3]=oldBox[3];
  } else if (~['f','e','d'].indexOf(normilizedNon)) {
    out[1]=mid[0][1];
    out[3]=mid[1][1];
  } else{
    out[1]=oldBox[1];
    out[3]=mid[0][1];
  }
  if (~['a','f','g'].indexOf(normilizedNon)) {
    out[0]=oldBox[0];
    out[2]=mid[0][0];
  } else if (~['b','e','h'].indexOf(normilizedNon)) {
    out[0] = mid[0][0];
    out[2] = mid[1][0];
  } else{
    out[0] = mid[1][0];
    out[2] = oldBox[2];
  }
  return out;
}

exports.toNon = toNon;
function toNon(coords, maxDepth, box) {
  var depth = -1;
  var out = '';
  var current, mid, prev;
  while (++depth < maxDepth) {
    mid = getMid(box);
    prev = current;
    current = whichNon(coords, mid, out);
    box = newBox(current, box, mid, out);
    out += current;
  }
  return out;
}
exports.fromNon = fromNon;
function fromNon(non, range) {
  var depth = non.length;
  var i = -1;
  var letter,prev,mid;
  while (++i < depth) {
    prev = letter;
    letter = non[i];
    mid = getMid(range);
    range = newBox(letter, range, mid, non.slice(0, i));
  }
  return range;
}

exports.next = next;
function next(non) {
  if (!non.length) {
    return non;
  }
  var i = non.length;
  while (i--) {
    if (non.charCodeAt(i) < 105) {
      return non.slice(0,i ) + String.fromCharCode(non.charCodeAt(i) + 1) + non.slice(i + 1);
    } else if (non.charCodeAt(i)===105) {
      non = non.slice(0, i);
    } else{
      throw new Error('invalid tile name');
    }
  }
}
exports.whichChildren = whichChildren;
function whichChildren(non, bbox, searchDepth, range) {
  var children = [
    non + 'a',
    non + 'b',
    non + 'c',
    non + 'd',
    non + 'e',
    non + 'f',
    non + 'g',
    non + 'h',
    non + 'i'
  ];
  var full = [];
  var partial = [];
  children.forEach(function(child) {
    var childBox = fromNon(child, range);
    if (contains(childBox, bbox)) {
      full.push(child);
    } else if (intersects(childBox, bbox)) {
      if (child.length === searchDepth) {
        full.push(child);
      } else {
        partial.push(child);
      }
    }
  });
  return {
    full: full,
    partial: partial,
    id: non
  };
}

var normalization = {
  true:{
    true:{
      c:'g',
      b:'h',
      a:'i',
      f:'d',
      e:'e',
      d:'f',
      i:'a',
      h:'b',
      g:'c'
    },
    false:{
      c:'a',
      b:'b',
      a:'c',
      f:'d',
      e:'e',
      d:'f',
      i:'g',
      h:'h',
      g:'i'
    }
  },
  false:{
    true:{
      a:'g',
      b:'h',
      c:'i',
      d:'d',
      e:'e',
      f:'f',
      g:'a',
      h:'b',
      i:'c'
    },
    false:{
      a:'a',
      b:'b',
      c:'c',
      d:'d',
      e:'e',
      f:'f',
      g:'g',
      h:'h',
      i:'i'
    }
  }
};
exports.extent = extent;
function extent(bbox, range, maxPieces, precision){
  var todo = [''];
  var done = [];
  var current, newTodo, tempTodo, len, i;
  while(todo.length){
    len = todo.length;
    i = -1;
    newTodo = new Array(len);
    while (++i < len) {
      newTodo[i] = whichChildren(todo[i], bbox, precision, range);
    }
    todo = [];
    tempTodo = [];
    newTodo.forEach(function(v){
      if(v.full.length ===1 && !v.partial.length){
        done.push(v.full[0]);
      }else if(!v.full.length && v.partial.length ===1){
        todo.push(v.partial[0]);
      }else{
        v.num = v.full.length+v.partial.length;
        tempTodo.push(v);
      }
    });
    if(tempTodo.length){
      tempTodo.sort(function(a, b){
        return a.num-b.num;
      });
      while(tempTodo.length){
        current = tempTodo.shift();
        if((current.num+todo.length + done.length) > maxPieces){
          done.push(current.id);
        }else{
          done = done.concat(current.full);
          todo = todo.concat(current.partial);
        }
      }
    }
  }
  return done;
}
exports.deA = deA;
function deA(a) {
  while (a.length) {
    if (a[a.length - 1] === 'a') {
      a = a.slice(0, -1);
    } else {
      return a;
    }
  }
  return a;
}
//from rbush
function contains(a, b) {
  return a[0] <= b[0] &&
         a[1] <= b[1] &&
         b[2] <= a[2] &&
         b[3] <= a[3];
}
function intersects(a, b) {
  return b[0] < a[2] &&
         b[1] < a[3] &&
         b[2] > a[0] &&
         b[3] > a[1];
}