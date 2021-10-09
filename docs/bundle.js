/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../game/noa/node_modules/@jpweeks/typedarray-pool/node_modules/is-buffer/index.js":
/*!********************************************************************************************!*\
  !*** ../../game/noa/node_modules/@jpweeks/typedarray-pool/node_modules/is-buffer/index.js ***!
  \********************************************************************************************/
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

module.exports = function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}


/***/ }),

/***/ "../../game/noa/node_modules/@jpweeks/typedarray-pool/pool.js":
/*!********************************************************************!*\
  !*** ../../game/noa/node_modules/@jpweeks/typedarray-pool/pool.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var bits = __webpack_require__(/*! bit-twiddle */ "../../game/noa/node_modules/bit-twiddle/twiddle.js")
var dup = __webpack_require__(/*! dup */ "../../game/noa/node_modules/dup/dup.js")
var isBuffer = __webpack_require__(/*! is-buffer */ "../../game/noa/node_modules/@jpweeks/typedarray-pool/node_modules/is-buffer/index.js")

//Legacy pool support
if(!__webpack_require__.g.__TYPEDARRAY_POOL) {
  __webpack_require__.g.__TYPEDARRAY_POOL = {
      UINT8   : dup([32, 0])
    , UINT16  : dup([32, 0])
    , UINT32  : dup([32, 0])
    , INT8    : dup([32, 0])
    , INT16   : dup([32, 0])
    , INT32   : dup([32, 0])
    , FLOAT   : dup([32, 0])
    , DOUBLE  : dup([32, 0])
    , DATA    : dup([32, 0])
    , UINT8C  : dup([32, 0])
    , BUFFER  : dup([32, 0])
  }
}

var hasUint8C = (typeof Uint8ClampedArray) !== 'undefined'
var POOL = __webpack_require__.g.__TYPEDARRAY_POOL

//Upgrade pool
if(!POOL.UINT8C) {
  POOL.UINT8C = dup([32, 0])
}
if(!POOL.BUFFER) {
  POOL.BUFFER = dup([32, 0])
}

//New technique: Only allocate from ArrayBufferView and Buffer
var DATA    = POOL.DATA
  , BUFFER  = POOL.BUFFER

exports.free = function free(array) {
  if(isBuffer(array)) {
    BUFFER[bits.log2(array.length)].push(array)
  } else {
    if(Object.prototype.toString.call(array) !== '[object ArrayBuffer]') {
      array = array.buffer
    }
    if(!array) {
      return
    }
    var n = array.length || array.byteLength
    var log_n = bits.log2(n)|0
    DATA[log_n].push(array)
  }
}

function freeArrayBuffer(buffer) {
  if(!buffer) {
    return
  }
  var n = buffer.length || buffer.byteLength
  var log_n = bits.log2(n)
  DATA[log_n].push(buffer)
}

function freeTypedArray(array) {
  freeArrayBuffer(array.buffer)
}

exports.freeUint8 =
exports.freeUint16 =
exports.freeUint32 =
exports.freeInt8 =
exports.freeInt16 =
exports.freeInt32 =
exports.freeFloat32 = 
exports.freeFloat =
exports.freeFloat64 = 
exports.freeDouble = 
exports.freeUint8Clamped = 
exports.freeDataView = freeTypedArray

exports.freeArrayBuffer = freeArrayBuffer

exports.freeBuffer = function freeBuffer(array) {
  BUFFER[bits.log2(array.length)].push(array)
}

exports.malloc = function malloc(n, dtype) {
  if(dtype === undefined || dtype === 'arraybuffer') {
    return mallocArrayBuffer(n)
  } else {
    switch(dtype) {
      case 'uint8':
        return mallocUint8(n)
      case 'uint16':
        return mallocUint16(n)
      case 'uint32':
        return mallocUint32(n)
      case 'int8':
        return mallocInt8(n)
      case 'int16':
        return mallocInt16(n)
      case 'int32':
        return mallocInt32(n)
      case 'float':
      case 'float32':
        return mallocFloat(n)
      case 'double':
      case 'float64':
        return mallocDouble(n)
      case 'uint8_clamped':
        return mallocUint8Clamped(n)
      case 'buffer':
        throw 'Buffer not supported'
      case 'data':
      case 'dataview':
        return mallocDataView(n)

      default:
        return null
    }
  }
  return null
}

function mallocArrayBuffer(n) {
  var n = bits.nextPow2(n)
  var log_n = bits.log2(n)
  var d = DATA[log_n]
  if(d.length > 0) {
    return d.pop()
  }
  return new ArrayBuffer(n)
}
exports.mallocArrayBuffer = mallocArrayBuffer

function mallocUint8(n) {
  return new Uint8Array(mallocArrayBuffer(n), 0, n)
}
exports.mallocUint8 = mallocUint8

function mallocUint16(n) {
  return new Uint16Array(mallocArrayBuffer(2*n), 0, n)
}
exports.mallocUint16 = mallocUint16

function mallocUint32(n) {
  return new Uint32Array(mallocArrayBuffer(4*n), 0, n)
}
exports.mallocUint32 = mallocUint32

function mallocInt8(n) {
  return new Int8Array(mallocArrayBuffer(n), 0, n)
}
exports.mallocInt8 = mallocInt8

function mallocInt16(n) {
  return new Int16Array(mallocArrayBuffer(2*n), 0, n)
}
exports.mallocInt16 = mallocInt16

function mallocInt32(n) {
  return new Int32Array(mallocArrayBuffer(4*n), 0, n)
}
exports.mallocInt32 = mallocInt32

function mallocFloat(n) {
  return new Float32Array(mallocArrayBuffer(4*n), 0, n)
}
exports.mallocFloat32 = exports.mallocFloat = mallocFloat

function mallocDouble(n) {
  return new Float64Array(mallocArrayBuffer(8*n), 0, n)
}
exports.mallocFloat64 = exports.mallocDouble = mallocDouble

function mallocUint8Clamped(n) {
  if(hasUint8C) {
    return new Uint8ClampedArray(mallocArrayBuffer(n), 0, n)
  } else {
    return mallocUint8(n)
  }
}
exports.mallocUint8Clamped = mallocUint8Clamped

function mallocDataView(n) {
  return new DataView(mallocArrayBuffer(n), 0, n)
}
exports.mallocDataView = mallocDataView

exports.clearCache = function clearCache() {
  for(var i=0; i<32; ++i) {
    POOL.UINT8[i].length = 0
    POOL.UINT16[i].length = 0
    POOL.UINT32[i].length = 0
    POOL.INT8[i].length = 0
    POOL.INT16[i].length = 0
    POOL.INT32[i].length = 0
    POOL.FLOAT[i].length = 0
    POOL.DOUBLE[i].length = 0
    POOL.UINT8C[i].length = 0
    DATA[i].length = 0
    BUFFER[i].length = 0
  }
}

/***/ }),

/***/ "../../game/noa/node_modules/aabb-3d/index.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/aabb-3d/index.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = AABB

var vec3 = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js")

function AABB(pos, vec) {

  if(!(this instanceof AABB)) {
    return new AABB(pos, vec)
  }

  var pos2 = vec3.create()
  vec3.add(pos2, pos, vec)
 
  this.base = vec3.min(vec3.create(), pos, pos2)
  this.vec = vec3.clone(vec)
  this.max = vec3.max(vec3.create(), pos, pos2)

  this.mag = vec3.length(this.vec)

}

var cons = AABB
  , proto = cons.prototype

proto.width = function() {
  return this.vec[0]
}

proto.height = function() {
  return this.vec[1]
}

proto.depth = function() {
  return this.vec[2]
}

proto.x0 = function() {
  return this.base[0]
}

proto.y0 = function() {
  return this.base[1]
}

proto.z0 = function() {
  return this.base[2]
}

proto.x1 = function() {
  return this.max[0]
}

proto.y1 = function() {
  return this.max[1]
}

proto.z1 = function() {
  return this.max[2]
}

proto.translate = function(by) {
  vec3.add(this.max, this.max, by)
  vec3.add(this.base, this.base, by)
  return this
}

proto.setPosition = function(pos) {
  vec3.add(this.max, pos, this.vec)
  vec3.copy(this.base, pos)
  return this
}

proto.expand = function(aabb) {
  var max = vec3.create()
    , min = vec3.create()

  vec3.max(max, aabb.max, this.max)
  vec3.min(min, aabb.base, this.base)
  vec3.subtract(max, max, min)

  return new AABB(min, max)
}

proto.intersects = function(aabb) {
  if(aabb.base[0] > this.max[0]) return false
  if(aabb.base[1] > this.max[1]) return false
  if(aabb.base[2] > this.max[2]) return false
  if(aabb.max[0] < this.base[0]) return false
  if(aabb.max[1] < this.base[1]) return false
  if(aabb.max[2] < this.base[2]) return false

  return true
}

proto.touches = function(aabb) {

  var intersection = this.union(aabb);

  return (intersection !== null) &&
         ((intersection.width() == 0) ||
         (intersection.height() == 0) || 
         (intersection.depth() == 0))

}

proto.union = function(aabb) {
  if(!this.intersects(aabb)) return null

  var base_x = Math.max(aabb.base[0], this.base[0])
    , base_y = Math.max(aabb.base[1], this.base[1])
    , base_z = Math.max(aabb.base[2], this.base[2])
    , max_x = Math.min(aabb.max[0], this.max[0])
    , max_y = Math.min(aabb.max[1], this.max[1])
    , max_z = Math.min(aabb.max[2], this.max[2])

  return new AABB([base_x, base_y, base_z], [max_x - base_x, max_y - base_y, max_z - base_z])
}






/***/ }),

/***/ "../../game/noa/node_modules/bit-twiddle/twiddle.js":
/*!**********************************************************!*\
  !*** ../../game/noa/node_modules/bit-twiddle/twiddle.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

 "use restrict";

//Number of bits in an integer
var INT_BITS = 32;

//Constants
exports.INT_BITS  = INT_BITS;
exports.INT_MAX   =  0x7fffffff;
exports.INT_MIN   = -1<<(INT_BITS-1);

//Returns -1, 0, +1 depending on sign of x
exports.sign = function(v) {
  return (v > 0) - (v < 0);
}

//Computes absolute value of integer
exports.abs = function(v) {
  var mask = v >> (INT_BITS-1);
  return (v ^ mask) - mask;
}

//Computes minimum of integers x and y
exports.min = function(x, y) {
  return y ^ ((x ^ y) & -(x < y));
}

//Computes maximum of integers x and y
exports.max = function(x, y) {
  return x ^ ((x ^ y) & -(x < y));
}

//Checks if a number is a power of two
exports.isPow2 = function(v) {
  return !(v & (v-1)) && (!!v);
}

//Computes log base 2 of v
exports.log2 = function(v) {
  var r, shift;
  r =     (v > 0xFFFF) << 4; v >>>= r;
  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
  return r | (v >> 1);
}

//Computes log base 10 of v
exports.log10 = function(v) {
  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
}

//Counts number of bits
exports.popCount = function(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}

//Counts number of trailing zeros
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000FFFF) c -= 16;
  if (v & 0x00FF00FF) c -= 8;
  if (v & 0x0F0F0F0F) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
exports.countTrailingZeros = countTrailingZeros;

//Rounds to next power of 2
exports.nextPow2 = function(v) {
  v += v === 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}

//Rounds down to previous power of 2
exports.prevPow2 = function(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v>>>1);
}

//Computes parity of word
exports.parity = function(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return (0x6996 >>> v) & 1;
}

var REVERSE_TABLE = new Array(256);

(function(tab) {
  for(var i=0; i<256; ++i) {
    var v = i, r = i, s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = (r << s) & 0xff;
  }
})(REVERSE_TABLE);

//Reverse bits in a 32 bit word
exports.reverse = function(v) {
  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
           REVERSE_TABLE[(v >>> 24) & 0xff];
}

//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
exports.interleave2 = function(x, y) {
  x &= 0xFFFF;
  x = (x | (x << 8)) & 0x00FF00FF;
  x = (x | (x << 4)) & 0x0F0F0F0F;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;

  y &= 0xFFFF;
  y = (y | (y << 8)) & 0x00FF00FF;
  y = (y | (y << 4)) & 0x0F0F0F0F;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;

  return x | (y << 1);
}

//Extracts the nth interleaved component
exports.deinterleave2 = function(v, n) {
  v = (v >>> n) & 0x55555555;
  v = (v | (v >>> 1))  & 0x33333333;
  v = (v | (v >>> 2))  & 0x0F0F0F0F;
  v = (v | (v >>> 4))  & 0x00FF00FF;
  v = (v | (v >>> 16)) & 0x000FFFF;
  return (v << 16) >> 16;
}


//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
exports.interleave3 = function(x, y, z) {
  x &= 0x3FF;
  x  = (x | (x<<16)) & 4278190335;
  x  = (x | (x<<8))  & 251719695;
  x  = (x | (x<<4))  & 3272356035;
  x  = (x | (x<<2))  & 1227133513;

  y &= 0x3FF;
  y  = (y | (y<<16)) & 4278190335;
  y  = (y | (y<<8))  & 251719695;
  y  = (y | (y<<4))  & 3272356035;
  y  = (y | (y<<2))  & 1227133513;
  x |= (y << 1);
  
  z &= 0x3FF;
  z  = (z | (z<<16)) & 4278190335;
  z  = (z | (z<<8))  & 251719695;
  z  = (z | (z<<4))  & 3272356035;
  z  = (z | (z<<2))  & 1227133513;
  
  return x | (z << 2);
}

//Extracts nth interleaved component of a 3-tuple
exports.deinterleave3 = function(v, n) {
  v = (v >>> n)       & 1227133513;
  v = (v | (v>>>2))   & 3272356035;
  v = (v | (v>>>4))   & 251719695;
  v = (v | (v>>>8))   & 4278190335;
  v = (v | (v>>>16))  & 0x3FF;
  return (v<<22)>>22;
}

//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
exports.nextCombination = function(v) {
  var t = v | (v - 1);
  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
}



/***/ }),

/***/ "../../game/noa/node_modules/box-intersect/index.js":
/*!**********************************************************!*\
  !*** ../../game/noa/node_modules/box-intersect/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = boxIntersectWrapper

var pool = __webpack_require__(/*! @jpweeks/typedarray-pool */ "../../game/noa/node_modules/@jpweeks/typedarray-pool/pool.js")
var sweep = __webpack_require__(/*! ./lib/sweep */ "../../game/noa/node_modules/box-intersect/lib/sweep.js")
var boxIntersectIter = __webpack_require__(/*! ./lib/intersect */ "../../game/noa/node_modules/box-intersect/lib/intersect.js")

function boxEmpty(d, box) {
  for(var j=0; j<d; ++j) {
    if(!(box[j] <= box[j+d])) {
      return true
    }
  }
  return false
}

//Unpack boxes into a flat typed array, remove empty boxes
function convertBoxes(boxes, d, data, ids) {
  var ptr = 0
  var count = 0
  for(var i=0, n=boxes.length; i<n; ++i) {
    var b = boxes[i]
    if(boxEmpty(d, b)) {
      continue
    }
    for(var j=0; j<2*d; ++j) {
      data[ptr++] = b[j]
    }
    ids[count++] = i
  }
  return count
}

//Perform type conversions, check bounds
function boxIntersect(red, blue, visit, full) {
  var n = red.length
  var m = blue.length

  //If either array is empty, then we can skip this whole thing
  if(n <= 0 || m <= 0) {
    return
  }

  //Compute dimension, if it is 0 then we skip
  var d = (red[0].length)>>>1
  if(d <= 0) {
    return
  }

  var retval

  //Convert red boxes
  var redList  = pool.mallocDouble(2*d*n)
  var redIds   = pool.mallocInt32(n)
  n = convertBoxes(red, d, redList, redIds)

  if(n > 0) {
    if(d === 1 && full) {
      //Special case: 1d complete
      sweep.init(n)
      retval = sweep.sweepComplete(
        d, visit, 
        0, n, redList, redIds,
        0, n, redList, redIds)
    } else {

      //Convert blue boxes
      var blueList = pool.mallocDouble(2*d*m)
      var blueIds  = pool.mallocInt32(m)
      m = convertBoxes(blue, d, blueList, blueIds)

      if(m > 0) {
        sweep.init(n+m)

        if(d === 1) {
          //Special case: 1d bipartite
          retval = sweep.sweepBipartite(
            d, visit, 
            0, n, redList,  redIds,
            0, m, blueList, blueIds)
        } else {
          //General case:  d>1
          retval = boxIntersectIter(
            d, visit,    full,
            n, redList,  redIds,
            m, blueList, blueIds)
        }

        pool.free(blueList)
        pool.free(blueIds)
      }
    }

    pool.free(redList)
    pool.free(redIds)
  }

  return retval
}


var RESULT

function appendItem(i,j) {
  RESULT.push([i,j])
}

function intersectFullArray(x) {
  RESULT = []
  boxIntersect(x, x, appendItem, true)
  return RESULT
}

function intersectBipartiteArray(x, y) {
  RESULT = []
  boxIntersect(x, y, appendItem, false)
  return RESULT
}

//User-friendly wrapper, handle full input and no-visitor cases
function boxIntersectWrapper(arg0, arg1, arg2) {
  var result
  switch(arguments.length) {
    case 1:
      return intersectFullArray(arg0)
    case 2:
      if(typeof arg1 === 'function') {
        return boxIntersect(arg0, arg0, arg1, true)
      } else {
        return intersectBipartiteArray(arg0, arg1)
      }
    case 3:
      return boxIntersect(arg0, arg1, arg2, false)
    default:
      throw new Error('box-intersect: Invalid arguments')
  }
}

/***/ }),

/***/ "../../game/noa/node_modules/box-intersect/lib/brute.js":
/*!**************************************************************!*\
  !*** ../../game/noa/node_modules/box-intersect/lib/brute.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


var DIMENSION   = 'd'
var AXIS        = 'ax'
var VISIT       = 'vv'
var FLIP        = 'fp'

var ELEM_SIZE   = 'es'

var RED_START   = 'rs'
var RED_END     = 're'
var RED_BOXES   = 'rb'
var RED_INDEX   = 'ri'
var RED_PTR     = 'rp'

var BLUE_START  = 'bs'
var BLUE_END    = 'be'
var BLUE_BOXES  = 'bb'
var BLUE_INDEX  = 'bi'
var BLUE_PTR    = 'bp'

var RETVAL      = 'rv'

var INNER_LABEL = 'Q'

var ARGS = [
  DIMENSION,
  AXIS,
  VISIT,
  RED_START,
  RED_END,
  RED_BOXES,
  RED_INDEX,
  BLUE_START,
  BLUE_END,
  BLUE_BOXES,
  BLUE_INDEX
]

function generateBruteForce(redMajor, flip, full) {
  var funcName = 'bruteForce' + 
    (redMajor ? 'Red' : 'Blue') + 
    (flip ? 'Flip' : '') +
    (full ? 'Full' : '')

  var code = ['function ', funcName, '(', ARGS.join(), '){',
    'var ', ELEM_SIZE, '=2*', DIMENSION, ';']

  var redLoop = 
    'for(var i=' + RED_START + ',' + RED_PTR + '=' + ELEM_SIZE + '*' + RED_START + ';' +
        'i<' + RED_END +';' +
        '++i,' + RED_PTR + '+=' + ELEM_SIZE + '){' +
        'var x0=' + RED_BOXES + '[' + AXIS + '+' + RED_PTR + '],' +
            'x1=' + RED_BOXES + '[' + AXIS + '+' + RED_PTR + '+' + DIMENSION + '],' +
            'xi=' + RED_INDEX + '[i];'

  var blueLoop = 
    'for(var j=' + BLUE_START + ',' + BLUE_PTR + '=' + ELEM_SIZE + '*' + BLUE_START + ';' +
        'j<' + BLUE_END + ';' +
        '++j,' + BLUE_PTR + '+=' + ELEM_SIZE + '){' +
        'var y0=' + BLUE_BOXES + '[' + AXIS + '+' + BLUE_PTR + '],' +
            (full ? 'y1=' + BLUE_BOXES + '[' + AXIS + '+' + BLUE_PTR + '+' + DIMENSION + '],' : '') +
            'yi=' + BLUE_INDEX + '[j];'

  if(redMajor) {
    code.push(redLoop, INNER_LABEL, ':', blueLoop)
  } else {
    code.push(blueLoop, INNER_LABEL, ':', redLoop)
  }

  if(full) {
    code.push('if(y1<x0||x1<y0)continue;')
  } else if(flip) {
    code.push('if(y0<=x0||x1<y0)continue;')
  } else {
    code.push('if(y0<x0||x1<y0)continue;')
  }

  code.push('for(var k='+AXIS+'+1;k<'+DIMENSION+';++k){'+
    'var r0='+RED_BOXES+'[k+'+RED_PTR+'],'+
        'r1='+RED_BOXES+'[k+'+DIMENSION+'+'+RED_PTR+'],'+
        'b0='+BLUE_BOXES+'[k+'+BLUE_PTR+'],'+
        'b1='+BLUE_BOXES+'[k+'+DIMENSION+'+'+BLUE_PTR+'];'+
      'if(r1<b0||b1<r0)continue ' + INNER_LABEL + ';}' +
      'var ' + RETVAL + '=' + VISIT + '(')

  if(flip) {
    code.push('yi,xi')
  } else {
    code.push('xi,yi')
  }

  code.push(');if(' + RETVAL + '!==void 0)return ' + RETVAL + ';}}}')

  return {
    name: funcName, 
    code: code.join('')
  }
}

function bruteForcePlanner(full) {
  var funcName = 'bruteForce' + (full ? 'Full' : 'Partial')
  var prefix = []
  var fargs = ARGS.slice()
  if(!full) {
    fargs.splice(3, 0, FLIP)
  }

  var code = ['function ' + funcName + '(' + fargs.join() + '){']

  function invoke(redMajor, flip) {
    var res = generateBruteForce(redMajor, flip, full)
    prefix.push(res.code)
    code.push('return ' + res.name + '(' + ARGS.join() + ');')
  }

  code.push('if(' + RED_END + '-' + RED_START + '>' +
                    BLUE_END + '-' + BLUE_START + '){')

  if(full) {
    invoke(true, false)
    code.push('}else{')
    invoke(false, false)
  } else {
    code.push('if(' + FLIP + '){')
    invoke(true, true)
    code.push('}else{')
    invoke(true, false)
    code.push('}}else{if(' + FLIP + '){')
    invoke(false, true)
    code.push('}else{')
    invoke(false, false)
    code.push('}')
  }
  code.push('}}return ' + funcName)

  var codeStr = prefix.join('') + code.join('')
  var proc = new Function(codeStr)
  return proc()
}


exports.partial = bruteForcePlanner(false)
exports.full    = bruteForcePlanner(true)

/***/ }),

/***/ "../../game/noa/node_modules/box-intersect/lib/intersect.js":
/*!******************************************************************!*\
  !*** ../../game/noa/node_modules/box-intersect/lib/intersect.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = boxIntersectIter

var pool = __webpack_require__(/*! @jpweeks/typedarray-pool */ "../../game/noa/node_modules/@jpweeks/typedarray-pool/pool.js")
var bits = __webpack_require__(/*! bit-twiddle */ "../../game/noa/node_modules/bit-twiddle/twiddle.js")
var bruteForce = __webpack_require__(/*! ./brute */ "../../game/noa/node_modules/box-intersect/lib/brute.js")
var bruteForcePartial = bruteForce.partial
var bruteForceFull = bruteForce.full
var sweep = __webpack_require__(/*! ./sweep */ "../../game/noa/node_modules/box-intersect/lib/sweep.js")
var findMedian = __webpack_require__(/*! ./median */ "../../game/noa/node_modules/box-intersect/lib/median.js")
var genPartition = __webpack_require__(/*! ./partition */ "../../game/noa/node_modules/box-intersect/lib/partition.js")

//Twiddle parameters
var BRUTE_FORCE_CUTOFF    = 128       //Cut off for brute force search
var SCAN_CUTOFF           = (1<<22)   //Cut off for two way scan
var SCAN_COMPLETE_CUTOFF  = (1<<22)  

//Partition functions
var partitionInteriorContainsInterval = genPartition(
  '!(lo>=p0)&&!(p1>=hi)', 
  ['p0', 'p1'])

var partitionStartEqual = genPartition(
  'lo===p0',
  ['p0'])

var partitionStartLessThan = genPartition(
  'lo<p0',
  ['p0'])

var partitionEndLessThanEqual = genPartition(
  'hi<=p0',
  ['p0'])

var partitionContainsPoint = genPartition(
  'lo<=p0&&p0<=hi',
  ['p0'])

var partitionContainsPointProper = genPartition(
  'lo<p0&&p0<=hi',
  ['p0'])

//Frame size for iterative loop
var IFRAME_SIZE = 6
var DFRAME_SIZE = 2

//Data for box statck
var INIT_CAPACITY = 1024
var BOX_ISTACK  = pool.mallocInt32(INIT_CAPACITY)
var BOX_DSTACK  = pool.mallocDouble(INIT_CAPACITY)

//Initialize iterative loop queue
function iterInit(d, count) {
  var levels = (8 * bits.log2(count+1) * (d+1))|0
  var maxInts = bits.nextPow2(IFRAME_SIZE*levels)
  if(BOX_ISTACK.length < maxInts) {
    pool.free(BOX_ISTACK)
    BOX_ISTACK = pool.mallocInt32(maxInts)
  }
  var maxDoubles = bits.nextPow2(DFRAME_SIZE*levels)
  if(BOX_DSTACK.length < maxDoubles) {
    pool.free(BOX_DSTACK)
    BOX_DSTACK = pool.mallocDouble(maxDoubles)
  }
}

//Append item to queue
function iterPush(ptr,
  axis, 
  redStart, redEnd, 
  blueStart, blueEnd, 
  state, 
  lo, hi) {

  var iptr = IFRAME_SIZE * ptr
  BOX_ISTACK[iptr]   = axis
  BOX_ISTACK[iptr+1] = redStart
  BOX_ISTACK[iptr+2] = redEnd
  BOX_ISTACK[iptr+3] = blueStart
  BOX_ISTACK[iptr+4] = blueEnd
  BOX_ISTACK[iptr+5] = state

  var dptr = DFRAME_SIZE * ptr
  BOX_DSTACK[dptr]   = lo
  BOX_DSTACK[dptr+1] = hi
}

//Special case:  Intersect single point with list of intervals
function onePointPartial(
  d, axis, visit, flip,
  redStart, redEnd, red, redIndex,
  blueOffset, blue, blueId) {

  var elemSize = 2 * d
  var bluePtr  = blueOffset * elemSize
  var blueX    = blue[bluePtr + axis]

red_loop:
  for(var i=redStart, redPtr=redStart*elemSize; i<redEnd; ++i, redPtr+=elemSize) {
    var r0 = red[redPtr+axis]
    var r1 = red[redPtr+axis+d]
    if(blueX < r0 || r1 < blueX) {
      continue
    }
    if(flip && blueX === r0) {
      continue
    }
    var redId = redIndex[i]
    for(var j=axis+1; j<d; ++j) {
      var r0 = red[redPtr+j]
      var r1 = red[redPtr+j+d]
      var b0 = blue[bluePtr+j]
      var b1 = blue[bluePtr+j+d]
      if(r1 < b0 || b1 < r0) {
        continue red_loop
      }
    }
    var retval
    if(flip) {
      retval = visit(blueId, redId)
    } else {
      retval = visit(redId, blueId)
    }
    if(retval !== void 0) {
      return retval
    }
  }
}

//Special case:  Intersect one point with list of intervals
function onePointFull(
  d, axis, visit,
  redStart, redEnd, red, redIndex,
  blueOffset, blue, blueId) {

  var elemSize = 2 * d
  var bluePtr  = blueOffset * elemSize
  var blueX    = blue[bluePtr + axis]

red_loop:
  for(var i=redStart, redPtr=redStart*elemSize; i<redEnd; ++i, redPtr+=elemSize) {
    var redId = redIndex[i]
    if(redId === blueId) {
      continue
    }
    var r0 = red[redPtr+axis]
    var r1 = red[redPtr+axis+d]
    if(blueX < r0 || r1 < blueX) {
      continue
    }
    for(var j=axis+1; j<d; ++j) {
      var r0 = red[redPtr+j]
      var r1 = red[redPtr+j+d]
      var b0 = blue[bluePtr+j]
      var b1 = blue[bluePtr+j+d]
      if(r1 < b0 || b1 < r0) {
        continue red_loop
      }
    }
    var retval = visit(redId, blueId)
    if(retval !== void 0) {
      return retval
    }
  }
}

//The main box intersection routine
function boxIntersectIter(
  d, visit, initFull,
  xSize, xBoxes, xIndex,
  ySize, yBoxes, yIndex) {

  //Reserve memory for stack
  iterInit(d, xSize + ySize)

  var top  = 0
  var elemSize = 2 * d
  var retval

  iterPush(top++,
      0,
      0, xSize,
      0, ySize,
      initFull ? 16 : 0, 
      -Infinity, Infinity)
  if(!initFull) {
    iterPush(top++,
      0,
      0, ySize,
      0, xSize,
      1, 
      -Infinity, Infinity)
  }

  while(top > 0) {
    top  -= 1

    var iptr = top * IFRAME_SIZE
    var axis      = BOX_ISTACK[iptr]
    var redStart  = BOX_ISTACK[iptr+1]
    var redEnd    = BOX_ISTACK[iptr+2]
    var blueStart = BOX_ISTACK[iptr+3]
    var blueEnd   = BOX_ISTACK[iptr+4]
    var state     = BOX_ISTACK[iptr+5]

    var dptr = top * DFRAME_SIZE
    var lo        = BOX_DSTACK[dptr]
    var hi        = BOX_DSTACK[dptr+1]

    //Unpack state info
    var flip      = (state & 1)
    var full      = !!(state & 16)

    //Unpack indices
    var red       = xBoxes
    var redIndex  = xIndex
    var blue      = yBoxes
    var blueIndex = yIndex
    if(flip) {
      red         = yBoxes
      redIndex    = yIndex
      blue        = xBoxes
      blueIndex   = xIndex
    }

    if(state & 2) {
      redEnd = partitionStartLessThan(
        d, axis,
        redStart, redEnd, red, redIndex,
        hi)
      if(redStart >= redEnd) {
        continue
      }
    }
    if(state & 4) {
      redStart = partitionEndLessThanEqual(
        d, axis,
        redStart, redEnd, red, redIndex,
        lo)
      if(redStart >= redEnd) {
        continue
      }
    }
    
    var redCount  = redEnd  - redStart
    var blueCount = blueEnd - blueStart

    if(full) {
      if(d * redCount * (redCount + blueCount) < SCAN_COMPLETE_CUTOFF) {
        retval = sweep.scanComplete(
          d, axis, visit, 
          redStart, redEnd, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
        if(retval !== void 0) {
          return retval
        }
        continue
      }
    } else {
      if(d * Math.min(redCount, blueCount) < BRUTE_FORCE_CUTOFF) {
        //If input small, then use brute force
        retval = bruteForcePartial(
            d, axis, visit, flip,
            redStart,  redEnd,  red,  redIndex,
            blueStart, blueEnd, blue, blueIndex)
        if(retval !== void 0) {
          return retval
        }
        continue
      } else if(d * redCount * blueCount < SCAN_CUTOFF) {
        //If input medium sized, then use sweep and prune
        retval = sweep.scanBipartite(
          d, axis, visit, flip, 
          redStart, redEnd, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
        if(retval !== void 0) {
          return retval
        }
        continue
      }
    }
    
    //First, find all red intervals whose interior contains (lo,hi)
    var red0 = partitionInteriorContainsInterval(
      d, axis, 
      redStart, redEnd, red, redIndex,
      lo, hi)

    //Lower dimensional case
    if(redStart < red0) {

      if(d * (red0 - redStart) < BRUTE_FORCE_CUTOFF) {
        //Special case for small inputs: use brute force
        retval = bruteForceFull(
          d, axis+1, visit,
          redStart, red0, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
        if(retval !== void 0) {
          return retval
        }
      } else if(axis === d-2) {
        if(flip) {
          retval = sweep.sweepBipartite(
            d, visit,
            blueStart, blueEnd, blue, blueIndex,
            redStart, red0, red, redIndex)
        } else {
          retval = sweep.sweepBipartite(
            d, visit,
            redStart, red0, red, redIndex,
            blueStart, blueEnd, blue, blueIndex)
        }
        if(retval !== void 0) {
          return retval
        }
      } else {
        iterPush(top++,
          axis+1,
          redStart, red0,
          blueStart, blueEnd,
          flip,
          -Infinity, Infinity)
        iterPush(top++,
          axis+1,
          blueStart, blueEnd,
          redStart, red0,
          flip^1,
          -Infinity, Infinity)
      }
    }

    //Divide and conquer phase
    if(red0 < redEnd) {

      //Cut blue into 3 parts:
      //
      //  Points < mid point
      //  Points = mid point
      //  Points > mid point
      //
      var blue0 = findMedian(
        d, axis, 
        blueStart, blueEnd, blue, blueIndex)
      var mid = blue[elemSize * blue0 + axis]
      var blue1 = partitionStartEqual(
        d, axis,
        blue0, blueEnd, blue, blueIndex,
        mid)

      //Right case
      if(blue1 < blueEnd) {
        iterPush(top++,
          axis,
          red0, redEnd,
          blue1, blueEnd,
          (flip|4) + (full ? 16 : 0),
          mid, hi)
      }

      //Left case
      if(blueStart < blue0) {
        iterPush(top++,
          axis,
          red0, redEnd,
          blueStart, blue0,
          (flip|2) + (full ? 16 : 0),
          lo, mid)
      }

      //Center case (the hard part)
      if(blue0 + 1 === blue1) {
        //Optimization: Range with exactly 1 point, use a brute force scan
        if(full) {
          retval = onePointFull(
            d, axis, visit,
            red0, redEnd, red, redIndex,
            blue0, blue, blueIndex[blue0])
        } else {
          retval = onePointPartial(
            d, axis, visit, flip,
            red0, redEnd, red, redIndex,
            blue0, blue, blueIndex[blue0])
        }
        if(retval !== void 0) {
          return retval
        }
      } else if(blue0 < blue1) {
        var red1
        if(full) {
          //If full intersection, need to handle special case
          red1 = partitionContainsPoint(
            d, axis,
            red0, redEnd, red, redIndex,
            mid)
          if(red0 < red1) {
            var redX = partitionStartEqual(
              d, axis,
              red0, red1, red, redIndex,
              mid)
            if(axis === d-2) {
              //Degenerate sweep intersection:
              //  [red0, redX] with [blue0, blue1]
              if(red0 < redX) {
                retval = sweep.sweepComplete(
                  d, visit,
                  red0, redX, red, redIndex,
                  blue0, blue1, blue, blueIndex)
                if(retval !== void 0) {
                  return retval
                }
              }

              //Normal sweep intersection:
              //  [redX, red1] with [blue0, blue1]
              if(redX < red1) {
                retval = sweep.sweepBipartite(
                  d, visit,
                  redX, red1, red, redIndex,
                  blue0, blue1, blue, blueIndex)
                if(retval !== void 0) {
                  return retval
                }
              }
            } else {
              if(red0 < redX) {
                iterPush(top++,
                  axis+1,
                  red0, redX,
                  blue0, blue1,
                  16,
                  -Infinity, Infinity)
              }
              if(redX < red1) {
                iterPush(top++,
                  axis+1,
                  redX, red1,
                  blue0, blue1,
                  0,
                  -Infinity, Infinity)
                iterPush(top++,
                  axis+1,
                  blue0, blue1,
                  redX, red1,
                  1,
                  -Infinity, Infinity)
              }
            }
          }
        } else {
          if(flip) {
            red1 = partitionContainsPointProper(
              d, axis,
              red0, redEnd, red, redIndex,
              mid)
          } else {
            red1 = partitionContainsPoint(
              d, axis,
              red0, redEnd, red, redIndex,
              mid)
          }
          if(red0 < red1) {
            if(axis === d-2) {
              if(flip) {
                retval = sweep.sweepBipartite(
                  d, visit,
                  blue0, blue1, blue, blueIndex,
                  red0, red1, red, redIndex)
              } else {
                retval = sweep.sweepBipartite(
                  d, visit,
                  red0, red1, red, redIndex,
                  blue0, blue1, blue, blueIndex)
              }
            } else {
              iterPush(top++,
                axis+1,
                red0, red1,
                blue0, blue1,
                flip,
                -Infinity, Infinity)
              iterPush(top++,
                axis+1,
                blue0, blue1,
                red0, red1,
                flip^1,
                -Infinity, Infinity)
            }
          }
        }
      }
    }
  }
}

/***/ }),

/***/ "../../game/noa/node_modules/box-intersect/lib/median.js":
/*!***************************************************************!*\
  !*** ../../game/noa/node_modules/box-intersect/lib/median.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = findMedian

var genPartition = __webpack_require__(/*! ./partition */ "../../game/noa/node_modules/box-intersect/lib/partition.js")

var partitionStartLessThan = genPartition('lo<p0', ['p0'])

var PARTITION_THRESHOLD = 8   //Cut off for using insertion sort in findMedian

//Base case for median finding:  Use insertion sort
function insertionSort(d, axis, start, end, boxes, ids) {
  var elemSize = 2 * d
  var boxPtr = elemSize * (start+1) + axis
  for(var i=start+1; i<end; ++i, boxPtr+=elemSize) {
    var x = boxes[boxPtr]
    for(var j=i, ptr=elemSize*(i-1); 
        j>start && boxes[ptr+axis] > x; 
        --j, ptr-=elemSize) {
      //Swap
      var aPtr = ptr
      var bPtr = ptr+elemSize
      for(var k=0; k<elemSize; ++k, ++aPtr, ++bPtr) {
        var y = boxes[aPtr]
        boxes[aPtr] = boxes[bPtr]
        boxes[bPtr] = y
      }
      var tmp = ids[j]
      ids[j] = ids[j-1]
      ids[j-1] = tmp
    }
  }
}

//Find median using quick select algorithm
//  takes O(n) time with high probability
function findMedian(d, axis, start, end, boxes, ids) {
  if(end <= start+1) {
    return start
  }

  var lo       = start
  var hi       = end
  var mid      = ((end + start) >>> 1)
  var elemSize = 2*d
  var pivot    = mid
  var value    = boxes[elemSize*mid+axis]
  
  while(lo < hi) {
    if(hi - lo < PARTITION_THRESHOLD) {
      insertionSort(d, axis, lo, hi, boxes, ids)
      value = boxes[elemSize*mid+axis]
      break
    }
    
    //Select pivot using median-of-3
    var count  = hi - lo
    var pivot0 = (Math.random()*count+lo)|0
    var value0 = boxes[elemSize*pivot0 + axis]
    var pivot1 = (Math.random()*count+lo)|0
    var value1 = boxes[elemSize*pivot1 + axis]
    var pivot2 = (Math.random()*count+lo)|0
    var value2 = boxes[elemSize*pivot2 + axis]
    if(value0 <= value1) {
      if(value2 >= value1) {
        pivot = pivot1
        value = value1
      } else if(value0 >= value2) {
        pivot = pivot0
        value = value0
      } else {
        pivot = pivot2
        value = value2
      }
    } else {
      if(value1 >= value2) {
        pivot = pivot1
        value = value1
      } else if(value2 >= value0) {
        pivot = pivot0
        value = value0
      } else {
        pivot = pivot2
        value = value2
      }
    }

    //Swap pivot to end of array
    var aPtr = elemSize * (hi-1)
    var bPtr = elemSize * pivot
    for(var i=0; i<elemSize; ++i, ++aPtr, ++bPtr) {
      var x = boxes[aPtr]
      boxes[aPtr] = boxes[bPtr]
      boxes[bPtr] = x
    }
    var y = ids[hi-1]
    ids[hi-1] = ids[pivot]
    ids[pivot] = y

    //Partition using pivot
    pivot = partitionStartLessThan(
      d, axis, 
      lo, hi-1, boxes, ids,
      value)

    //Swap pivot back
    var aPtr = elemSize * (hi-1)
    var bPtr = elemSize * pivot
    for(var i=0; i<elemSize; ++i, ++aPtr, ++bPtr) {
      var x = boxes[aPtr]
      boxes[aPtr] = boxes[bPtr]
      boxes[bPtr] = x
    }
    var y = ids[hi-1]
    ids[hi-1] = ids[pivot]
    ids[pivot] = y

    //Swap pivot to last pivot
    if(mid < pivot) {
      hi = pivot-1
      while(lo < hi && 
        boxes[elemSize*(hi-1)+axis] === value) {
        hi -= 1
      }
      hi += 1
    } else if(pivot < mid) {
      lo = pivot + 1
      while(lo < hi &&
        boxes[elemSize*lo+axis] === value) {
        lo += 1
      }
    } else {
      break
    }
  }

  //Make sure pivot is at start
  return partitionStartLessThan(
    d, axis, 
    start, mid, boxes, ids,
    boxes[elemSize*mid+axis])
}

/***/ }),

/***/ "../../game/noa/node_modules/box-intersect/lib/partition.js":
/*!******************************************************************!*\
  !*** ../../game/noa/node_modules/box-intersect/lib/partition.js ***!
  \******************************************************************/
/***/ ((module) => {

"use strict";


module.exports = genPartition

var code = 'for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var _;if($)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m'

function genPartition(predicate, args) {
  var fargs ='abcdef'.split('').concat(args)
  var reads = []
  if(predicate.indexOf('lo') >= 0) {
    reads.push('lo=e[k+n]')
  }
  if(predicate.indexOf('hi') >= 0) {
    reads.push('hi=e[k+o]')
  }
  fargs.push(
    code.replace('_', reads.join())
        .replace('$', predicate))
  return Function.apply(void 0, fargs)
}

/***/ }),

/***/ "../../game/noa/node_modules/box-intersect/lib/sort.js":
/*!*************************************************************!*\
  !*** ../../game/noa/node_modules/box-intersect/lib/sort.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


//This code is extracted from ndarray-sort
//It is inlined here as a temporary workaround

module.exports = wrapper;

var INSERT_SORT_CUTOFF = 32

function wrapper(data, n0) {
  if (n0 <= 4*INSERT_SORT_CUTOFF) {
    insertionSort(0, n0 - 1, data);
  } else {
    quickSort(0, n0 - 1, data);
  }
}

function insertionSort(left, right, data) {
  var ptr = 2*(left+1)
  for(var i=left+1; i<=right; ++i) {
    var a = data[ptr++]
    var b = data[ptr++]
    var j = i
    var jptr = ptr-2
    while(j-- > left) {
      var x = data[jptr-2]
      var y = data[jptr-1]
      if(x < a) {
        break
      } else if(x === a && y < b) {
        break
      }
      data[jptr]   = x
      data[jptr+1] = y
      jptr -= 2
    }
    data[jptr]   = a
    data[jptr+1] = b
  }
}

function swap(i, j, data) {
  i *= 2
  j *= 2
  var x = data[i]
  var y = data[i+1]
  data[i] = data[j]
  data[i+1] = data[j+1]
  data[j] = x
  data[j+1] = y
}

function move(i, j, data) {
  i *= 2
  j *= 2
  data[i] = data[j]
  data[i+1] = data[j+1]
}

function rotate(i, j, k, data) {
  i *= 2
  j *= 2
  k *= 2
  var x = data[i]
  var y = data[i+1]
  data[i] = data[j]
  data[i+1] = data[j+1]
  data[j] = data[k]
  data[j+1] = data[k+1]
  data[k] = x
  data[k+1] = y
}

function shufflePivot(i, j, px, py, data) {
  i *= 2
  j *= 2
  data[i] = data[j]
  data[j] = px
  data[i+1] = data[j+1]
  data[j+1] = py
}

function compare(i, j, data) {
  i *= 2
  j *= 2
  var x = data[i],
      y = data[j]
  if(x < y) {
    return false
  } else if(x === y) {
    return data[i+1] > data[j+1]
  }
  return true
}

function comparePivot(i, y, b, data) {
  i *= 2
  var x = data[i]
  if(x < y) {
    return true
  } else if(x === y) {
    return data[i+1] < b
  }
  return false
}

function quickSort(left, right, data) {
  var sixth = (right - left + 1) / 6 | 0, 
      index1 = left + sixth, 
      index5 = right - sixth, 
      index3 = left + right >> 1, 
      index2 = index3 - sixth, 
      index4 = index3 + sixth, 
      el1 = index1, 
      el2 = index2, 
      el3 = index3, 
      el4 = index4, 
      el5 = index5, 
      less = left + 1, 
      great = right - 1, 
      tmp = 0
  if(compare(el1, el2, data)) {
    tmp = el1
    el1 = el2
    el2 = tmp
  }
  if(compare(el4, el5, data)) {
    tmp = el4
    el4 = el5
    el5 = tmp
  }
  if(compare(el1, el3, data)) {
    tmp = el1
    el1 = el3
    el3 = tmp
  }
  if(compare(el2, el3, data)) {
    tmp = el2
    el2 = el3
    el3 = tmp
  }
  if(compare(el1, el4, data)) {
    tmp = el1
    el1 = el4
    el4 = tmp
  }
  if(compare(el3, el4, data)) {
    tmp = el3
    el3 = el4
    el4 = tmp
  }
  if(compare(el2, el5, data)) {
    tmp = el2
    el2 = el5
    el5 = tmp
  }
  if(compare(el2, el3, data)) {
    tmp = el2
    el2 = el3
    el3 = tmp
  }
  if(compare(el4, el5, data)) {
    tmp = el4
    el4 = el5
    el5 = tmp
  }

  var pivot1X = data[2*el2]
  var pivot1Y = data[2*el2+1]
  var pivot2X = data[2*el4]
  var pivot2Y = data[2*el4+1]

  var ptr0 = 2 * el1;
  var ptr2 = 2 * el3;
  var ptr4 = 2 * el5;
  var ptr5 = 2 * index1;
  var ptr6 = 2 * index3;
  var ptr7 = 2 * index5;
  for (var i1 = 0; i1 < 2; ++i1) {
    var x = data[ptr0+i1];
    var y = data[ptr2+i1];
    var z = data[ptr4+i1];
    data[ptr5+i1] = x;
    data[ptr6+i1] = y;
    data[ptr7+i1] = z;
  }

  move(index2, left, data)
  move(index4, right, data)
  for (var k = less; k <= great; ++k) {
    if (comparePivot(k, pivot1X, pivot1Y, data)) {
      if (k !== less) {
        swap(k, less, data)
      }
      ++less;
    } else {
      if (!comparePivot(k, pivot2X, pivot2Y, data)) {
        while (true) {
          if (!comparePivot(great, pivot2X, pivot2Y, data)) {
            if (--great < k) {
              break;
            }
            continue;
          } else {
            if (comparePivot(great, pivot1X, pivot1Y, data)) {
              rotate(k, less, great, data)
              ++less;
              --great;
            } else {
              swap(k, great, data)
              --great;
            }
            break;
          }
        }
      }
    }
  }
  shufflePivot(left, less-1, pivot1X, pivot1Y, data)
  shufflePivot(right, great+1, pivot2X, pivot2Y, data)
  if (less - 2 - left <= INSERT_SORT_CUTOFF) {
    insertionSort(left, less - 2, data);
  } else {
    quickSort(left, less - 2, data);
  }
  if (right - (great + 2) <= INSERT_SORT_CUTOFF) {
    insertionSort(great + 2, right, data);
  } else {
    quickSort(great + 2, right, data);
  }
  if (great - less <= INSERT_SORT_CUTOFF) {
    insertionSort(less, great, data);
  } else {
    quickSort(less, great, data);
  }
}

/***/ }),

/***/ "../../game/noa/node_modules/box-intersect/lib/sweep.js":
/*!**************************************************************!*\
  !*** ../../game/noa/node_modules/box-intersect/lib/sweep.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = {
  init:           sqInit,
  sweepBipartite: sweepBipartite,
  sweepComplete:  sweepComplete,
  scanBipartite:  scanBipartite,
  scanComplete:   scanComplete
}

var pool  = __webpack_require__(/*! @jpweeks/typedarray-pool */ "../../game/noa/node_modules/@jpweeks/typedarray-pool/pool.js")
var bits  = __webpack_require__(/*! bit-twiddle */ "../../game/noa/node_modules/bit-twiddle/twiddle.js")
var isort = __webpack_require__(/*! ./sort */ "../../game/noa/node_modules/box-intersect/lib/sort.js")

//Flag for blue
var BLUE_FLAG = (1<<28)

//1D sweep event queue stuff (use pool to save space)
var INIT_CAPACITY      = 1024
var RED_SWEEP_QUEUE    = pool.mallocInt32(INIT_CAPACITY)
var RED_SWEEP_INDEX    = pool.mallocInt32(INIT_CAPACITY)
var BLUE_SWEEP_QUEUE   = pool.mallocInt32(INIT_CAPACITY)
var BLUE_SWEEP_INDEX   = pool.mallocInt32(INIT_CAPACITY)
var COMMON_SWEEP_QUEUE = pool.mallocInt32(INIT_CAPACITY)
var COMMON_SWEEP_INDEX = pool.mallocInt32(INIT_CAPACITY)
var SWEEP_EVENTS       = pool.mallocDouble(INIT_CAPACITY * 8)

//Reserves memory for the 1D sweep data structures
function sqInit(count) {
  var rcount = bits.nextPow2(count)
  if(RED_SWEEP_QUEUE.length < rcount) {
    pool.free(RED_SWEEP_QUEUE)
    RED_SWEEP_QUEUE = pool.mallocInt32(rcount)
  }
  if(RED_SWEEP_INDEX.length < rcount) {
    pool.free(RED_SWEEP_INDEX)
    RED_SWEEP_INDEX = pool.mallocInt32(rcount)
  }
  if(BLUE_SWEEP_QUEUE.length < rcount) {
    pool.free(BLUE_SWEEP_QUEUE)
    BLUE_SWEEP_QUEUE = pool.mallocInt32(rcount)
  }
  if(BLUE_SWEEP_INDEX.length < rcount) {
    pool.free(BLUE_SWEEP_INDEX)
    BLUE_SWEEP_INDEX = pool.mallocInt32(rcount)
  }
  if(COMMON_SWEEP_QUEUE.length < rcount) {
    pool.free(COMMON_SWEEP_QUEUE)
    COMMON_SWEEP_QUEUE = pool.mallocInt32(rcount)
  }
  if(COMMON_SWEEP_INDEX.length < rcount) {
    pool.free(COMMON_SWEEP_INDEX)
    COMMON_SWEEP_INDEX = pool.mallocInt32(rcount)
  }
  var eventLength = 8 * rcount
  if(SWEEP_EVENTS.length < eventLength) {
    pool.free(SWEEP_EVENTS)
    SWEEP_EVENTS = pool.mallocDouble(eventLength)
  }
}

//Remove an item from the active queue in O(1)
function sqPop(queue, index, count, item) {
  var idx = index[item]
  var top = queue[count-1]
  queue[idx] = top
  index[top] = idx
}

//Insert an item into the active queue in O(1)
function sqPush(queue, index, count, item) {
  queue[count] = item
  index[item]  = count
}

//Recursion base case: use 1D sweep algorithm
function sweepBipartite(
    d, visit,
    redStart,  redEnd, red, redIndex,
    blueStart, blueEnd, blue, blueIndex) {

  //store events as pairs [coordinate, idx]
  //
  //  red create:  -(idx+1)
  //  red destroy: idx
  //  blue create: -(idx+BLUE_FLAG)
  //  blue destroy: idx+BLUE_FLAG
  //
  var ptr      = 0
  var elemSize = 2*d
  var istart   = d-1
  var iend     = elemSize-1

  for(var i=redStart; i<redEnd; ++i) {
    var idx = redIndex[i]
    var redOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = red[redOffset+istart]
    SWEEP_EVENTS[ptr++] = -(idx+1)
    SWEEP_EVENTS[ptr++] = red[redOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }

  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = blueIndex[i]+BLUE_FLAG
    var blueOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart]
    SWEEP_EVENTS[ptr++] = -idx
    SWEEP_EVENTS[ptr++] = blue[blueOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }

  //process events from left->right
  var n = ptr >>> 1
  isort(SWEEP_EVENTS, n)
  
  var redActive  = 0
  var blueActive = 0
  for(var i=0; i<n; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0
    if(e >= BLUE_FLAG) {
      //blue destroy event
      e = (e-BLUE_FLAG)|0
      sqPop(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive--, e)
    } else if(e >= 0) {
      //red destroy event
      sqPop(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive--, e)
    } else if(e <= -BLUE_FLAG) {
      //blue create event
      e = (-e-BLUE_FLAG)|0
      for(var j=0; j<redActive; ++j) {
        var retval = visit(RED_SWEEP_QUEUE[j], e)
        if(retval !== void 0) {
          return retval
        }
      }
      sqPush(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive++, e)
    } else {
      //red create event
      e = (-e-1)|0
      for(var j=0; j<blueActive; ++j) {
        var retval = visit(e, BLUE_SWEEP_QUEUE[j])
        if(retval !== void 0) {
          return retval
        }
      }
      sqPush(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive++, e)
    }
  }
}

//Complete sweep
function sweepComplete(d, visit, 
  redStart, redEnd, red, redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var ptr      = 0
  var elemSize = 2*d
  var istart   = d-1
  var iend     = elemSize-1

  for(var i=redStart; i<redEnd; ++i) {
    var idx = (redIndex[i]+1)<<1
    var redOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = red[redOffset+istart]
    SWEEP_EVENTS[ptr++] = -idx
    SWEEP_EVENTS[ptr++] = red[redOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }

  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = (blueIndex[i]+1)<<1
    var blueOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart]
    SWEEP_EVENTS[ptr++] = (-idx)|1
    SWEEP_EVENTS[ptr++] = blue[blueOffset+iend]
    SWEEP_EVENTS[ptr++] = idx|1
  }

  //process events from left->right
  var n = ptr >>> 1
  isort(SWEEP_EVENTS, n)
  
  var redActive    = 0
  var blueActive   = 0
  var commonActive = 0
  for(var i=0; i<n; ++i) {
    var e     = SWEEP_EVENTS[2*i+1]|0
    var color = e&1
    if(i < n-1 && (e>>1) === (SWEEP_EVENTS[2*i+3]>>1)) {
      color = 2
      i += 1
    }
    
    if(e < 0) {
      //Create event
      var id = -(e>>1) - 1

      //Intersect with common
      for(var j=0; j<commonActive; ++j) {
        var retval = visit(COMMON_SWEEP_QUEUE[j], id)
        if(retval !== void 0) {
          return retval
        }
      }

      if(color !== 0) {
        //Intersect with red
        for(var j=0; j<redActive; ++j) {
          var retval = visit(RED_SWEEP_QUEUE[j], id)
          if(retval !== void 0) {
            return retval
          }
        }
      }

      if(color !== 1) {
        //Intersect with blue
        for(var j=0; j<blueActive; ++j) {
          var retval = visit(BLUE_SWEEP_QUEUE[j], id)
          if(retval !== void 0) {
            return retval
          }
        }
      }

      if(color === 0) {
        //Red
        sqPush(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive++, id)
      } else if(color === 1) {
        //Blue
        sqPush(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive++, id)
      } else if(color === 2) {
        //Both
        sqPush(COMMON_SWEEP_QUEUE, COMMON_SWEEP_INDEX, commonActive++, id)
      }
    } else {
      //Destroy event
      var id = (e>>1) - 1
      if(color === 0) {
        //Red
        sqPop(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive--, id)
      } else if(color === 1) {
        //Blue
        sqPop(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive--, id)
      } else if(color === 2) {
        //Both
        sqPop(COMMON_SWEEP_QUEUE, COMMON_SWEEP_INDEX, commonActive--, id)
      }
    }
  }
}

//Sweep and prune/scanline algorithm:
//  Scan along axis, detect intersections
//  Brute force all boxes along axis
function scanBipartite(
  d, axis, visit, flip,
  redStart,  redEnd, red, redIndex,
  blueStart, blueEnd, blue, blueIndex) {
  
  var ptr      = 0
  var elemSize = 2*d
  var istart   = axis
  var iend     = axis+d

  var redShift  = 1
  var blueShift = 1
  if(flip) {
    blueShift = BLUE_FLAG
  } else {
    redShift  = BLUE_FLAG
  }

  for(var i=redStart; i<redEnd; ++i) {
    var idx = i + redShift
    var redOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = red[redOffset+istart]
    SWEEP_EVENTS[ptr++] = -idx
    SWEEP_EVENTS[ptr++] = red[redOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }
  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = i + blueShift
    var blueOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart]
    SWEEP_EVENTS[ptr++] = -idx
  }

  //process events from left->right
  var n = ptr >>> 1
  isort(SWEEP_EVENTS, n)
  
  var redActive    = 0
  for(var i=0; i<n; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0
    if(e < 0) {
      var idx   = -e
      var isRed = false
      if(idx >= BLUE_FLAG) {
        isRed = !flip
        idx -= BLUE_FLAG 
      } else {
        isRed = !!flip
        idx -= 1
      }
      if(isRed) {
        sqPush(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive++, idx)
      } else {
        var blueId  = blueIndex[idx]
        var bluePtr = elemSize * idx
        
        var b0 = blue[bluePtr+axis+1]
        var b1 = blue[bluePtr+axis+1+d]

red_loop:
        for(var j=0; j<redActive; ++j) {
          var oidx   = RED_SWEEP_QUEUE[j]
          var redPtr = elemSize * oidx

          if(b1 < red[redPtr+axis+1] || 
             red[redPtr+axis+1+d] < b0) {
            continue
          }

          for(var k=axis+2; k<d; ++k) {
            if(blue[bluePtr + k + d] < red[redPtr + k] || 
               red[redPtr + k + d] < blue[bluePtr + k]) {
              continue red_loop
            }
          }

          var redId  = redIndex[oidx]
          var retval
          if(flip) {
            retval = visit(blueId, redId)
          } else {
            retval = visit(redId, blueId)
          }
          if(retval !== void 0) {
            return retval 
          }
        }
      }
    } else {
      sqPop(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive--, e - redShift)
    }
  }
}

function scanComplete(
  d, axis, visit,
  redStart,  redEnd, red, redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var ptr      = 0
  var elemSize = 2*d
  var istart   = axis
  var iend     = axis+d

  for(var i=redStart; i<redEnd; ++i) {
    var idx = i + BLUE_FLAG
    var redOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = red[redOffset+istart]
    SWEEP_EVENTS[ptr++] = -idx
    SWEEP_EVENTS[ptr++] = red[redOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }
  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = i + 1
    var blueOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart]
    SWEEP_EVENTS[ptr++] = -idx
  }

  //process events from left->right
  var n = ptr >>> 1
  isort(SWEEP_EVENTS, n)
  
  var redActive    = 0
  for(var i=0; i<n; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0
    if(e < 0) {
      var idx   = -e
      if(idx >= BLUE_FLAG) {
        RED_SWEEP_QUEUE[redActive++] = idx - BLUE_FLAG
      } else {
        idx -= 1
        var blueId  = blueIndex[idx]
        var bluePtr = elemSize * idx

        var b0 = blue[bluePtr+axis+1]
        var b1 = blue[bluePtr+axis+1+d]

red_loop:
        for(var j=0; j<redActive; ++j) {
          var oidx   = RED_SWEEP_QUEUE[j]
          var redId  = redIndex[oidx]

          if(redId === blueId) {
            break
          }

          var redPtr = elemSize * oidx
          if(b1 < red[redPtr+axis+1] || 
            red[redPtr+axis+1+d] < b0) {
            continue
          }
          for(var k=axis+2; k<d; ++k) {
            if(blue[bluePtr + k + d] < red[redPtr + k] || 
               red[redPtr + k + d]   < blue[bluePtr + k]) {
              continue red_loop
            }
          }

          var retval = visit(redId, blueId)
          if(retval !== void 0) {
            return retval 
          }
        }
      }
    } else {
      var idx = e - BLUE_FLAG
      for(var j=redActive-1; j>=0; --j) {
        if(RED_SWEEP_QUEUE[j] === idx) {
          for(var k=j+1; k<redActive; ++k) {
            RED_SWEEP_QUEUE[k-1] = RED_SWEEP_QUEUE[k]
          }
          break
        }
      }
      --redActive
    }
  }
}

/***/ }),

/***/ "../../game/noa/node_modules/dup/dup.js":
/*!**********************************************!*\
  !*** ../../game/noa/node_modules/dup/dup.js ***!
  \**********************************************/
/***/ ((module) => {

"use strict";


function dupe_array(count, value, i) {
  var c = count[i]|0
  if(c <= 0) {
    return []
  }
  var result = new Array(c), j
  if(i === count.length-1) {
    for(j=0; j<c; ++j) {
      result[j] = value
    }
  } else {
    for(j=0; j<c; ++j) {
      result[j] = dupe_array(count, value, i+1)
    }
  }
  return result
}

function dupe_number(count, value) {
  var result, i
  result = new Array(count)
  for(i=0; i<count; ++i) {
    result[i] = value
  }
  return result
}

function dupe(count, value) {
  if(typeof value === "undefined") {
    value = 0
  }
  switch(typeof count) {
    case "number":
      if(count > 0) {
        return dupe_number(count|0, value)
      }
    break
    case "object":
      if(typeof (count.length) === "number") {
        return dupe_array(count, value, 0)
      }
    break
  }
  return []
}

module.exports = dupe

/***/ }),

/***/ "../../game/noa/node_modules/ent-comp/src/ECS.js":
/*!*******************************************************!*\
  !*** ../../game/noa/node_modules/ent-comp/src/ECS.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = ECS
var DataStore = __webpack_require__(/*! ./dataStore */ "../../game/noa/node_modules/ent-comp/src/dataStore.js")



/*!
 * ent-comp: a light, *fast* Entity Component System in JS
 * @url      github.com/andyhall/ent-comp
 * @author   Andy Hall <andy@fenomas.com>
 * @license  MIT
*/



/**
 * Constructor for a new entity-component-system manager.
 * 
 * ```js
 * var ECS = require('ent-comp')
 * var ecs = new ECS()
 * ```
 * @class
 * @constructor
 * @exports ECS
 * @typicalname ecs
*/

function ECS() {
	var self = this

	/** 
	 * Hash of component definitions. Also aliased to `comps`.
	 * 
	 * ```js
	 * var comp = { name: 'foo' }
	 * ecs.createComponent(comp)
	 * ecs.components['foo'] === comp  // true
	 * ecs.comps['foo']                // same
	 * ```
	*/
	this.components = {}
	this.comps = this.components



	/*
	 * 
	 * 		internal properties:
	 * 
	*/

	var components = this.components

	// counter for entity IDs
	var UID = 1

	// Storage for all component state data:
	// storage['component-name'] = DataStore instance
	var storage = {}

	// flat arrays of names of components with systems
	var systems = []
	var renderSystems = []

	// flags and arrays for deferred cleanup of removed stuff
	var deferrals = {
		timeout: false,
		removals: [],
		multiComps: [],
	}

	// expose references to internals for debugging or hacking
	this._storage = storage
	this._systems = systems
	this._renderSystems = renderSystems





	/*
	 * 
	 * 
	 * 				Public API
	 * 
	 * 
	*/




	/**
	 * Creates a new entity id (currently just an incrementing integer).
	 * 
	 * Optionally takes a list of component names to add to the entity (with default state data).
	 * 
	 * ```js
	 * var id1 = ecs.createEntity()
	 * var id2 = ecs.createEntity([ 'some-component', 'other-component' ])
	 * ```
	*/
	this.createEntity = function (compList) {
		var id = UID++
		if (Array.isArray(compList)) {
			compList.forEach(compName => self.addComponent(id, compName))
		}
		return id
	}



	/**
	 * Deletes an entity, which in practice means removing all its components.
	 * 
	 * ```js
	 * ecs.deleteEntity(id)
	 * ```
	*/
	this.deleteEntity = function (entID) {
		// loop over all components and maybe remove them
		// this avoids needing to keep a list of components-per-entity
		Object.keys(storage).forEach(compName => {
			var data = storage[compName]
			if (data.hash[entID]) {
				removeComponent(entID, compName)
			}
		})
		return self
	}







	/**
	 * Creates a new component from a definition object. 
	 * The definition must have a `name`; all other properties are optional.
	 * 
	 * Returns the component name, to make it easy to grab when the component
	 * is being `require`d from a module.
	 * 
	 * ```js
	 * var comp = {
	 * 	 name: 'some-unique-string',
	 * 	 state: {},
	 * 	 order: 99,
	 * 	 multi: false,
	 * 	 onAdd:        (id, state) => { },
	 * 	 onRemove:     (id, state) => { },
	 * 	 system:       (dt, states) => { },
	 * 	 renderSystem: (dt, states) => { },
	 * }
	 * 
	 * var name = ecs.createComponent( comp )
	 * // name == 'some-unique-string'
	 * ```
	 * 
	 * Note the `multi` flag - for components where this is true, a given 
	 * entity can have multiple state objects for that component.
	 * For multi-components, APIs that would normally return a state object 
	 * (like `getState`) will instead return an array of them.
	*/
	this.createComponent = function (compDefn) {
		if (!compDefn) throw 'Missing component definition'
		var name = compDefn.name
		if (!name) throw 'Component definition must have a name property.'
		if (typeof name !== 'string') throw 'Component name must be a string.'
		if (name === '') throw 'Component name must be a non-empty string.'
		if (storage[name]) throw `Component ${name} already exists.`

		// rebuild definition object for monomorphism
		var internalDef = {}
		internalDef.name = name
		internalDef.multi = !!compDefn.multi
		internalDef.order = isNaN(compDefn.order) ? 99 : compDefn.order
		internalDef.state = compDefn.state || {}
		internalDef.onAdd = compDefn.onAdd || null
		internalDef.onRemove = compDefn.onRemove || null
		internalDef.system = compDefn.system || null
		internalDef.renderSystem = compDefn.renderSystem || null

		components[name] = internalDef
		storage[name] = new DataStore()
		storage[name]._pendingMultiCleanup = false
		storage[name]._multiCleanupIDs = (internalDef.multi) ? [] : null

		if (internalDef.system) {
			systems.push(name)
			systems.sort((a, b) => components[a].order - components[b].order)
		}
		if (internalDef.renderSystem) {
			renderSystems.push(name)
			renderSystems.sort((a, b) => components[a].order - components[b].order)
		}

		return name
	}





	/**
	 * Deletes the component definition with the given name. 
	 * First removes the component from all entities that have it.
	 * 
	 * **Note:** This API shouldn't be necessary in most real-world usage - 
	 * you should set up all your components during init and then leave them be.
	 * But it's useful if, say, you receive an ECS from another library and 
	 * you need to replace its components.
	 * 
	 * ```js
	 * ecs.deleteComponent( 'some-component' )
	 * ```
	*/
	this.deleteComponent = function (compName) {
		var data = storage[compName]
		if (!data) throw `Unknown component: ${compName}`

		data.flush()
		data.list.forEach(obj => {
			if (!obj) return
			var id = obj.__id || obj[0].__id
			removeComponent(id, compName)
		})

		var i = systems.indexOf(compName)
		var j = renderSystems.indexOf(compName)
		if (i > -1) systems.splice(i, 1)
		if (j > -1) renderSystems.splice(j, 1)

		storage[compName].dispose()
		delete storage[compName]
		delete components[compName]

		return self
	}




	/**
	 * Adds a component to an entity, optionally initializing the state object.
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: 'foo',
	 * 	state: { val: 1 }
	 * })
	 * ecs.addComponent(id1, 'foo')             // use default state
	 * ecs.addComponent(id2, 'foo', { val:2 })  // pass in state data
	 * ```
	*/
	this.addComponent = function (entID, compName, state) {
		var def = components[compName]
		var data = storage[compName]
		if (!data) throw `Unknown component: ${compName}.`

		// treat adding an existing (non-multi-) component as an error
		if (data.hash[entID] && !def.multi) {
			throw `Entity ${entID} already has component: ${compName}.`
		}

		// create new component state object for this entity
		var newState = Object.assign({}, { __id: entID }, def.state, state)

		// just in case passed-in state object had an __id property
		newState.__id = entID

		// add to data store - for multi components, may already be present
		if (def.multi) {
			var statesArr = data.hash[entID]
			if (!statesArr) {
				statesArr = []
				data.add(entID, statesArr)
			}
			statesArr.push(newState)
		} else {
			data.add(entID, newState)
		}

		// call handler and return
		if (def.onAdd) def.onAdd(entID, newState)

		return this
	}



	/**
	 * Checks if an entity has a component.
	 * 
	 * ```js
	 * ecs.addComponent(id, 'foo')
	 * ecs.hasComponent(id, 'foo')       // true
	 * ```
	*/

	this.hasComponent = function (entID, compName) {
		var data = storage[compName]
		if (!data) throw `Unknown component: ${compName}.`
		return !!data.hash[entID]
	}





	/**
	 * Removes a component from an entity, triggering the component's 
	 * `onRemove` handler, and then deleting any state data.
	 * 
	 * ```js
	 * ecs.removeComponent(id, 'foo')
	 * ecs.hasComponent(id, 'foo')     	 // false
	 * ```
	*/
	this.removeComponent = function (entID, compName) {
		var data = storage[compName]
		if (!data) throw `Unknown component: ${compName}.`

		// removal implementations at end
		removeComponent(entID, compName)

		return self
	}





	/**
	 * Get the component state for a given entity.
	 * It will automatically have an `__id` property for the entity id.
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: 'foo',
	 * 	state: { val: 0 }
	 * })
	 * ecs.addComponent(id, 'foo')
	 * ecs.getState(id, 'foo').val       // 0
	 * ecs.getState(id, 'foo').__id      // equals id
	 * ```
	*/

	this.getState = function (entID, compName) {
		var data = storage[compName]
		if (!data) throw `Unknown component: ${compName}.`
		return data.hash[entID]
	}




	/**
	 * Get an array of state objects for every entity with the given component. 
	 * Each one will have an `__id` property for the entity id it refers to.
	 * Don't add or remove elements from the returned list!
	 * 
	 * ```js
	 * var arr = ecs.getStatesList('foo')
	 * // returns something shaped like:
	 * //   [
	 * //     {__id:0, x:1},
	 * //     {__id:7, x:2},
	 * //   ]
	 * ```  
	*/

	this.getStatesList = function (compName) {
		var data = storage[compName]
		if (!data) throw `Unknown component: ${compName}.`
		doDeferredCleanup(data)
		return data.list
	}




	/**
	 * Makes a `getState`-like accessor bound to a given component. 
	 * The accessor is faster than `getState`, so you may want to create 
	 * an accessor for any component you'll be accessing a lot.
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: 'size',
	 * 	state: { val: 0 }
	 * })
	 * var getEntitySize = ecs.getStateAccessor('size')
	 * // ...
	 * ecs.addComponent(id, 'size', { val:123 })
	 * getEntitySize(id).val      // 123
	 * ```  
	*/

	this.getStateAccessor = function (compName) {
		if (!storage[compName]) throw `Unknown component: ${compName}.`
		var hash = storage[compName].hash
		return (id) => hash[id]
	}




	/**
	 * Makes a `hasComponent`-like accessor function bound to a given component. 
	 * The accessor is much faster than `hasComponent`.
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: 'foo',
	 * })
	 * var hasFoo = ecs.getComponentAccessor('foo')
	 * // ...
	 * ecs.addComponent(id, 'foo')
	 * hasFoo(id) // true
	 * ```  
	*/

	this.getComponentAccessor = function (compName) {
		if (!storage[compName]) throw `Unknown component: ${compName}.`
		var hash = storage[compName].hash
		return (id) => !!hash[id]
	}





	/**
	 * Tells the ECS that a game tick has occurred, causing component 
	 * `system` functions to get called.
	 * 
	 * The optional parameter simply gets passed to the system functions. 
	 * It's meant to be a timestep, but can be used (or not used) as you like.    
	 * 
	 * If components have an `order` property, they'll get called in that order
	 * (lowest to highest). Component order defaults to `99`.
	 * ```js
	 * ecs.createComponent({
	 * 	name: foo,
	 * 	order: 1,
	 * 	system: function(dt, states) {
	 * 		// states is the same array you'd get from #getStatesList()
	 * 		states.forEach(state => {
	 * 			console.log('Entity ID: ', state.__id)
	 * 		})
	 * 	}
	 * })
	 * ecs.tick(30) // triggers log statements
	 * ```
	*/

	this.tick = function (dt) {
		doDeferredCleanup()
		for (var i = 0; i < systems.length; i++) {
			var compName = systems[i]
			var comp = components[compName]
			var data = storage[compName]
			comp.system(dt, data.list)
			doDeferredCleanup()
		}
		return self
	}



	/**
	 * Functions exactly like `tick`, but calls `renderSystem` functions.
	 * this effectively gives you a second set of systems that are 
	 * called with separate timing, in case you want to 
	 * [tick and render in separate loops](http://gafferongames.com/game-physics/fix-your-timestep/)
	 * (which you should!).
	 * 
	 * ```js
	 * ecs.createComponent({
	 * 	name: foo,
	 * 	order: 5,
	 * 	renderSystem: function(dt, states) {
	 * 		// states is the same array you'd get from #getStatesList()
	 * 	}
	 * })
	 * ecs.render(1000/60)
	 * ```
	*/

	this.render = function (dt) {
		doDeferredCleanup()
		for (var i = 0; i < renderSystems.length; i++) {
			var compName = renderSystems[i]
			var comp = components[compName]
			var data = storage[compName]
			comp.renderSystem(dt, data.list)
			doDeferredCleanup()
		}
		return self
	}




	/**
	 * Removes one particular instance of a multi-component.
	 * To avoid breaking loops, the relevant state object will get nulled
	 * immediately, and spliced from the states array later when safe 
	 * (after the current tick/render/animationFrame).
	 * 
	 * ```js
	 * // where component 'foo' is a multi-component
	 * ecs.getState(id, 'foo')   // [ state1, state2, state3 ]
	 * ecs.removeMultiComponent(id, 'foo', 1)
	 * ecs.getState(id, 'foo')   // [ state1, null, state3 ]
	 * // one JS event loop later...
	 * ecs.getState(id, 'foo')   // [ state1, state3 ]
	 * ```
	 */
	this.removeMultiComponent = function (entID, compName, index) {
		var def = components[compName]
		var data = storage[compName]
		if (!data) throw `Unknown component: ${compName}.`
		if (!def.multi) throw 'removeMultiComponent called on non-multi component'

		// removal implementations at end
		removeMultiCompElement(entID, def, data, index)

		return self
	}













	/*
	 * 
	 * 
	 *		internal implementations of remove/delete operations
	 * 		a bit hairy due to deferred cleanup, etc.
	 * 
	 * 
	*/


	// remove given component from an entity
	function removeComponent(entID, compName) {
		var def = components[compName]
		var data = storage[compName]

		// fail silently on all cases where removal target isn't present,
		// since multiple pieces of logic often remove/delete simultaneously
		var state = data.hash[entID]
		if (!state) return

		// null out data now, so overlapped remove events won't fire
		data.remove(entID)

		// call onRemove handler - on each instance for multi components
		if (def.onRemove) {
			if (def.multi) {
				state.forEach(state => {
					if (state) def.onRemove(entID, state)
				})
				state.length = 0
			} else {
				def.onRemove(entID, state)
			}
		}

		deferrals.removals.push(data)
		pingDeferrals()
	}


	// remove one state from a multi component
	function removeMultiCompElement(entID, def, data, index) {
		// if statesArr isn't present there's no work or cleanup to do
		var statesArr = data.hash[entID]
		if (!statesArr) return

		// as above, ignore cases where removal target doesn't exist
		var state = statesArr[index]
		if (!state) return

		// null out element and fire event
		statesArr[index] = null
		if (def.onRemove) def.onRemove(entID, state)

		deferrals.multiComps.push({ entID, data })
		pingDeferrals()
	}







	// rigging
	function pingDeferrals() {
		if (deferrals.timeout) return
		deferrals.timeout = true
		setTimeout(deferralHandler, 1)
	}

	function deferralHandler() {
		deferrals.timeout = false
		doDeferredCleanup()
	}


	/*
	 * 
	 *		general handling for deferred data cleanup
	 * 			- removes null states if component is multi
	 * 			- removes null entries from component dataStore
	 * 		should be called at safe times - not during state loops
	 * 
	*/

	function doDeferredCleanup() {
		if (deferrals.multiComps.length) {
			deferredMultiCompCleanup(deferrals.multiComps)
		}
		if (deferrals.removals.length) {
			deferredComponentCleanup(deferrals.removals)
		}
	}

	// removes null elements from multi-comp state arrays
	function deferredMultiCompCleanup(list) {
		for (var i = 0; i < list.length; i++) {
			var { entID, data } = list[i]
			var statesArr = data.hash[entID]
			if (!statesArr) continue
			for (var j = 0; j < statesArr.length; j++) {
				if (statesArr[j]) continue
				statesArr.splice(j, 1)
				j--
			}
			// if this leaves the states list empty, remove the whole component
			if (statesArr.length === 0) {
				data.remove(entID)
				deferrals.removals.push(data)
			}
		}
		list.length = 0
	}

	// flushes dataStore after components have been removed
	function deferredComponentCleanup(list) {
		for (var i = 0; i < list.length; i++) {
			var data = list[i]
			data.flush()
		}
		list.length = 0
	}



}



/***/ }),

/***/ "../../game/noa/node_modules/ent-comp/src/dataStore.js":
/*!*************************************************************!*\
  !*** ../../game/noa/node_modules/ent-comp/src/dataStore.js ***!
  \*************************************************************/
/***/ ((module) => {



/*
 * 
 *      Encapsulates (mostly) a collection of objects, 
 *      exposed both as a hash and as an array
 *      _map maps hash id to list index
 * 
 *      Note this is a dumb store, it doesn't check any inputs at all.
 *      It also assumes every stored data object is stored like:
 *          dataStore.add(37, {__id:37} )
 * 
*/


module.exports = class DataStore {

    constructor() {
        this.list = []
        this.hash = {}
        this._map = {}
        this._pendingRemovals = []
    }


    // add a new state object
    add(id, stateObject) {
        if (typeof this._map[id] === 'number') {
            // this happens if id is removed/readded without flushing
            var index = this._map[id]
            this.hash[id] = stateObject
            this.list[index] = stateObject
        } else {
            this._map[id] = this.list.length
            this.hash[id] = stateObject
            this.list.push(stateObject)
        }
    }


    // remove - nulls the state object, actual removal comes later
    remove(id) {
        var index = this._map[id]
        this.hash[id] = null
        this.list[index] = null
        this._pendingRemovals.push(id)
    }


    // just sever references
    dispose() {
        this.list = null
        this.hash = null
        this._map = null
        this._pendingRemovals.length = 0
    }


    // deletes removed objects from data structures
    flush() {
        for (var i = 0; i < this._pendingRemovals.length; i++) {
            var id = this._pendingRemovals[i]
            // removal might have been reversed, or already handled
            if (this.hash[id] !== null) continue
            removeElement(this, id)
        }
        this._pendingRemovals.length = 0
    }

}


/*
 * 
 *      actual remove / cleanup logic, fixes up data structures after removal
 * 
 * 
*/


function removeElement(data, id) {
    // current location of this element in the list
    var index = data._map[id]
    // for hash and map, just delete by id
    delete data.hash[id]
    delete data._map[id]
    // now splice - either by popping or by swapping with final element
    if (index === data.list.length - 1) {
        data.list.pop()
    } else {
        // swap last item with the one we're removing
        var swapped = data.list.pop()
        data.list[index] = swapped
        // need to fix _map for swapped item
        if (swapped === null || swapped[0] === null) {
            // slowest but rarest case - swapped item is ALSO pending removal
            var prevIndex = data.list.length
            for (var swapID in data._map) {
                if (data._map[swapID] === prevIndex) {
                    data._map[swapID] = index
                    return
                }
            }
        } else {
            var swappedID = swapped.__id || swapped[0].__id
            data._map[swappedID] = index
        }
    }
}




/***/ }),

/***/ "../../game/noa/node_modules/events/events.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/events/events.js ***!
  \****************************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "../../game/noa/node_modules/fast-voxel-raycast/index.js":
/*!***************************************************************!*\
  !*** ../../game/noa/node_modules/fast-voxel-raycast/index.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


function traceRay_impl( getVoxel,
	px, py, pz,
	dx, dy, dz,
	max_d, hit_pos, hit_norm) {
	
	// consider raycast vector to be parametrized by t
	//   vec = [px,py,pz] + t * [dx,dy,dz]
	
	// algo below is as described by this paper:
	// http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf
	
	var t = 0.0
		, floor = Math.floor
		, ix = floor(px) | 0
		, iy = floor(py) | 0
		, iz = floor(pz) | 0

		, stepx = (dx > 0) ? 1 : -1
		, stepy = (dy > 0) ? 1 : -1
		, stepz = (dz > 0) ? 1 : -1
		
	// dx,dy,dz are already normalized
		, txDelta = Math.abs(1 / dx)
		, tyDelta = Math.abs(1 / dy)
		, tzDelta = Math.abs(1 / dz)

		, xdist = (stepx > 0) ? (ix + 1 - px) : (px - ix)
		, ydist = (stepy > 0) ? (iy + 1 - py) : (py - iy)
		, zdist = (stepz > 0) ? (iz + 1 - pz) : (pz - iz)
		
	// location of nearest voxel boundary, in units of t 
		, txMax = (txDelta < Infinity) ? txDelta * xdist : Infinity
		, tyMax = (tyDelta < Infinity) ? tyDelta * ydist : Infinity
		, tzMax = (tzDelta < Infinity) ? tzDelta * zdist : Infinity

		, steppedIndex = -1
	
	// main loop along raycast vector
	while (t <= max_d) {
		
		// exit check
		var b = getVoxel(ix, iy, iz)
		if (b) {
			if (hit_pos) {
				hit_pos[0] = px + t * dx
				hit_pos[1] = py + t * dy
				hit_pos[2] = pz + t * dz
			}
			if (hit_norm) {
				hit_norm[0] = hit_norm[1] = hit_norm[2] = 0
				if (steppedIndex === 0) hit_norm[0] = -stepx
				if (steppedIndex === 1) hit_norm[1] = -stepy
				if (steppedIndex === 2) hit_norm[2] = -stepz
			}
			return b
		}
		
		// advance t to next nearest voxel boundary
		if (txMax < tyMax) {
			if (txMax < tzMax) {
				ix += stepx
				t = txMax
				txMax += txDelta
				steppedIndex = 0
			} else {
				iz += stepz
				t = tzMax
				tzMax += tzDelta
				steppedIndex = 2
			}
		} else {
			if (tyMax < tzMax) {
				iy += stepy
				t = tyMax
				tyMax += tyDelta
				steppedIndex = 1
			} else {
				iz += stepz
				t = tzMax
				tzMax += tzDelta
				steppedIndex = 2
			}
		}

	}
	
	// no voxel hit found
	if (hit_pos) {
		hit_pos[0] = px + t * dx
		hit_pos[1] = py + t * dy
		hit_pos[2] = pz + t * dz
	}
	if (hit_norm) {
		hit_norm[0] = hit_norm[1] = hit_norm[2] = 0
	}

	return 0

}


// conform inputs

function traceRay(getVoxel, origin, direction, max_d, hit_pos, hit_norm) {
	var px = +origin[0]
		, py = +origin[1]
		, pz = +origin[2]
		, dx = +direction[0]
		, dy = +direction[1]
		, dz = +direction[2]
		, ds = Math.sqrt(dx * dx + dy * dy + dz * dz)

	if (ds === 0) {
		throw new Error("Can't raycast along a zero vector")
	}

	dx /= ds
	dy /= ds
	dz /= ds
	if (typeof (max_d) === "undefined") {
		max_d = 64.0
	} else {
		max_d = +max_d
	}
	return traceRay_impl(getVoxel, px, py, pz, dx, dy, dz, max_d, hit_pos, hit_norm)
}

module.exports = traceRay

/***/ }),

/***/ "../../game/noa/node_modules/game-inputs/inputs.js":
/*!*********************************************************!*\
  !*** ../../game/noa/node_modules/game-inputs/inputs.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var vkey = __webpack_require__(/*! vkey */ "../../game/noa/node_modules/vkey/index.js")
var EventEmitter = __webpack_require__(/*! events */ "../../game/noa/node_modules/events/events.js").EventEmitter
// mousewheel polyfill borrowed directly from game-shell
var addMouseWheel = __webpack_require__(/*! ./lib/mousewheel-polyfill.js */ "../../game/noa/node_modules/game-inputs/lib/mousewheel-polyfill.js")

module.exports = function (domElement, options) {
    return new Inputs(domElement, options)
}


/*
 *   Simple inputs manager to abstract key/mouse inputs.
 *        Inspired by (and where applicable stealing code from) 
 *        game-shell: https://github.com/mikolalysenko/game-shell
 *  
 *  inputs.bind( 'move-right', 'D', '<right>' )
 *  inputs.bind( 'move-left',  'A' )
 *  inputs.unbind( 'move-left' )
 *  
 *  inputs.down.on( 'move-right',  function( binding, event ) {})
 *  inputs.up.on(   'move-right',  function( binding, event ) {})
 *
 *  inputs.state['move-right']  // true when corresponding keys are down
 *  inputs.state.dx             // mouse x movement since tick() was last called
 *  inputs.getBindings()        // [ 'move-right', 'move-left', ... ]
*/


function Inputs(element, opts) {

    // settings
    this.element = element || document
    opts = opts || {}
    this.preventDefaults = !!opts.preventDefaults
    this.stopPropagation = !!opts.stopPropagation
    this.allowContextMenu = !!opts.allowContextMenu
    this.disabled = !!opts.disabled

    // emitters
    this.down = new EventEmitter()
    this.up = new EventEmitter()

    // state object to be queried
    this.state = {
        dx: 0, dy: 0,
        scrollx: 0, scrolly: 0, scrollz: 0
    }

    // internal state
    this._keybindmap = {}       // { 'vkeycode' : [ 'binding', 'binding2' ] }
    this._keyStates = {}        // { 'vkeycode' : boolean }
    this._bindPressCounts = {}  // { 'binding' : int }

    // needed to work around a bug in Mac Chrome 75
    // https://bugs.chromium.org/p/chromium/issues/detail?id=977093
    this._ignoreMousemoveOnce = false

    // register for dom events
    this.initEvents()
}


/*
 *
 *   PUBLIC API 
 *
*/

Inputs.prototype.initEvents = function () {
    // keys
    window.addEventListener('keydown', onKeyEvent.bind(undefined, this, true), false)
    window.addEventListener('keyup', onKeyEvent.bind(undefined, this, false), false)
    // mouse buttons
    this.element.addEventListener("mousedown", onMouseEvent.bind(undefined, this, true), false)
    this.element.addEventListener("mouseup", onMouseEvent.bind(undefined, this, false), false)
    this.element.oncontextmenu = onContextMenu.bind(undefined, this)
    // treat dragstart like mouseup - idiotically, mouseup doesn't fire after a drag starts (!)
    this.element.addEventListener("dragstart", onMouseEvent.bind(undefined, this, false), false)
    // touch/mouse movement
    this.element.addEventListener("mousemove", onMouseMove.bind(undefined, this), false)
    this.element.addEventListener("touchmove", onMouseMove.bind(undefined, this), false)
    this.element.addEventListener("touchstart", onTouchStart.bind(undefined, this), false)
    // scroll/mousewheel
    addMouseWheel(this.element, onMouseWheel.bind(undefined, this), false)
    // temp bug workaround, see above
    document.addEventListener("pointerlockchange", onLockChange.bind(undefined, this), false)
    document.addEventListener("mozpointerlockchange", onLockChange.bind(undefined, this), false)
}


// Usage:  bind( bindingName, vkeyCode, vkeyCode.. )
//    Note that inputs._keybindmap maps vkey codes to binding names
//    e.g. this._keybindmap['a'] = 'move-left'
Inputs.prototype.bind = function (binding) {
    for (var i = 1; i < arguments.length; ++i) {
        var vkeyCode = arguments[i]
        var arr = this._keybindmap[vkeyCode] || []
        if (arr.indexOf(binding) == -1) {
            arr.push(binding)
        }
        this._keybindmap[vkeyCode] = arr
    }
    this.state[binding] = !!this.state[binding]
}

// search out and remove all keycodes bound to a given binding
Inputs.prototype.unbind = function (binding) {
    for (var b in this._keybindmap) {
        var arr = this._keybindmap[b]
        var i = arr.indexOf(binding)
        if (i > -1) { arr.splice(i, 1) }
    }
}

// tick function - clears out cumulative mouse movement state variables
Inputs.prototype.tick = function () {
    this.state.dx = this.state.dy = 0
    this.state.scrollx = this.state.scrolly = this.state.scrollz = 0
}



Inputs.prototype.getBoundKeys = function () {
    var arr = []
    for (var b in this._keybindmap) { arr.push(b) }
    return arr
}



/*
 *
 *
 *      INTERNALS - DOM EVENT HANDLERS
 *
 *
*/


function onKeyEvent(inputs, wasDown, ev) {
    handleKeyEvent(ev.keyCode, vkey[ev.keyCode], wasDown, inputs, ev)
}

function onMouseEvent(inputs, wasDown, ev) {
    // simulate a code out of range of vkey
    var keycode = -1 - ev.button
    var vkeycode = '<mouse ' + (ev.button + 1) + '>'
    handleKeyEvent(keycode, vkeycode, wasDown, inputs, ev)
    return false
}

function onContextMenu(inputs) {
    if (!inputs.allowContextMenu) return false
}

function onMouseMove(inputs, ev) {
    // bug workaround, see top of file
    if (inputs._ignoreMousemoveOnce) {
        inputs._ignoreMousemoveOnce = false
        return
    }
    // for now, just populate the state object with mouse movement
    var dx = ev.movementX || ev.mozMovementX || 0,
        dy = ev.movementY || ev.mozMovementY || 0
    // ad-hoc experimental touch support
    if (ev.touches && (dx | dy) === 0) {
        var xy = getTouchMovement(ev)
        dx = xy[0]
        dy = xy[1]
    }
    inputs.state.dx += dx
    inputs.state.dy += dy
}

// experimental - for touch events, extract useful dx/dy
var lastTouchX = 0
var lastTouchY = 0
var lastTouchID = null

function onTouchStart(inputs, ev) {
    var touch = ev.changedTouches[0]
    lastTouchX = touch.clientX
    lastTouchY = touch.clientY
    lastTouchID = touch.identifier
}

function getTouchMovement(ev) {
    var touch
    var touches = ev.changedTouches
    for (var i = 0; i < touches.length; ++i) {
        if (touches[i].identifier == lastTouchID) touch = touches[i]
    }
    if (!touch) return [0, 0]
    var res = [touch.clientX - lastTouchX, touch.clientY - lastTouchY]
    lastTouchX = touch.clientX
    lastTouchY = touch.clientY
    return res
}

function onMouseWheel(inputs, ev) {
    // basically borrowed from game-shell
    var scale = 1
    switch (ev.deltaMode) {
        case 0: scale = 1; break  // Pixel
        case 1: scale = 12; break  // Line
        case 2:  // page
            // TODO: investigate when this happens, what correct handling is
            scale = inputs.element.clientHeight || window.innerHeight
            break
    }
    // accumulate state
    inputs.state.scrollx += ev.deltaX * scale
    inputs.state.scrolly += ev.deltaY * scale
    inputs.state.scrollz += (ev.deltaZ * scale) || 0
    return false
}

function onLockChange(inputs, ev) {
    var locked = document.pointerLockElement
        || document.mozPointerLockElement
        || null
    if (locked) inputs._ignoreMousemoveOnce = true
}




/*
 *
 *
 *   KEY BIND HANDLING
 *
 *
*/


function handleKeyEvent(keycode, vcode, wasDown, inputs, ev) {
    var arr = inputs._keybindmap[vcode]
    // don't prevent defaults if there's no binding
    if (!arr) { return }
    if (inputs.preventDefaults) ev.preventDefault()
    if (inputs.stopPropagation) ev.stopPropagation()

    // if the key's state has changed, handle an event for all bindings
    var currstate = inputs._keyStates[keycode]
    if (XOR(currstate, wasDown)) {
        // for each binding: emit an event, and update cached state information
        for (var i = 0; i < arr.length; ++i) {
            handleBindingEvent(arr[i], wasDown, inputs, ev)
        }
    }
    inputs._keyStates[keycode] = wasDown
}


function handleBindingEvent(binding, wasDown, inputs, ev) {
    // keep count of presses mapped by binding
    // (to handle two keys with the same binding pressed at once)
    var ct = inputs._bindPressCounts[binding] || 0
    ct += wasDown ? 1 : -1
    if (ct < 0) { ct = 0 } // shouldn't happen
    inputs._bindPressCounts[binding] = ct

    // emit event if binding's state has changed
    var currstate = inputs.state[binding]
    if (XOR(currstate, ct)) {
        var emitter = wasDown ? inputs.down : inputs.up
        if (!inputs.disabled) emitter.emit(binding, ev)
    }
    inputs.state[binding] = !!ct
}




/*
 *
 *
 *    HELPERS
 *
 *
*/


// how is this not part of Javascript?
function XOR(a, b) {
    return a ? !b : b
}






/***/ }),

/***/ "../../game/noa/node_modules/game-inputs/lib/mousewheel-polyfill.js":
/*!**************************************************************************!*\
  !*** ../../game/noa/node_modules/game-inputs/lib/mousewheel-polyfill.js ***!
  \**************************************************************************/
/***/ ((module) => {

//Adapted from here: https://developer.mozilla.org/en-US/docs/Web/Reference/Events/wheel?redirectlocale=en-US&redirectslug=DOM%2FMozilla_event_reference%2Fwheel

var prefix = "", _addEventListener, onwheel, support;

// detect event model
if ( window.addEventListener ) {
  _addEventListener = "addEventListener";
} else {
  _addEventListener = "attachEvent";
  prefix = "on";
}

// detect available wheel event
support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
          document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
          "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

function _addWheelListener( elem, eventName, callback, useCapture ) {
  elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
    !originalEvent && ( originalEvent = window.event );

    // create a normalized event object
    var event = {
      // keep a ref to the original event object
      originalEvent: originalEvent,
      target: originalEvent.target || originalEvent.srcElement,
      type: "wheel",
      deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
      deltaX: 0,
      delatZ: 0,
      preventDefault: function() {
        originalEvent.preventDefault ?
          originalEvent.preventDefault() :
          originalEvent.returnValue = false;
      }
    };
    
    // calculate deltaY (and deltaX) according to the event
    if ( support == "mousewheel" ) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
      // Webkit also support wheelDeltaX
      originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
    } else {
      event.deltaY = originalEvent.detail;
    }

    // it's time to fire the callback
    return callback( event );
  }, useCapture || false );
}

module.exports = function( elem, callback, useCapture ) {
  _addWheelListener( elem, support, callback, useCapture );

  // handle MozMousePixelScroll in older Firefox
  if( support == "DOMMouseScroll" ) {
    _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
  }
};

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/add.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/add.js ***!
  \**************************************************/
/***/ ((module) => {

module.exports = add;

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/angle.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/angle.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = angle

var fromValues = __webpack_require__(/*! ./fromValues */ "../../game/noa/node_modules/gl-vec3/fromValues.js")
var normalize = __webpack_require__(/*! ./normalize */ "../../game/noa/node_modules/gl-vec3/normalize.js")
var dot = __webpack_require__(/*! ./dot */ "../../game/noa/node_modules/gl-vec3/dot.js")

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
function angle(a, b) {
    var tempA = fromValues(a[0], a[1], a[2])
    var tempB = fromValues(b[0], b[1], b[2])
 
    normalize(tempA, tempA)
    normalize(tempB, tempB)
 
    var cosine = dot(tempA, tempB)

    if(cosine > 1.0){
        return 0
    } else {
        return Math.acos(cosine)
    }     
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/ceil.js":
/*!***************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/ceil.js ***!
  \***************************************************/
/***/ ((module) => {

module.exports = ceil

/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */
function ceil(out, a) {
  out[0] = Math.ceil(a[0])
  out[1] = Math.ceil(a[1])
  out[2] = Math.ceil(a[2])
  return out
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/clone.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/clone.js ***!
  \****************************************************/
/***/ ((module) => {

module.exports = clone;

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
function clone(a) {
    var out = new Float32Array(3)
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/copy.js":
/*!***************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/copy.js ***!
  \***************************************************/
/***/ ((module) => {

module.exports = copy;

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/create.js":
/*!*****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/create.js ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = create;

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
function create() {
    var out = new Float32Array(3)
    out[0] = 0
    out[1] = 0
    out[2] = 0
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/cross.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/cross.js ***!
  \****************************************************/
/***/ ((module) => {

module.exports = cross;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2]

    out[0] = ay * bz - az * by
    out[1] = az * bx - ax * bz
    out[2] = ax * by - ay * bx
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/dist.js":
/*!***************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/dist.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./distance */ "../../game/noa/node_modules/gl-vec3/distance.js")


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/distance.js":
/*!*******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/distance.js ***!
  \*******************************************************/
/***/ ((module) => {

module.exports = distance;

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2]
    return Math.sqrt(x*x + y*y + z*z)
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/div.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/div.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./divide */ "../../game/noa/node_modules/gl-vec3/divide.js")


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/divide.js":
/*!*****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/divide.js ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = divide;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0]
    out[1] = a[1] / b[1]
    out[2] = a[2] / b[2]
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/dot.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/dot.js ***!
  \**************************************************/
/***/ ((module) => {

module.exports = dot;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/epsilon.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/epsilon.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = 0.000001


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/equals.js":
/*!*****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/equals.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = equals

var EPSILON = __webpack_require__(/*! ./epsilon */ "../../game/noa/node_modules/gl-vec3/epsilon.js")

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0]
  var a1 = a[1]
  var a2 = a[2]
  var b0 = b[0]
  var b1 = b[1]
  var b2 = b[2]
  return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
          Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
          Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)))
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/exactEquals.js":
/*!**********************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/exactEquals.js ***!
  \**********************************************************/
/***/ ((module) => {

module.exports = exactEquals

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/floor.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/floor.js ***!
  \****************************************************/
/***/ ((module) => {

module.exports = floor

/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */
function floor(out, a) {
  out[0] = Math.floor(a[0])
  out[1] = Math.floor(a[1])
  out[2] = Math.floor(a[2])
  return out
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/forEach.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/forEach.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = forEach;

var vec = __webpack_require__(/*! ./create */ "../../game/noa/node_modules/gl-vec3/create.js")()

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
function forEach(a, stride, offset, count, fn, arg) {
        var i, l
        if(!stride) {
            stride = 3
        }

        if(!offset) {
            offset = 0
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length)
        } else {
            l = a.length
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i] 
            vec[1] = a[i+1] 
            vec[2] = a[i+2]
            fn(vec, vec, arg)
            a[i] = vec[0] 
            a[i+1] = vec[1] 
            a[i+2] = vec[2]
        }
        
        return a
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/fromValues.js":
/*!*********************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/fromValues.js ***!
  \*********************************************************/
/***/ ((module) => {

module.exports = fromValues;

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
function fromValues(x, y, z) {
    var out = new Float32Array(3)
    out[0] = x
    out[1] = y
    out[2] = z
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/index.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/index.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
  EPSILON: __webpack_require__(/*! ./epsilon */ "../../game/noa/node_modules/gl-vec3/epsilon.js")
  , create: __webpack_require__(/*! ./create */ "../../game/noa/node_modules/gl-vec3/create.js")
  , clone: __webpack_require__(/*! ./clone */ "../../game/noa/node_modules/gl-vec3/clone.js")
  , angle: __webpack_require__(/*! ./angle */ "../../game/noa/node_modules/gl-vec3/angle.js")
  , fromValues: __webpack_require__(/*! ./fromValues */ "../../game/noa/node_modules/gl-vec3/fromValues.js")
  , copy: __webpack_require__(/*! ./copy */ "../../game/noa/node_modules/gl-vec3/copy.js")
  , set: __webpack_require__(/*! ./set */ "../../game/noa/node_modules/gl-vec3/set.js")
  , equals: __webpack_require__(/*! ./equals */ "../../game/noa/node_modules/gl-vec3/equals.js")
  , exactEquals: __webpack_require__(/*! ./exactEquals */ "../../game/noa/node_modules/gl-vec3/exactEquals.js")
  , add: __webpack_require__(/*! ./add */ "../../game/noa/node_modules/gl-vec3/add.js")
  , subtract: __webpack_require__(/*! ./subtract */ "../../game/noa/node_modules/gl-vec3/subtract.js")
  , sub: __webpack_require__(/*! ./sub */ "../../game/noa/node_modules/gl-vec3/sub.js")
  , multiply: __webpack_require__(/*! ./multiply */ "../../game/noa/node_modules/gl-vec3/multiply.js")
  , mul: __webpack_require__(/*! ./mul */ "../../game/noa/node_modules/gl-vec3/mul.js")
  , divide: __webpack_require__(/*! ./divide */ "../../game/noa/node_modules/gl-vec3/divide.js")
  , div: __webpack_require__(/*! ./div */ "../../game/noa/node_modules/gl-vec3/div.js")
  , min: __webpack_require__(/*! ./min */ "../../game/noa/node_modules/gl-vec3/min.js")
  , max: __webpack_require__(/*! ./max */ "../../game/noa/node_modules/gl-vec3/max.js")
  , floor: __webpack_require__(/*! ./floor */ "../../game/noa/node_modules/gl-vec3/floor.js")
  , ceil: __webpack_require__(/*! ./ceil */ "../../game/noa/node_modules/gl-vec3/ceil.js")
  , round: __webpack_require__(/*! ./round */ "../../game/noa/node_modules/gl-vec3/round.js")
  , scale: __webpack_require__(/*! ./scale */ "../../game/noa/node_modules/gl-vec3/scale.js")
  , scaleAndAdd: __webpack_require__(/*! ./scaleAndAdd */ "../../game/noa/node_modules/gl-vec3/scaleAndAdd.js")
  , distance: __webpack_require__(/*! ./distance */ "../../game/noa/node_modules/gl-vec3/distance.js")
  , dist: __webpack_require__(/*! ./dist */ "../../game/noa/node_modules/gl-vec3/dist.js")
  , squaredDistance: __webpack_require__(/*! ./squaredDistance */ "../../game/noa/node_modules/gl-vec3/squaredDistance.js")
  , sqrDist: __webpack_require__(/*! ./sqrDist */ "../../game/noa/node_modules/gl-vec3/sqrDist.js")
  , length: __webpack_require__(/*! ./length */ "../../game/noa/node_modules/gl-vec3/length.js")
  , len: __webpack_require__(/*! ./len */ "../../game/noa/node_modules/gl-vec3/len.js")
  , squaredLength: __webpack_require__(/*! ./squaredLength */ "../../game/noa/node_modules/gl-vec3/squaredLength.js")
  , sqrLen: __webpack_require__(/*! ./sqrLen */ "../../game/noa/node_modules/gl-vec3/sqrLen.js")
  , negate: __webpack_require__(/*! ./negate */ "../../game/noa/node_modules/gl-vec3/negate.js")
  , inverse: __webpack_require__(/*! ./inverse */ "../../game/noa/node_modules/gl-vec3/inverse.js")
  , normalize: __webpack_require__(/*! ./normalize */ "../../game/noa/node_modules/gl-vec3/normalize.js")
  , dot: __webpack_require__(/*! ./dot */ "../../game/noa/node_modules/gl-vec3/dot.js")
  , cross: __webpack_require__(/*! ./cross */ "../../game/noa/node_modules/gl-vec3/cross.js")
  , lerp: __webpack_require__(/*! ./lerp */ "../../game/noa/node_modules/gl-vec3/lerp.js")
  , random: __webpack_require__(/*! ./random */ "../../game/noa/node_modules/gl-vec3/random.js")
  , transformMat4: __webpack_require__(/*! ./transformMat4 */ "../../game/noa/node_modules/gl-vec3/transformMat4.js")
  , transformMat3: __webpack_require__(/*! ./transformMat3 */ "../../game/noa/node_modules/gl-vec3/transformMat3.js")
  , transformQuat: __webpack_require__(/*! ./transformQuat */ "../../game/noa/node_modules/gl-vec3/transformQuat.js")
  , rotateX: __webpack_require__(/*! ./rotateX */ "../../game/noa/node_modules/gl-vec3/rotateX.js")
  , rotateY: __webpack_require__(/*! ./rotateY */ "../../game/noa/node_modules/gl-vec3/rotateY.js")
  , rotateZ: __webpack_require__(/*! ./rotateZ */ "../../game/noa/node_modules/gl-vec3/rotateZ.js")
  , forEach: __webpack_require__(/*! ./forEach */ "../../game/noa/node_modules/gl-vec3/forEach.js")
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/inverse.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/inverse.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = inverse;

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
function inverse(out, a) {
  out[0] = 1.0 / a[0]
  out[1] = 1.0 / a[1]
  out[2] = 1.0 / a[2]
  return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/len.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/len.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./length */ "../../game/noa/node_modules/gl-vec3/length.js")


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/length.js":
/*!*****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/length.js ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = length;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return Math.sqrt(x*x + y*y + z*z)
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/lerp.js":
/*!***************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/lerp.js ***!
  \***************************************************/
/***/ ((module) => {

module.exports = lerp;

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2]
    out[0] = ax + t * (b[0] - ax)
    out[1] = ay + t * (b[1] - ay)
    out[2] = az + t * (b[2] - az)
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/max.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/max.js ***!
  \**************************************************/
/***/ ((module) => {

module.exports = max;

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function max(out, a, b) {
    out[0] = Math.max(a[0], b[0])
    out[1] = Math.max(a[1], b[1])
    out[2] = Math.max(a[2], b[2])
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/min.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/min.js ***!
  \**************************************************/
/***/ ((module) => {

module.exports = min;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function min(out, a, b) {
    out[0] = Math.min(a[0], b[0])
    out[1] = Math.min(a[1], b[1])
    out[2] = Math.min(a[2], b[2])
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/mul.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/mul.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./multiply */ "../../game/noa/node_modules/gl-vec3/multiply.js")


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/multiply.js":
/*!*******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/multiply.js ***!
  \*******************************************************/
/***/ ((module) => {

module.exports = multiply;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0]
    out[1] = a[1] * b[1]
    out[2] = a[2] * b[2]
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/negate.js":
/*!*****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/negate.js ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = negate;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
function negate(out, a) {
    out[0] = -a[0]
    out[1] = -a[1]
    out[2] = -a[2]
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/normalize.js":
/*!********************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/normalize.js ***!
  \********************************************************/
/***/ ((module) => {

module.exports = normalize;

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    var len = x*x + y*y + z*z
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
        out[2] = a[2] * len
    }
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/random.js":
/*!*****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/random.js ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = random;

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
function random(out, scale) {
    scale = scale || 1.0

    var r = Math.random() * 2.0 * Math.PI
    var z = (Math.random() * 2.0) - 1.0
    var zScale = Math.sqrt(1.0-z*z) * scale

    out[0] = Math.cos(r) * zScale
    out[1] = Math.sin(r) * zScale
    out[2] = z * scale
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/rotateX.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/rotateX.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = rotateX;

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateX(out, a, b, c){
    var by = b[1]
    var bz = b[2]

    // Translate point to the origin
    var py = a[1] - by
    var pz = a[2] - bz

    var sc = Math.sin(c)
    var cc = Math.cos(c)

    // perform rotation and translate to correct position
    out[0] = a[0]
    out[1] = by + py * cc - pz * sc
    out[2] = bz + py * sc + pz * cc

    return out
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/rotateY.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/rotateY.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = rotateY;

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateY(out, a, b, c){
    var bx = b[0]
    var bz = b[2]

    // translate point to the origin
    var px = a[0] - bx
    var pz = a[2] - bz
    
    var sc = Math.sin(c)
    var cc = Math.cos(c)
  
    // perform rotation and translate to correct position
    out[0] = bx + pz * sc + px * cc
    out[1] = a[1]
    out[2] = bz + pz * cc - px * sc
  
    return out
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/rotateZ.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/rotateZ.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = rotateZ;

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateZ(out, a, b, c){
    var bx = b[0]
    var by = b[1]

    //Translate point to the origin
    var px = a[0] - bx
    var py = a[1] - by
  
    var sc = Math.sin(c)
    var cc = Math.cos(c)

    // perform rotation and translate to correct position
    out[0] = bx + px * cc - py * sc
    out[1] = by + px * sc + py * cc
    out[2] = a[2]
  
    return out
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/round.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/round.js ***!
  \****************************************************/
/***/ ((module) => {

module.exports = round

/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */
function round(out, a) {
  out[0] = Math.round(a[0])
  out[1] = Math.round(a[1])
  out[2] = Math.round(a[2])
  return out
}


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/scale.js":
/*!****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/scale.js ***!
  \****************************************************/
/***/ ((module) => {

module.exports = scale;

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b
    out[1] = a[1] * b
    out[2] = a[2] * b
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/scaleAndAdd.js":
/*!**********************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/scaleAndAdd.js ***!
  \**********************************************************/
/***/ ((module) => {

module.exports = scaleAndAdd;

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale)
    out[1] = a[1] + (b[1] * scale)
    out[2] = a[2] + (b[2] * scale)
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/set.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/set.js ***!
  \**************************************************/
/***/ ((module) => {

module.exports = set;

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set(out, x, y, z) {
    out[0] = x
    out[1] = y
    out[2] = z
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/sqrDist.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/sqrDist.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./squaredDistance */ "../../game/noa/node_modules/gl-vec3/squaredDistance.js")


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/sqrLen.js":
/*!*****************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/sqrLen.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./squaredLength */ "../../game/noa/node_modules/gl-vec3/squaredLength.js")


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/squaredDistance.js":
/*!**************************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/squaredDistance.js ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = squaredDistance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2]
    return x*x + y*y + z*z
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/squaredLength.js":
/*!************************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/squaredLength.js ***!
  \************************************************************/
/***/ ((module) => {

module.exports = squaredLength;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return x*x + y*y + z*z
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/sub.js":
/*!**************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/sub.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./subtract */ "../../game/noa/node_modules/gl-vec3/subtract.js")


/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/subtract.js":
/*!*******************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/subtract.js ***!
  \*******************************************************/
/***/ ((module) => {

module.exports = subtract;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/transformMat3.js":
/*!************************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/transformMat3.js ***!
  \************************************************************/
/***/ ((module) => {

module.exports = transformMat3;

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3(out, a, m) {
    var x = a[0], y = a[1], z = a[2]
    out[0] = x * m[0] + y * m[3] + z * m[6]
    out[1] = x * m[1] + y * m[4] + z * m[7]
    out[2] = x * m[2] + y * m[5] + z * m[8]
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/transformMat4.js":
/*!************************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/transformMat4.js ***!
  \************************************************************/
/***/ ((module) => {

module.exports = transformMat4;

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
    var x = a[0], y = a[1], z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15]
    w = w || 1.0
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/gl-vec3/transformQuat.js":
/*!************************************************************!*\
  !*** ../../game/noa/node_modules/gl-vec3/transformQuat.js ***!
  \************************************************************/
/***/ ((module) => {

module.exports = transformQuat;

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx
    return out
}

/***/ }),

/***/ "../../game/noa/node_modules/iota-array/iota.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/iota-array/iota.js ***!
  \******************************************************/
/***/ ((module) => {

"use strict";


function iota(n) {
  var result = new Array(n)
  for(var i=0; i<n; ++i) {
    result[i] = i
  }
  return result
}

module.exports = iota

/***/ }),

/***/ "../../game/noa/node_modules/is-buffer/index.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/is-buffer/index.js ***!
  \******************************************************/
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ "../../game/noa/node_modules/micro-game-shell/src/micro-game-shell.js":
/*!****************************************************************************!*\
  !*** ../../game/noa/node_modules/micro-game-shell/src/micro-game-shell.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MicroGameShell": () => (/* binding */ MicroGameShell)
/* harmony export */ });



/*
 * 
 * 
 *      base class and API
 * 
 * 
*/

class MicroGameShell {

    constructor(domElement = null, pollTime = 10, skipFramesAfter = 100) {
        // settings
        this.stickyPointerLock = false
        this.stickyFullscreen = false

        this.tickRate = 30
        this.maxRenderRate = 0

        // API
        this.pointerLock = false
        this.fullscreen = false

        // for client to override
        this.onTick = function (dt) { }
        this.onRender = function () { }

        this.onInit = function () { }
        this.onResize = function () { }
        this.onPointerLockChanged = function (hasPL) { }
        this.onFullscreenChanged = function (hasFS) { }

        // init
        domReady(() => {
            setupTimers(this, pollTime, skipFramesAfter)
            setupDomElement(this, domElement)
            this.onInit()
        })
    }
}





/*
 * 
 *      tick- and render events
 * 
*/

function setupTimers(shell, pollTime, skipFramesAfter) {
    shell._nowObject = performance || Date
    shell._skipFramesAfter = skipFramesAfter
    shell._renderAccum = 0
    // these are when the last tick/render _started_
    var now = shell._nowObject.now()
    shell._lastTick = now
    shell._lastRender = now

    shell._frameCB = frameHandler.bind(null, shell)
    requestAnimationFrame(shell._frameCB)
    if (pollTime > 0) {
        shell._intervalCB = intervalHandler.bind(null, shell)
        shell._interval = setInterval(shell._intervalCB, pollTime)
    }
}


function intervalHandler(shell) {
    var now = shell._nowObject.now()
    var cutoffTime = now + shell._skipFramesAfter
    var tickDur = 1000 / shell.tickRate
    // tick until we're up to date
    while (shell._lastTick + tickDur < now) {
        shell.onTick(tickDur)
        shell._lastTick += tickDur
        now = shell._nowObject.now()
        // skip frames if we've exceeded max processing time
        if (now > cutoffTime) {
            shell._lastTick = now
            return
        }
    }
}

function frameHandler(shell) {
    requestAnimationFrame(shell._frameCB)
    intervalHandler(shell)
    var now = shell._nowObject.now()
    var dt = now - shell._lastRender
    shell._lastRender = now
    if (shell.maxRenderRate > 0) {
        shell._renderAccum += dt
        var frameDur = 1000 / shell.maxRenderRate
        if (shell._renderAccum < frameDur) return
        shell._renderAccum = Math.min(shell._renderAccum - frameDur, frameDur)
    }
    var tickDur = 1000 / shell.tickRate
    var framePart = (now - shell._lastTick) / tickDur
    shell.onRender(dt, framePart, tickDur)
}






/*
 * 
 *      DOM element and sticky fullscreen/pointerlock
 * 
*/

function setupDomElement(shell, el) {
    if (!el) return

    var hasPL = false
    var hasFS = false

    // track whether we actually have PL/FS, and send events
    document.addEventListener('pointerlockchange', ev => {
        hasPL = (document.pointerLockElement === el)
        shell.onPointerLockChanged(hasPL)
    })
    document.addEventListener('fullscreenchange', ev => {
        hasFS = (document.fullscreenElement === el)
        shell.onFullscreenChanged(hasFS)
    })


    // decorate shell with getter/setters that request FS/PL
    Object.defineProperty(shell, 'pointerLock', {
        get: () => hasPL,
        set: (want) => {
            if (want && !hasPL) {
                el.requestPointerLock()
            } else if (hasPL && !want) {
                document.exitPointerLock()
            }
        }
    })
    Object.defineProperty(shell, 'fullscreen', {
        get: () => hasFS,
        set: (want) => {
            if (want && !hasFS) {
                el.requestFullscreen()
            } else if (hasFS && !want) {
                document.exitFullscreen()
            }
        }
    })


    // stickiness via click handler
    el.addEventListener('click', ev => {
        if (shell.stickyPointerLock && !hasPL) {
            el.requestPointerLock()
        }
        if (shell.stickyFullscreen && !hasFS) {
            el.requestFullscreen()
        }
    })


    // resize events via ResizeObserver
    var resizeHandler = () => shell.onResize()
    if (window.ResizeObserver) {
        var observer = new ResizeObserver(resizeHandler)
        observer.observe(el)
    } else {
        window.addEventListener('resize', resizeHandler)
    }
}





/*
 * 
 *      util 
 * 
*/

var domReady = (fn) => {
    if (document.readyState === 'loading') {
        var handler = () => {
            document.removeEventListener('readystatechange', handler)
            fn()
        }
        document.addEventListener('readystatechange', handler)
    } else {
        setTimeout(fn, 1)
    }
}


/***/ }),

/***/ "../../game/noa/node_modules/ndarray/ndarray.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/ndarray/ndarray.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var iota = __webpack_require__(/*! iota-array */ "../../game/noa/node_modules/iota-array/iota.js")
var isBuffer = __webpack_require__(/*! is-buffer */ "../../game/noa/node_modules/is-buffer/index.js")

var hasTypedArrays  = ((typeof Float64Array) !== "undefined")

function compare1st(a, b) {
  return a[0] - b[0]
}

function order() {
  var stride = this.stride
  var terms = new Array(stride.length)
  var i
  for(i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i]
  }
  terms.sort(compare1st)
  var result = new Array(terms.length)
  for(i=0; i<result.length; ++i) {
    result[i] = terms[i][1]
  }
  return result
}

function compileConstructor(dtype, dimension) {
  var className = ["View", dimension, "d", dtype].join("")
  if(dimension < 0) {
    className = "View_Nil" + dtype
  }
  var useGetters = (dtype === "generic")

  if(dimension === -1) {
    //Special case for trivial arrays
    var code =
      "function "+className+"(a){this.data=a;};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return -1};\
proto.size=0;\
proto.dimension=-1;\
proto.shape=proto.stride=proto.order=[];\
proto.lo=proto.hi=proto.transpose=proto.step=\
function(){return new "+className+"(this.data);};\
proto.get=proto.set=function(){};\
proto.pick=function(){return null};\
return function construct_"+className+"(a){return new "+className+"(a);}"
    var procedure = new Function(code)
    return procedure()
  } else if(dimension === 0) {
    //Special case for 0d arrays
    var code =
      "function "+className+"(a,d) {\
this.data = a;\
this.offset = d\
};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return this.offset};\
proto.dimension=0;\
proto.size=1;\
proto.shape=\
proto.stride=\
proto.order=[];\
proto.lo=\
proto.hi=\
proto.transpose=\
proto.step=function "+className+"_copy() {\
return new "+className+"(this.data,this.offset)\
};\
proto.pick=function "+className+"_pick(){\
return TrivialArray(this.data);\
};\
proto.valueOf=proto.get=function "+className+"_get(){\
return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
"};\
proto.set=function "+className+"_set(v){\
return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
};\
return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}"
    var procedure = new Function("TrivialArray", code)
    return procedure(CACHED_CONSTRUCTORS[dtype][0])
  }

  var code = ["'use strict'"]

  //Create constructor for view
  var indices = iota(dimension)
  var args = indices.map(function(i) { return "i"+i })
  var index_str = "this.offset+" + indices.map(function(i) {
        return "this.stride[" + i + "]*i" + i
      }).join("+")
  var shapeArg = indices.map(function(i) {
      return "b"+i
    }).join(",")
  var strideArg = indices.map(function(i) {
      return "c"+i
    }).join(",")
  code.push(
    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
      "this.shape=[" + shapeArg + "]",
      "this.stride=[" + strideArg + "]",
      "this.offset=d|0}",
    "var proto="+className+".prototype",
    "proto.dtype='"+dtype+"'",
    "proto.dimension="+dimension)

  //view.size:
  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
"}})")

  //view.order:
  if(dimension === 1) {
    code.push("proto.order=[0]")
  } else {
    code.push("Object.defineProperty(proto,'order',{get:")
    if(dimension < 4) {
      code.push("function "+className+"_order(){")
      if(dimension === 2) {
        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})")
      } else if(dimension === 3) {
        code.push(
"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
if(s0>s1){\
if(s1>s2){\
return [2,1,0];\
}else if(s0>s2){\
return [1,2,0];\
}else{\
return [1,0,2];\
}\
}else if(s0>s2){\
return [2,0,1];\
}else if(s2>s1){\
return [0,1,2];\
}else{\
return [0,2,1];\
}}})")
      }
    } else {
      code.push("ORDER})")
    }
  }

  //view.set(i0, ..., v):
  code.push(
"proto.set=function "+className+"_set("+args.join(",")+",v){")
  if(useGetters) {
    code.push("return this.data.set("+index_str+",v)}")
  } else {
    code.push("return this.data["+index_str+"]=v}")
  }

  //view.get(i0, ...):
  code.push("proto.get=function "+className+"_get("+args.join(",")+"){")
  if(useGetters) {
    code.push("return this.data.get("+index_str+")}")
  } else {
    code.push("return this.data["+index_str+"]}")
  }

  //view.index:
  code.push(
    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}")

  //view.hi():
  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
    indices.map(function(i) {
      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
    }).join(",")+","+
    indices.map(function(i) {
      return "this.stride["+i + "]"
    }).join(",")+",this.offset)}")

  //view.lo():
  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" })
  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" })
  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","))
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'&&i"+i+">=0){\
d=i"+i+"|0;\
b+=c"+i+"*d;\
a"+i+"-=d}")
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a"+i
    }).join(",")+","+
    indices.map(function(i) {
      return "c"+i
    }).join(",")+",b)}")

  //view.step():
  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
    indices.map(function(i) {
      return "a"+i+"=this.shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "b"+i+"=this.stride["+i+"]"
    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil")
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'){\
d=i"+i+"|0;\
if(d<0){\
c+=b"+i+"*(a"+i+"-1);\
a"+i+"=ceil(-a"+i+"/d)\
}else{\
a"+i+"=ceil(a"+i+"/d)\
}\
b"+i+"*=d\
}")
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a" + i
    }).join(",")+","+
    indices.map(function(i) {
      return "b" + i
    }).join(",")+",c)}")

  //view.transpose():
  var tShape = new Array(dimension)
  var tStride = new Array(dimension)
  for(var i=0; i<dimension; ++i) {
    tShape[i] = "a[i"+i+"]"
    tStride[i] = "b[i"+i+"]"
  }
  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}")

  //view.pick():
  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset")
  for(var i=0; i<dimension; ++i) {
    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}")
  }
  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}")

  //Add return statement
  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
    indices.map(function(i) {
      return "shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "stride["+i+"]"
    }).join(",")+",offset)}")

  //Compile procedure
  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"))
  return procedure(CACHED_CONSTRUCTORS[dtype], order)
}

function arrayDType(data) {
  if(isBuffer(data)) {
    return "buffer"
  }
  if(hasTypedArrays) {
    switch(Object.prototype.toString.call(data)) {
      case "[object Float64Array]":
        return "float64"
      case "[object Float32Array]":
        return "float32"
      case "[object Int8Array]":
        return "int8"
      case "[object Int16Array]":
        return "int16"
      case "[object Int32Array]":
        return "int32"
      case "[object Uint8Array]":
        return "uint8"
      case "[object Uint16Array]":
        return "uint16"
      case "[object Uint32Array]":
        return "uint32"
      case "[object Uint8ClampedArray]":
        return "uint8_clamped"
      case "[object BigInt64Array]":
        return "bigint64"
      case "[object BigUint64Array]":
        return "biguint64"
    }
  }
  if(Array.isArray(data)) {
    return "array"
  }
  return "generic"
}

var CACHED_CONSTRUCTORS = {
  "float32":[],
  "float64":[],
  "int8":[],
  "int16":[],
  "int32":[],
  "uint8":[],
  "uint16":[],
  "uint32":[],
  "array":[],
  "uint8_clamped":[],
  "bigint64": [],
  "biguint64": [],
  "buffer":[],
  "generic":[]
}

;(function() {
  for(var id in CACHED_CONSTRUCTORS) {
    CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1))
  }
});

function wrappedNDArrayCtor(data, shape, stride, offset) {
  if(data === undefined) {
    var ctor = CACHED_CONSTRUCTORS.array[0]
    return ctor([])
  } else if(typeof data === "number") {
    data = [data]
  }
  if(shape === undefined) {
    shape = [ data.length ]
  }
  var d = shape.length
  if(stride === undefined) {
    stride = new Array(d)
    for(var i=d-1, sz=1; i>=0; --i) {
      stride[i] = sz
      sz *= shape[i]
    }
  }
  if(offset === undefined) {
    offset = 0
    for(var i=0; i<d; ++i) {
      if(stride[i] < 0) {
        offset -= (shape[i]-1)*stride[i]
      }
    }
  }
  var dtype = arrayDType(data)
  var ctor_list = CACHED_CONSTRUCTORS[dtype]
  while(ctor_list.length <= d+1) {
    ctor_list.push(compileConstructor(dtype, ctor_list.length-1))
  }
  var ctor = ctor_list[d+1]
  return ctor(data, shape, stride, offset)
}

module.exports = wrappedNDArrayCtor


/***/ }),

/***/ "../../game/noa/node_modules/tslib/tslib.es6.js":
/*!******************************************************!*\
  !*** ../../game/noa/node_modules/tslib/tslib.es6.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__extends": () => (/* binding */ __extends),
/* harmony export */   "__assign": () => (/* binding */ __assign),
/* harmony export */   "__rest": () => (/* binding */ __rest),
/* harmony export */   "__decorate": () => (/* binding */ __decorate),
/* harmony export */   "__param": () => (/* binding */ __param),
/* harmony export */   "__metadata": () => (/* binding */ __metadata),
/* harmony export */   "__awaiter": () => (/* binding */ __awaiter),
/* harmony export */   "__generator": () => (/* binding */ __generator),
/* harmony export */   "__createBinding": () => (/* binding */ __createBinding),
/* harmony export */   "__exportStar": () => (/* binding */ __exportStar),
/* harmony export */   "__values": () => (/* binding */ __values),
/* harmony export */   "__read": () => (/* binding */ __read),
/* harmony export */   "__spread": () => (/* binding */ __spread),
/* harmony export */   "__spreadArrays": () => (/* binding */ __spreadArrays),
/* harmony export */   "__spreadArray": () => (/* binding */ __spreadArray),
/* harmony export */   "__await": () => (/* binding */ __await),
/* harmony export */   "__asyncGenerator": () => (/* binding */ __asyncGenerator),
/* harmony export */   "__asyncDelegator": () => (/* binding */ __asyncDelegator),
/* harmony export */   "__asyncValues": () => (/* binding */ __asyncValues),
/* harmony export */   "__makeTemplateObject": () => (/* binding */ __makeTemplateObject),
/* harmony export */   "__importStar": () => (/* binding */ __importStar),
/* harmony export */   "__importDefault": () => (/* binding */ __importDefault),
/* harmony export */   "__classPrivateFieldGet": () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   "__classPrivateFieldSet": () => (/* binding */ __classPrivateFieldSet)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}


/***/ }),

/***/ "../../game/noa/node_modules/vkey/index.js":
/*!*************************************************!*\
  !*** ../../game/noa/node_modules/vkey/index.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  , isOSX = /OS X/.test(ua)
  , isOpera = /Opera/.test(ua)
  , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

var i, output = module.exports = {
  0:  isOSX ? '<menu>' : '<UNK>'
, 1:  '<mouse 1>'
, 2:  '<mouse 2>'
, 3:  '<break>'
, 4:  '<mouse 3>'
, 5:  '<mouse 4>'
, 6:  '<mouse 5>'
, 8:  '<backspace>'
, 9:  '<tab>'
, 12: '<clear>'
, 13: '<enter>'
, 16: '<shift>'
, 17: '<control>'
, 18: '<alt>'
, 19: '<pause>'
, 20: '<caps-lock>'
, 21: '<ime-hangul>'
, 23: '<ime-junja>'
, 24: '<ime-final>'
, 25: '<ime-kanji>'
, 27: '<escape>'
, 28: '<ime-convert>'
, 29: '<ime-nonconvert>'
, 30: '<ime-accept>'
, 31: '<ime-mode-change>'
, 32: '<space>'
, 33: '<page-up>'
, 34: '<page-down>'
, 35: '<end>'
, 36: '<home>'
, 37: '<left>'
, 38: '<up>'
, 39: '<right>'
, 40: '<down>'
, 41: '<select>'
, 42: '<print>'
, 43: '<execute>'
, 44: '<snapshot>'
, 45: '<insert>'
, 46: '<delete>'
, 47: '<help>'
, 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
, 92: '<meta>'  // meta-right
, 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
, 95: '<sleep>'
, 106: '<num-*>'
, 107: '<num-+>'
, 108: '<num-enter>'
, 109: '<num-->'
, 110: '<num-.>'
, 111: '<num-/>'
, 144: '<num-lock>'
, 145: '<scroll-lock>'
, 160: '<shift-left>'
, 161: '<shift-right>'
, 162: '<control-left>'
, 163: '<control-right>'
, 164: '<alt-left>'
, 165: '<alt-right>'
, 166: '<browser-back>'
, 167: '<browser-forward>'
, 168: '<browser-refresh>'
, 169: '<browser-stop>'
, 170: '<browser-search>'
, 171: '<browser-favorites>'
, 172: '<browser-home>'

  // ff/osx reports '<volume-mute>' for '-'
, 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
, 174: '<volume-down>'
, 175: '<volume-up>'
, 176: '<next-track>'
, 177: '<prev-track>'
, 178: '<stop>'
, 179: '<play-pause>'
, 180: '<launch-mail>'
, 181: '<launch-media-select>'
, 182: '<launch-app 1>'
, 183: '<launch-app 2>'
, 186: ';'
, 187: '='
, 188: ','
, 189: '-'
, 190: '.'
, 191: '/'
, 192: '`'
, 219: '['
, 220: '\\'
, 221: ']'
, 222: "'"
, 223: '<meta>'
, 224: '<meta>'       // firefox reports meta here.
, 226: '<alt-gr>'
, 229: '<ime-process>'
, 231: isOpera ? '`' : '<unicode>'
, 246: '<attention>'
, 247: '<crsel>'
, 248: '<exsel>'
, 249: '<erase-eof>'
, 250: '<play>'
, 251: '<zoom>'
, 252: '<no-name>'
, 253: '<pa-1>'
, 254: '<clear>'
}

for(i = 58; i < 65; ++i) {
  output[i] = String.fromCharCode(i)
}

// 0-9
for(i = 48; i < 58; ++i) {
  output[i] = (i - 48)+''
}

// A-Z
for(i = 65; i < 91; ++i) {
  output[i] = String.fromCharCode(i)
}

// num0-9
for(i = 96; i < 106; ++i) {
  output[i] = '<num-'+(i - 96)+'>'
}

// F1-F24
for(i = 112; i < 136; ++i) {
  output[i] = 'F'+(i-111)
}


/***/ }),

/***/ "../../game/noa/node_modules/voxel-aabb-sweep/index.js":
/*!*************************************************************!*\
  !*** ../../game/noa/node_modules/voxel-aabb-sweep/index.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";



// reused array instances

var tr_arr = []
var ldi_arr = []
var tri_arr = []
var step_arr = []
var tDelta_arr = []
var tNext_arr = []
var vec_arr = []
var normed_arr = []
var base_arr = []
var max_arr = []
var left_arr = []
var result_arr = []



// core implementation:

function sweep_impl(getVoxel, callback, vec, base, max, epsilon) {

    // consider algo as a raycast along the AABB's leading corner
    // as raycast enters each new voxel, iterate in 2D over the AABB's 
    // leading face in that axis looking for collisions
    // 
    // original raycast implementation: https://github.com/andyhall/fast-voxel-raycast
    // original raycast paper: http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf

    var tr = tr_arr
    var ldi = ldi_arr
    var tri = tri_arr
    var step = step_arr
    var tDelta = tDelta_arr
    var tNext = tNext_arr
    var normed = normed_arr

    var floor = Math.floor
    var cumulative_t = 0.0
    var t = 0.0
    var max_t = 0.0
    var axis = 0
    var i = 0


    // init for the current sweep vector and take first step
    initSweep()
    if (max_t === 0) return 0

    axis = stepForward()

    // loop along raycast vector
    while (t <= max_t) {

        // sweeps over leading face of AABB
        if (checkCollision(axis)) {
            // calls the callback and decides whether to continue
            var done = handleCollision()
            if (done) return cumulative_t
        }

        axis = stepForward()
    }

    // reached the end of the vector unobstructed, finish and exit
    cumulative_t += max_t
    for (i = 0; i < 3; i++) {
        base[i] += vec[i]
        max[i] += vec[i]
    }
    return cumulative_t





    // low-level implementations of each step:
    function initSweep() {

        // parametrization t along raycast
        t = 0.0
        max_t = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2])
        if (max_t === 0) return
        for (var i = 0; i < 3; i++) {
            var dir = (vec[i] >= 0)
            step[i] = dir ? 1 : -1
            // trailing / trailing edge coords
            var lead = dir ? max[i] : base[i]
            tr[i] = dir ? base[i] : max[i]
            // int values of lead/trail edges
            ldi[i] = leadEdgeToInt(lead, step[i])
            tri[i] = trailEdgeToInt(tr[i], step[i])
            // normed vector
            normed[i] = vec[i] / max_t
            // distance along t required to move one voxel in each axis
            tDelta[i] = Math.abs(1 / normed[i])
            // location of nearest voxel boundary, in units of t 
            var dist = dir ? (ldi[i] + 1 - lead) : (lead - ldi[i])
            tNext[i] = (tDelta[i] < Infinity) ? tDelta[i] * dist : Infinity
        }

    }


    // check for collisions - iterate over the leading face on the advancing axis

    function checkCollision(i_axis) {
        var stepx = step[0]
        var x0 = (i_axis === 0) ? ldi[0] : tri[0]
        var x1 = ldi[0] + stepx

        var stepy = step[1]
        var y0 = (i_axis === 1) ? ldi[1] : tri[1]
        var y1 = ldi[1] + stepy

        var stepz = step[2]
        var z0 = (i_axis === 2) ? ldi[2] : tri[2]
        var z1 = ldi[2] + stepz

        // var j_axis = (i_axis + 1) % 3
        // var k_axis = (i_axis + 2) % 3
        // var s = ['x', 'y', 'z'][i_axis]
        // var js = ['x', 'y', 'z'][j_axis]
        // var ks = ['x', 'y', 'z'][k_axis]
        // var i0 = [x0, y0, z0][i_axis]
        // var j0 = [x0, y0, z0][j_axis]
        // var k0 = [x0, y0, z0][k_axis]
        // var i1 = [x1 - stepx, y1 - stepy, z1 - stepz][i_axis]
        // var j1 = [x1 - stepx, y1 - stepy, z1 - stepz][j_axis]
        // var k1 = [x1 - stepx, y1 - stepy, z1 - stepz][k_axis]
        // console.log('=== step', s, 'to', i0, '   sweep', js, j0 + ',' + j1, '   ', ks, k0 + ',' + k1)

        for (var x = x0; x != x1; x += stepx) {
            for (var y = y0; y != y1; y += stepy) {
                for (var z = z0; z != z1; z += stepz) {
                    if (getVoxel(x, y, z)) return true
                }
            }
        }
        return false
    }


    // on collision - call the callback and return or set up for the next sweep

    function handleCollision() {

        // set up for callback
        cumulative_t += t
        var dir = step[axis]

        // vector moved so far, and left to move
        var done = t / max_t
        var left = left_arr
        for (i = 0; i < 3; i++) {
            var dv = vec[i] * done
            base[i] += dv
            max[i] += dv
            left[i] = vec[i] - dv
        }

        // set leading edge of stepped axis exactly to voxel boundary
        // else we'll sometimes rounding error beyond it
        if (dir > 0) {
            max[axis] = Math.round(max[axis])
        } else {
            base[axis] = Math.round(base[axis])
        }
        
        // call back to let client update the "left to go" vector
        var res = callback(cumulative_t, axis, dir, left)

        // bail out out on truthy response
        if (res) return true

        // init for new sweep along vec
        for (i = 0; i < 3; i++) vec[i] = left[i]
        initSweep()
        if (max_t === 0) return true // no vector left

        return false
    }


    // advance to next voxel boundary, and return which axis was stepped

    function stepForward() {
        var axis = (tNext[0] < tNext[1]) ?
            ((tNext[0] < tNext[2]) ? 0 : 2) :
            ((tNext[1] < tNext[2]) ? 1 : 2)
        var dt = tNext[axis] - t
        t = tNext[axis]
        ldi[axis] += step[axis]
        tNext[axis] += tDelta[axis]
        for (i = 0; i < 3; i++) {
            tr[i] += dt * normed[i]
            tri[i] = trailEdgeToInt(tr[i], step[i])
        }

        return axis
    }



    function leadEdgeToInt(coord, step) {
        return floor(coord - step * epsilon)
    }
    function trailEdgeToInt(coord, step) {
        return floor(coord + step * epsilon)
    }

}





// conform inputs

function sweep(getVoxel, box, dir, callback, noTranslate, epsilon) {

    var vec = vec_arr
    var base = base_arr
    var max = max_arr
    var result = result_arr

    // init parameter float arrays
    for (var i = 0; i < 3; i++) {
        vec[i] = +dir[i]
        max[i] = +box.max[i]
        base[i] = +box.base[i]
    }

    if (!epsilon) epsilon = 1e-10

    // run sweep implementation
    var dist = sweep_impl(getVoxel, callback, vec, base, max, epsilon)

    // translate box by distance needed to updated base value
    if (!noTranslate) {
        for (i = 0; i < 3; i++) {
            result[i] = (dir[i] > 0) ? max[i] - box.max[i] : base[i] - box.base[i]
        }
        box.translate(result)
    }

    // return value is total distance moved (not necessarily magnitude of [end]-[start])
    return dist
}

module.exports = sweep



/***/ }),

/***/ "../../game/noa/node_modules/voxel-physics-engine/src/index.js":
/*!*********************************************************************!*\
  !*** ../../game/noa/node_modules/voxel-physics-engine/src/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Physics": () => (/* binding */ Physics)
/* harmony export */ });

var aabb = __webpack_require__(/*! aabb-3d */ "../../game/noa/node_modules/aabb-3d/index.js")
var vec3 = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js")
var sweep = __webpack_require__(/*! voxel-aabb-sweep */ "../../game/noa/node_modules/voxel-aabb-sweep/index.js")
var RigidBody = __webpack_require__(/*! ./rigidBody */ "../../game/noa/node_modules/voxel-physics-engine/src/rigidBody.js")


var DEBUG = 0




var defaults = {
    airDrag: 0.1,
    fluidDrag: 0.4,
    fluidDensity: 2.0,
    gravity: [0, -10, 0],
    minBounceImpulse: .5, // lowest collision impulse that bounces
}




/**
 *          Voxel Physics Engine
 * 
 * Models a world of rigid bodies, to be integrated against
 * solid or liquid voxel terrain.
 * 
 * Takes `testSolid(x,y,z)` function to query block solidity
 * Takes `testFluid(x,y,z)` function to query if a block is a fluid
 *  
 * The `options` argument can take the following params:
 * 
 * ```js
 * {
 *     airDrag: 0.1,
 *     fluidDrag: 0.4,
 *     fluidDensity: 2.0,
 *     gravity: [0, -10, 0],
 *     minBounceImpulse: .5, // lowest collision impulse that bounces
 * }
 * 
 * ```
*/
function Physics(opts, testSolid, testFluid) {
    opts = Object.assign({}, defaults, opts)

    this.gravity = opts.gravity
    this.airDrag = opts.airDrag
    this.fluidDensity = opts.fluidDensity
    this.fluidDrag = opts.fluidDrag
    this.minBounceImpulse = opts.minBounceImpulse
    this.bodies = []

    // collision function - TODO: abstract this into a setter?
    this.testSolid = testSolid
    this.testFluid = testFluid
}


/** 
 * Adds a physics body to the simulation
 * @returns {RigidBody}
*/
Physics.prototype.addBody = function (_aabb, mass, friction,
    restitution, gravMult, onCollide) {
    _aabb = _aabb || new aabb([0, 0, 0], [1, 1, 1])
    if (typeof mass == 'undefined') mass = 1
    if (typeof friction == 'undefined') friction = 1
    if (typeof restitution == 'undefined') restitution = 0
    if (typeof gravMult == 'undefined') gravMult = 1
    var b = new RigidBody(_aabb, mass, friction, restitution, gravMult, onCollide)
    this.bodies.push(b)
    return b
}

/** Removes a body, by direct reference */
Physics.prototype.removeBody = function (b) {
    var i = this.bodies.indexOf(b)
    if (i < 0) return undefined
    this.bodies.splice(i, 1)
    b.aabb = b.onCollide = null
}




/*
 *    PHYSICS AND COLLISIONS
*/

var a = vec3.create()
var dv = vec3.create()
var dx = vec3.create()
var impacts = vec3.create()
var oldResting = vec3.create()


/* Ticks the simulation forwards in time. */
Physics.prototype.tick = function (dt) {
    // convert dt to seconds
    dt = dt / 1000
    var noGravity = equals(0, vec3.squaredLength(this.gravity))
    this.bodies.forEach(b => iterateBody(this, b, dt, noGravity))
}



/*
 *    PER-BODY MAIN PHYSICS ROUTINE
*/

function iterateBody(self, b, dt, noGravity) {
    vec3.copy(oldResting, b.resting)

    // treat bodies with <= mass as static
    if (b.mass <= 0) {
        vec3.set(b.velocity, 0, 0, 0)
        vec3.set(b._forces, 0, 0, 0)
        vec3.set(b._impulses, 0, 0, 0)
        return
    }

    // skip bodies if static or no velocity/forces/impulses
    var localNoGrav = noGravity || (b.gravityMultiplier === 0)
    if (bodyAsleep(self, b, dt, localNoGrav)) return
    b._sleepFrameCount--

    // check if under water, if so apply buoyancy and drag forces
    applyFluidForces(self, b)

    // debug hooks
    sanityCheck(b._forces)
    sanityCheck(b._impulses)
    sanityCheck(b.velocity)
    sanityCheck(b.resting)

    // semi-implicit Euler integration

    // a = f/m + gravity*gravityMultiplier
    vec3.scale(a, b._forces, 1 / b.mass)
    vec3.scaleAndAdd(a, a, self.gravity, b.gravityMultiplier)

    // dv = i/m + a*dt
    // v1 = v0 + dv
    vec3.scale(dv, b._impulses, 1 / b.mass)
    vec3.scaleAndAdd(dv, dv, a, dt)
    vec3.add(b.velocity, b.velocity, dv)

    // apply friction based on change in velocity this frame
    if (b.friction) {
        applyFrictionByAxis(0, b, dv)
        applyFrictionByAxis(1, b, dv)
        applyFrictionByAxis(2, b, dv)
    }

    // linear air or fluid friction - effectively v *= drag
    // body settings override global settings
    var drag = (b.airDrag >= 0) ? b.airDrag : self.airDrag
    if (b.inFluid) {
        drag = (b.fluidDrag >= 0) ? b.fluidDrag : self.fluidDrag
        drag *= 1 - (1 - b.ratioInFluid) ** 2
    }
    var mult = Math.max(1 - drag * dt / b.mass, 0)
    vec3.scale(b.velocity, b.velocity, mult)

    // x1-x0 = v1*dt
    vec3.scale(dx, b.velocity, dt)

    // clear forces and impulses for next timestep
    vec3.set(b._forces, 0, 0, 0)
    vec3.set(b._impulses, 0, 0, 0)

    // cache old position for use in autostepping
    if (b.autoStep) {
        cloneAABB(tmpBox, b.aabb)
    }

    // sweeps aabb along dx and accounts for collisions
    processCollisions(self, b.aabb, dx, b.resting)

    // if autostep, and on ground, run collisions again with stepped up aabb
    if (b.autoStep) {
        tryAutoStepping(self, b, tmpBox, dx)
    }

    // Collision impacts. b.resting shows which axes had collisions:
    for (var i = 0; i < 3; ++i) {
        impacts[i] = 0
        if (b.resting[i]) {
            // count impact only if wasn't collided last frame
            if (!oldResting[i]) impacts[i] = -b.velocity[i]
            b.velocity[i] = 0
        }
    }
    var mag = vec3.length(impacts)
    if (mag > .001) { // epsilon
        // send collision event - allows client to optionally change
        // body's restitution depending on what terrain it hit
        // event argument is impulse J = m * dv
        vec3.scale(impacts, impacts, b.mass)
        if (b.onCollide) b.onCollide(impacts)

        // bounce depending on restitution and minBounceImpulse
        if (b.restitution > 0 && mag > self.minBounceImpulse) {
            vec3.scale(impacts, impacts, b.restitution)
            b.applyImpulse(impacts)
        }
    }


    // sleep check
    var vsq = vec3.squaredLength(b.velocity)
    if (vsq > 1e-5) b._markActive()
}








/*
 *    FLUIDS
*/

function applyFluidForces(self, body) {
    // First pass at handling fluids. Assumes fluids are settled
    //   thus, only check at corner of body, and only from bottom up
    var box = body.aabb
    var cx = Math.floor(box.base[0])
    var cz = Math.floor(box.base[2])
    var y0 = Math.floor(box.base[1])
    var y1 = Math.floor(box.max[1])

    if (!self.testFluid(cx, y0, cz)) {
        body.inFluid = false
        body.ratioInFluid = 0
        return
    }

    // body is in a fluid - find out how much of body is submerged
    var submerged = 1
    var cy = y0 + 1
    while (cy <= y1 && self.testFluid(cx, cy, cz)) {
        submerged++
        cy++
    }
    var fluidLevel = y0 + submerged
    var heightInFluid = fluidLevel - box.base[1]
    var ratioInFluid = heightInFluid / box.vec[1]
    if (ratioInFluid > 1) ratioInFluid = 1
    var vol = box.vec[0] * box.vec[1] * box.vec[2]
    var displaced = vol * ratioInFluid
    // bouyant force = -gravity * fluidDensity * volumeDisplaced
    var f = _fluidVec
    vec3.scale(f, self.gravity, -self.fluidDensity * displaced)
    body.applyForce(f)

    body.inFluid = true
    body.ratioInFluid = ratioInFluid
}

var _fluidVec = vec3.create()





/*
 *    FRICTION
*/


function applyFrictionByAxis(axis, body, dvel) {
    // friction applies only if moving into a touched surface
    var restDir = body.resting[axis]
    var vNormal = dvel[axis]
    if (restDir === 0) return
    if (restDir * vNormal <= 0) return

    // current vel lateral to friction axis
    vec3.copy(lateralVel, body.velocity)
    lateralVel[axis] = 0
    var vCurr = vec3.length(lateralVel)
    if (equals(vCurr, 0)) return

    // treat current change in velocity as the result of a pseudoforce
    //        Fpseudo = m*dv/dt
    // Base friction force on normal component of the pseudoforce
    //        Ff = u * Fnormal
    //        Ff = u * m * dvnormal / dt
    // change in velocity due to friction force
    //        dvF = dt * Ff / m
    //            = dt * (u * m * dvnormal / dt) / m
    //            = u * dvnormal
    var dvMax = Math.abs(body.friction * vNormal)

    // decrease lateral vel by dvMax (or clamp to zero)
    var scaler = (vCurr > dvMax) ? (vCurr - dvMax) / vCurr : 0
    body.velocity[(axis + 1) % 3] *= scaler
    body.velocity[(axis + 2) % 3] *= scaler
}
var lateralVel = vec3.create()






/*
 *    COLLISION HANDLER
*/

// sweep aabb along velocity vector and set resting vector
function processCollisions(self, box, velocity, resting) {
    vec3.set(resting, 0, 0, 0)
    return sweep(self.testSolid, box, velocity, function (dist, axis, dir, vec) {
        resting[axis] = dir
        vec[axis] = 0
    })
}





/*
 *    AUTO-STEPPING
*/

var tmpBox = new aabb([], [])
var tmpResting = vec3.create()
var targetPos = vec3.create()
var upvec = vec3.create()
var leftover = vec3.create()

function tryAutoStepping(self, b, oldBox, dx) {
    if (b.resting[1] >= 0 && !b.inFluid) return

    // // direction movement was blocked before trying a step
    var xBlocked = (b.resting[0] !== 0)
    var zBlocked = (b.resting[2] !== 0)
    if (!(xBlocked || zBlocked)) return

    // continue autostepping only if headed sufficiently into obstruction
    var ratio = Math.abs(dx[0] / dx[2])
    var cutoff = 4
    if (!xBlocked && ratio > cutoff) return
    if (!zBlocked && ratio < 1 / cutoff) return

    // original target position before being obstructed
    vec3.add(targetPos, oldBox.base, dx)

    // move towards the target until the first X/Z collision
    var getVoxels = self.testSolid
    sweep(getVoxels, oldBox, dx, function (dist, axis, dir, vec) {
        if (axis === 1) vec[axis] = 0
        else return true
    })

    var y = b.aabb.base[1]
    var ydist = Math.floor(y + 1.001) - y
    vec3.set(upvec, 0, ydist, 0)
    var collided = false
    // sweep up, bailing on any obstruction
    sweep(getVoxels, oldBox, upvec, function (dist, axis, dir, vec) {
        collided = true
        return true
    })
    if (collided) return // could't move upwards

    // now move in X/Z however far was left over before hitting the obstruction
    vec3.subtract(leftover, targetPos, oldBox.base)
    leftover[1] = 0
    processCollisions(self, oldBox, leftover, tmpResting)

    // bail if no movement happened in the originally blocked direction
    if (xBlocked && !equals(oldBox.base[0], targetPos[0])) return
    if (zBlocked && !equals(oldBox.base[2], targetPos[2])) return

    // done - oldBox is now at the target autostepped position
    cloneAABB(b.aabb, oldBox)
    b.resting[0] = tmpResting[0]
    b.resting[2] = tmpResting[2]
    if (b.onStep) b.onStep()
}





/*
 *    SLEEP CHECK
*/

function bodyAsleep(self, body, dt, noGravity) {
    if (body._sleepFrameCount > 0) return false
    // without gravity bodies stay asleep until a force/impulse wakes them up
    if (noGravity) return true
    // otherwise check body is resting against something
    // i.e. sweep along by distance d = 1/2 g*t^2
    // and check there's still a collision
    var isResting = false
    var gmult = 0.5 * dt * dt * body.gravityMultiplier
    vec3.scale(sleepVec, self.gravity, gmult)
    sweep(self.testSolid, body.aabb, sleepVec, function () {
        isResting = true
        return true
    }, true)
    return isResting
}
var sleepVec = vec3.create()





function equals(a, b) { return Math.abs(a - b) < 1e-5 }

function cloneAABB(tgt, src) {
    for (var i = 0; i < 3; i++) {
        tgt.base[i] = src.base[i]
        tgt.max[i] = src.max[i]
        tgt.vec[i] = src.vec[i]
    }
}



var sanityCheck = function (v) { }
if (DEBUG) sanityCheck = function (v) {
    if (isNaN(vec3.length(v))) throw 'Vector with NAN: ' + v
}


/***/ }),

/***/ "../../game/noa/node_modules/voxel-physics-engine/src/rigidBody.js":
/*!*************************************************************************!*\
  !*** ../../game/noa/node_modules/voxel-physics-engine/src/rigidBody.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var aabb = __webpack_require__(/*! aabb-3d */ "../../game/noa/node_modules/aabb-3d/index.js")
var vec3 = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js")


var DEBUG = 0


module.exports = RigidBody



/*
 *    RIGID BODY - internal data structure
 *  Only AABB bodies right now. Someday will likely need spheres?
*/

function RigidBody(_aabb, mass, friction, restitution, gravMult, onCollide, autoStep) {
    this.aabb = new aabb(_aabb.base, _aabb.vec) // clone
    this.mass = mass
    this.friction = friction
    this.restitution = restitution
    this.gravityMultiplier = gravMult
    this.onCollide = onCollide
    this.autoStep = !!autoStep
    this.airDrag = -1   // overrides global airDrag when >= 0
    this.fluidDrag = -1 // overrides global fluidDrag when >= 0
    this.onStep = null

    // internal state
    this.velocity = vec3.create()
    this.resting = [0, 0, 0]
    this.inFluid = false

    // internals
    /** @internal */
    this._ratioInFluid = 0
    /** @internal */
    this._forces = vec3.create()
    /** @internal */
    this._impulses = vec3.create()
    /** @internal */
    this._sleepFrameCount = 10 | 0
}

RigidBody.prototype.setPosition = function (p) {
    sanityCheck(p)
    vec3.subtract(p, p, this.aabb.base)
    this.aabb.translate(p)
    this._markActive()
}
RigidBody.prototype.getPosition = function () {
    return vec3.clone(this.aabb.base)
}
RigidBody.prototype.applyForce = function (f) {
    sanityCheck(f)
    vec3.add(this._forces, this._forces, f)
    this._markActive()
}
RigidBody.prototype.applyImpulse = function (i) {
    sanityCheck(i)
    vec3.add(this._impulses, this._impulses, i)
    this._markActive()
}

/** @internal */
RigidBody.prototype._markActive = function () {
    this._sleepFrameCount = 10 | 0
}



// temp
RigidBody.prototype.atRestX = function () { return this.resting[0] }
RigidBody.prototype.atRestY = function () { return this.resting[1] }
RigidBody.prototype.atRestZ = function () { return this.resting[2] }





var sanityCheck = function (v) { }
if (DEBUG) sanityCheck = function (v) {
    if (isNaN(vec3.length(v))) throw 'Vector with NAN: ' + v
}


/***/ }),

/***/ "../../game/noa/src/components/collideEntities.js":
/*!********************************************************!*\
  !*** ../../game/noa/src/components/collideEntities.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

var boxIntersect = __webpack_require__(/*! box-intersect */ "../../game/noa/node_modules/box-intersect/index.js")



/*
 * 	Every frame, entities with this component will get mutually checked for colliions
 * 
 *   * cylinder: flag for checking collisions as a vertical cylindar (rather than AABB)
 *   * collideBits: category for this entity
 *   * collideMask: categories this entity collides with
 *   * callback: function(other_id) - called when `own.collideBits & other.collideMask` is true
 * 
 * 
 * 		Notes:
 * 	Set collideBits=0 for entities like bullets, which can collide with things 
 * 		but are never the target of a collision.
 * 	Set collideMask=0 for things with no callback - things that get collided with,
 * 		but don't themselves instigate collisions.
 * 
 */



/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {

    var intervals = []

    return {

        name: 'collideEntities',

        order: 70,

        state: {
            cylinder: false,
            collideBits: 1 | 0,
            collideMask: 1 | 0,
            callback: null,
        },

        onAdd: null,

        onRemove: null,


        system: function entityCollider(dt, states) {
            var ents = noa.ents

            // data struct that boxIntersect looks for
            // - array of [lo, lo, lo, hi, hi, hi] extents
            for (var i = 0; i < states.length; i++) {
                var id = states[i].__id
                var dat = ents.getPositionData(id)
                intervals[i] = dat._extents
            }
            intervals.length = states.length

            // run the intersect library
            boxIntersect(intervals, function (a, b) {
                var stateA = states[a]
                var stateB = states[b]
                if (!stateA || !stateB) return
                var intervalA = intervals[a]
                var intervalB = intervals[b]
                if (cylindricalHitTest(stateA, stateB, intervalA, intervalB)) {
                    handleCollision(noa, stateA, stateB)
                }
            })

        }
    }



    /*
     * 
     * 		IMPLEMENTATION
     * 
     */


    function handleCollision(noa, stateA, stateB) {
        var idA = stateA.__id
        var idB = stateB.__id

        // entities really do overlap, so check masks and call event handlers
        if (stateA.collideMask & stateB.collideBits) {
            if (stateA.callback) stateA.callback(idB)
        }
        if (stateB.collideMask & stateA.collideBits) {
            if (stateB.callback) stateB.callback(idA)
        }

        // general pairwise handler
        noa.ents.onPairwiseEntityCollision(idA, idB)
    }



    // For entities whose extents overlap, 
    // test if collision still happens when taking cylinder flags into account

    function cylindricalHitTest(stateA, stateB, intervalA, intervalB) {
        if (stateA.cylinder) {
            if (stateB.cylinder) {
                return cylinderCylinderTest(intervalA, intervalB)
            } else {
                return cylinderBoxTest(intervalA, intervalB)
            }
        } else if (stateB.cylinder) {
            return cylinderBoxTest(intervalB, intervalA)
        }
        return true
    }




    // Cylinder-cylinder hit test (AABBs are known to overlap)
    // given their extent arrays [lo, lo, lo, hi, hi, hi]

    function cylinderCylinderTest(a, b) {
        // distance between cylinder centers
        var rada = (a[3] - a[0]) / 2
        var radb = (b[3] - b[0]) / 2
        var dx = a[0] + rada - (b[0] + radb)
        var dz = a[2] + rada - (b[2] + radb)
        // collide if dist <= sum of radii
        var distsq = dx * dx + dz * dz
        var radsum = rada + radb
        return (distsq <= radsum * radsum)
    }




    // Cylinder-Box hit test (AABBs are known to overlap)
    // given their extent arrays [lo, lo, lo, hi, hi, hi]

    function cylinderBoxTest(cyl, cube) {
        // X-z center of cylinder
        var rad = (cyl[3] - cyl[0]) / 2
        var cx = cyl[0] + rad
        var cz = cyl[2] + rad
        // point in X-Z square closest to cylinder
        var px = clamp(cx, cube[0], cube[3])
        var pz = clamp(cz, cube[2], cube[5])
        // collision if distance from that point to circle <= cylinder radius
        var dx = px - cx
        var dz = pz - cz
        var distsq = dx * dx + dz * dz
        return (distsq <= rad * rad)
    }

    function clamp(val, lo, hi) {
        return (val < lo) ? lo : (val > hi) ? hi : val
    }




}


/***/ }),

/***/ "../../game/noa/src/components/collideTerrain.js":
/*!*******************************************************!*\
  !*** ../../game/noa/src/components/collideTerrain.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {
    return {

        name: 'collideTerrain',

        order: 0,

        state: {
            callback: null
        },

        onAdd: function (eid, state) {
            // add collide handler for physics engine to call
            var ents = noa.entities
            if (ents.hasPhysics(eid)) {
                var body = ents.getPhysics(eid).body
                body.onCollide = function bodyOnCollide(impulse) {
                    var cb = noa.ents.getCollideTerrain(eid).callback
                    if (cb) cb(impulse, eid)
                }
            }
        },

        onRemove: function (eid, state) {
            var ents = noa.entities
            if (ents.hasPhysics(eid)) {
                ents.getPhysics(eid).body.onCollide = null
            }
        },



    }
}


/***/ }),

/***/ "../../game/noa/src/components/fadeOnZoom.js":
/*!***************************************************!*\
  !*** ../../game/noa/src/components/fadeOnZoom.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

/**
 * Component for the player entity, when active hides the player's mesh 
 * when camera zoom is less than a certain amount
 */

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {
    return {

        name: 'fadeOnZoom',

        order: 99,

        state: {
            cutoff: 1.5,
            _showing: null,
        },

        onAdd: null,

        onRemove: null,

        system: function fadeOnZoomProc(dt, states) {
            var zoom = noa.camera.currentZoom
            var ents = noa.entities
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                checkZoom(state, zoom, ents)
            }
        }
    }
}


function checkZoom(state, zoom, ents) {
    if (!ents.hasMesh(state.__id)) return

    var shouldShow = (zoom > state.cutoff)
    if (state._showing !== shouldShow) {
        ents.getMeshData(state.__id).mesh.visibility = shouldShow
        state._showing = shouldShow
    }
}


/***/ }),

/***/ "../../game/noa/src/components/followsEntity.js":
/*!******************************************************!*\
  !*** ../../game/noa/src/components/followsEntity.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_0__);




/*
 * Indicates that an entity should be moved to another entity's position each tick,
 * possibly by a fixed offset, and the same for renderPositions each render
 */

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {

    return {

        name: 'followsEntity',

        order: 50,

        state: {
            entity: 0 | 0,
            offset: null,
            onTargetMissing: null,
        },

        onAdd: function (eid, state) {
            var off = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()
            state.offset = (state.offset) ? gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(off, state.offset) : off
            updatePosition(state)
            updateRenderPosition(state)
        },

        onRemove: null,


        // on tick, copy over regular positions
        system: function followEntity(dt, states) {
            for (var i = 0; i < states.length; i++) {
                updatePosition(states[i])
            }
        },


        // on render, copy over render positions
        renderSystem: function followEntityMesh(dt, states) {
            for (var i = 0; i < states.length; i++) {
                updateRenderPosition(states[i])
            }
        }
    }



    function updatePosition(state) {
        var id = state.__id
        var self = noa.ents.getPositionData(id)
        var other = noa.ents.getPositionData(state.entity)
        if (!other) {
            if (state.onTargetMissing) state.onTargetMissing(id)
            noa.ents.removeComponent(id, noa.ents.names.followsEntity)
        } else {
            gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().add(self._localPosition, other._localPosition, state.offset)
        }
    }

    function updateRenderPosition(state) {
        var id = state.__id
        var self = noa.ents.getPositionData(id)
        var other = noa.ents.getPositionData(state.entity)
        if (other) {
            gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().add(self._renderPosition, other._renderPosition, state.offset)
        }
    }

}


/***/ }),

/***/ "../../game/noa/src/components/mesh.js":
/*!*********************************************!*\
  !*** ../../game/noa/src/components/mesh.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_0__);




/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {
    return {

        name: 'mesh',

        order: 100,

        state: {
            mesh: null,
            offset: null
        },


        onAdd: function (eid, state) {
            // implicitly assume there's already a position component
            var posDat = noa.ents.getPositionData(eid)
            if (state.mesh) {
                noa.rendering.addMeshToScene(state.mesh, false, posDat.position)
            } else {
                throw new Error('Mesh component added without a mesh - probably a bug!')
            }
            if (!state.offset) state.offset = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()

            // set mesh to correct position
            var rpos = posDat._renderPosition
            state.mesh.position.copyFromFloats(
                rpos[0] + state.offset[0],
                rpos[1] + state.offset[1],
                rpos[2] + state.offset[2])
        },


        onRemove: function (eid, state) {
            state.mesh.dispose()
        },



        renderSystem: function (dt, states) {
            // before render move each mesh to its render position, 
            // set by the physics engine or driving logic
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var id = state.__id

                var rpos = noa.ents.getPositionData(id)._renderPosition
                state.mesh.position.copyFromFloats(
                    rpos[0] + state.offset[0],
                    rpos[1] + state.offset[1],
                    rpos[2] + state.offset[2])
            }
        }


    }
}


/***/ }),

/***/ "../../game/noa/src/components/movement.js":
/*!*************************************************!*\
  !*** ../../game/noa/src/components/movement.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MovementState": () => (/* binding */ MovementState),
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_0__);
/** @module noa.ents.comps.movement */







/** 
 * State object of the `movement` component
 * @class
*/
function MovementState() {
    this.heading = 0 // radians
    this.running = false
    this.jumping = false

    // options
    this.maxSpeed = 10
    this.moveForce = 30
    this.responsiveness = 15
    this.runningFriction = 0
    this.standingFriction = 2

    // jumps
    this.airMoveMult = 0.5
    this.jumpImpulse = 10
    this.jumpForce = 12
    this.jumpTime = 500 // ms
    this.airJumps = 1

    // internal state
    /** @internal */
    this._jumpCount = 0
    /** @internal */
    this._currjumptime = 0
    /** @internal */
    this._isJumping = false
}





/**
 * Movement component. State stores settings like jump height, etc.,
 * as well as current state (running, jumping, heading angle).
 * Processor checks state and applies movement/friction/jump forces
 * to the entity's physics body. 
 * @param {import('..').Engine} noa
 * @internal
*/

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {
    return {

        name: 'movement',

        order: 30,

        state: new MovementState(),

        onAdd: null,

        onRemove: null,


        system: function movementProcessor(dt, states) {
            var ents = noa.entities
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var phys = ents.getPhysics(state.__id)
                if (phys) applyMovementPhysics(dt, state, phys.body)
            }
        }


    }
}


var tempvec = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()
var tempvec2 = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()
var zeroVec = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()


/**
 * @internal
 * @param {number} dt 
 * @param {MovementState} state 
 * @param {*} body 
*/

function applyMovementPhysics(dt, state, body) {
    // move implementation originally written as external module
    //   see https://github.com/fenomas/voxel-fps-controller
    //   for original code

    // jumping
    var onGround = (body.atRestY() < 0)
    var canjump = (onGround || state._jumpCount < state.airJumps)
    if (onGround) {
        state._isJumping = false
        state._jumpCount = 0
    }

    // process jump input
    if (state.jumping) {
        if (state._isJumping) { // continue previous jump
            if (state._currjumptime > 0) {
                var jf = state.jumpForce
                if (state._currjumptime < dt) jf *= state._currjumptime / dt
                body.applyForce([0, jf, 0])
                state._currjumptime -= dt
            }
        } else if (canjump) { // start new jump
            state._isJumping = true
            if (!onGround) state._jumpCount++
            state._currjumptime = state.jumpTime
            body.applyImpulse([0, state.jumpImpulse, 0])
            // clear downward velocity on airjump
            if (!onGround && body.velocity[1] < 0) body.velocity[1] = 0
        }
    } else {
        state._isJumping = false
    }

    // apply movement forces if entity is moving, otherwise just friction
    var m = tempvec
    var push = tempvec2
    if (state.running) {

        var speed = state.maxSpeed
        // todo: add crouch/sprint modifiers if needed
        // if (state.sprint) speed *= state.sprintMoveMult
        // if (state.crouch) speed *= state.crouchMoveMult
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().set(m, 0, 0, speed)

        // rotate move vector to entity's heading
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().rotateY(m, m, zeroVec, state.heading)

        // push vector to achieve desired speed & dir
        // following code to adjust 2D velocity to desired amount is patterned on Quake: 
        // https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/bg_pmove.c#L275
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().subtract(push, m, body.velocity)
        push[1] = 0
        var pushLen = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().length(push)
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().normalize(push, push)

        if (pushLen > 0) {
            // pushing force vector
            var canPush = state.moveForce
            if (!onGround) canPush *= state.airMoveMult

            // apply final force
            var pushAmt = state.responsiveness * pushLen
            if (canPush > pushAmt) canPush = pushAmt

            gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().scale(push, push, canPush)
            body.applyForce(push)
        }

        // different friction when not moving
        // idea from Sonic: http://info.sonicretro.org/SPG:Running
        body.friction = state.runningFriction
    } else {
        body.friction = state.standingFriction
    }
}


/***/ }),

/***/ "../../game/noa/src/components/physics.js":
/*!************************************************!*\
  !*** ../../game/noa/src/components/physics.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "setPhysicsFromPosition": () => (/* binding */ setPhysicsFromPosition)
/* harmony export */ });
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_0__);




/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {


    return {

        name: 'physics',

        order: 40,

        state: {
            body: null,
        },


        onAdd: function (entID, state) {
            state.body = noa.physics.addBody()
            // implicitly assume body has a position component, to get size
            var posDat = noa.ents.getPositionData(state.__id)
            setPhysicsFromPosition(state, posDat)
        },


        onRemove: function (entID, state) {
            // update position before removing
            // this lets entity wind up at e.g. the result of a collision
            // even if physics component is removed in collision handler
            if (noa.ents.hasPosition(state.__id)) {
                var pdat = noa.ents.getPositionData(state.__id)
                setPositionFromPhysics(state, pdat)
                backtrackRenderPos(state, pdat, 0, false)
            }
            noa.physics.removeBody(state.body)
        },


        system: function (dt, states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var pdat = noa.ents.getPositionData(state.__id)
                setPositionFromPhysics(state, pdat)
            }
        },


        renderSystem: function (dt, states) {

            var tickPos = noa.positionInCurrentTick
            var tickTime = 1000 / noa.container._shell.tickRate
            tickTime *= noa.timeScale
            var tickMS = tickPos * tickTime

            // tickMS is time since last physics engine tick
            // to avoid temporal aliasing, render the state as if lerping between
            // the last position and the next one 
            // since the entity data is the "next" position this amounts to 
            // offsetting each entity into the past by tickRate - dt
            // http://gafferongames.com/game-physics/fix-your-timestep/

            var backtrackAmt = (tickMS - tickTime) / 1000
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var id = state.__id
                var pdat = noa.ents.getPositionData(id)
                var smoothed = noa.ents.cameraSmoothed(id)
                backtrackRenderPos(state, pdat, backtrackAmt, smoothed)
            }
        }

    }

}



// var offset = vec3.create()
var local = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()

function setPhysicsFromPosition(physState, posState) {
    var box = physState.body.aabb
    var ext = posState._extents
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(box.base, ext)
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().set(box.vec, posState.width, posState.height, posState.width)
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().add(box.max, box.base, box.vec)
}


function setPositionFromPhysics(physState, posState) {
    var base = physState.body.aabb.base
    var hw = posState.width / 2
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().set(posState._localPosition, base[0] + hw, base[1], base[2] + hw)
}


function backtrackRenderPos(physState, posState, backtrackAmt, smoothed) {
    // pos = pos + backtrack * body.velocity
    var vel = physState.body.velocity
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().scaleAndAdd(local, posState._localPosition, vel, backtrackAmt)

    // smooth out update if component is present
    // (this is set after sudden movements like auto-stepping)
    if (smoothed) gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().lerp(local, posState._renderPosition, local, 0.3)

    // copy values over to renderPosition, 
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(posState._renderPosition, local)
}


/***/ }),

/***/ "../../game/noa/src/components/position.js":
/*!*************************************************!*\
  !*** ../../game/noa/src/components/position.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "updatePositionExtents": () => (/* binding */ updatePositionExtents)
/* harmony export */ });
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_0__);




/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {

    /**
     * 
     * 	Component holding entity's position, width, and height.
     *  By convention, entity's "position" is the bottom center of its AABB
     * 
     *  Of the various properties, _localPosition is the "real", 
     *  single-source-of-truth position. Others are derived.
     *  Local coords are relative to `noa.worldOriginOffset`.
     * 
     *  Props:
     *      position: pos in global coords (may be low precision)
     *      _localPosition: precise pos in local coords
     *      _renderPosition: [x,y,z] in LOCAL COORDS
     *      _extents: array [lo, lo, lo, hi, hi, hi] in LOCAL COORDS
     * 
     */



    return {

        name: 'position',

        order: 60,

        state: {
            position: null,
            width: 0.8,
            height: 0.8,
            _localPosition: null,
            _renderPosition: null,
            _extents: null,
        },


        onAdd: function (eid, state) {
            // copy position into a plain array
            var pos = [0, 0, 0]
            if (state.position) gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(pos, state.position)
            state.position = pos

            state._localPosition = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()
            state._renderPosition = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()
            state._extents = new Float32Array(6)

            // on init only, set local from global
            noa.globalToLocal(state.position, null, state._localPosition)
            gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(state._renderPosition, state._localPosition)
            updatePositionExtents(state)
        },

        onRemove: null,



        system: function (dt, states) {
            var off = noa.worldOriginOffset
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().add(state.position, state._localPosition, off)
                updatePositionExtents(state)
            }
        },


    }
}



// update an entity's position state `_extents` 
function updatePositionExtents(state) {
    var hw = state.width / 2
    var lpos = state._localPosition
    var ext = state._extents
    ext[0] = lpos[0] - hw
    ext[1] = lpos[1]
    ext[2] = lpos[2] - hw
    ext[3] = lpos[0] + hw
    ext[4] = lpos[1] + state.height
    ext[5] = lpos[2] + hw
}


/***/ }),

/***/ "../../game/noa/src/components/receivesInputs.js":
/*!*******************************************************!*\
  !*** ../../game/noa/src/components/receivesInputs.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

/**
 * 
 * Input processing component - gets (key) input state and  
 * applies it to receiving entities by updating their movement 
 * component state (heading, movespeed, jumping, etc.)
 * 
 */

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {
    return {

        name: 'receivesInputs',

        order: 20,

        state: {},

        onAdd: null,

        onRemove: null,

        system: function inputProcessor(dt, states) {
            var ents = noa.entities
            var inputState = noa.inputs.state
            var camHeading = noa.camera.heading

            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var moveState = ents.getMovement(state.__id)
                setMovementState(moveState, inputState, camHeading)
            }
        }

    }
}



/**
 * @param {import('../components/movement').MovementState} state 
 * @param {Object<string, boolean>} inputs 
 * @param {number} camHeading 
 * @internal
*/

function setMovementState(state, inputs, camHeading) {
    state.jumping = !!inputs.jump

    var fb = inputs.forward ? (inputs.backward ? 0 : 1) : (inputs.backward ? -1 : 0)
    var rl = inputs.right ? (inputs.left ? 0 : 1) : (inputs.left ? -1 : 0)

    if ((fb | rl) === 0) {
        state.running = false
    } else {
        state.running = true
        if (fb) {
            if (fb == -1) camHeading += Math.PI
            if (rl) {
                camHeading += Math.PI / 4 * fb * rl // didn't plan this but it works!
            }
        } else {
            camHeading += rl * Math.PI / 2
        }
        state.heading = camHeading
    }

}


/***/ }),

/***/ "../../game/noa/src/components/shadow.js":
/*!***********************************************!*\
  !*** ../../game/noa/src/components/shadow.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babylonjs_core_Maths_math_color__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babylonjs/core/Maths/math.color */ "../../game/noa/node_modules/@babylonjs/core/Maths/math.color.js");
/* harmony import */ var _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babylonjs/core/Meshes/mesh */ "../../game/noa/node_modules/@babylonjs/core/Meshes/mesh.js");
/* harmony import */ var _babylonjs_core_Meshes_Builders_discBuilder__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/discBuilder */ "../../game/noa/node_modules/@babylonjs/core/Meshes/Builders/discBuilder.js");
/* harmony import */ var _babylonjs_core_Meshes_instancedMesh__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babylonjs/core/Meshes/instancedMesh */ "../../game/noa/node_modules/@babylonjs/core/Meshes/instancedMesh.js");









/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa, dist) {

    var shadowDist = dist

    // create a mesh to re-use for shadows
    var scene = noa.rendering.getScene()
    var disc = _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_2__.Mesh.CreateDisc('shadow', 0.75, 30, scene)
    disc.rotation.x = Math.PI / 2
    var mat = noa.rendering.makeStandardMaterial('shadowMat')
    mat.diffuseColor = _babylonjs_core_Maths_math_color__WEBPACK_IMPORTED_MODULE_1__.Color3.Black()
    mat.ambientColor = _babylonjs_core_Maths_math_color__WEBPACK_IMPORTED_MODULE_1__.Color3.Black()
    mat.alpha = 0.5
    disc.material = mat
    disc.setEnabled(false)

    // source mesh needn't be in the scene graph
    scene.removeMesh(disc)


    return {

        name: 'shadow',

        order: 80,

        state: {
            size: 0.5,
            _mesh: null,
        },


        onAdd: function (eid, state) {
            var mesh = disc.createInstance('shadow_instance')
            noa.rendering.addMeshToScene(mesh)
            mesh.setEnabled(false)
            state._mesh = mesh
        },


        onRemove: function (eid, state) {
            state._mesh.dispose()
        },


        system: function shadowSystem(dt, states) {
            var cpos = noa.camera._localGetPosition()
            var dist = shadowDist
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var posState = noa.ents.getPositionData(state.__id)
                var physState = noa.ents.getPhysics(state.__id)
                updateShadowHeight(noa, posState, physState, state._mesh, state.size, dist, cpos)
            }
        },


        renderSystem: function (dt, states) {
            // before render adjust shadow x/z to render positions
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var rpos = noa.ents.getPositionData(state.__id)._renderPosition
                var spos = state._mesh.position
                spos.x = rpos[0]
                spos.z = rpos[2]
            }
        }




    }
}

var shadowPos = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().fromValues(0, 0, 0)
var down = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().fromValues(0, -1, 0)

function updateShadowHeight(noa, posDat, physDat, mesh, size, shadowDist, camPos) {

    // local Y ground position - from physics or raycast
    var localY
    if (physDat && physDat.body.resting[1] < 0) {
        localY = posDat._localPosition[1]
    } else {
        var res = noa._localPick(posDat._localPosition, down, shadowDist)
        if (!res) {
            mesh.setEnabled(false)
            return
        }
        localY = res.position[1] - noa.worldOriginOffset[1]
    }

    // round Y pos and offset upwards slightly to avoid z-fighting
    localY = Math.round(localY)
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(shadowPos, posDat._localPosition)
    shadowPos[1] = localY
    var sqdist = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().squaredDistance(camPos, shadowPos)
    // offset ~ 0.01 for nearby shadows, up to 0.1 at distance of ~40
    var offset = 0.01 + 0.1 * (sqdist / 1600)
    if (offset > 0.1) offset = 0.1
    mesh.position.y = localY + offset
    // set shadow scale
    var dist = posDat._localPosition[1] - localY
    var scale = size * 0.7 * (1 - dist / shadowDist)
    mesh.scaling.copyFromFloats(scale, scale, scale)
    mesh.setEnabled(true)
}


/***/ }),

/***/ "../../game/noa/src/components/smoothCamera.js":
/*!*****************************************************!*\
  !*** ../../game/noa/src/components/smoothCamera.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(noa) {
    return {

        name: 'smooth-camera',

        order: 99,

        state: {
            time: 100.1
        },

        onAdd: null,

        onRemove: null,

        system: function (dt, states) {
            // remove self after time elapses
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                state.time -= dt
                if (state.time < 0) noa.ents.removeComponent(state.__id, 'smooth-camera')
            }
        },

    }
}


/***/ }),

/***/ "../../game/noa/src/components sync \\.js$":
/*!**************************************************************!*\
  !*** ../../game/noa/src/components/ sync nonrecursive \.js$ ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./collideEntities.js": "../../game/noa/src/components/collideEntities.js",
	"./collideTerrain.js": "../../game/noa/src/components/collideTerrain.js",
	"./fadeOnZoom.js": "../../game/noa/src/components/fadeOnZoom.js",
	"./followsEntity.js": "../../game/noa/src/components/followsEntity.js",
	"./mesh.js": "../../game/noa/src/components/mesh.js",
	"./movement.js": "../../game/noa/src/components/movement.js",
	"./physics.js": "../../game/noa/src/components/physics.js",
	"./position.js": "../../game/noa/src/components/position.js",
	"./receivesInputs.js": "../../game/noa/src/components/receivesInputs.js",
	"./shadow.js": "../../game/noa/src/components/shadow.js",
	"./smoothCamera.js": "../../game/noa/src/components/smoothCamera.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "../../game/noa/src/components sync \\.js$";

/***/ }),

/***/ "../../game/noa/src/index.js":
/*!***********************************!*\
  !*** ../../game/noa/src/index.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Engine": () => (/* binding */ Engine)
/* harmony export */ });
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ndarray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ndarray */ "../../game/noa/node_modules/ndarray/ndarray.js");
/* harmony import */ var ndarray__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ndarray__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! events */ "../../game/noa/node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var fast_voxel_raycast__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fast-voxel-raycast */ "../../game/noa/node_modules/fast-voxel-raycast/index.js");
/* harmony import */ var fast_voxel_raycast__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(fast_voxel_raycast__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _lib_inputs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lib/inputs */ "../../game/noa/src/lib/inputs.js");
/* harmony import */ var _lib_container__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./lib/container */ "../../game/noa/src/lib/container.js");
/* harmony import */ var _lib_camera__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./lib/camera */ "../../game/noa/src/lib/camera.js");
/* harmony import */ var _lib_entities__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./lib/entities */ "../../game/noa/src/lib/entities.js");
/* harmony import */ var _lib_objectMesher__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./lib/objectMesher */ "../../game/noa/src/lib/objectMesher.js");
/* harmony import */ var _lib_terrainMesher__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./lib/terrainMesher */ "../../game/noa/src/lib/terrainMesher.js");
/* harmony import */ var _lib_registry__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./lib/registry */ "../../game/noa/src/lib/registry.js");
/* harmony import */ var _lib_rendering__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./lib/rendering */ "../../game/noa/src/lib/rendering.js");
/* harmony import */ var _lib_physics__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./lib/physics */ "../../game/noa/src/lib/physics.js");
/* harmony import */ var _lib_world__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./lib/world */ "../../game/noa/src/lib/world.js");
/* harmony import */ var _lib_util__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./lib/util */ "../../game/noa/src/lib/util.js");
/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../package.json */ "../../game/noa/package.json");
/** @module noa */

/*!
 * noa: an experimental voxel game engine.
 * @url      github.com/fenomas/noa
 * @author   Andy Hall <andy@fenomas.com>
 * @license  MIT
 */




















var version = _package_json__WEBPACK_IMPORTED_MODULE_15__.version



// profile every N ticks/renders
var PROFILE = 0
var PROFILE_RENDER = 0


var defaultOptions = {
    debug: false,
    silent: false,
    playerHeight: 1.8,
    playerWidth: 0.6,
    playerStart: [0, 10, 0],
    playerAutoStep: false,
    tickRate: 30,           // ticks per second
    maxRenderRate: 0,       // max FPS, 0 for uncapped 
    blockTestDistance: 10,
    stickyPointerLock: true,
    dragCameraOutsidePointerLock: true,
    stickyFullscreen: false,
    skipDefaultHighlighting: false,
    originRebaseDistance: 25,
}


/**
 * Main engine class.  
 * Takes an object full of optional settings as a parameter.
 * 
 * ```js
 * import { Engine } from 'noa-engine'
 * var noa = new Engine({
 *    debug: false,
 * })
 * ```
 * 
 * Note that the options object is also passed to noa's 
 * child modules ({@link Rendering}, {@link Container}, etc).
 * See docs for each module for their options.
 * 
 * @emits tick(dt)
 * @emits beforeRender(dt)
 * @emits afterRender(dt)
 * @emits targetBlockChanged(blockDesc)
*/

class Engine extends events__WEBPACK_IMPORTED_MODULE_2__.EventEmitter {

    /**
     * The core Engine constructor uses the following options:
     * 
     * ```js
     * var defaultOptions = {
     *    debug: false,
     *    silent: false,
     *    playerHeight: 1.8,
     *    playerWidth: 0.6,
     *    playerStart: [0, 10, 0],
     *    playerAutoStep: false,
     *    tickRate: 30,           // ticks per second
     *    maxRenderRate: 0,       // max FPS, 0 for uncapped 
     *    blockTestDistance: 10,
     *    stickyPointerLock: true,
     *    dragCameraOutsidePointerLock: true,
     *    stickyFullscreen: false,
     *    skipDefaultHighlighting: false,
     *    originRebaseDistance: 25,
     * }
     * ```
    */
    constructor(opts = {}) {
        super()
        opts = Object.assign({}, defaultOptions, opts)

        /** Version string, e.g. `"0.25.4"` */
        this.version = version
        if (!opts.silent) {
            var debugstr = (opts.debug) ? ' (debug)' : ''
            console.log(`noa-engine v${this.version}${debugstr}`)
        }

        /** @internal */
        this._paused = false

        /** @internal */
        this._dragOutsideLock = opts.dragCameraOutsidePointerLock

        /** @internal */
        this._originRebaseDistance = opts.originRebaseDistance

        // world origin offset, used throughout engine for origin rebasing
        /** @internal */
        this.worldOriginOffset = [0, 0, 0]

        // how far engine is into the current tick. Updated each render.
        /** @internal */
        this.positionInCurrentTick = 0

        /** 
         * String identifier for the current world. 
         * It's safe to ignore this if your game has only one level/world. 
        */
        this.worldName = 'default'

        /**
         * Multiplier for how fast time moves. Setting this to a value other than 
         * `1` will make the game speed up or slow down. This can significantly 
         * affect how core systems behave (particularly physics!).
        */
        this.timeScale = 1

        /** Child module for managing the game's container, canvas, etc. */
        this.container = new _lib_container__WEBPACK_IMPORTED_MODULE_5__.Container(this, opts)

        /** The game's tick rate (ticks per second) 
         * @readonly 
        */
        this.tickRate = this.container._shell.tickRate
        Object.defineProperty(this, 'tickRate', {
            get: () => this.container._shell.tickRate
        })

        /** The game's max framerate (use `0` for uncapped) */
        this.maxRenderRate = this.container._shell.maxRenderRate
        Object.defineProperty(this, 'maxRenderRate', {
            get: () => this.container._shell.maxRenderRate,
            set: (v) => { this.container._shell.maxRenderRate = v || 0 },
        })


        /** Inputs manager - abstracts key/mouse input */
        this.inputs = (0,_lib_inputs__WEBPACK_IMPORTED_MODULE_4__.createInputs)(this, opts, this.container.element)

        /** A registry where voxel/material properties are managed */
        this.registry = new _lib_registry__WEBPACK_IMPORTED_MODULE_10__.Registry(this, opts)

        /** Manages the world, chunks, and all voxel data */
        this.world = new _lib_world__WEBPACK_IMPORTED_MODULE_13__.World(this, opts)

        /** Rendering manager */
        this.rendering = new _lib_rendering__WEBPACK_IMPORTED_MODULE_11__.Rendering(this, opts, this.container.canvas)

        /** Physics engine - solves collisions, properties, etc. */
        this.physics = new _lib_physics__WEBPACK_IMPORTED_MODULE_12__.Physics(this, opts)

        /** Entity manager / Entity Component System (ECS) */
        this.entities = new _lib_entities__WEBPACK_IMPORTED_MODULE_7__.Entities(this, opts)

        /** Alias to `noa.entities` */
        this.ents = this.entities
        var ents = this.entities

        /** Entity id for the player entity */
        this.playerEntity = ents.add(
            opts.playerStart, // starting location
            opts.playerWidth, opts.playerHeight,
            null, null, // no mesh for now, no meshOffset, 
            true, true
        )

        // make player entity it collide with terrain and other entities
        ents.addComponent(this.playerEntity, ents.names.collideTerrain)
        ents.addComponent(this.playerEntity, ents.names.collideEntities)

        // adjust default physics parameters
        var body = ents.getPhysics(this.playerEntity).body
        body.gravityMultiplier = 2 // less floaty
        body.autoStep = opts.playerAutoStep // auto step onto blocks

        // input component - sets entity's movement state from key inputs
        ents.addComponent(this.playerEntity, ents.names.receivesInputs)

        // add a component to make player mesh fade out when zooming in
        ents.addComponent(this.playerEntity, ents.names.fadeOnZoom)

        // movement component - applies movement forces
        ents.addComponent(this.playerEntity, ents.names.movement, {
            airJumps: 1
        })

        /** Manages the game's camera, view angle, sensitivity, etc. */
        this.camera = new _lib_camera__WEBPACK_IMPORTED_MODULE_6__.Camera(this, opts)

        /** How far to check for a solid voxel the player is currently looking at */
        this.blockTestDistance = opts.blockTestDistance

        /** 
         * Callback to determine which voxels can be targeted. 
         * Defaults to a solidity check, but can be overridden with arbitrary logic.
         * @type {(blockID: number) => boolean} 
        */
        this.blockTargetIdCheck = this.registry.getBlockSolidity

        /** 
         * Dynamically updated object describing the currently targeted block.
         * @type {null | { 
         *      blockID:number,
         *      position: number[],
         *      normal: number[],
         *      adjacent: number[],
         * }} 
        */
        this.targetedBlock = null

        // add a default block highlighting function
        if (!opts.skipDefaultHighlighting) {
            // the default listener, defined onto noa in case people want to remove it later
            this.defaultBlockHighlightFunction = (tgt) => {
                if (tgt) {
                    this.rendering.highlightBlockFace(true, tgt.position, tgt.normal)
                } else {
                    this.rendering.highlightBlockFace(false)
                }
            }
            this.on('targetBlockChanged', this.defaultBlockHighlightFunction)
        }


        /*
         *
         *      Various internals...
         *
        */

        /** @internal */
        this._terrainMesher = new _lib_terrainMesher__WEBPACK_IMPORTED_MODULE_9__.default(this)

        /** @internal */
        this._objectMesher = new _lib_objectMesher__WEBPACK_IMPORTED_MODULE_8__.default(this)

        /** @internal */
        this._targetedBlockDat = {
            blockID: 0,
            position: gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create(),
            normal: gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create(),
            adjacent: gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create(),
        }

        /** @internal */
        this._prevTargetHash = 0

        /** @internal */
        this.makeTargetHash = (pos, norm, id) => {
            var N = (0,_lib_util__WEBPACK_IMPORTED_MODULE_14__.locationHasher)(pos[0] + id, pos[1], pos[2])
            return N ^ (0,_lib_util__WEBPACK_IMPORTED_MODULE_14__.locationHasher)(norm[0], norm[1] + id, norm[2])
        }

        /** @internal */
        this._pickPos = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()

        /** @internal */
        this._pickResult = {
            _localPosition: gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create(),
            position: [0, 0, 0],
            normal: [0, 0, 0],
        }





        // temp hacks for development
        if (opts.debug) {
            // expose often-used classes
            /** @internal */
            this.vec3 = (gl_vec3__WEBPACK_IMPORTED_MODULE_0___default())
            /** @internal */
            this.ndarray = (ndarray__WEBPACK_IMPORTED_MODULE_1___default())
            // gameplay tweaks
            ents.getMovement(1).airJumps = 999
            // decorate window while making TS happy
            var win = /** @type {any} */ (window)
            win.noa = this
            win.vec3 = (gl_vec3__WEBPACK_IMPORTED_MODULE_0___default())
            win.ndarray = (ndarray__WEBPACK_IMPORTED_MODULE_1___default())
            win.scene = this.rendering._scene
        }

        // add hooks to throw helpful errors when using deprecated methods
        deprecateStuff(this)
    }



    /*
     *
     *
     *              Core Engine APIs
     *
     *
    */

    /**
     * Tick function, called by container module at a fixed timestep. 
     * Clients should not normally need to call this manually.
     * @internal
    */

    tick(dt) {
        dt *= this.timeScale || 1

        // note dt is a fixed value, not an observed delay
        if (this._paused) {
            if (this.world.worldGenWhilePaused) this.world.tick()
            return
        }
        profile_hook('start')
        checkWorldOffset(this)
        this.world.tick() // chunk creation/removal
        profile_hook('world')
        if (!this.world.playerChunkLoaded) {
            // when waiting on worldgen, just tick the meshing queue and exit
            this.rendering.tick(dt)
            return
        }
        this.physics.tick(dt) // iterates physics
        profile_hook('physics')
        this._objectMesher.tick() // rebuild objects if needed
        this.rendering.tick(dt) // does deferred chunk meshing
        profile_hook('rendering')
        updateBlockTargets(this) // finds targeted blocks, and highlights one if needed
        profile_hook('targets')
        this.entities.tick(dt) // runs all entity systems
        profile_hook('entities')
        this.emit('tick', dt)
        profile_hook('tick event')
        profile_hook('end')
        // clear accumulated scroll inputs (mouseMove is cleared on render)
        var st = this.inputs.state
        st.scrollx = st.scrolly = st.scrollz = 0
    }




    /**
     * Render function, called every animation frame. Emits #beforeRender(dt), #afterRender(dt) 
     * where dt is the time in ms *since the last tick*.
     * Clients should not normally need to call this manually.
     * @internal
    */
    render(dt, framePart) {
        dt *= this.timeScale || 1

        // note: framePart is how far we are into the current tick
        // dt is the *actual* time (ms) since last render, for
        // animating things that aren't tied to game tick rate

        // frame position - for rendering movement between ticks
        this.positionInCurrentTick = framePart

        // when paused, just optionally ping worldgen, then exit
        if (this._paused) {
            if (this.world.worldGenWhilePaused) this.world.render()
            return
        }

        profile_hook_render('start')

        // only move camera during pointerlock or mousedown, or if pointerlock is unsupported
        if (this.container.hasPointerLock ||
            !this.container.supportsPointerLock ||
            (this._dragOutsideLock && this.inputs.state.fire)) {
            this.camera.applyInputsToCamera()
        }
        profile_hook_render('init')

        // brief run through meshing queue
        this.world.render()
        profile_hook_render('meshing')

        // entity render systems
        this.camera.updateBeforeEntityRenderSystems()
        this.entities.render(dt)
        this.camera.updateAfterEntityRenderSystems()
        profile_hook_render('entities')

        // events and render
        this.emit('beforeRender', dt)
        profile_hook_render('before render')

        this.rendering.render()
        this.rendering.postRender()
        profile_hook_render('render')

        this.emit('afterRender', dt)
        profile_hook_render('after render')
        profile_hook_render('end')

        // clear accumulated mouseMove inputs (scroll inputs cleared on render)
        this.inputs.state.dx = this.inputs.state.dy = 0
    }




    /** Pausing the engine will also stop render/tick events, etc. */
    setPaused(paused = false) {
        this._paused = !!paused
        // when unpausing, clear any built-up mouse inputs
        if (!paused) {
            this.inputs.state.dx = this.inputs.state.dy = 0
        }
    }

    /** 
     * Get the voxel ID at the specified position
    */
    getBlock(x, y = 0, z = 0) {
        if (x.length) return this.world.getBlockID(x[0], x[1], x[2])
        return this.world.getBlockID(x, y, z)
    }

    /** 
     * Sets the voxel ID at the specified position. 
     * Does not check whether any entities are in the way! 
     */
    setBlock(id, x, y = 0, z = 0) {
        if (x.length) return this.world.setBlockID(x[0], x[1], x[2])
        return this.world.setBlockID(id, x, y, z)
    }

    /**
     * Adds a block, unless there's an entity in the way.
    */
    addBlock(id, x, y = 0, z = 0) {
        // add a new terrain block, if nothing blocks the terrain there
        if (x.length) {
            if (this.entities.isTerrainBlocked(x[0], x[1], x[2])) return
            this.world.setBlockID(id, x[0], x[1], x[2])
            return id
        } else {
            if (this.entities.isTerrainBlocked(x, y, z)) return
            this.world.setBlockID(id, x, y, z)
            return id
        }
    }







    /*
     *              Rebasing local <-> global coords
    */


    /** 
     * Precisely converts a world position to the current internal 
     * local frame of reference.
     * 
     * See `/docs/positions.md` for more info.
     * 
     * Params: 
     *  * `global`: input position in global coords
     *  * `globalPrecise`: (optional) sub-voxel offset to the global position
     *  * `local`: output array which will receive the result
     */
    globalToLocal(global, globalPrecise, local) {
        var off = this.worldOriginOffset
        if (globalPrecise) {
            for (var i = 0; i < 3; i++) {
                var coord = global[i] - off[i]
                coord += globalPrecise[i]
                local[i] = coord
            }
            return local
        } else {
            return gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().subtract(local, global, off)
        }
    }

    /** 
     * Precisely converts a world position to the current internal 
     * local frame of reference.
     * 
     * See `/docs/positions.md` for more info.
     * 
     * Params: 
     *  * `local`: input array of local coords
     *  * `global`: output array which receives the result
     *  * `globalPrecise`: (optional) sub-voxel offset to the output global position
     * 
     * If both output arrays are passed in, `global` will get int values and 
     * `globalPrecise` will get fractional parts. If only one array is passed in,
     * `global` will get the whole output position.
    */
    localToGlobal(local, global, globalPrecise = null) {
        var off = this.worldOriginOffset
        if (globalPrecise) {
            for (var i = 0; i < 3; i++) {
                var floored = Math.floor(local[i])
                global[i] = floored + off[i]
                globalPrecise[i] = local[i] - floored
            }
            return global
        } else {
            return gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().add(global, local, off)
        }
    }




    /*
     *              Picking / raycasting
    */

    /**
     * Raycast through the world, returning a result object for any non-air block
     * 
     * See `/docs/positions.md` for info on working with precise positions.
     * 
     * @param {number[]} pos where to pick from (default: player's eye pos)
     * @param {number[]} dir direction to pick along (default: camera vector)
     * @param {number} dist pick distance (default: `noa.blockTestDistance`)
     * @param {(id:number) => boolean} blockTestFunction which voxel IDs can be picked (default: any solid voxel)
    */
    pick(pos = null, dir = null, dist = -1, blockTestFunction = null) {
        if (dist === 0) return null
        // input position to local coords, if any
        var pickPos = this._pickPos
        if (pos) {
            this.globalToLocal(pos, null, pickPos)
            pos = pickPos
        }
        return this._localPick(pos, dir, dist, blockTestFunction)
    }


    /**
     * @internal
     * Do a raycast in local coords. 
     * See `/docs/positions.md` for more info.
     * @param {number[]} pos where to pick from (default: player's eye pos)
     * @param {number[]} dir direction to pick along (default: camera vector)
     * @param {number} dist pick distance (default: `noa.blockTestDistance`)
     * @param {(id:number) => boolean} blockTestFunction which voxel IDs can be picked (default: any solid voxel)
     * @returns { null | {
     *      position: number[],
     *      normal: number[],
     *      _localPosition: number[],
     * }}
     */
    _localPick(pos = null, dir = null, dist = -1, blockTestFunction = null) {
        // do a raycast in local coords - result obj will be in global coords
        if (dist === 0) return null
        var testFn = blockTestFunction || this.registry.getBlockSolidity
        var world = this.world
        var off = this.worldOriginOffset
        var testVoxel = function (x, y, z) {
            var id = world.getBlockID(x + off[0], y + off[1], z + off[2])
            return testFn(id)
        }
        if (!pos) pos = this.camera._localGetTargetPosition()
        dir = dir || this.camera.getDirection()
        dist = dist || -1
        if (dist < 0) dist = this.blockTestDistance
        var result = this._pickResult
        var rpos = result._localPosition
        var rnorm = result.normal
        var hit = fast_voxel_raycast__WEBPACK_IMPORTED_MODULE_3___default()(testVoxel, pos, dir, dist, rpos, rnorm)
        if (!hit) return null
        // position is right on a voxel border - adjust it so that flooring works reliably
        // adjust along normal direction, i.e. away from the block struck
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().scaleAndAdd(rpos, rpos, rnorm, 0.01)
        // add global result
        this.localToGlobal(rpos, result.position)
        return result
    }

}



/*
 * 
 * 
 * 
 *                  INTERNAL HELPERS
 * 
 * 
 * 
 * 
*/




/*
 *
 *      rebase world origin offset around the player if necessary
 *
*/
function checkWorldOffset(noa) {
    var lpos = noa.ents.getPositionData(noa.playerEntity)._localPosition
    var cutoff = noa._originRebaseDistance
    if (gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().sqrLen(lpos) < cutoff * cutoff) return
    var delta = []
    for (var i = 0; i < 3; i++) {
        delta[i] = Math.floor(lpos[i])
        noa.worldOriginOffset[i] += delta[i]
    }
    noa.rendering._rebaseOrigin(delta)
    noa.entities._rebaseOrigin(delta)
    noa._objectMesher._rebaseOrigin(delta)
}





// Each frame, by default pick along the player's view vector 
// and tell rendering to highlight the struck block face
function updateBlockTargets(noa) {
    var newhash = 0
    var blockIdFn = noa.blockTargetIdCheck || noa.registry.getBlockSolidity
    var result = noa._localPick(null, null, null, blockIdFn)
    if (result) {
        var dat = noa._targetedBlockDat
        // pick stops just shy of voxel boundary, so floored pos is the adjacent voxel
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().floor(dat.adjacent, result.position)
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(dat.normal, result.normal)
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().subtract(dat.position, dat.adjacent, dat.normal)
        dat.blockID = noa.world.getBlockID(dat.position[0], dat.position[1], dat.position[2])
        noa.targetedBlock = dat
        newhash = noa.makeTargetHash(dat.position, dat.normal, dat.blockID, _lib_util__WEBPACK_IMPORTED_MODULE_14__.locationHasher)
    } else {
        noa.targetedBlock = null
    }
    if (newhash != noa._prevTargetHash) {
        noa.emit('targetBlockChanged', noa.targetedBlock)
        noa._prevTargetHash = newhash
    }
}



/*
 * 
 *  add some hooks for guidance on removed APIs
 * 
 */

function deprecateStuff(noa) {
    var ver = `0.27`
    var dep = (loc, name, msg) => {
        var throwFn = () => { throw `This property changed in ${ver} - ${msg}` }
        Object.defineProperty(loc, name, { get: throwFn, set: throwFn })
    }
    dep(noa, 'getPlayerEyePosition', 'to get the camera/player offset see API docs for `noa.camera.cameraTarget`')
    dep(noa, 'setPlayerEyePosition', 'to set the camera/player offset see API docs for `noa.camera.cameraTarget`')
    dep(noa, 'getPlayerPosition', 'use `noa.ents.getPosition(noa.playerEntity)` or similar')
    dep(noa, 'getCameraVector', 'use `noa.camera.getDirection`')
    dep(noa, 'getPlayerMesh', 'use `noa.ents.getMeshData(noa.playerEntity).mesh` or similar')
    dep(noa, 'playerBody', 'use `noa.ents.getPhysicsBody(noa.playerEntity)`')
    dep(noa.rendering, 'zoomDistance', 'use `noa.camera.zoomDistance`')
    dep(noa.rendering, '_currentZoom', 'use `noa.camera.currentZoom`')
    dep(noa.rendering, '_cameraZoomSpeed', 'use `noa.camera.zoomSpeed`')
    dep(noa.rendering, 'getCameraVector', 'use `noa.camera.getDirection`')
    dep(noa.rendering, 'getCameraPosition', 'use `noa.camera.getLocalPosition`')
    dep(noa.rendering, 'getCameraRotation', 'use `noa.camera.heading` and `noa.camera.pitch`')
    dep(noa.rendering, 'setCameraRotation', 'to customize camera behavior see API docs for `noa.camera`')
    ver = '0.28'
    dep(noa.rendering, 'makeMeshInstance', 'removed, use Babylon\'s `mesh.createInstance`')
    dep(noa.world, '_maxChunksPendingCreation', 'use `maxChunksPendingCreation` (no "_")')
    dep(noa.world, '_maxChunksPendingMeshing', 'use `maxChunksPendingMeshing` (no "_")')
    dep(noa.world, '_maxProcessingPerTick', 'use `maxProcessingPerTick` (no "_")')
    dep(noa.world, '_maxProcessingPerRender', 'use `maxProcessingPerRender` (no "_")')
    ver = '0.29'
    dep(noa, '_constants', 'removed, voxel IDs are no longer packed with bit flags')
    ver = '0.30'
    dep(noa, '_tickRate', 'tickRate is now at `noa.tickRate`')
    dep(noa.container, '_tickRate', 'tickRate is now at `noa.tickRate`')
    ver = '0.31'
    dep(noa.world, 'chunkSize', 'effectively an internal, so changed to `_chunkSize`')
    dep(noa.world, 'chunkAddDistance', 'set this with `noa.world.setAddRemoveDistance`')
    dep(noa.world, 'chunkRemoveDistance', 'set this with `noa.world.setAddRemoveDistance`')
}





var makeProfileHook = __webpack_require__(/*! ./lib/util */ "../../game/noa/src/lib/util.js").makeProfileHook
var profile_hook = (PROFILE > 0) ?
    makeProfileHook(PROFILE, 'tick   ') : () => { }
var profile_hook_render = (PROFILE_RENDER > 0) ?
    makeProfileHook(PROFILE_RENDER, 'render ') : () => { }


/***/ }),

/***/ "../../game/noa/src/lib/camera.js":
/*!****************************************!*\
  !*** ../../game/noa/src/lib/camera.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Camera": () => (/* binding */ Camera)
/* harmony export */ });
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var aabb_3d__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! aabb-3d */ "../../game/noa/node_modules/aabb-3d/index.js");
/* harmony import */ var aabb_3d__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(aabb_3d__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var voxel_aabb_sweep__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! voxel-aabb-sweep */ "../../game/noa/node_modules/voxel-aabb-sweep/index.js");
/* harmony import */ var voxel_aabb_sweep__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(voxel_aabb_sweep__WEBPACK_IMPORTED_MODULE_2__);
/** 
 * The Camera class is found at [[Camera | `noa.camera`]].
 * @module noa.camera
 */







// default options
var defaults = {
    inverseX: false,
    inverseY: false,
    sensitivityX: 10,
    sensitivityY: 10,
    initialZoom: 0,
    zoomSpeed: 0.2,
}


// locals
var tempVectors = [
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create(),
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create(),
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create(),
]
var originVector = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()


/**
 * `noa.camera` - manages the camera, its position and direction, 
 * mouse sensitivity, and so on.
 * 
 * This module uses the following default options (from the options
 * object passed to the [[Engine]]):
 * ```js
 * var defaults = {
 *     inverseX: false,
 *     inverseY: false,
 *     sensitivityX: 10,
 *     sensitivityY: 10,
 *     initialZoom: 0,
 *     zoomSpeed: 0.2,
 * }
 * ```
*/

class Camera {

    /** @internal */
    constructor(noa, opts) {
        opts = Object.assign({}, defaults, opts)

        /** 
         * @internal
         * @type {import('../index').Engine}
        */
        this.noa = noa

        /** Horizontal mouse sensitivity. Same scale as Overwatch (typical values around `5..10`) */
        this.sensitivityX = +opts.sensitivityX

        /** Vertical mouse sensitivity. Same scale as Overwatch (typical values around `5..10`) */
        this.sensitivityY = +opts.sensitivityY

        /** Mouse look inverse (horizontal) */
        this.inverseX = !!opts.inverseX

        /** Mouse look inverse (vertical) */
        this.inverseY = !!opts.inverseY

        /** 
         * Camera yaw angle. 
         * Returns the camera's rotation angle around the vertical axis. 
         * Range: `0..2π`  
         * This value is writeable, but it's managed by the engine and 
         * will be overwritten each frame.
        */
        this.heading = 0

        /** Camera pitch angle. 
         * Returns the camera's up/down rotation angle. The pitch angle is 
         * clamped by a small epsilon, such that the camera never quite 
         * points perfectly up or down.  
         * Range: `-π/2..π/2`.  
         * This value is writeable, but it's managed by the engine and 
         * will be overwritten each frame.
        */
        this.pitch = 0

        /** 
         * Entity ID of a special entity that exists for the camera to point at.
         * 
         * By default this entity follows the player entity, so you can 
         * change the player's eye height by changing the `follow` component's offset:
         * ```js
         * var followState = noa.ents.getState(noa.camera.cameraTarget, 'followsEntity')
         * followState.offset[1] = 0.9 * myPlayerHeight
         * ```
         * 
         * For customized camera controls you can change the follow 
         * target to some other entity, or override the behavior entirely:
         * ```js
         * // make cameraTarget stop following the player
         * noa.ents.removeComponent(noa.camera.cameraTarget, 'followsEntity')
         * // control cameraTarget position directly (or whatever..)
         * noa.ents.setPosition(noa.camera.cameraTarget, [x,y,z])
         * ```
        */
        this.cameraTarget = this.noa.ents.createEntity(['position'])

        // make the camera follow the cameraTarget entity
        var eyeOffset = 0.9 * noa.ents.getPositionData(noa.playerEntity).height
        noa.ents.addComponent(this.cameraTarget, 'followsEntity', {
            entity: noa.playerEntity,
            offset: [0, eyeOffset, 0],
        })

        /** How far back the camera should be from the player's eye position */
        this.zoomDistance = opts.initialZoom

        /** How quickly the camera moves to its `zoomDistance` (0..1) */
        this.zoomSpeed = opts.zoomSpeed

        /** Current actual zoom distance. This differs from `zoomDistance` when
         * the camera is in the process of moving towards the desired distance, 
         * or when it's obstructed by solid terrain behind the player.
         * @readonly
        */
        this.currentZoom = opts.initialZoom
        /** @internal */
        this._currentZoom = this.currentZoom
        Object.defineProperty(this, 'currentZoom', { get: () => this._currentZoom })

        /** @internal */
        this._dirVector = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().fromValues(0, 0, 1)
    }




    /*
     * 
     * 
     *          API
     * 
     * 
    */


    /*
     *      Local position functions for high precision
    */
    /** @internal */
    _localGetTargetPosition() {
        var pdat = this.noa.ents.getPositionData(this.cameraTarget)
        var pos = tempVectors[0]
        return gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(pos, pdat._renderPosition)
    }
    /** @internal */
    _localGetPosition() {
        var loc = this._localGetTargetPosition()
        if (this._currentZoom === 0) return loc
        return gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().scaleAndAdd(loc, loc, this._dirVector, -this._currentZoom)
    }



    /**
     * Returns the camera's current target position - i.e. the player's 
     * eye position. When the camera is zoomed all the way in, 
     * this returns the same location as `camera.getPosition()`.
    */
    getTargetPosition() {
        var loc = this._localGetTargetPosition()
        var globalCamPos = tempVectors[1]
        return this.noa.localToGlobal(loc, globalCamPos)
    }


    /**
     * Returns the current camera position (read only)
    */
    getPosition() {
        var loc = this._localGetPosition()
        var globalCamPos = tempVectors[2]
        return this.noa.localToGlobal(loc, globalCamPos)
    }


    /**
     * Returns the camera direction vector (read only)
    */
    getDirection() {
        return this._dirVector
    }




    /*
     * 
     * 
     * 
     *          internals below
     * 
     * 
     * 
    */



    /**
     * Called before render, if mouseLock etc. is applicable.
     * Consumes input mouse events x/y, updates camera angle and zoom
     * @internal
    */

    applyInputsToCamera() {
        // dx/dy from input state
        var state = this.noa.inputs.state
        bugFix(state) // TODO: REMOVE EVENTUALLY    

        // convert to rads, using (sens * 0.0066 deg/pixel), like Overwatch
        var conv = 0.0066 * Math.PI / 180
        var dy = state.dy * this.sensitivityY * conv
        var dx = state.dx * this.sensitivityX * conv
        if (this.inverseY) dy = -dy
        if (this.inverseX) dx = -dx

        // normalize/clamp angles, update direction vector
        var twopi = 2 * Math.PI
        this.heading += (dx < 0) ? dx + twopi : dx
        if (this.heading > twopi) this.heading -= twopi
        var maxPitch = Math.PI / 2 - 0.001
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch + dy))

        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().set(this._dirVector, 0, 0, 1)
        console.log
        var dir = this._dirVector
        var origin = originVector
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().rotateX(dir, dir, origin, this.pitch)
        gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().rotateY(dir, dir, origin, this.heading)
    }



    /**
     *  Called before all renders, pre- and post- entity render systems
     * @internal
    */
    updateBeforeEntityRenderSystems() {
        // zoom update
        this._currentZoom += (this.zoomDistance - this._currentZoom) * this.zoomSpeed
    }

    /** @internal */
    updateAfterEntityRenderSystems() {
        // clamp camera zoom not to clip into solid terrain
        var maxZoom = cameraObstructionDistance(this)
        if (this._currentZoom > maxZoom) this._currentZoom = maxZoom
    }

}




/*
 *  check for obstructions behind camera by sweeping back an AABB
*/

function cameraObstructionDistance(self) {
    if (!self._sweepBox) {
        self._sweepBox = new (aabb_3d__WEBPACK_IMPORTED_MODULE_1___default())([0, 0, 0], [0.2, 0.2, 0.2])
        self._sweepGetVoxel = self.noa.world.getBlockSolidity.bind(self.noa.world)
        self._sweepVec = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().create()
        self._sweepHit = () => true
    }
    var pos = gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().copy(self._sweepVec, self._localGetTargetPosition())
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().add(pos, pos, self.noa.worldOriginOffset)
    for (var i = 0; i < 3; i++) pos[i] -= 0.1
    self._sweepBox.setPosition(pos)
    var dist = Math.max(self.zoomDistance, self.currentZoom) + 0.1
    gl_vec3__WEBPACK_IMPORTED_MODULE_0___default().scale(self._sweepVec, self.getDirection(), -dist)
    return voxel_aabb_sweep__WEBPACK_IMPORTED_MODULE_2___default()(self._sweepGetVoxel, self._sweepBox, self._sweepVec, self._sweepHit, true)
}






// workaround for this Chrome 63 + Win10 bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=781182
// later updated to also address: https://github.com/fenomas/noa/issues/153
function bugFix(state) {
    var dx = state.dx
    var dy = state.dy
    var badx = (Math.abs(dx) > 400 && Math.abs(dx / lastx) > 4)
    var bady = (Math.abs(dy) > 400 && Math.abs(dy / lasty) > 4)
    if (badx || bady) {
        state.dx = lastx
        state.dy = lasty
        lastx = (lastx + dx) / 2
        lasty = (lasty + dy) / 2
    } else {
        lastx = dx || 1
        lasty = dy || 1
    }
}

var lastx = 0
var lasty = 0


/***/ }),

/***/ "../../game/noa/src/lib/chunk.js":
/*!***************************************!*\
  !*** ../../game/noa/src/lib/chunk.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "../../game/noa/src/lib/util.js");
/** 
 * @module
 * @internal
 */



var ndarray = __webpack_require__(/*! ndarray */ "../../game/noa/node_modules/ndarray/ndarray.js")

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Chunk);


/* 
 * 
 *   Chunk
 * 
 *  Stores and manages voxel ids and flags for each voxel within chunk
 * 
 */





/*
 *
 *    Chunk constructor
 *
 */

function Chunk(noa, requestID, ci, cj, ck, size, dataArray) {
    this.noa = noa
    this.isDisposed = false

    // voxel data and properties
    this.requestID = requestID     // id sent to game client
    this.voxels = dataArray
    this.i = ci
    this.j = cj
    this.k = ck
    this.size = size
    this.x = ci * size
    this.y = cj * size
    this.z = ck * size
    this.pos = [this.x, this.y, this.z]

    // flags to track if things need re-meshing
    this._terrainDirty = false
    this._objectsDirty = false

    // inits state of terrain / object meshing
    this._terrainMeshes = []
    noa._terrainMesher.initChunk(this)
    noa._objectMesher.initChunk(this)
    this._isFull = false
    this._isEmpty = false

    this._fullcount = 0
    this._emptycount = 0

    // references to neighboring chunks, if they exist (filled in by `world`)
    var narr = Array.from(Array(27), () => null)
    this._neighbors = ndarray(narr, [3, 3, 3]).lo(1, 1, 1)
    this._neighbors.set(0, 0, 0, this)
    this._neighborCount = 0
    this._timesMeshed = 0

    // location queue of voxels in this chunk with block handlers (assume it's rare)
    this._blockHandlerLocs = new _util__WEBPACK_IMPORTED_MODULE_0__.LocationQueue()

    // passes through voxel contents, calling block handlers etc.
    scanVoxelData(this)
}


// expose logic internally to create and update the voxel data array
Chunk._createVoxelArray = function (size) {
    var arr = new Uint16Array(size * size * size)
    return ndarray(arr, [size, size, size])
}

Chunk.prototype._updateVoxelArray = function (dataArray) {
    // dispose current object blocks
    callAllBlockHandlers(this, 'onUnload')
    this.noa._objectMesher.disposeChunk(this)
    this.noa._terrainMesher.disposeChunk(this)
    this.voxels = dataArray
    this._terrainDirty = false
    this._objectsDirty = false
    this._blockHandlerLocs.empty()
    this.noa._objectMesher.initChunk(this)
    this.noa._terrainMesher.initChunk(this)
    scanVoxelData(this)
}








/*
 *
 *    Chunk API
 *
 */

// get/set deal with block IDs, so that this class acts like an ndarray

Chunk.prototype.get = function (i, j, k) {
    return this.voxels.get(i, j, k)
}

Chunk.prototype.getSolidityAt = function (i, j, k) {
    var solidLookup = this.noa.registry._solidityLookup
    return solidLookup[this.voxels.get(i, j, k)]
}

Chunk.prototype.set = function (i, j, k, newID) {
    var oldID = this.voxels.get(i, j, k)
    if (newID === oldID) return

    // update voxel data
    this.voxels.set(i, j, k, newID)

    // lookup tables from registry, etc
    var solidLookup = this.noa.registry._solidityLookup
    var objectLookup = this.noa.registry._objectLookup
    var opaqueLookup = this.noa.registry._opacityLookup
    var handlerLookup = this.noa.registry._blockHandlerLookup

    // voxel lifecycle handling
    var hold = handlerLookup[oldID]
    var hnew = handlerLookup[newID]
    if (hold) callBlockHandler(this, hold, 'onUnset', i, j, k)
    if (hnew) {
        callBlockHandler(this, hnew, 'onSet', i, j, k)
        this._blockHandlerLocs.add(i, j, k)
    } else {
        this._blockHandlerLocs.remove(i, j, k)
    }

    // track object block states
    var objMesher = this.noa._objectMesher
    var objOld = objectLookup[oldID]
    var objNew = objectLookup[newID]
    if (objOld) objMesher.setObjectBlock(this, 0, i, j, k)
    if (objNew) objMesher.setObjectBlock(this, newID, i, j, k)

    // track full/emptiness and dirty flags for the chunk
    if (!opaqueLookup[newID]) this._isFull = false
    if (newID !== 0) this._isEmpty = false

    var solidityChanged = (solidLookup[oldID] !== solidLookup[newID])
    var opacityChanged = (opaqueLookup[oldID] !== opaqueLookup[newID])

    if (objOld || objNew) this._objectsDirty = true
    if (solidityChanged || opacityChanged
        || (!objNew && (newID !== 0))) this._terrainDirty = true

    if (this._terrainDirty || this._objectsDirty) {
        this.noa.world._queueChunkForRemesh(this)
    }

    // neighbors only affected if solidity or opacity changed on an edge
    if (solidityChanged || opacityChanged) {
        var edge = this.size - 1
        var imin = (i === 0) ? -1 : 0
        var jmin = (j === 0) ? -1 : 0
        var kmin = (k === 0) ? -1 : 0
        var imax = (i === edge) ? 1 : 0
        var jmax = (j === edge) ? 1 : 0
        var kmax = (k === edge) ? 1 : 0
        for (var ni = imin; ni <= imax; ni++) {
            for (var nj = jmin; nj <= jmax; nj++) {
                for (var nk = kmin; nk <= kmax; nk++) {
                    if ((ni | nj | nk) === 0) continue
                    var nab = this._neighbors.get(ni, nj, nk)
                    if (!nab) return
                    nab._terrainDirty = true
                    this.noa.world._queueChunkForRemesh(nab)
                }
            }
        }
    }
}



// helper to call handler of a given type at a particular xyz
function callBlockHandler(chunk, handlers, type, i, j, k) {
    var handler = handlers[type]
    if (!handler) return
    handler(chunk.x + i, chunk.y + j, chunk.z + k)
}


// gets called by World when this chunk has been queued for remeshing
Chunk.prototype.updateMeshes = function () {
    if (this._terrainDirty) {
        this.noa._terrainMesher.meshChunk(this)
        this._timesMeshed++
        this._terrainDirty = false
    }
    if (this._objectsDirty) {
        this.noa._objectMesher.buildObjectMeshes()
        this._objectsDirty = false
    }
}












/*
 * 
 *      Init
 * 
 *  Scans voxel data, processing object blocks and setting chunk flags
 * 
*/

function scanVoxelData(chunk) {
    // flags for tracking if chunk is entirely opaque or transparent
    var fullyOpaque = true
    var fullyAir = true

    var fct = 0
    var ect = 0

    chunk._blockHandlerLocs.empty()
    var voxels = chunk.voxels
    var data = voxels.data
    var len = voxels.shape[0]
    var opaqueLookup = chunk.noa.registry._opacityLookup
    var handlerLookup = chunk.noa.registry._blockHandlerLookup
    var objectLookup = chunk.noa.registry._objectLookup
    var objMesher = chunk.noa._objectMesher
    for (var i = 0; i < len; ++i) {
        for (var j = 0; j < len; ++j) {
            var index = voxels.index(i, j, 0)
            for (var k = 0; k < len; ++k, ++index) {
                var id = data[index]
                // skip air blocks
                if (id === 0) {
                    ect++
                    fullyOpaque = false
                    continue
                }
                if (opaqueLookup[id]) fct++
                fullyOpaque = fullyOpaque && opaqueLookup[id]
                fullyAir = false
                // handle object blocks and handlers
                if (objectLookup[id]) {
                    objMesher.setObjectBlock(chunk, id, i, j, k)
                    chunk._objectsDirty = true
                }
                var handlers = handlerLookup[id]
                if (handlers) {
                    chunk._blockHandlerLocs.add(i, j, k)
                    callBlockHandler(chunk, handlers, 'onLoad', i, j, k)
                }
            }
        }
    }
    chunk._fullcount = fct
    chunk._emptycount = ect

    chunk._isFull = fullyOpaque
    chunk._isEmpty = fullyAir
    chunk._terrainDirty = !chunk._isEmpty
}











// dispose function - just clears properties and references

Chunk.prototype.dispose = function () {
    // look through the data for onUnload handlers
    callAllBlockHandlers(this, 'onUnload')
    this._blockHandlerLocs.empty()

    // let meshers dispose their stuff
    this.noa._objectMesher.disposeChunk(this)
    this.noa._terrainMesher.disposeChunk(this)

    // apparently there's no way to dispose typed arrays, so just null everything
    this.voxels.data = null
    this.voxels = null
    this._neighbors.data = null
    this._neighbors = null

    this.isDisposed = true
}



// helper to call a given handler for all blocks in the chunk
function callAllBlockHandlers(chunk, type) {
    var voxels = chunk.voxels
    var handlerLookup = chunk.noa.registry._blockHandlerLookup
    chunk._blockHandlerLocs.arr.forEach(([i, j, k]) => {
        var id = voxels.get(i, j, k)
        callBlockHandler(chunk, handlerLookup[id], type, i, j, k)
    })
}


/***/ }),

/***/ "../../game/noa/src/lib/container.js":
/*!*******************************************!*\
  !*** ../../game/noa/src/lib/container.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Container": () => (/* binding */ Container)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "../../game/noa/node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var micro_game_shell__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micro-game-shell */ "../../game/noa/node_modules/micro-game-shell/src/micro-game-shell.js");
/** 
 * The Container class is found at [[Container | `noa.container`]].
 * @module noa.container
 */



// import { MicroGameShell } from '/Users/andy/dev/npm-modules/micro-game-shell'




/**
 * `noa.container` - manages the game's HTML container element, canvas, 
 * fullscreen, pointerLock, and so on.
 * 
 * This module wraps `micro-game-shell`, which does most of the implementation.
 * 
 * @emits DOMready
 * @emits gainedPointerLock
 * @emits lostPointerLock
 */

class Container extends events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {

    /** @internal */
    constructor(noa, opts) {
        super()
        opts = opts || {}

        /** 
         * @internal
         * @type {import('../index').Engine}
        */
        this.noa = noa

        /** The game's DOM element container */
        this.element = opts.domElement || createContainerDiv()

        /** The `canvas` element that the game will draw into */
        this.canvas = getOrCreateCanvas(this.element)

        /** Whether the browser supports pointerLock. @readonly */
        this.supportsPointerLock = false

        /** Whether the user's pointer is within the game area. @readonly */
        this.pointerInGame = false

        /** Whether the game is focused. @readonly */
        this.isFocused = !!document.hasFocus()

        /** Gets the current state of pointerLock. @readonly */
        this.hasPointerLock = false



        // shell manages tick/render rates, and pointerlock/fullscreen
        var pollTime = 10
        /** @internal */
        this._shell = new micro_game_shell__WEBPACK_IMPORTED_MODULE_1__.MicroGameShell(this.element, pollTime)
        this._shell.tickRate = opts.tickRate
        this._shell.maxRenderRate = opts.maxRenderRate
        this._shell.stickyPointerLock = opts.stickyPointerLock
        this._shell.stickyFullscreen = opts.stickyFullscreen



        // core timing events
        this._shell.onTick = noa.tick.bind(noa)
        this._shell.onRender = noa.render.bind(noa)

        // shell listeners
        this._shell.onPointerLockChanged = (hasPL) => {
            this.hasPointerLock = hasPL
            this.emit((hasPL) ? 'gainedPointerLock' : 'lostPointerLock')
            // this works around a Firefox bug where no mouse-in event 
            // gets issued after starting pointerlock
            if (hasPL) this.pointerInGame = true
        }

        // catch and relay domReady event
        this._shell.onInit = () => {
            this._shell.onResize = noa.rendering.resize.bind(noa.rendering)
            // listeners to track when game has focus / pointer
            detectPointerLock(this)
            this.element.addEventListener('mouseenter', () => { this.pointerInGame = true })
            this.element.addEventListener('mouseleave', () => { this.pointerInGame = false })
            window.addEventListener('focus', () => { this.isFocused = true })
            window.addEventListener('blur', () => { this.isFocused = false })
            // catch edge cases for initial states
            var onFirstMousedown = () => {
                this.pointerInGame = true
                this.isFocused = true
                this.element.removeEventListener('mousedown', onFirstMousedown)
            }
            this.element.addEventListener('mousedown', onFirstMousedown)
            // emit for engine core
            this.emit('DOMready')
            // done and remove listener
            this._shell.onInit = null
        }
    }


    /*
     *
     *
     *              PUBLIC API 
     *
     *
    */

    /** @internal */
    appendTo(htmlElement) {
        this.element.appendChild(htmlElement)
    }

    /** 
     * Sets whether `noa` should try to acquire or release pointerLock
    */
    setPointerLock(lock = false) {
        // not sure if this will work robustly
        this._shell.pointerLock = !!lock
    }
}



/*
 *
 *
 *              INTERNALS
 *
 *
*/


function createContainerDiv() {
    // based on github.com/mikolalysenko/game-shell - makeDefaultContainer()
    var container = document.createElement("div")
    container.tabIndex = 1
    container.style.position = "fixed"
    container.style.left = "0px"
    container.style.right = "0px"
    container.style.top = "0px"
    container.style.bottom = "0px"
    container.style.height = "100%"
    container.style.overflow = "hidden"
    document.body.appendChild(container)
    document.body.style.overflow = "hidden" //Prevent bounce
    document.body.style.height = "100%"
    container.id = 'noa-container'
    return container
}


function getOrCreateCanvas(el) {
    // based on github.com/stackgl/gl-now - default canvas
    var canvas = el.querySelector('canvas')
    if (!canvas) {
        canvas = document.createElement('canvas')
        canvas.style.position = "absolute"
        canvas.style.left = "0px"
        canvas.style.top = "0px"
        canvas.style.height = "100%"
        canvas.style.width = "100%"
        canvas.id = 'noa-canvas'
        el.insertBefore(canvas, el.firstChild)
    }
    return canvas
}


// set up stuff to detect pointer lock support.
// Needlessly complex because Chrome/Android claims to support but doesn't.
// For now, just feature detect, but assume no support if a touch event occurs
// TODO: see if this makes sense on hybrid touch/mouse devices
function detectPointerLock(self) {
    var lockElementExists =
        ('pointerLockElement' in document) ||
        ('mozPointerLockElement' in document) ||
        ('webkitPointerLockElement' in document)
    if (lockElementExists) {
        self.supportsPointerLock = true
        var listener = function (e) {
            self.supportsPointerLock = false
            document.removeEventListener(e.type, listener)
        }
        document.addEventListener('touchmove', listener)
    }
}


/***/ }),

/***/ "../../game/noa/src/lib/entities.js":
/*!******************************************!*\
  !*** ../../game/noa/src/lib/entities.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Entities": () => (/* binding */ Entities)
/* harmony export */ });
/* harmony import */ var ent_comp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ent-comp */ "../../game/noa/node_modules/ent-comp/src/ECS.js");
/* harmony import */ var ent_comp__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ent_comp__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js");
/* harmony import */ var gl_vec3__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(gl_vec3__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_position__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/position */ "../../game/noa/src/components/position.js");
/* harmony import */ var _components_physics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/physics */ "../../game/noa/src/components/physics.js");
/** 
 * The ECS manager, found at [[Entities | `noa.entities`]] or [[Entities | `noa.ents`]].
 * @module noa.entities
 */



// var ECS = require('../../../../npm-modules/ent-comp')







var defaultOptions = {
    shadowDistance: 10,
}


/**
 * `noa.entities` - manages entities and components.
 * 
 * This class extends [ent-comp](https://github.com/fenomas/ent-comp), 
 * a general-purpose ECS. It's also decorated with noa-specific helpers and 
 * accessor functions for querying entity positions, etc.
 * 
 * Expects entity definitions in a specific format - see source `components` 
 * folder for examples.
 * 
 * This module uses the following default options (from the options
 * object passed to the [[Engine]]):
 * 
 * ```js
 * var defaults = {
 *     shadowDistance: 10,
 * }
 * ```
*/

class Entities extends (ent_comp__WEBPACK_IMPORTED_MODULE_0___default()) {


    /** @internal */
    constructor(noa, opts) {
        super()
        opts = Object.assign({}, defaultOptions, opts)
        // optional arguments to supply to component creation functions
        var componentArgs = {
            'shadow': opts.shadowDistance,
        }

        /** 
         * @internal
         * @type {import('../index').Engine}
        */
        this.noa = noa

        /** Hash containing the component names of built-in components.
         * @type {Object.<string, string>}
        */
        this.names = {}

        // does bundler magic to import all compontents, and call
        // `ents.createComponent` on them
        importLocalComponents(this, componentArgs, this.createComponent)


        /*
         *
         *
         * 
         *          ENTITY ACCESSORS
         *
         * A whole bunch of getters and such for accessing component state.
         * These are moderately faster than `ents.getState(whatever)`.
         * 
         * 
         * 
        */

        // internal use:
        var getPos = this.getStateAccessor(this.names.position)
        var getPhys = this.getStateAccessor(this.names.physics)

        /** @internal */
        this.cameraSmoothed = this.getComponentAccessor(this.names.smoothCamera)


        /**
         * Returns whether the entity has a physics body
         * @param {number} id
         * @returns {boolean}
        */
        this.hasPhysics = this.getComponentAccessor(this.names.physics)

        /**
         * Returns whether the entity has a position
         * @type {(id:number) => boolean}
        */
        this.hasPosition = this.getComponentAccessor(this.names.position)

        /**
         * Returns the entity's position component state
         * @type {(id:number) => {
         *      position: number[], width: number, height: number,
         *      _localPosition: any, _renderPosition: any, _extents: any,
         * }}
        */
        this.getPositionData = getPos

        /**
         * Returns the entity's position vector.
         * Note, will throw if the entity doesn't have the position component!
         * @type {(id:number) => number[]}
        */
        this.getPosition = (id) => getPos(id).position

        /**
         * Returns the entity's `physics` component state.
         * @type {(id:number) => { body:any }}
        */
        this.getPhysics = getPhys

        /**
         * Returns the entity's physics body
         * Note, will throw if the entity doesn't have the position component!
         * @type {(id:number) => { any }}
        */
        this.getPhysicsBody = (id) => getPhys(id).body

        /**
         * Returns whether the entity has a mesh
         * @type {(id:number) => boolean}
        */
        this.hasMesh = this.getComponentAccessor(this.names.mesh)

        /**
         * Returns the entity's `mesh` component state
         * @type {(id:number) => {mesh:any, offset:number[]}}
        */
        this.getMeshData = this.getStateAccessor(this.names.mesh)

        /**
         * Returns the entity's `movement` component state
         * @type {(id:number) => import('../components/movement').MovementState}
        */
        this.getMovement = this.getStateAccessor(this.names.movement)

        /**
         * Returns the entity's `collideTerrain` component state
         * @type {(id:number) => {callback: function}}
        */
        this.getCollideTerrain = this.getStateAccessor(this.names.collideTerrain)

        /**
         * Returns the entity's `collideEntities` component state
         * @type {(id:number) => {
         *      cylinder:boolean, collideBits:number, 
         *      collideMask:number, callback: function}}
        */
        this.getCollideEntities = this.getStateAccessor(this.names.collideEntities)


        /**
         * Pairwise collideEntities event - assign your own function to this 
         * property if you want to handle entity-entity overlap events.
         * @type {(id1:number, id2:number) => void}
         */
        this.onPairwiseEntityCollision = function (id1, id2) { }
    }




    /*
     * 
     * 
     *      PUBLIC ENTITY STATE ACCESSORS
     * 
     * 
    */


    /** Set an entity's position, and update all derived state.
     * 
     * In general, always use this to set an entity's position unless
     * you're familiar with engine internals.
     * 
     * ```js
     * noa.ents.setPosition(playerEntity, [5, 6, 7])
     * noa.ents.setPosition(playerEntity, 5, 6, 7)  // also works
     * ```
     * 
     * @param {number} id
     */
    setPosition(id, pos, y = 0, z = 0) {
        if (typeof pos === 'number') pos = [pos, y, z]
        // convert to local and defer impl
        var loc = this.noa.globalToLocal(pos, null, [])
        this._localSetPosition(id, loc)
    }

    /** Set an entity's size 
     * @param {number} xs
     * @param {number} ys
     * @param {number} zs
    */
    setEntitySize(id, xs, ys, zs) {
        var posDat = this.getPositionData(id)
        posDat.width = (xs + zs) / 2
        posDat.height = ys
        this._updateDerivedPositionData(id, posDat)
    }




    /**
     * called when engine rebases its local coords
     * @internal
     */
    _rebaseOrigin(delta) {
        for (var state of this.getStatesList(this.names.position)) {
            var locPos = state._localPosition
            var hw = state.width / 2
            nudgePosition(locPos, 0, -hw, hw, state.__id)
            nudgePosition(locPos, 1, 0, state.height, state.__id)
            nudgePosition(locPos, 2, -hw, hw, state.__id)
            gl_vec3__WEBPACK_IMPORTED_MODULE_1___default().subtract(locPos, locPos, delta)
            this._updateDerivedPositionData(state.__id, state)
        }
    }

    /** @internal */
    _localGetPosition(id) {
        return this.getPositionData(id)._localPosition
    }

    /** @internal */
    _localSetPosition(id, pos) {
        var posDat = this.getPositionData(id)
        gl_vec3__WEBPACK_IMPORTED_MODULE_1___default().copy(posDat._localPosition, pos)
        this._updateDerivedPositionData(id, posDat)
    }


    /** 
     * helper to update everything derived from `_localPosition`
     * @internal 
    */
    _updateDerivedPositionData(id, posDat) {
        gl_vec3__WEBPACK_IMPORTED_MODULE_1___default().copy(posDat._renderPosition, posDat._localPosition)
        var offset = this.noa.worldOriginOffset
        gl_vec3__WEBPACK_IMPORTED_MODULE_1___default().add(posDat.position, posDat._localPosition, offset)
        ;(0,_components_position__WEBPACK_IMPORTED_MODULE_2__.updatePositionExtents)(posDat)
        var physDat = this.getPhysics(id)
        if (physDat) (0,_components_physics__WEBPACK_IMPORTED_MODULE_3__.setPhysicsFromPosition)(physDat, posDat)
    }





    /*
     *
     *
     *      OTHER ENTITY MANAGEMENT APIs
     * 
     *      note most APIs are on the original ECS module (ent-comp)
     *      these are some overlaid extras for noa
     *
     *
    */


    /** 
     * Safely add a component - if the entity already had the 
     * component, this will remove and re-add it.
    */
    addComponentAgain(id, name, state) {
        // removes component first if necessary
        if (this.hasComponent(id, name)) this.removeComponent(id, name)
        this.addComponent(id, name, state)
    }


    /** 
     * Checks whether a voxel is obstructed by any entity (with the 
     * `collidesTerrain` component)
    */
    isTerrainBlocked(x, y, z) {
        // checks if terrain location is blocked by entities
        var off = this.noa.worldOriginOffset
        var xlocal = Math.floor(x - off[0])
        var ylocal = Math.floor(y - off[1])
        var zlocal = Math.floor(z - off[2])
        var blockExt = [
            xlocal + 0.001, ylocal + 0.001, zlocal + 0.001,
            xlocal + 0.999, ylocal + 0.999, zlocal + 0.999,
        ]
        var list = this.getStatesList(this.names.collideTerrain)
        for (var i = 0; i < list.length; i++) {
            var id = list[i].__id
            var ext = this.getPositionData(id)._extents
            if (extentsOverlap(blockExt, ext)) return true
        }
        return false
    }



    /** 
     * Gets an array of all entities overlapping the given AABB
    */
    getEntitiesInAABB(box, withComponent) {
        // extents to test against
        var off = this.noa.worldOriginOffset
        var testExtents = [
            box.base[0] - off[0], box.base[1] - off[1], box.base[2] - off[2],
            box.max[0] - off[0], box.max[1] - off[1], box.max[2] - off[2],
        ]
        // entity position state list
        var entStates
        if (withComponent) {
            entStates = []
            for (var compState of this.getStatesList(withComponent)) {
                var pdat = this.getPositionData(compState.__id)
                if (pdat) entStates.push(pdat)
            }
        } else {
            entStates = this.getStatesList(this.names.position)
        }

        // run each test
        var hits = []
        for (var i = 0; i < entStates.length; i++) {
            var state = entStates[i]
            if (extentsOverlap(testExtents, state._extents)) {
                hits.push(state.__id)
            }
        }
        return hits
    }



    /** 
     * Helper to set up a general entity, and populate with some common components depending on arguments.
    */
    add(position, width, height, // required
        mesh, meshOffset, doPhysics, shadow) {

        var self = this

        // new entity
        var eid = this.createEntity()

        // position component
        this.addComponent(eid, this.names.position, {
            position: position || [0, 0, 0],
            width: width,
            height: height
        })

        // rigid body in physics simulator
        if (doPhysics) {
            // body = this.noa.physics.addBody(box)
            this.addComponent(eid, this.names.physics)
            var body = this.getPhysics(eid).body

            // handler for physics engine to call on auto-step
            var smoothName = this.names.smoothCamera
            body.onStep = function () {
                self.addComponentAgain(eid, smoothName)
            }
        }

        // mesh for the entity
        if (mesh) {
            if (!meshOffset) meshOffset = gl_vec3__WEBPACK_IMPORTED_MODULE_1___default().create()
            this.addComponent(eid, this.names.mesh, {
                mesh: mesh,
                offset: meshOffset
            })
        }

        // add shadow-drawing component
        if (shadow) {
            this.addComponent(eid, this.names.shadow, { size: width })
        }

        return eid
    }
}


/*
 * 
 * 
 * 
 *          HELPERS
 * 
 * 
 * 
*/

// safety helper - when rebasing, nudge extent away from 
// voxel boudaries, so floating point error doesn't carry us accross
function nudgePosition(pos, index, dmin, dmax, id) {
    var min = pos[index] + dmin
    var max = pos[index] + dmax
    if (Math.abs(min - Math.round(min)) < 0.002) pos[index] += 0.002
    if (Math.abs(max - Math.round(max)) < 0.001) pos[index] -= 0.001
}

// compare extent arrays
function extentsOverlap(extA, extB) {
    if (extA[0] > extB[3]) return false
    if (extA[1] > extB[4]) return false
    if (extA[2] > extB[5]) return false
    if (extA[3] < extB[0]) return false
    if (extA[4] < extB[1]) return false
    if (extA[5] < extB[2]) return false
    return true
}


// Bundler magic to import everything in the ../components directory
// each component module exports a default function: (noa) => compDefinition
function importLocalComponents(ents, args, createCompFn) {
    //@ts-expect-error
    var reqContext = __webpack_require__("../../game/noa/src/components sync \\.js$")
    for (var name of reqContext.keys()) {
        // convert name ('./foo.js') to bare name ('foo')
        var bareName = /\.\/(.*)\.js/.exec(name)[1]
        var arg = args[bareName] || undefined
        var compFn = reqContext(name)
        if (compFn.default) compFn = compFn.default
        var compDef = compFn(ents.noa, arg)
        var comp = createCompFn(compDef)
        ents.names[bareName] = comp
    }
}


/***/ }),

/***/ "../../game/noa/src/lib/inputs.js":
/*!****************************************!*\
  !*** ../../game/noa/src/lib/inputs.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createInputs": () => (/* binding */ createInputs)
/* harmony export */ });
/* harmony import */ var game_inputs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! game-inputs */ "../../game/noa/node_modules/game-inputs/inputs.js");
/* harmony import */ var game_inputs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(game_inputs__WEBPACK_IMPORTED_MODULE_0__);
/** 
 * The Inputs class is found at [[Inputs | `noa.inputs`]].
 * @module noa.inputs
 */



// import { Inputs as GameInputs } from '../../../../npm-modules/game-inputs'



var defaultOptions = {
    preventDefaults: false,
    stopPropagation: false,
    allowContextMenu: false,
}

var defaultBindings = {
    "forward": ["W", "<up>"],
    "left": ["A", "<left>"],
    "backward": ["S", "<down>"],
    "right": ["D", "<right>"],
    "fire": "<mouse 1>",
    "mid-fire": ["<mouse 2>", "Q"],
    "alt-fire": ["<mouse 3>", "E"],
    "jump": "<space>",
    "sprint": "<shift>",
    "crouch": "<control>",
}

/**
 * @internal
 * @returns {Inputs}
 */
function createInputs(noa, opts, element) {
    opts = Object.assign({}, defaultOptions, opts)
    var inputs = game_inputs__WEBPACK_IMPORTED_MODULE_0___default()(element, opts)
    var b = opts.bindings || defaultBindings
    for (var name in b) {
        var arr = (Array.isArray(b[name])) ? b[name] : [b[name]]
        arr.unshift(name)
        inputs.bind.apply(inputs, arr)
    }
    return inputs
}







/**
 * `noa.inputs` - manages keybinds and mouse input.
 *
 * Extends [game-inputs](https://github.com/fenomas/game-inputs),
 * see there for implementation and docs.
 *
 * By default, the following bindings will be made automatically.
 * You can undo bindings with `unbind`, or specify your own with a
 * `bindings` property on the options object passed to the [[Engine]].
 *
 * ```js
 * var defaultBindings = {
 *     "forward": ["W", "<up>"],
 *     "left": ["A", "<left>"],
 *     "backward": ["S", "<down>"],
 *     "right": ["D", "<right>"],
 *     "fire": "<mouse 1>",
 *     "mid-fire": ["<mouse 2>", "Q"],
 *     "alt-fire": ["<mouse 3>", "E"],
 *     "jump": "<space>",
 *     "sprint": "<shift>",
 *     "crouch": "<control>",
 * }
 * ```
 *
 * @typedef {Object} Inputs
 * @prop {boolean} disabled
 * @prop {Object} state Maps key binding names to input states.
 * @prop {(binding:string, ...keyCodes:string[]) => void} bind Binds one or more keycodes to a binding.
 * @prop {(binding:string) => void} unbind Unbinds all keyCodes from a binding.
 * @prop {import('events').EventEmitter} down Emits input start events (i.e. keyDown).
 * @prop {import('events').EventEmitter} up Emits input end events (i.e. keyUp).
*/




/***/ }),

/***/ "../../game/noa/src/lib/objectMesher.js":
/*!**********************************************!*\
  !*** ../../game/noa/src/lib/objectMesher.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "../../game/noa/src/lib/util.js");
/* harmony import */ var _babylonjs_core_Meshes_transformNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babylonjs/core/Meshes/transformNode */ "../../game/noa/node_modules/@babylonjs/core/Meshes/transformNode.js");
/* harmony import */ var _babylonjs_core_Meshes_thinInstanceMesh__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babylonjs/core/Meshes/thinInstanceMesh */ "../../game/noa/node_modules/@babylonjs/core/Meshes/thinInstanceMesh.js");
/** 
 * @module 
 * @internal exclude this file from API docs 
*/





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ObjectMesher);

var PROFILE = 0





/*
 *
 *          Object meshing
 * 
 *      Per-chunk handling of the creation/disposal of static meshes
 *      associated with particular voxel IDs
 * 
 * 
*/


function ObjectMesher(noa) {

    // transform node for all instance meshes to be parented to
    this.rootNode = new _babylonjs_core_Meshes_transformNode__WEBPACK_IMPORTED_MODULE_1__.TransformNode('objectMeshRoot', noa.rendering._scene)

    // tracking rebase amount inside matrix data
    var rebaseOffset = [0, 0, 0]

    // flag to trigger a rebuild after a chunk is disposed
    var rebuildNextTick = false

    // mock object to pass to customMesh handler, to get transforms
    var transformObj = new _babylonjs_core_Meshes_transformNode__WEBPACK_IMPORTED_MODULE_1__.TransformNode('')

    // internal storage of instance managers, keyed by ID
    // has check to dedupe by mesh, since babylon chokes on
    // separate sets of instances for the same mesh/clone/geometry
    var managers = {}
    var getManager = (id) => {
        if (managers[id]) return managers[id]
        var mesh = noa.registry._blockMeshLookup[id]
        for (var id2 in managers) {
            var prev = managers[id2].mesh
            if (prev === mesh || (prev.geometry === mesh.geometry)) {
                return managers[id] = managers[id2]
            }
        }
        return managers[id] = new InstanceManager(noa, mesh)
    }




    /*
     * 
     *      public API
     * 
    */


    // add any properties that will get used for meshing
    this.initChunk = function (chunk) {
        chunk._objectBlocks = {}
    }


    // called by world when an object block is set or cleared
    this.setObjectBlock = function (chunk, blockID, i, j, k) {
        return
        var x = chunk.x + i
        var y = chunk.y + j
        var z = chunk.z + k
        var key = (0,_util__WEBPACK_IMPORTED_MODULE_0__.locationHasher)(x, y, z)

        var oldID = chunk._objectBlocks[key] || 0
        if (oldID === blockID) return // should be impossible
        if (oldID > 0) {
            var oldMgr = getManager(oldID)
            oldMgr.removeInstance(chunk, key)
        }

        if (blockID > 0) {
            // if there's a block event handler, call it with
            // a mock object so client can add transforms
            var handlers = noa.registry._blockHandlerLookup[blockID]
            var onCreate = handlers && handlers.onCustomMeshCreate
            if (onCreate) {
                transformObj.position.copyFromFloats(0.5, 0, 0.5)
                transformObj.scaling.setAll(1)
                transformObj.rotation.setAll(0)
                onCreate(transformObj, x, y, z)
            }
            var mgr = getManager(blockID)
            var xform = (onCreate) ? transformObj : null
            mgr.addInstance(chunk, key, i, j, k, xform, rebaseOffset)
        }

        if (oldID > 0 && !blockID) delete chunk._objectBlocks[key]
        if (blockID > 0) chunk._objectBlocks[key] = blockID
    }



    // called by world when it knows that objects have been updated
    this.buildObjectMeshes = function () {
        profile_hook('start')

        for (var id in managers) {
            var mgr = managers[id]
            mgr.updateMatrix()
            if (mgr.count === 0) mgr.dispose()
            if (mgr.disposed) delete managers[id]
        }

        profile_hook('rebuilt')
        profile_hook('end')
    }



    // called by world at end of chunk lifecycle
    this.disposeChunk = function (chunk) {
        for (var key in chunk._objectBlocks) {
            var id = chunk._objectBlocks[key]
            if (id > 0) {
                var mgr = getManager(id)
                mgr.removeInstance(chunk, key)
            }
        }
        chunk._objectBlocks = null

        // since some instance managers will have been updated
        rebuildNextTick = true
    }



    // tick handler catches case where objects are dirty due to disposal
    this.tick = function () {
        if (rebuildNextTick) {
            this.buildObjectMeshes()
            rebuildNextTick = false
        }
    }



    // world rebase handler
    this._rebaseOrigin = function (delta) {
        rebaseOffset[0] += delta[0]
        rebaseOffset[1] += delta[1]
        rebaseOffset[2] += delta[2]

        for (var id1 in managers) managers[id1].rebased = false
        for (var id2 in managers) {
            var mgr = managers[id2]
            if (mgr.rebased) continue
            for (var i = 0; i < mgr.count; i++) {
                var ix = i << 4
                mgr.buffer[ix + 12] -= delta[0]
                mgr.buffer[ix + 13] -= delta[1]
                mgr.buffer[ix + 14] -= delta[2]
            }
            mgr.rebased = true
            mgr.dirty = true
        }
        rebuildNextTick = true
    }

}















/*
 * 
 * 
 *      manager class for thin instances of a given object block ID 
 * 
 * 
*/

function InstanceManager(noa, mesh) {
    this.mesh = mesh
    this.buffer = null
    this.capacity = 0
    this.count = 0
    this.dirty = false
    this.rebased = true
    this.disposed = false
    // dual struct to map keys (locations) to buffer locations, and back
    this.keyToIndex = {}
    this.locToKey = []
    // prepare mesh for rendering
    this.mesh.position.setAll(0)
    this.mesh.parent = noa._objectMesher.rootNode
    noa.rendering.addMeshToScene(this.mesh, false)
    this.mesh.doNotSyncBoundingInfo = true
    this.mesh.alwaysSelectAsActiveMesh = true
}



InstanceManager.prototype.dispose = function () {
    if (this.disposed) return
    this.mesh.thinInstanceCount = 0
    this.setCapacity(0)
    this.mesh.isVisible = false
    this.mesh = null
    this.keyToIndex = null
    this.locToKey = null
    this.disposed = true
}


InstanceManager.prototype.addInstance = function (chunk, key, i, j, k, transform, rebaseVec) {
    if (this.count === this.capacity) expandBuffer(this)
    var ix = this.count << 4
    this.locToKey[this.count] = key
    this.keyToIndex[key] = ix
    if (transform) {
        transform.position.x += (chunk.x - rebaseVec[0]) + i
        transform.position.y += (chunk.y - rebaseVec[1]) + j
        transform.position.z += (chunk.z - rebaseVec[2]) + k
        transform.resetLocalMatrix()
        var xformArr = transform._localMatrix._m
        copyMatrixData(xformArr, 0, this.buffer, ix)
    } else {
        var matArray = tempMatrixArray
        matArray[12] = (chunk.x - rebaseVec[0]) + i + 0.5
        matArray[13] = (chunk.y - rebaseVec[1]) + j
        matArray[14] = (chunk.z - rebaseVec[2]) + k + 0.5
        copyMatrixData(matArray, 0, this.buffer, ix)
    }
    this.count++
    this.dirty = true
}


InstanceManager.prototype.removeInstance = function (chunk, key) {
    var remIndex = this.keyToIndex[key]
    if (!(remIndex >= 0)) throw 'tried to remove object instance not in storage'
    delete this.keyToIndex[key]
    var remLoc = remIndex >> 4
    // copy tail instance's data to location of one we're removing
    var tailLoc = this.count - 1
    if (remLoc !== tailLoc) {
        var tailIndex = tailLoc << 4
        copyMatrixData(this.buffer, tailIndex, this.buffer, remIndex)
        // update key/location structs
        var tailKey = this.locToKey[tailLoc]
        this.keyToIndex[tailKey] = remIndex
        this.locToKey[remLoc] = tailKey
    }
    this.count--
    this.dirty = true
    if (this.count < this.capacity * 0.4) contractBuffer(this)
}


InstanceManager.prototype.updateMatrix = function () {
    if (!this.dirty) return
    this.mesh.thinInstanceCount = this.count
    this.mesh.thinInstanceBufferUpdated('matrix')
    this.mesh.isVisible = (this.count > 0)
    this.dirty = false
}



InstanceManager.prototype.setCapacity = function (size) {
    this.capacity = size || 0
    if (!size) {
        this.buffer = null
    } else {
        var prev = this.buffer
        this.buffer = new Float32Array(this.capacity * 16)
        if (prev) {
            var len = Math.min(prev.length, this.buffer.length)
            for (var i = 0; i < len; i++) this.buffer[i] = prev[i]
        }
    }
    this.mesh.thinInstanceSetBuffer('matrix', this.buffer)
    this.dirty = false
}


function expandBuffer(mgr) {
    var size = (mgr.capacity < 16) ? 16 : mgr.capacity * 2
    mgr.setCapacity(size)
}

function contractBuffer(mgr) {
    var size = (mgr.capacity / 2) | 0
    if (size < 100) return
    mgr.setCapacity(size)
    mgr.locToKey.length = Math.max(mgr.locToKey.length, mgr.capacity)
}






// helpers

var tempMatrixArray = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
]

function copyMatrixData(src, srcOff, dest, destOff) {
    for (var i = 0; i < 16; i++) dest[destOff + i] = src[srcOff + i]
}













var profile_hook = (PROFILE) ?
    (0,_util__WEBPACK_IMPORTED_MODULE_0__.makeProfileHook)(PROFILE, 'Object meshing') : () => { }


/***/ }),

/***/ "../../game/noa/src/lib/physics.js":
/*!*****************************************!*\
  !*** ../../game/noa/src/lib/physics.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Physics": () => (/* binding */ Physics)
/* harmony export */ });
/* harmony import */ var voxel_physics_engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! voxel-physics-engine */ "../../game/noa/node_modules/voxel-physics-engine/src/index.js");
/** 
 * The Physics class is found at [[Physics | `noa.physics`]].
 * @module noa.physics
 */



// import { Physics as VoxelPhysics } from '../../../../npm-modules/voxel-physics-engine'



var defaultOptions = {
    gravity: [0, -10, 0],
    airDrag: 0.1,
}

/**
 * `noa.physics` - Wrapper module for the physics engine.
 * 
 * This module extends 
 * [voxel-physics-engine](https://github.com/fenomas/voxel-physics-engine),
 * so turn on "Inherited" to see its APIs here, or view the base module 
 * for full docs.
 * 
 * This module uses the following default options (from the options
 * object passed to the [[Engine]]):
 * 
 * ```js
 * {
 *     gravity: [0, -10, 0],
 *     airDrag: 0.1,
 *     fluidDrag: 0.4,
 *     fluidDensity: 2.0,
 *     minBounceImpulse: .5,      // cutoff for a bounce to occur
 * }
 * ```
*/

class Physics extends voxel_physics_engine__WEBPACK_IMPORTED_MODULE_0__.Physics {

    /** @internal */
    constructor(noa, opts) {
        opts = Object.assign({}, defaultOptions, opts)
        var world = noa.world
        var solidLookup = noa.registry._solidityLookup
        var fluidLookup = noa.registry._fluidityLookup

        // physics engine runs in offset coords, so voxel getters need to match
        var offset = noa.worldOriginOffset

        var blockGetter = (x, y, z) => {
            var id = world.getBlockID(x + offset[0], y + offset[1], z + offset[2])
            return solidLookup[id]
        }
        var isFluidGetter = (x, y, z) => {
            var id = world.getBlockID(x + offset[0], y + offset[1], z + offset[2])
            return fluidLookup[id]
        }

        super(opts, blockGetter, isFluidGetter)
    }

}





/***/ }),

/***/ "../../game/noa/src/lib/registry.js":
/*!******************************************!*\
  !*** ../../game/noa/src/lib/registry.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Registry": () => (/* binding */ Registry)
/* harmony export */ });
/** 
 * The Registry class is found at [[Registry | `noa.registry`]].
 * @module noa.registry
 */

/*
 *  data structs in the registry:
 *  registry 
 *      blockSolidity:     id -> boolean
 *      blockOpacity:      id -> boolean
 *      blockIsFluid:      id -> boolean
 *      blockMats:         id -> 6x matID  [-x, +x, -y, +y, -z, +z]
 *      blockProps         id -> obj of less-often accessed properties
 *      blockMeshes:       id -> obj/null (custom mesh to instantiate)
 *      blockHandlers      id -> instance of `BlockCallbackHolder` or null 
 *      matIDs             matName -> matID (int)
 *      matData            matID -> { color, alpha, texture, textureAlpha }
*/


var defaults = {
    texturePath: ''
}

var blockDefaults = {
    solid: true,
    opaque: true,
    fluidDensity: 1.0,
    viscosity: 0.5,
}


// voxel ID now uses the whole Uint16Array element
var MAX_BLOCK_ID = (1 << 16) - 1




/* 
 * 
 *      data structures
 *      TODO: move these inside class
 * 
*/

// lookup arrays for block props and flags - all keyed by blockID
// fill in first value for id=0, empty space
var blockSolidity = [false]
var blockOpacity = [false]
var blockIsFluid = [false]
var blockIsObject = [false]
var blockMats = [0, 0, 0, 0, 0, 0]
var blockProps = [null]
var blockMeshes = [null]
var blockHandlers = [null]

// material data structs
var matIDs = {} // mat name -> id
var matData = [null] // mat id -> { color, alpha, texture, textureAlpha }




/**
 * `noa.registry` - Where you register your voxel types, 
 * materials, properties, and events.
 * 
 * This module uses the following default options (from the options
 * object passed to the [[Engine]]):
 * 
 * ```js
 * var defaults = {
 *     texturePath: ''
 * }
 * ```
*/

class Registry {


    /** @internal */
    constructor(noa, opts) {
        opts = Object.assign({}, defaults, opts)
        /** @internal */
        this.noa = noa

        /** @internal */
        this._texturePath = opts.texturePath


        /* 
         * 
         *      Block registration methods
         * 
         */



        /**
         * Register (by integer ID) a block type and its parameters.
         * 
         *  `id` param: integer, currently 1..255. This needs to be passed in by the 
         *    client because it goes into the chunk data, which someday will get serialized.
         * 
         *  `options` param: Recognized fields for the options object:
         * 
         *  * material: can be:
         *      * one (String) material name
         *      * array of 2 names: [top/bottom, sides]
         *      * array of 3 names: [top, bottom, sides]
         *      * array of 6 names: [-x, +x, -y, +y, -z, +z]
         *    If not specified, terrain won't be meshed for the block type
         *  * solid: (true) solidity for physics purposes
         *  * opaque: (true) fully obscures neighboring blocks
         *  * fluid: (false) whether nonsolid block is a fluid (buoyant, viscous..)
         *  * blockMesh: (null) if specified, noa will create a copy this mesh in the voxel
         *  * fluidDensity: (1.0) for fluid blocks
         *  * viscosity: (0.5) for fluid blocks
         *  * onLoad(): block event handler
         *  * onUnload(): block event handler
         *  * onSet(): block event handler
         *  * onUnset(): block event handler
         *  * onCustomMeshCreate(): block event handler
         */

        this.registerBlock = function (id, options = null) {
            if (!options) options = {}
            blockDefaults.solid = !options.fluid
            blockDefaults.opaque = !options.fluid
            var opts = Object.assign({}, blockDefaults, options)

            // console.log('register block: ', id, opts)
            if (id < 1 || id > MAX_BLOCK_ID) throw 'Block id out of range: ' + id

            // if block ID is greater than current highest ID, 
            // register fake blocks to avoid holes in lookup arrays
            while (id > blockSolidity.length) {
                this.registerBlock(blockSolidity.length, {})
            }

            // flags default to solid, opaque, nonfluid
            blockSolidity[id] = !!opts.solid
            blockOpacity[id] = !!opts.opaque
            blockIsFluid[id] = !!opts.fluid

            // store any custom mesh
            blockIsObject[id] = !!opts.blockMesh
            blockMeshes[id] = opts.blockMesh || null

            // parse out material parameter
            // always store 6 material IDs per blockID, so material lookup is monomorphic
            var mat = opts.material || null
            var mats
            if (!mat) {
                mats = [null, null, null, null, null, null]
            } else if (typeof mat == 'string') {
                mats = [mat, mat, mat, mat, mat, mat]
            } else if (mat.length && mat.length == 2) {
                // interpret as [top/bottom, sides]
                mats = [mat[1], mat[1], mat[0], mat[0], mat[1], mat[1]]
            } else if (mat.length && mat.length == 3) {
                // interpret as [top, bottom, sides]
                mats = [mat[2], mat[2], mat[0], mat[1], mat[2], mat[2]]
            } else if (mat.length && mat.length == 6) {
                // interpret as [-x, +x, -y, +y, -z, +z]
                mats = mat
            } else throw 'Invalid material parameter: ' + mat

            // argument is material name, but store as material id, allocating one if needed
            for (var i = 0; i < 6; ++i) {
                blockMats[id * 6 + i] = getMaterialId(this, matIDs, mats[i], true)
            }

            // props data object - currently only used for fluid properties
            blockProps[id] = {}

            // if block is fluid, initialize properties if needed
            if (blockIsFluid[id]) {
                blockProps[id].fluidDensity = opts.fluidDensity
                blockProps[id].viscosity = opts.viscosity
            }

            // event callbacks
            var hasHandler = opts.onLoad || opts.onUnload || opts.onSet || opts.onUnset || opts.onCustomMeshCreate
            blockHandlers[id] = (hasHandler) ? new BlockCallbackHolder(opts) : null

            return id
        }




        /**
         * Register (by name) a material and its parameters.
         * 
         * @param name
         * @param color
         * @param textureURL
         * @param texHasAlpha
         * @param renderMaterial an optional BABYLON material to be used for block faces with this block material
         */

        this.registerMaterial = function (name, color = [1, 1, 1], textureURL = '', texHasAlpha = false, renderMaterial = null) {
            // console.log('register mat: ', name, color, textureURL)
            var id = matIDs[name] || matData.length
            matIDs[name] = id
            var alpha = 1
            if (color && color.length == 4) {
                alpha = color.pop()
            }
            matData[id] = {
                color: color || [1, 1, 1],
                alpha: alpha,
                texture: textureURL ? this._texturePath + textureURL : '',
                textureAlpha: !!texHasAlpha,
                renderMat: renderMaterial || null,
            }
            return id
        }



        /*
         *      quick accessors for querying block ID stuff
         */

        /** 
         * block solidity (as in physics) 
         * @param id
         */
        this.getBlockSolidity = function (id) {
            return blockSolidity[id]
        }

        /**
         * block opacity - whether it obscures the whole voxel (dirt) or 
         * can be partially seen through (like a fencepost, etc)
         * @param id
         */
        this.getBlockOpacity = function (id) {
            return blockOpacity[id]
        }

        /** 
         * block is fluid or not
         * @param id
         */
        this.getBlockFluidity = function (id) {
            return blockIsFluid[id]
        }

        /** 
         * Get block property object passed in at registration
         * @param id
         */
        this.getBlockProps = function (id) {
            return blockProps[id]
        }

        // look up a block ID's face material
        // dir is a value 0..5: [ +x, -x, +y, -y, +z, -z ]
        this.getBlockFaceMaterial = function (blockId, dir) {
            return blockMats[blockId * 6 + dir]
        }





        // look up material color given ID
        this.getMaterialColor = function (matID) {
            return matData[matID].color
        }

        // look up material texture given ID
        this.getMaterialTexture = function (matID) {
            return matData[matID].texture
        }

        // look up material's properties: color, alpha, texture, textureAlpha
        this.getMaterialData = function (matID) {
            return matData[matID]
        }





        /*
         * 
         *   Meant for internal use within the engine
         * 
         */


        // internal access to lookup arrays
        /** @internal */
        this._solidityLookup = blockSolidity
        /** @internal */
        this._opacityLookup = blockOpacity
        /** @internal */
        this._fluidityLookup = blockIsFluid
        /** @internal */
        this._objectLookup = blockIsObject
        /** @internal */
        this._blockMeshLookup = blockMeshes
        /** @internal */
        this._blockHandlerLookup = blockHandlers






        // look up color used for vertices of blocks of given material
        // - i.e. white if it has a texture, color otherwise
        /** @internal */
        this._getMaterialVertexColor = (matID) => {
            if (matData[matID].texture) return white
            return matData[matID].color
        }
        var white = [1, 1, 1]





        /*
         * 
         *      default initialization
         * 
         */

        // add a default material and set ID=1 to it
        // note that registering new block data overwrites the old
        this.registerMaterial('dirt', [0.4, 0.3, 0], null)
        this.registerBlock(1, { material: 'dirt' })



    }

}

/*
 * 
 *          helpers
 * 
*/



// look up material ID given its name
// if lazy is set, pre-register the name and return an ID
function getMaterialId(reg, matIDs, name, lazyInit) {
    if (!name) return 0
    var id = matIDs[name]
    if (id === undefined && lazyInit) id = reg.registerMaterial(name)
    return id
}



// data class for holding block callback references
function BlockCallbackHolder(opts) {
    this.onLoad = opts.onLoad || null
    this.onUnload = opts.onUnload || null
    this.onSet = opts.onSet || null
    this.onUnset = opts.onUnset || null
    this.onCustomMeshCreate = opts.onCustomMeshCreate || null
}


/***/ }),

/***/ "../../game/noa/src/lib/rendering.js":
/*!*******************************************!*\
  !*** ../../game/noa/src/lib/rendering.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Rendering": () => (/* binding */ Rendering)
/* harmony export */ });
/* harmony import */ var _sceneOctreeManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sceneOctreeManager */ "../../game/noa/src/lib/sceneOctreeManager.js");
/* harmony import */ var _babylonjs_core_scene__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babylonjs/core/scene */ "../../game/noa/node_modules/@babylonjs/core/scene.js");
/* harmony import */ var _babylonjs_core_Cameras_freeCamera__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babylonjs/core/Cameras/freeCamera */ "../../game/noa/node_modules/@babylonjs/core/Cameras/freeCamera.js");
/* harmony import */ var _babylonjs_core_Engines_engine__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babylonjs/core/Engines/engine */ "../../game/noa/node_modules/@babylonjs/core/Engines/engine.js");
/* harmony import */ var _babylonjs_core_Lights_hemisphericLight__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babylonjs/core/Lights/hemisphericLight */ "../../game/noa/node_modules/@babylonjs/core/Lights/hemisphericLight.js");
/* harmony import */ var _babylonjs_core_Materials_standardMaterial__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babylonjs/core/Materials/standardMaterial */ "../../game/noa/node_modules/@babylonjs/core/Materials/standardMaterial.js");
/* harmony import */ var _babylonjs_core_Maths_math_color__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babylonjs/core/Maths/math.color */ "../../game/noa/node_modules/@babylonjs/core/Maths/math.color.js");
/* harmony import */ var _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babylonjs/core/Maths/math.vector */ "../../game/noa/node_modules/@babylonjs/core/Maths/math.vector.js");
/* harmony import */ var _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babylonjs/core/Meshes/mesh */ "../../game/noa/node_modules/@babylonjs/core/Meshes/mesh.js");
/* harmony import */ var _babylonjs_core_Meshes_transformNode__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @babylonjs/core/Meshes/transformNode */ "../../game/noa/node_modules/@babylonjs/core/Meshes/transformNode.js");
/* harmony import */ var _babylonjs_core_Meshes_Builders_planeBuilder__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/planeBuilder */ "../../game/noa/node_modules/@babylonjs/core/Meshes/Builders/planeBuilder.js");
/* harmony import */ var _babylonjs_core_Meshes_Builders_linesBuilder__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/linesBuilder */ "../../game/noa/node_modules/@babylonjs/core/Meshes/Builders/linesBuilder.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./util */ "../../game/noa/src/lib/util.js");
/** 
 * The Rendering class is found at [[Rendering | `noa.rendering`]].
 * @module noa.rendering
 */


var glvec3 = __webpack_require__(/*! gl-vec3 */ "../../game/noa/node_modules/gl-vec3/index.js")

;

















// profiling flag
var PROFILE = 0



var defaults = {
    showFPS: false,
    antiAlias: true,
    clearColor: [0.8, 0.9, 1],
    ambientColor: [1, 1, 1],
    lightDiffuse: [1, 1, 1],
    lightSpecular: [1, 1, 1],
    groundLightColor: [0.5, 0.5, 0.5],
    useAO: true,
    AOmultipliers: [0.93, 0.8, 0.5],
    reverseAOmultiplier: 1.0,
    preserveDrawingBuffer: true,
    octreeBlockSize: 2,
    renderOnResize: true,
}



/**
 * `noa.rendering` - 
 * Manages all rendering, and the BABYLON scene, materials, etc.
 * 
 * This module uses the following default options (from the options
 * object passed to the [[Engine]]):
 * ```js
 * {
 *     showFPS: false,
 *     antiAlias: true,
 *     clearColor: [0.8, 0.9, 1],
 *     ambientColor: [1, 1, 1],
 *     lightDiffuse: [1, 1, 1],
 *     lightSpecular: [1, 1, 1],
 *     groundLightColor: [0.5, 0.5, 0.5],
 *     useAO: true,
 *     AOmultipliers: [0.93, 0.8, 0.5],
 *     reverseAOmultiplier: 1.0,
 *     preserveDrawingBuffer: true,
 *     octreeBlockSize: 2,
 *     renderOnResize: true,
 * }
 * ```
*/

class Rendering {

    /** @internal */
    constructor(noa, opts, canvas) {
        opts = Object.assign({}, defaults, opts)
        /** @internal */
        this.noa = noa

        // settings
        /** Whether to redraw the screen when the game is resized while paused */
        this.renderOnResize = !!opts.renderOnResize

        // internals
        /** @internal */
        this.useAO = !!opts.useAO
        /** @internal */
        this.aoVals = opts.AOmultipliers
        /** @internal */
        this.revAoVal = opts.reverseAOmultiplier
        /** @internal */
        this.meshingCutoffTime = 6 // ms

        // set up babylon scene
        /** @internal */
        this._scene = null
        /** @internal */
        this._engine = null
        /** @internal */
        this._octreeManager = null
        initScene(this, canvas, opts)

        // for debugging
        if (opts.showFPS) setUpFPS()
    }
}

// Constructor helper - set up the Babylon.js scene and basic components
function initScene(self, canvas, opts) {

    // init internal properties
    self._engine = new _babylonjs_core_Engines_engine__WEBPACK_IMPORTED_MODULE_3__.Engine(canvas, opts.antiAlias, {
        preserveDrawingBuffer: opts.preserveDrawingBuffer,
    })
    self._scene = new _babylonjs_core_scene__WEBPACK_IMPORTED_MODULE_1__.Scene(self._engine)
    var scene = self._scene
    // remove built-in listeners
    scene.detachControl()

    // octree manager class
    var blockSize = Math.round(opts.octreeBlockSize)
    self._octreeManager = new _sceneOctreeManager__WEBPACK_IMPORTED_MODULE_0__.SceneOctreeManager(self, blockSize)

    // camera, and a node to hold it and accumulate rotations
    self._cameraHolder = new _babylonjs_core_Meshes_transformNode__WEBPACK_IMPORTED_MODULE_9__.TransformNode('camHolder', scene)
    self._camera = new _babylonjs_core_Cameras_freeCamera__WEBPACK_IMPORTED_MODULE_2__.FreeCamera('camera', new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__.Vector3(0, 0, 0), scene)
    self._camera.parent = self._cameraHolder
    self._camera.minZ = .01
    self._cameraHolder.visibility = false

    // plane obscuring the camera - for overlaying an effect on the whole view
    self._camScreen = _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_8__.Mesh.CreatePlane('camScreen', 10, scene)
    self.addMeshToScene(self._camScreen)
    self._camScreen.position.z = .1
    self._camScreen.parent = self._camera
    self._camScreenMat = self.makeStandardMaterial('camscreenmat')
    self._camScreen.material = self._camScreenMat
    self._camScreen.setEnabled(false)
    self._camLocBlock = 0

    // apply some defaults
    var lightVec = new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__.Vector3(0.1, 1, 0.3)
    self._light = new _babylonjs_core_Lights_hemisphericLight__WEBPACK_IMPORTED_MODULE_4__.HemisphericLight('light', lightVec, scene)

    function arrToColor(a) { return new _babylonjs_core_Maths_math_color__WEBPACK_IMPORTED_MODULE_6__.Color3(a[0], a[1], a[2]) }
    scene.clearColor = arrToColor(opts.clearColor)
    scene.ambientColor = arrToColor(opts.ambientColor)
    self._light.diffuse = arrToColor(opts.lightDiffuse)
    self._light.specular = arrToColor(opts.lightSpecular)
    self._light.groundColor = arrToColor(opts.groundLightColor)

    // make a default flat material (used or clone by terrain, etc)
    self.flatMaterial = self.makeStandardMaterial('flatmat')

}



/*
 *   PUBLIC API 
 */


/** The Babylon `scene` object representing the game world. */
Rendering.prototype.getScene = function () {
    return this._scene
}

// per-tick listener for rendering-related stuff
/** @internal */
Rendering.prototype.tick = function (dt) {
    // nothing here at the moment
}




/** @internal */
Rendering.prototype.render = function () {
    profile_hook('start')
    updateCameraForRender(this)
    profile_hook('updateCamera')
    this._engine.beginFrame()
    profile_hook('beginFrame')
    this._scene.render()
    profile_hook('render')
    fps_hook()
    this._engine.endFrame()
    profile_hook('endFrame')
    profile_hook('end')
}


/** @internal */
Rendering.prototype.postRender = function () {
    // nothing currently
}


/** @internal */
Rendering.prototype.resize = function () {
    this._engine.resize()
    if (this.noa._paused && this.renderOnResize) {
        this._scene.render()
    }
}


/** @internal */
Rendering.prototype.highlightBlockFace = function (show, posArr, normArr) {
    var m = getHighlightMesh(this)
    if (show) {
        // floored local coords for highlight mesh
        this.noa.globalToLocal(posArr, null, hlpos)
        // offset to avoid z-fighting, bigger when camera is far away
        var dist = glvec3.dist(this.noa.camera._localGetPosition(), hlpos)
        var slop = 0.001 + 0.001 * dist
        for (var i = 0; i < 3; i++) {
            if (normArr[i] === 0) {
                hlpos[i] += 0.5
            } else {
                hlpos[i] += (normArr[i] > 0) ? 1 + slop : -slop
            }
        }
        m.position.copyFromFloats(hlpos[0], hlpos[1], hlpos[2])
        m.rotation.x = (normArr[1]) ? Math.PI / 2 : 0
        m.rotation.y = (normArr[0]) ? Math.PI / 2 : 0
    }
    m.setEnabled(show)
}
var hlpos = []




/**
 * Add a mesh to the scene's octree setup so that it renders. 
 * 
 * @param mesh the mesh to add to the scene
 * @param isStatic pass in true if mesh never moves (i.e. change octree blocks)
 * @param pos (optional) global position where the mesh should be
 * @param containingChunk (optional) chunk to which the mesh is statically bound
 */
Rendering.prototype.addMeshToScene = function (mesh, isStatic = false, pos = null, containingChunk = null) {
    // exit silently if mesh has already been added and not removed
    if (this._octreeManager.includesMesh(mesh)) return

    // find local position for mesh and move it there (unless it's parented)
    if (!mesh.parent) {
        if (!pos) pos = [mesh.position.x, mesh.position.y, mesh.position.z]
        var lpos = []
        this.noa.globalToLocal(pos, null, lpos)
        mesh.position.copyFromFloats(lpos[0], lpos[1], lpos[2])
    }

    // save CPU by freezing terrain meshes
    if (isStatic) {
        mesh.freezeWorldMatrix()
        if (mesh.freezeNormals) mesh.freezeNormals()
    }

    // add to the octree, and add dispose handler to remove it
    this._octreeManager.addMesh(mesh, isStatic, pos, containingChunk)
    mesh.onDisposeObservable.add(() => {
        this._octreeManager.removeMesh(mesh)
    })
}











/**
 * Create a default standardMaterial:      
 * flat, nonspecular, fully reflects diffuse and ambient light
 */
Rendering.prototype.makeStandardMaterial = function (name) {
    var mat = new _babylonjs_core_Materials_standardMaterial__WEBPACK_IMPORTED_MODULE_5__.StandardMaterial(name, this._scene)
    mat.specularColor.copyFromFloats(0, 0, 0)
    mat.ambientColor.copyFromFloats(1, 1, 1)
    mat.diffuseColor.copyFromFloats(1, 1, 1)
    this.postMaterialCreationHook(mat)
    return mat
}

/** Exposed hook for if the client wants to do something to newly created materials */
Rendering.prototype.postMaterialCreationHook = function (mat) { }






/*
 *
 *   INTERNALS
 *
 */





/*
 *
 * 
 *   ACCESSORS FOR CHUNK ADD/REMOVAL/MESHING
 *
 * 
 */
/** @internal */
Rendering.prototype.prepareChunkForRendering = function (chunk) {
    // currently no logic needed here, but I may need it again...
}

/** @internal */
Rendering.prototype.disposeChunkForRendering = function (chunk) {
    // nothing currently
}






// change world origin offset, and rebase everything with a position
/** @internal */
Rendering.prototype._rebaseOrigin = function (delta) {
    var dvec = new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__.Vector3(delta[0], delta[1], delta[2])

    this._scene.meshes.forEach(mesh => {
        // parented meshes don't live in the world coord system
        if (mesh.parent) return

        // move each mesh by delta (even though most are managed by components)
        mesh.position.subtractInPlace(dvec)

        if (mesh._isWorldMatrixFrozen) {
            // paradoxically this unfreezes, then re-freezes the matrix
            mesh.freezeWorldMatrix()
        }
    })

    // updates position of all octree blocks
    this._octreeManager.rebase(dvec)
}





// updates camera position/rotation to match settings from noa.camera

function updateCameraForRender(self) {
    var cam = self.noa.camera
    var tgtLoc = cam._localGetTargetPosition()
    self._cameraHolder.position.copyFromFloats(tgtLoc[0], tgtLoc[1], tgtLoc[2])
    self._cameraHolder.rotation.x = cam.pitch
    self._cameraHolder.rotation.y = cam.heading
    self._camera.position.z = -cam.currentZoom

    // applies screen effect when camera is inside a transparent voxel
    var cloc = cam._localGetPosition()
    var off = self.noa.worldOriginOffset
    var cx = Math.floor(cloc[0] + off[0])
    var cy = Math.floor(cloc[1] + off[1])
    var cz = Math.floor(cloc[2] + off[2])
    var id = self.noa.getBlock(cx, cy, cz)
    checkCameraEffect(self, id)
}



//  If camera's current location block id has alpha color (e.g. water), apply/remove an effect

function checkCameraEffect(self, id) {
    if (id === self._camLocBlock) return
    if (id === 0) {
        self._camScreen.setEnabled(false)
    } else {
        var matId = self.noa.registry.getBlockFaceMaterial(id, 0)
        if (matId) {
            var matData = self.noa.registry.getMaterialData(matId)
            var col = matData.color
            var alpha = matData.alpha
            if (col && alpha && alpha < 1) {
                self._camScreenMat.diffuseColor.set(0, 0, 0)
                self._camScreenMat.ambientColor.set(col[0], col[1], col[2])
                self._camScreenMat.alpha = alpha
                self._camScreen.setEnabled(true)
            }
        }
    }
    self._camLocBlock = id
}






// make or get a mesh for highlighting active voxel
function getHighlightMesh(rendering) {
    var mesh = rendering._highlightMesh
    if (!mesh) {
        mesh = _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_8__.Mesh.CreatePlane("highlight", 1.0, rendering._scene)
        var hlm = rendering.makeStandardMaterial('highlightMat')
        hlm.backFaceCulling = false
        hlm.emissiveColor = new _babylonjs_core_Maths_math_color__WEBPACK_IMPORTED_MODULE_6__.Color3(1, 1, 1)
        hlm.alpha = 0.2
        mesh.material = hlm

        // outline
        var s = 0.5
        var lines = _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_8__.Mesh.CreateLines("hightlightLines", [
            new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__.Vector3(s, s, 0),
            new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__.Vector3(s, -s, 0),
            new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__.Vector3(-s, -s, 0),
            new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__.Vector3(-s, s, 0),
            new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_7__.Vector3(s, s, 0)
        ], rendering._scene)
        lines.color = new _babylonjs_core_Maths_math_color__WEBPACK_IMPORTED_MODULE_6__.Color3(1, 1, 1)
        lines.parent = mesh

        rendering.addMeshToScene(mesh)
        rendering.addMeshToScene(lines)
        rendering._highlightMesh = mesh
    }
    return mesh
}










/*
 * 
 *      sanity checks:
 * 
 */
/** @internal */
Rendering.prototype.debug_SceneCheck = function () {
    var meshes = this._scene.meshes
    var octree = this._scene._selectionOctree
    var dyns = octree.dynamicContent
    var octs = []
    var numOcts = 0
    var numSubs = 0
    var mats = this._scene.materials
    var allmats = []
    mats.forEach(mat => {
        if (mat.subMaterials) mat.subMaterials.forEach(mat => allmats.push(mat))
        else allmats.push(mat)
    })
    octree.blocks.forEach(function (block) {
        numOcts++
        block.entries.forEach(m => octs.push(m))
    })
    meshes.forEach(function (m) {
        if (m._isDisposed) warn(m, 'disposed mesh in scene')
        if (empty(m)) return
        if (missing(m, dyns, octs)) warn(m, 'non-empty mesh missing from octree')
        if (!m.material) { warn(m, 'non-empty scene mesh with no material'); return }
        numSubs += (m.subMeshes) ? m.subMeshes.length : 1
        var mats = m.material.subMaterials || [m.material]
        mats.forEach(function (mat) {
            if (missing(mat, mats)) warn(mat, 'mesh material not in scene')
        })
    })
    var unusedMats = []
    allmats.forEach(mat => {
        var used = false
        meshes.forEach(mesh => {
            if (mesh.material === mat) used = true
            if (!mesh.material || !mesh.material.subMaterials) return
            if (mesh.material.subMaterials.includes(mat)) used = true
        })
        if (!used) unusedMats.push(mat.name)
    })
    if (unusedMats.length) {
        console.warn('Materials unused by any mesh: ', unusedMats.join(', '))
    }
    dyns.forEach(function (m) {
        if (missing(m, meshes)) warn(m, 'octree/dynamic mesh not in scene')
    })
    octs.forEach(function (m) {
        if (missing(m, meshes)) warn(m, 'octree block mesh not in scene')
    })
    var avgPerOct = Math.round(10 * octs.length / numOcts) / 10
    console.log('meshes - octree:', octs.length, '  dynamic:', dyns.length,
        '   subMeshes:', numSubs,
        '   avg meshes/octreeBlock:', avgPerOct)

    function warn(obj, msg) { console.warn(obj.name + ' --- ' + msg) }

    function empty(mesh) { return (mesh.getIndices().length === 0) }

    function missing(obj, list1, list2) {
        if (!obj) return false
        if (list1.includes(obj)) return false
        if (list2 && list2.includes(obj)) return false
        return true
    }
    return 'done.'
}


/** @internal */
Rendering.prototype.debug_MeshCount = function () {
    var ct = {}
    this._scene.meshes.forEach(m => {
        var n = m.name || ''
        n = n.replace(/-\d+.*/, '#')
        n = n.replace(/\d+.*/, '#')
        n = n.replace(/(rotHolder|camHolder|camScreen)/, 'rendering use')
        n = n.replace(/atlas sprite .*/, 'atlas sprites')
        ct[n] = ct[n] || 0
        ct[n]++
    })
    for (var s in ct) console.log('   ' + (ct[s] + '       ').substr(0, 7) + s)
}







;
var profile_hook = (PROFILE) ?
    (0,_util__WEBPACK_IMPORTED_MODULE_12__.makeProfileHook)(200, 'render internals') : () => { }



var fps_hook = function () { }

function setUpFPS() {
    var div = document.createElement('div')
    div.id = 'noa_fps'
    div.style.position = 'absolute'
    div.style.top = '0'
    div.style.right = '0'
    div.style.zIndex = '0'
    div.style.color = 'white'
    div.style.backgroundColor = 'rgba(0,0,0,0.5)'
    div.style.font = '14px monospace'
    div.style.textAlign = 'center'
    div.style.minWidth = '2em'
    div.style.margin = '4px'
    document.body.appendChild(div)
    var every = 1000
    var ct = 0
    var longest = 0
    var start = performance.now()
    var last = start
    fps_hook = function () {
        ct++
        var nt = performance.now()
        if (nt - last > longest) longest = nt - last
        last = nt
        if (nt - start < every) return
        var fps = Math.round(ct / (nt - start) * 1000)
        var min = Math.round(1 / longest * 1000)
        div.innerHTML = fps + '<br>' + min
        ct = 0
        longest = 0
        start = nt
    }
}


/***/ }),

/***/ "../../game/noa/src/lib/sceneOctreeManager.js":
/*!****************************************************!*\
  !*** ../../game/noa/src/lib/sceneOctreeManager.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SceneOctreeManager": () => (/* binding */ SceneOctreeManager)
/* harmony export */ });
/* harmony import */ var _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babylonjs/core/Maths/math.vector */ "../../game/noa/node_modules/@babylonjs/core/Maths/math.vector.js");
/* harmony import */ var _babylonjs_core_Culling_Octrees_octree__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babylonjs/core/Culling/Octrees/octree */ "../../game/noa/node_modules/@babylonjs/core/Culling/Octrees/octree.js");
/* harmony import */ var _babylonjs_core_Culling_Octrees_octreeBlock__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babylonjs/core/Culling/Octrees/octreeBlock */ "../../game/noa/node_modules/@babylonjs/core/Culling/Octrees/octreeBlock.js");
/* harmony import */ var _babylonjs_core_Culling_Octrees___WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babylonjs/core/Culling/Octrees/ */ "../../game/noa/node_modules/@babylonjs/core/Culling/Octrees/index.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util */ "../../game/noa/src/lib/util.js");
/** 
 * @module 
 * @internal exclude this file from API docs 
*/









/*
 * 
 * 
 * 
 *          simple class to manage scene octree and octreeBlocks
 * 
 * 
 * 
*/

class SceneOctreeManager {

    /** @internal */
    constructor(rendering, blockSize) {
        var scene = rendering._scene
        scene._addComponent(new _babylonjs_core_Culling_Octrees___WEBPACK_IMPORTED_MODULE_3__.OctreeSceneComponent(scene))

        // the root octree object
        var octree = new _babylonjs_core_Culling_Octrees_octree__WEBPACK_IMPORTED_MODULE_1__.Octree(NOP)
        scene._selectionOctree = octree
        octree.blocks = []
        var octBlocksHash = {}


        /*
         * 
         *          public API
         * 
        */

        this.rebase = (offset) => { recurseRebaseBlocks(octree, offset) }
        this.includesMesh = (mesh) => {
            return (mesh._noaContainingBlock || mesh._noaIsDynamicContent)
        }

        this.addMesh = (mesh, isStatic, pos, chunk) => {
            if (!isStatic) {
                mesh._noaIsDynamicContent = true
                octree.dynamicContent.push(mesh)
                return
            }
            // octreeBlock-space integer coords of mesh position, and hashed key
            var ci = Math.floor(pos[0] / bs)
            var cj = Math.floor(pos[1] / bs)
            var ck = Math.floor(pos[2] / bs)
            var mapKey = (0,_util__WEBPACK_IMPORTED_MODULE_4__.locationHasher)(ci, cj, ck)

            // get or create octreeBlock
            var block = octBlocksHash[mapKey]
            if (!block) {
                // lower corner of new octree block position, in global/local
                var gloc = [ci * bs, cj * bs, ck * bs]
                var loc = [0, 0, 0]
                rendering.noa.globalToLocal(gloc, null, loc)
                // make the new octree block and store it
                block = makeOctreeBlock(loc, bs)
                octree.blocks.push(block)
                octBlocksHash[mapKey] = block
                block._noaMapKey = mapKey
            }

            // do the actual adding logic
            block.entries.push(mesh)
            mesh._noaContainingBlock = block

            // rely on octrees for selection, skipping bounds checks
            mesh.alwaysSelectAsActiveMesh = true
        }

        this.removeMesh = (mesh) => {
            if (mesh._noaIsDynamicContent) {
                mesh._noaIsDynamicContent = null
                ;(0,_util__WEBPACK_IMPORTED_MODULE_4__.removeUnorderedListItem)(octree.dynamicContent, mesh)
            }
            if (mesh._noaContainingBlock) {
                mesh._noaContainingChunk = null
                var block = mesh._noaContainingBlock
                ;(0,_util__WEBPACK_IMPORTED_MODULE_4__.removeUnorderedListItem)(block.entries, mesh)
                if (block.entries.length === 0) {
                    delete octBlocksHash[block._noaMapKey]
                    ;(0,_util__WEBPACK_IMPORTED_MODULE_4__.removeUnorderedListItem)(octree.blocks, block)
                }
            }
        }

        /*
         * 
         *          internals
         * 
        */

        var NOP = () => { }
        var bs = blockSize * rendering.noa.world._chunkSize

        var recurseRebaseBlocks = (parent, offset) => {
            parent.blocks.forEach(child => {
                child.minPoint.subtractInPlace(offset)
                child.maxPoint.subtractInPlace(offset)
                child._boundingVectors.forEach(v => v.subtractInPlace(offset))
                if (child.blocks) recurseRebaseBlocks(child, offset)
            })
        }

        var makeOctreeBlock = (minPt, size) => {
            var min = new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.Vector3(minPt[0], minPt[1], minPt[2])
            var max = new _babylonjs_core_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.Vector3(minPt[0] + size, minPt[1] + size, minPt[2] + size)
            return new _babylonjs_core_Culling_Octrees_octreeBlock__WEBPACK_IMPORTED_MODULE_2__.OctreeBlock(min, max, undefined, undefined, undefined, NOP)
        }

    }

}


/***/ }),

/***/ "../../game/noa/src/lib/terrainMesher.js":
/*!***********************************************!*\
  !*** ../../game/noa/src/lib/terrainMesher.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var ndarray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ndarray */ "../../game/noa/node_modules/ndarray/ndarray.js");
/* harmony import */ var ndarray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ndarray__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babylonjs/core/Meshes/mesh */ "../../game/noa/node_modules/@babylonjs/core/Meshes/mesh.js");
/* harmony import */ var _babylonjs_core_Meshes_subMesh__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babylonjs/core/Meshes/subMesh */ "../../game/noa/node_modules/@babylonjs/core/Meshes/subMesh.js");
/* harmony import */ var _babylonjs_core_Meshes_mesh_vertexData__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babylonjs/core/Meshes/mesh.vertexData */ "../../game/noa/node_modules/@babylonjs/core/Meshes/mesh.vertexData.js");
/* harmony import */ var _babylonjs_core_Materials_multiMaterial__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babylonjs/core/Materials/multiMaterial */ "../../game/noa/node_modules/@babylonjs/core/Materials/multiMaterial.js");
/* harmony import */ var _babylonjs_core_Materials_Textures_texture__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babylonjs/core/Materials/Textures/texture */ "../../game/noa/node_modules/@babylonjs/core/Materials/Textures/texture.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util */ "../../game/noa/src/lib/util.js");
/* harmony import */ var _chunk__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./chunk */ "../../game/noa/src/lib/chunk.js");
/** 
 * @module 
 * @internal exclude this file from API docs 
*/










/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TerrainMesher);




// enable for profiling..
var PROFILE_EVERY = 0




/*
 * 
 *          TERRAIN MESHER!!
 * 
*/


function TerrainMesher(noa) {

    var greedyMesher = new GreedyMesher(noa)
    var meshBuilder = new MeshBuilder(noa)


    /*
     * 
     *      public API
     * 
    */


    // add any properties that will get used for meshing
    this.initChunk = function (chunk) {
        chunk._terrainMeshes.length = 0
    }


    /**
     * meshing entry point and high-level flow
     * @param {Chunk} chunk 
     */
    this.meshChunk = function (chunk, matGetter, colGetter, ignoreMaterials, useAO, aoVals, revAoVal) {
        profile_hook('start')

        // dispose any previously existing mesh
        chunk._terrainMeshes.forEach(m => m.dispose())
        chunk._terrainMeshes.length = 0
        profile_hook('cleanup')

        // args
        var mats = matGetter || noa.registry.getBlockFaceMaterial
        var cols = colGetter || noa.registry._getMaterialVertexColor
        var ao = (useAO === undefined) ? noa.rendering.useAO : useAO
        var vals = aoVals || noa.rendering.aoVals
        var rev = isNaN(revAoVal) ? noa.rendering.revAoVal : revAoVal

        // copy voxel data into array padded with neighbor values
        var voxels = buildPaddedVoxelArray(chunk)
        profile_hook('copy')

        // greedy mesher creates big arrays of geometry data
        var edgesOnly = chunk._isFull || chunk._isEmpty
        var geomData = greedyMesher.mesh(voxels, mats, cols, ao, vals, rev, edgesOnly)
        profile_hook('geom')

        // builds the babylon mesh that will be added to the scene
        var mesh = (geomData.numQuads === 0) ? null :
            meshBuilder.build(chunk, geomData, ignoreMaterials)
        profile_hook('build')

        profile_hook('end')

        // add to scene and finish
        if (mesh && mesh.getIndices().length > 0) {
            noa.rendering.addMeshToScene(mesh, true, chunk.pos, this)
            chunk._terrainMeshes.push(mesh)
        }
    }


    // nothing to do on dispose except remove the previous mesh
    this.disposeChunk = function (chunk) {
        chunk._terrainMeshes.forEach(m => m.dispose())
        chunk._terrainMeshes.length = 0
    }



}









/*
 * 
 *      Padded voxel data assembler
 * 
 * Takes the chunk of size n, and copies its data into center of an (n+2) ndarray
 * Then copies in edge data from neighbors, or if not available zeroes it out
 * Actual mesher will then run on the padded ndarray
 * 
*/

function buildPaddedVoxelArray(chunk) {
    var src = chunk.voxels
    var cs = src.shape[0]
    var tgt = cachedPadded

    // embiggen cached target array
    if (cs + 2 !== tgt.shape[0]) {
        var s2 = cs + 2
        tgt = new (ndarray__WEBPACK_IMPORTED_MODULE_0___default())(new Uint16Array(s2 * s2 * s2), [s2, s2, s2])
        cachedPadded = tgt
    }

    // loop through neighbors (neighbor(0,0,0) is the chunk itself)
    // copying or zeroing voxel body/edge data into padded target array
    var loc = _vecs[0]
    var pos = _vecs[1]
    var size = _vecs[2]
    var tgtPos = _vecs[3]
    var posValues = _vecs[4]
    var sizeValues = _vecs[5]
    var tgtPosValues = _vecs[6]
    if (cs !== _cachedVecSize) {
        _cachedVecSize = cs
        allocateVectors(cs, posValues, sizeValues, tgtPosValues)
    }

    for (var i = 0; i < 3; i++) {
        loc[0] = i
        for (var j = 0; j < 3; j++) {
            loc[1] = j
            for (var k = 0; k < 3; k++) {
                loc[2] = k
                for (var n = 0; n < 3; n++) {
                    var coord = loc[n]
                    pos[n] = posValues[coord]
                    size[n] = sizeValues[coord]
                    tgtPos[n] = tgtPosValues[coord]
                }
                var nab = chunk._neighbors.get(i - 1, j - 1, k - 1)
                var nsrc = (nab) ? nab.voxels : null
                ;(0,_util__WEBPACK_IMPORTED_MODULE_6__.copyNdarrayContents)(nsrc, tgt, pos, size, tgtPos)
            }
        }
    }
    return tgt
}
var cachedPadded = new (ndarray__WEBPACK_IMPORTED_MODULE_0___default())(new Uint16Array(27), [3, 3, 3])
var _vecs = Array.from(Array(10), () => [0, 0, 0])
var _cachedVecSize
function allocateVectors(size, posValues, sizeValues, tgtPosValues) {
    for (var i = 0; i < 3; i++) {
        posValues[i] = [size - 1, 0, 0][i]
        sizeValues[i] = [1, size, 1][i]
        tgtPosValues[i] = [0, 1, size + 1][i]
    }
}








/*
 * 
 *  A single reusable struct to hold all geometry data for the chunk 
 *  currently being meshed.
 * 
 *  Basically, the greedy mesher builds this and the mesh builder consumes it
 * 
*/

var cachedGeometryData = {
    numQuads: 0,                // how many quads meshed so far
    materialQuadCounts: {},     // how many quads use each material ID
    quadMaterials: [1],         // list of which matID each quad used
    positions: [0.5],           // raw data, 12 positions per quad
    indices: [1],               // raw data, 6 indexes per quad
    normals: [0.5],             // raw data, 12 normals per quad
    colors: [0.5],              // raw data, 16 colors per quad
    uvs: [0.5],                 // raw data, 8 uvs per quad

    reset: function () {
        this.numQuads = 0
        this.materialQuadCounts = {}
    }
}









/*
 * 
 *  Mesh Builder - consumes all the raw data in geomData to build
 *  Babylon.js mesh/submeshes, ready to be added to the scene
 * 
 */

function MeshBuilder(noa) {
    var matCache = {}
    var multiMatCache = {}


    // core
    this.build = function (chunk, geomData, ignoreMaterials) {
        var nq = geomData.numQuads
        var quadCounts = geomData.materialQuadCounts

        // find any used materials that can share the scene default
        // and move their quad counts to matID 0
        var matLookup = { '0': '0' }
        quadCounts['0'] = 0
        for (var matID in quadCounts) {
            if (matID === '0') continue
            if (ignoreMaterials || canUseDefaultMat(matID)) {
                quadCounts['0'] += quadCounts[matID]
                quadCounts[matID] = 0
                matLookup[matID] = '0'
            } else {
                matLookup[matID] = matID
            }
        }

        // arbitrarily choose a starting offset for quads using each material
        var matOffsets = {}
        var currOffset = 0
        for (var matID2 in quadCounts) {
            if (quadCounts[matID2] === 0) continue
            matOffsets[matID2] = currOffset
            currOffset += quadCounts[matID2]
        }

        // allocate the typed data arrays we'll hand off to Babylon
        var pos = new Float32Array(nq * 12)
        var ind = new Uint16Array(nq * 6)
        var nor = new Float32Array(nq * 12)
        var col = new Float32Array(nq * 16)
        var uvs = new Float32Array(nq * 8)

        // copy data from dataGeom into typed arrays, reordering it as we go
        // so that geometry sharing the same material is contiguous
        for (var ix = 0; ix < nq; ix++) {
            var mergedID = matLookup[geomData.quadMaterials[ix]]
            var off = matOffsets[mergedID]
            // note: indices need a flat offset to point to their original data
            var indexAdjust = (off - ix) * 4
            copyArraySubset(geomData.positions, ix, pos, off, 12, 0)
            copyArraySubset(geomData.indices, ix, ind, off, 6, indexAdjust)
            copyArraySubset(geomData.normals, ix, nor, off, 12, 0)
            copyArraySubset(geomData.colors, ix, col, off, 16, 0)
            copyArraySubset(geomData.uvs, ix, uvs, off, 8, 0)
            matOffsets[mergedID]++
        }

        // build the mesh and vertexData object
        var scene = noa.rendering.getScene()
        var name = 'chunk_' + chunk.requestID
        var mesh = new _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_1__.Mesh(name, scene)
        var vdat = new _babylonjs_core_Meshes_mesh_vertexData__WEBPACK_IMPORTED_MODULE_3__.VertexData()
        vdat.positions = pos
        vdat.indices = ind
        vdat.normals = nor
        vdat.colors = col
        vdat.uvs = uvs
        vdat.applyToMesh(mesh)

        // array of the materialIDs we need, in stable order
        var matIDsUsed = Object.keys(matOffsets).sort((a, b) => (a < b) ? -1 : 1)

        // assign a material or make a multimaterial
        if (matIDsUsed.length === 1) {
            var onlyMatID = matLookup[geomData.quadMaterials[0]]
            mesh.material = getTerrainMaterial(onlyMatID, ignoreMaterials)
        } else {
            // make a multimaterial and define (babylon) submeshes
            mesh.subMeshes = []
            var matNum = 0
            for (var matID4 of matIDsUsed) {
                // note that offsets are currently at END of their respective spans
                var qct = quadCounts[matID4]
                var start = matOffsets[matID4] - qct
                new _babylonjs_core_Meshes_subMesh__WEBPACK_IMPORTED_MODULE_2__.SubMesh(
                    matNum, // index into multmat
                    start * 12, qct * 12, // vertex start, count - these appear to be used
                    start * 6, qct * 6, // indices start, length
                    mesh)
                matNum++
            }
            mesh.material = getMultiMatForIDs(matIDsUsed, scene)
            mesh.onDisposeObservable.add(onMeshDispose)
        }

        // done, mesh will be positioned later when added to the scene
        return mesh
    }

    function canUseDefaultMat(matID) {
        if (noa.registry.getMaterialTexture(matID)) return false
        var matData = noa.registry.getMaterialData(matID)
        return (matData.alpha === 1 && !matData.renderMat)
    }

    function copyArraySubset(src, sbase, tgt, tbase, count, addValue) {
        var soff = sbase * count
        var toff = tbase * count
        for (var i = 0; i < count; i++) {
            tgt[toff + i] = src[soff + i] + addValue
        }
    }








    //                         Material wrangling


    function getMultiMatForIDs(matIDs, scene) {
        var matName = 'terrain_multi:' + matIDs.join(',')
        if (!multiMatCache[matName]) {
            var multiMat = new _babylonjs_core_Materials_multiMaterial__WEBPACK_IMPORTED_MODULE_4__.MultiMaterial(matName, scene)
            multiMat.subMaterials = matIDs.map(matID => getTerrainMaterial(matID, false))
            multiMatCache[matName] = { multiMat, useCount: 0 }
        }
        multiMatCache[matName].useCount++
        return multiMatCache[matName].multiMat
    }

    function onMeshDispose(mesh, b, c) {
        if (!mesh || !mesh.material) return
        var matName = mesh.material.name
        if (!multiMatCache[matName]) return
        mesh.material = null
        multiMatCache[matName].useCount--
        if (multiMatCache[matName].useCount > 0) return
        multiMatCache[matName].multiMat.dispose()
        mesh._scene.removeMultiMaterial(multiMatCache[matName])
        delete multiMatCache[matName]
    }

    // manage materials/textures to avoid duplicating them
    function getTerrainMaterial(matID, ignore) {
        if (ignore || matID == 0) return noa.rendering.flatMaterial
        var name = 'terrain_mat:' + matID
        if (!matCache[name]) {
            matCache[name] = makeTerrainMaterial(matID, name)
        }
        return matCache[name]
    }



    // canonical function to make a terrain material
    function makeTerrainMaterial(id, name) {
        // if user-specified render material is defined, use it
        var matData = noa.registry.getMaterialData(id)
        if (matData.renderMat) return matData.renderMat
        // otherwise determine which built-in material to use
        var url = noa.registry.getMaterialTexture(id)
        var alpha = matData.alpha
        if (!url && alpha === 1) {
            // base material is fine for non-textured case, if no alpha
            return noa.rendering.flatMaterial
        }
        var mat = noa.rendering.makeStandardMaterial(name)
        if (url) {
            var scene = noa.rendering.getScene()
            var tex = new _babylonjs_core_Materials_Textures_texture__WEBPACK_IMPORTED_MODULE_5__.Texture(url, scene, true, false, _babylonjs_core_Materials_Textures_texture__WEBPACK_IMPORTED_MODULE_5__.Texture.NEAREST_SAMPLINGMODE)
            if (matData.textureAlpha) tex.hasAlpha = true
            mat.diffuseTexture = tex
        }
        if (matData.alpha < 1) {
            mat.alpha = matData.alpha
        }
        return mat
    }
}








/*
 *    Greedy voxel meshing algorithm
 *        based initially on algo by Mikola Lysenko:
 *          http://0fps.net/2012/07/07/meshing-minecraft-part-2/
 *          but evolved quite a bit since then
 *        AO handling by me, stitched together out of cobwebs and dreams
 *    
 *    Arguments:
 *        arr: 3D ndarray of dimensions X,Y,Z
 *             packed with solidity/opacity booleans in higher bits
 *        getMaterial: function( blockID, dir )
 *             returns a material ID based on block id and which cube face it is
 *             (assume for now that each mat ID should get its own mesh)
 *        getColor: function( materialID )
 *             looks up a color (3-array) by material ID
 *             TODO: replace this with a lookup array?
 *        doAO: whether or not to bake ambient occlusion into vertex colors
 *        aoValues: array[3] of color multipliers for AO (least to most occluded)
 *        revAoVal: "reverse ao" - color multiplier for unoccluded exposed edges
 *
 *    Return object: array of mesh objects keyed by material ID
 *        arr[id] = {
 *          id:       material id for mesh
 *          vertices: ints, range 0 .. X/Y/Z
 *          indices:  ints
 *          normals:  ints,   -1 .. 1
 *          colors:   floats,  0 .. 1
 *          uvs:      floats,  0 .. X/Y/Z
 *        }
 */

function GreedyMesher(noa) {

    var maskCache = new Int16Array(16)
    var aomaskCache = new Uint16Array(16)

    var solidLookup = noa.registry._solidityLookup
    var opacityLookup = noa.registry._opacityLookup


    this.mesh = function (voxels, getMaterial, getColor, doAO, aoValues, revAoVal, edgesOnly) {
        solidLookup = noa.registry._solidityLookup
        opacityLookup = noa.registry._opacityLookup

        // collected geometry data for the current mesh
        var geomData = cachedGeometryData
        geomData.reset()

        // how to apply AO packing in first masking function
        var skipReverseAO = (revAoVal === aoValues[0])

        //Sweep over each axis, mapping axes to [d,u,v]
        for (var d = 0; d < 3; ++d) {
            var u = (d + 1) % 3
            var v = (d + 2) % 3

            // make transposed ndarray so index i is the axis we're sweeping
            var shape = voxels.shape
            var arrT = voxels.transpose(d, u, v).lo(1, 1, 1).hi(shape[d] - 2, shape[u] - 2, shape[v] - 2)

            // shorten len0 by 1 so faces at edges don't get drawn in both chunks
            var len0 = arrT.shape[0] - 1
            var len1 = arrT.shape[1]
            var len2 = arrT.shape[2]

            // embiggen mask arrays as needed
            if (maskCache.length < len1 * len2) {
                maskCache = new Int16Array(len1 * len2)
                aomaskCache = new Uint16Array(len1 * len2)
            }

            // iterate along current major axis..
            for (var i = 0; i <= len0; ++i) {

                // fills mask and aomask arrays with values
                constructMeshMasks(i, d, arrT, getMaterial, doAO, skipReverseAO)

                // parses the masks to do greedy meshing
                constructGeometryFromMasks(i, d, u, v, len1, len2,
                    doAO, geomData, getColor, aoValues, revAoVal)

                // process edges only by jumping to other edge
                if (edgesOnly) i += (len0 - 1)

            }
        }

        // done!
        return geomData
    }







    //      Greedy meshing inner loop one
    //
    // iterating across ith 2d plane, with n being index into masks

    function constructMeshMasks(i, d, arrT, getMaterial, doAO, skipRevAO) {
        var len = arrT.shape[1]
        var mask = maskCache
        var aomask = aomaskCache
        // set up for quick array traversals
        var n = 0
        var materialDir = d * 2
        var data = arrT.data
        var dbase = arrT.index(i - 1, 0, 0)
        var istride = arrT.stride[0]
        var jstride = arrT.stride[1]
        var kstride = arrT.stride[2]

        for (var k = 0; k < len; ++k) {
            var d0 = dbase
            dbase += kstride
            for (var j = 0; j < len; j++, n++, d0 += jstride) {

                // mask[n] will represent the face needed between i-1,j,k and i,j,k
                // for now, assume we never have two faces in both directions

                // note that mesher zeroes out the mask as it goes, so there's 
                // no need to zero it here when no face is needed

                // IDs at i-1,j,k  and  i,j,k
                var id0 = data[d0]
                var id1 = data[d0 + istride]

                // most common case: never a face between same voxel IDs, 
                // so skip out early
                if (id0 === id1) continue

                var faceDir = getFaceDir(id0, id1, getMaterial, materialDir)
                if (faceDir) {
                    // set regular mask value to material ID, sign indicating direction
                    mask[n] = (faceDir > 0) ?
                        getMaterial(id0, materialDir) :
                        -getMaterial(id1, materialDir + 1)

                    // if doing AO, precalculate AO level for each face into second mask
                    if (doAO) {
                        // i values in direction face is/isn't pointing{
                        aomask[n] = (faceDir > 0) ?
                            packAOMask(arrT, i, i - 1, j, k, skipRevAO) :
                            packAOMask(arrT, i - 1, i, j, k, skipRevAO)
                    }
                }
            }
        }
    }



    function getFaceDir(id0, id1, getMaterial, materialDir) {
        // no face if both blocks are opaque
        var op0 = opacityLookup[id0]
        var op1 = opacityLookup[id1]
        if (op0 && op1) return 0
        // if either block is opaque draw a face for it
        if (op0) return 1
        if (op1) return -1
        // can't tell from block IDs, so compare block materials of each face
        var m0 = getMaterial(id0, materialDir)
        var m1 = getMaterial(id1, materialDir + 1)
        // if same material, draw no face. If one is missing, draw the other
        if (m0 === m1) { return 0 }
        else if (m0 === 0) { return -1 }
        else if (m1 === 0) { return 1 }
        // remaining case is two different non-opaque block materials
        // facing each other. for now, draw neither..
        return 0
    }






    // 
    //      Greedy meshing inner loop two
    //
    // construct geometry data from the masks

    function constructGeometryFromMasks(i, d, u, v, len1, len2,
        doAO, geomData, getColor, aoValues, revAoVal) {
        var n = 0
        var mask = maskCache
        var aomask = aomaskCache

        var x = [0, 0, 0]
        var du = [0, 0, 0]
        var dv = [0, 0, 0]
        x[d] = i
        var norms = [0, 0, 0]

        // some logic is broken into helper functions for AO and non-AO
        // this fixes deopts in Chrome (for reasons unknown)
        var maskCompareFcn = (doAO) ? maskCompare : maskCompare_noAO
        var meshColorFcn = (doAO) ? pushMeshColors : pushMeshColors_noAO

        for (var k = 0; k < len2; ++k) {
            var w = 1
            var h = 1
            for (var j = 0; j < len1; j += w, n += w) {

                var maskVal = mask[n] | 0
                if (!maskVal) {
                    w = 1
                    continue
                }
                var ao = aomask[n] | 0

                // Compute width and height of area with same mask/aomask values
                for (w = 1; w < len1 - j; ++w) {
                    if (!maskCompareFcn(n + w, mask, maskVal, aomask, ao)) break
                }

                OUTER:
                for (h = 1; h < len2 - k; ++h) {
                    for (var m = 0; m < w; ++m) {
                        var ix = n + m + h * len1
                        if (!maskCompareFcn(ix, mask, maskVal, aomask, ao)) break OUTER
                    }
                }

                // for testing: doing the following will disable greediness
                //w=h=1

                // material and mesh for this face
                var matID = Math.abs(maskVal)

                // we're now ready to push a quad worth of geometry data
                var nq = geomData.numQuads
                geomData.quadMaterials[nq] = matID | 0
                geomData.materialQuadCounts[matID] =
                    (geomData.materialQuadCounts[matID] || 0) + 1

                // add colors into geomData
                // tridir is boolean for which way to split the quad into triangles
                var colorsArr = geomData.colors
                var colorsIndex = nq * 16
                var triDir = meshColorFcn(colorsArr, colorsIndex,
                    getColor(matID), ao, aoValues, revAoVal)

                //Add quad positions - vertices = x -> x+du -> x+du+dv -> x+dv
                x[u] = j
                x[v] = k
                du[u] = w
                dv[v] = h
                addPositionValues(geomData.positions, nq * 12, x, du, dv)

                // add uv values, with the order and sign depending on 
                // axis and direction so as to avoid mirror-image textures
                var dir = sign(maskVal)
                addUVs(geomData.uvs, nq * 8, d, w, h, dir)

                // add same normals for all vertices, depending on
                // which direction the mask was solid in..
                norms[d] = dir
                addNormalValues(geomData.normals, nq * 12, norms)

                // Add indexes, ordered clockwise for the facing direction;
                var inds = geomData.indices
                var ioff = nq * 6
                var voff = nq * 4
                addIndexValues(inds, ioff, voff, maskVal, triDir)

                // finished adding  quad geometry data
                geomData.numQuads++

                //Zero-out mask
                for (var hx = 0; hx < h; ++hx) {
                    for (var wx = 0; wx < w; ++wx) {
                        mask[n + wx + hx * len1] = 0
                    }
                }

            }
        }
    }


    // small helpers to add values to raw data geometry arrays:

    function addPositionValues(posArr, offset, x, du, dv) {
        for (var i = 0; i < 3; i++) {
            posArr[offset + i] = x[i]
            posArr[offset + 3 + i] = x[i] + du[i]
            posArr[offset + 6 + i] = x[i] + du[i] + dv[i]
            posArr[offset + 9 + i] = x[i] + dv[i]
        }
    }

    function addUVs(uvArr, offset, d, w, h, dir) {
        for (var i = 0; i < 8; i++) uvArr[offset + i] = 0
        if (d === 2) {
            uvArr[offset + 1] = uvArr[offset + 3] = h
            uvArr[offset + 2] = uvArr[offset + 4] = -dir * w
        } else {
            uvArr[offset + 1] = uvArr[offset + 7] = w
            uvArr[offset + 4] = uvArr[offset + 6] = dir * h
        }
    }

    function addNormalValues(normArr, offset, norms) {
        for (var i = 0; i < 12; i++) {
            normArr[offset + i] = norms[i % 3]
        }
    }

    function addIndexValues(indArr, offset, baseIndex, maskVal, triDir) {
        var indexVals = (maskVal < 0) ?
            (triDir ? indexLists.A : indexLists.B) :
            (triDir ? indexLists.C : indexLists.D)
        for (var i = 0; i < 6; i++) {
            indArr[offset + i] = baseIndex + indexVals[i]
        }
    }
    var indexLists = {
        A: [0, 1, 2, 0, 2, 3],
        B: [1, 2, 3, 0, 1, 3],
        C: [0, 2, 1, 0, 3, 2],
        D: [3, 1, 0, 3, 2, 1],
    }




    // Helper functions with AO and non-AO implementations:

    function maskCompare(index, mask, maskVal, aomask, aoVal) {
        if (maskVal !== mask[index]) return false
        if (aoVal !== aomask[index]) return false
        return true
    }

    function maskCompare_noAO(index, mask, maskVal, aomask, aoVal) {
        if (maskVal !== mask[index]) return false
        return true
    }

    function pushMeshColors_noAO(colors, ix, c, ao, aoValues, revAoVal) {
        for (var off = 0; off < 16; off += 4) {
            colors[ix + off] = c[0]
            colors[ix + off + 1] = c[1]
            colors[ix + off + 2] = c[2]
            colors[ix + off + 3] = 1
        }
        return true // triangle direction doesn't matter for non-AO
    }

    function pushMeshColors(colors, ix, c, ao, aoValues, revAoVal) {
        var ao00 = unpackAOMask(ao, 0, 0)
        var ao10 = unpackAOMask(ao, 1, 0)
        var ao11 = unpackAOMask(ao, 1, 1)
        var ao01 = unpackAOMask(ao, 0, 1)
        pushAOColor(colors, ix, c, ao00, aoValues, revAoVal)
        pushAOColor(colors, ix + 4, c, ao10, aoValues, revAoVal)
        pushAOColor(colors, ix + 8, c, ao11, aoValues, revAoVal)
        pushAOColor(colors, ix + 12, c, ao01, aoValues, revAoVal)

        // this bit is pretty magical..
        var triDir = true
        if (ao00 === ao11) {
            triDir = (ao01 === ao10) ? (ao01 === 2) : true
        } else {
            triDir = (ao01 === ao10) ? false : (ao00 + ao11 > ao01 + ao10)
        }
        return triDir
    }

    function sign(num) {
        return (num > 0) ? 1 : -1
    }




    /* 
     *  packAOMask:
     *
     *    For a given face, find occlusion levels for each vertex, then
     *    pack 4 such (2-bit) values into one Uint8 value
     * 
     *  Occlusion levels:
     *    1 is flat ground, 2 is partial occlusion, 3 is max (corners)
     *    0 is "reverse occlusion" - an unoccluded exposed edge 
     *  Packing order var(bit offset):
     *      a01(2)  -   a11(6)   ^  K
     *        -     -            +> J
     *      a00(0)  -   a10(4)
     */

    function packAOMask(data, ipos, ineg, j, k, skipReverse) {
        var a00 = 1
        var a01 = 1
        var a10 = 1
        var a11 = 1

        // inc occlusion of vertex next to obstructed side
        if (solidLookup[data.get(ipos, j + 1, k)]) { ++a10; ++a11 }
        if (solidLookup[data.get(ipos, j - 1, k)]) { ++a00; ++a01 }
        if (solidLookup[data.get(ipos, j, k + 1)]) { ++a01; ++a11 }
        if (solidLookup[data.get(ipos, j, k - 1)]) { ++a00; ++a10 }

        // facing into a solid (non-opaque) block?
        var facingSolid = solidLookup[data.get(ipos, j, k)]
        if (facingSolid) {
            // always 2, or 3 in corners
            a11 = (a11 === 3 || solidLookup[data.get(ipos, j + 1, k + 1)]) ? 3 : 2
            a01 = (a01 === 3 || solidLookup[data.get(ipos, j - 1, k + 1)]) ? 3 : 2
            a10 = (a10 === 3 || solidLookup[data.get(ipos, j + 1, k - 1)]) ? 3 : 2
            a00 = (a00 === 3 || solidLookup[data.get(ipos, j - 1, k - 1)]) ? 3 : 2
            return a11 << 6 | a10 << 4 | a01 << 2 | a00
        }

        // simpler logic if skipping reverse AO?
        if (skipReverse) {
            // treat corner as occlusion 3 only if not occluded already
            if (a11 === 1 && (solidLookup[data.get(ipos, j + 1, k + 1)])) { a11 = 2 }
            if (a01 === 1 && (solidLookup[data.get(ipos, j - 1, k + 1)])) { a01 = 2 }
            if (a10 === 1 && (solidLookup[data.get(ipos, j + 1, k - 1)])) { a10 = 2 }
            if (a00 === 1 && (solidLookup[data.get(ipos, j - 1, k - 1)])) { a00 = 2 }
            return a11 << 6 | a10 << 4 | a01 << 2 | a00
        }

        // check each corner, and if not present do reverse AO
        if (a11 === 1) {
            if (solidLookup[data.get(ipos, j + 1, k + 1)]) {
                a11 = 2
            } else if (!(solidLookup[data.get(ineg, j, k + 1)]) ||
                !(solidLookup[data.get(ineg, j + 1, k)]) ||
                !(solidLookup[data.get(ineg, j + 1, k + 1)])) {
                a11 = 0
            }
        }

        if (a10 === 1) {
            if (solidLookup[data.get(ipos, j + 1, k - 1)]) {
                a10 = 2
            } else if (!(solidLookup[data.get(ineg, j, k - 1)]) ||
                !(solidLookup[data.get(ineg, j + 1, k)]) ||
                !(solidLookup[data.get(ineg, j + 1, k - 1)])) {
                a10 = 0
            }
        }

        if (a01 === 1) {
            if (solidLookup[data.get(ipos, j - 1, k + 1)]) {
                a01 = 2
            } else if (!(solidLookup[data.get(ineg, j, k + 1)]) ||
                !(solidLookup[data.get(ineg, j - 1, k)]) ||
                !(solidLookup[data.get(ineg, j - 1, k + 1)])) {
                a01 = 0
            }
        }

        if (a00 === 1) {
            if (solidLookup[data.get(ipos, j - 1, k - 1)]) {
                a00 = 2
            } else if (!(solidLookup[data.get(ineg, j, k - 1)]) ||
                !(solidLookup[data.get(ineg, j - 1, k)]) ||
                !(solidLookup[data.get(ineg, j - 1, k - 1)])) {
                a00 = 0
            }
        }

        return a11 << 6 | a10 << 4 | a01 << 2 | a00
    }



    // unpack (2 bit) ao value from ao mask
    // see above for details
    function unpackAOMask(aomask, jpos, kpos) {
        var offset = jpos ? (kpos ? 6 : 4) : (kpos ? 2 : 0)
        return aomask >> offset & 3
    }


    // premultiply vertex colors by value depending on AO level
    // then push them into color array
    function pushAOColor(colors, ix, baseCol, ao, aoVals, revAoVal) {
        var mult = (ao === 0) ? revAoVal : aoVals[ao - 1]
        colors[ix] = baseCol[0] * mult
        colors[ix + 1] = baseCol[1] * mult
        colors[ix + 2] = baseCol[2] * mult
        colors[ix + 3] = 1
    }

}









var profile_hook = (PROFILE_EVERY) ?
    (0,_util__WEBPACK_IMPORTED_MODULE_6__.makeProfileHook)(PROFILE_EVERY, 'Terrain meshing') : () => { }


/***/ }),

/***/ "../../game/noa/src/lib/util.js":
/*!**************************************!*\
  !*** ../../game/noa/src/lib/util.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeUnorderedListItem": () => (/* binding */ removeUnorderedListItem),
/* harmony export */   "loopForTime": () => (/* binding */ loopForTime),
/* harmony export */   "numberOfVoxelsInSphere": () => (/* binding */ numberOfVoxelsInSphere),
/* harmony export */   "copyNdarrayContents": () => (/* binding */ copyNdarrayContents),
/* harmony export */   "iterateOverShellAtDistance": () => (/* binding */ iterateOverShellAtDistance),
/* harmony export */   "locationHasher": () => (/* binding */ locationHasher),
/* harmony export */   "ChunkStorage": () => (/* binding */ ChunkStorage),
/* harmony export */   "LocationQueue": () => (/* binding */ LocationQueue),
/* harmony export */   "makeProfileHook": () => (/* binding */ makeProfileHook),
/* harmony export */   "makeThroughputHook": () => (/* binding */ makeThroughputHook)
/* harmony export */ });
/** 
 * @module 
 * @internal exclude this file from API docs 
*/


// helper to swap item to end and pop(), instead of splice()ing
function removeUnorderedListItem(list, item) {
    var i = list.indexOf(item)
    if (i < 0) return
    if (i === list.length - 1) {
        list.pop()
    } else {
        list[i] = list.pop()
    }
}



// loop over a function for a few ms, or until it returns true
function loopForTime(maxTimeInMS, callback, startTime) {
    var t0 = startTime || performance.now()
    var res = callback()
    if (res) return
    var t1 = performance.now(), dt = t1 - startTime
    // tweak time to make the average delay equal to the desired amt
    var cutoff = t0 + maxTimeInMS - dt / 2
    if (t1 > cutoff) return
    var maxIter = 1000 // sanity check
    for (var i = 0; i < maxIter; i++) {
        if (callback() || performance.now() > cutoff) return
    }
}





// ....
function numberOfVoxelsInSphere(rad) {
    if (rad === prevRad) return prevAnswer
    var ext = Math.ceil(rad), ct = 0, rsq = rad * rad
    for (var i = -ext; i <= ext; ++i) {
        for (var j = -ext; j <= ext; ++j) {
            for (var k = -ext; k <= ext; ++k) {
                var dsq = i * i + j * j + k * k
                if (dsq < rsq) ct++
            }
        }
    }
    prevRad = rad
    prevAnswer = ct
    return ct
}
var prevRad = 0, prevAnswer = 0





// partly "unrolled" loops to copy contents of ndarrays
// when there's no source, zeroes out the array instead
function copyNdarrayContents(src, tgt, pos, size, tgtPos) {
    if (src) {
        doNdarrayCopy(src, tgt, pos[0], pos[1], pos[2],
            size[0], size[1], size[2], tgtPos[0], tgtPos[1], tgtPos[2])
    } else {
        doNdarrayZero(tgt, tgtPos[0], tgtPos[1], tgtPos[2],
            size[0], size[1], size[2])
    }
}
function doNdarrayCopy(src, tgt, i0, j0, k0, si, sj, sk, ti, tj, tk) {
    var sdx = src.stride[2]
    var tdx = tgt.stride[2]
    for (var i = 0; i < si; i++) {
        for (var j = 0; j < sj; j++) {
            var six = src.index(i0 + i, j0 + j, k0)
            var tix = tgt.index(ti + i, tj + j, tk)
            for (var k = 0; k < sk; k++) {
                tgt.data[tix] = src.data[six]
                six += sdx
                tix += tdx
            }
        }
    }
}

function doNdarrayZero(tgt, i0, j0, k0, si, sj, sk) {
    var dx = tgt.stride[2]
    for (var i = 0; i < si; i++) {
        for (var j = 0; j < sj; j++) {
            var ix = tgt.index(i0 + i, j0 + j, k0)
            for (var k = 0; k < sk; k++) {
                tgt.data[ix] = 0
                ix += dx
            }
        }
    }
}




// iterates over 3D positions a given manhattan distance from (0,0,0)
// and exit early if the callback returns true
// skips locations beyond a horiz or vertical max distance
function iterateOverShellAtDistance(d, xmax, ymax, cb) {
    if (d === 0) return cb(0, 0, 0)
    // larger top/bottom planes of current shell
    var dx = Math.min(d, xmax)
    var dy = Math.min(d, ymax)
    if (d <= ymax) {
        for (var x = -dx; x <= dx; x++) {
            for (var z = -dx; z <= dx; z++) {
                if (cb(x, d, z)) return true
                if (cb(x, -d, z)) return true
            }
        }
    }
    // smaller side planes of shell
    if (d <= xmax) {
        for (var i = -d; i < d; i++) {
            for (var y = -dy + 1; y < dy; y++) {
                if (cb(i, y, d)) return true
                if (cb(-i, y, -d)) return true
                if (cb(d, y, -i)) return true
                if (cb(-d, y, i)) return true
            }
        }
    }
    return false
}






// function to hash three indexes (i,j,k) into one integer
// note that hash wraps around every 1024 indexes.
//      i.e.:   hash(1, 1, 1) === hash(1025, 1, -1023)
function locationHasher(i, j, k) {
    return (i & 1023)
        | ((j & 1023) << 10)
        | ((k & 1023) << 20)
}



/*
 * 
 *      chunkStorage - a Map-backed abstraction for storing/
 *      retrieving chunk objects by their location indexes
 * 
*/

function ChunkStorage() {
    var hash = {}
    // exposed API - getting and setting
    this.getChunkByIndexes = (i, j, k) => {
        return hash[locationHasher(i, j, k)] || null
    }
    this.storeChunkByIndexes = (i, j, k, chunk) => {
        hash[locationHasher(i, j, k)] = chunk
    }
    this.removeChunkByIndexes = (i, j, k) => {
        delete hash[locationHasher(i, j, k)]
    }
}






/*
 * 
 *      LocationQueue - simple array of [i,j,k] locations, 
 *      backed by a hash for O(1) existence checks.
 *      removals by value are O(n).
 * 
*/

function LocationQueue() {
    this.arr = []
    this.hash = {}
}
LocationQueue.prototype.forEach = function (a, b) { this.arr.forEach(a, b) }
LocationQueue.prototype.includes = function (i, j, k) {
    var id = locationHasher(i, j, k)
    return !!this.hash[id]
}
LocationQueue.prototype.add = function (i, j, k) {
    var id = locationHasher(i, j, k)
    if (this.hash[id]) return
    this.arr.push([i, j, k, id])
    this.hash[id] = true
}
LocationQueue.prototype.addToFront = function (i, j, k) {
    var id = locationHasher(i, j, k)
    if (this.hash[id]) return
    this.arr.unshift([i, j, k, id])
    this.hash[id] = true
}
LocationQueue.prototype.removeByIndex = function (ix) {
    var el = this.arr[ix]
    delete this.hash[el[3]]
    this.arr.splice(ix, 1)
}
LocationQueue.prototype.remove = function (i, j, k) {
    var id = locationHasher(i, j, k)
    if (!this.hash[id]) return
    delete this.hash[id]
    for (var ix = 0; ix < this.arr.length; ix++) {
        if (id === this.arr[ix][3]) {
            this.arr.splice(ix, 1)
            return
        }
    }
    throw 'internal bug with location queue - hash value overlapped'
}
LocationQueue.prototype.count = function () { return this.arr.length }
LocationQueue.prototype.isEmpty = function () { return (this.arr.length === 0) }
LocationQueue.prototype.empty = function () {
    this.arr.length = 0
    this.hash = {}
}
LocationQueue.prototype.pop = function () {
    var el = this.arr.pop()
    delete this.hash[el[3]]
    return el
}
LocationQueue.prototype.copyFrom = function (queue) {
    this.arr = queue.arr.slice()
    this.hash = {}
    for (var key in queue.hash) this.hash[key] = true
}
LocationQueue.prototype.sortByDistance = function (locToDist) {
    var hash = {}
    for (var loc of this.arr) hash[loc] = locToDist(loc[0], loc[1], loc[2])
    this.arr.sort((a, b) => hash[b] - hash[a]) // DESCENDING!
    hash = null
}











// simple thing for reporting time split up between several activities
function makeProfileHook(every, title, filter) {
    if (!(every > 0)) return () => { }
    title = title || ''
    var times = []
    var names = []
    var started = 0
    var last = 0
    var iter = 0
    var total = 0
    var clearNext = true

    var start = function () {
        if (clearNext) {
            times.length = names.length = 0
            clearNext = false
        }
        started = last = performance.now()
        iter++
    }
    var add = function (name) {
        var t = performance.now()
        if (names.indexOf(name) < 0) names.push(name)
        var i = names.indexOf(name)
        if (!times[i]) times[i] = 0
        times[i] += t - last
        last = t
    }
    var report = function () {
        total += performance.now() - started
        if (iter === every) {
            var head = title + ' total ' + (total / every).toFixed(2) + 'ms (avg, ' + every + ' runs)    '
            console.log(head, names.map(function (name, i) {
                if (filter && times[i] / total < 0.05) return ''
                return name + ': ' + (times[i] / every).toFixed(2) + 'ms    '
            }).join(''))
            clearNext = true
            iter = 0
            total = 0
        }
    }
    return function profile_hook(state) {
        if (state === 'start') start()
        else if (state === 'end') report()
        else add(state)
    }
}




// simple thing for reporting time actions/sec
function makeThroughputHook(_every, _title, filter) {
    var title = _title || ''
    var every = _every || 1
    var counts = {}
    var started = performance.now()
    var iter = 0
    return function profile_hook(state) {
        if (state === 'start') return
        if (state === 'end') {
            if (++iter < every) return
            var t = performance.now()
            console.log(title + '   ' + Object.keys(counts).map(k => {
                var through = counts[k] / (t - started) * 1000
                counts[k] = 0
                return k + ':' + through.toFixed(2) + '   '
            }).join(''))
            started = t
            iter = 0
        } else {
            if (!counts[state]) counts[state] = 0
            counts[state]++
        }
    }
}


/***/ }),

/***/ "../../game/noa/src/lib/world.js":
/*!***************************************!*\
  !*** ../../game/noa/src/lib/world.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "World": () => (/* binding */ World)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "../../game/noa/node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _chunk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chunk */ "../../game/noa/src/lib/chunk.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util */ "../../game/noa/src/lib/util.js");
/** 
 * The World class is found at [[World | `noa.world`]].
 * @module noa.world
 */






var PROFILE_EVERY = 0               // ticks
var PROFILE_QUEUES_EVERY = 0        // ticks






var defaultOptions = {
    chunkSize: 24,
    chunkAddDistance: [2, 2],           // [horizontal, vertical]
    chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
    worldGenWhilePaused: false,
    manuallyControlChunkLoading: false,
}

/**
 * `noa.world` - manages world data, chunks, voxels.
 * 
 * This module uses the following default options (from the options
 * object passed to the [[Engine]]):
 * ```js
 * var defaultOptions = {
 *   chunkSize: 24,
 *   chunkAddDistance: [2, 2],           // [horizontal, vertical]
 *   chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
 *   worldGenWhilePaused: false,
 *   manuallyControlChunkLoading: false,
 * }
 * ```
*/
class World extends (events__WEBPACK_IMPORTED_MODULE_0___default()) {

    /** @internal */
    constructor(noa, opts) {
        super()
        opts = Object.assign({}, defaultOptions, opts)
        /** @internal */
        this.noa = noa

        /** @internal */
        this.playerChunkLoaded = false

        /** @internal */
        this.Chunk = _chunk__WEBPACK_IMPORTED_MODULE_1__.default // expose this class for ...reasons

        /**
         * Game clients should set this if they need to manually control 
         * which chunks to load and unload. When set, client should call 
         * `noa.world.manuallyLoadChunk` / `manuallyUnloadChunk` as needed.
         */
        this.manuallyControlChunkLoading = !!opts.manuallyControlChunkLoading

        /**
         * Defining this function sets a custom order in which to create chunks.
         * The function should look like:
         * ```js
         *   (i, j, k) => 1 // return a smaller number for chunks to process first
         * ```
         */
        this.chunkSortingDistFn = defaultSortDistance

        /**
         * Set this higher to cause chunks not to mesh until they have some neighbors.
         * Max legal value is 26 (each chunk will mesh only when all neighbors are present)
         */
        this.minNeighborsToMesh = 6

        /** When true, worldgen queues will keep running if engine is paused. */
        this.worldGenWhilePaused = !!opts.worldGenWhilePaused

        /** Limit the size of internal chunk processing queues 
         * @type {number} 
        */
        this.maxChunksPendingCreation = 10

        /** Limit the size of internal chunk processing queues 
         * @type {number} 
        */
        this.maxChunksPendingMeshing = 10

        /** Cutoff (in ms) of time spent each **tick** 
         * @type {number}
        */
        this.maxProcessingPerTick = 9

        /** Cutoff (in ms) of time spent each **render** 
         * @type {number}
        */
        this.maxProcessingPerRender = 5


        // set up internal state


        /** @internal */
        this._chunkSize = opts.chunkSize
        /** @internal */
        this._chunkAddDistance = [1, 1]
        /** @internal */
        this._chunkRemoveDistance = [1, 1]
        /** @internal */
        this._addDistanceFn = null
        /** @internal */
        this._remDistanceFn = null
        /** @internal */
        this._prevWorldName = ''
        /** @internal */
        this._prevPlayerChunkHash = 0
        /** @internal */
        this._chunkAddSearchFrom = 0
        /** @internal */
        this._prevSortingFn = null

        /** @internal */
        this._chunksKnown = null
        /** @internal */
        this._chunksPending = null
        /** @internal */
        this._chunksToRequest = null
        /** @internal */
        this._chunksToRemove = null
        /** @internal */
        this._chunksToMesh = null
        /** @internal */
        this._chunksToMeshFirst = null
        /** @internal */
        this._chunksSortedLocs = null
        initChunkQueues(this)

        // validate add/remove sizes through a setter that clients can use later
        this.setAddRemoveDistance(opts.chunkAddDistance, opts.chunkRemoveDistance)

        // chunks stored in a data structure for quick lookup
        // note that the hash wraps around every 1024 chunk indexes!!
        // i.e. two chunks that far apart can't be loaded at the same time
        /** @internal */
        this._storage = new _util__WEBPACK_IMPORTED_MODULE_2__.ChunkStorage()

        // coordinate converter functions - default versions first:
        var cs = this._chunkSize
        /** @internal */
        this._coordsToChunkIndexes = chunkCoordsToIndexesGeneral
        /** @internal */
        this._coordsToChunkLocals = chunkCoordsToLocalsGeneral

        // when chunk size is a power of two, override with bit-twiddling:
        var powerOfTwo = ((cs & cs - 1) === 0)
        if (powerOfTwo) {
            /** @internal */
            this._coordShiftBits = Math.log2(cs) | 0
            /** @internal */
            this._coordMask = (cs - 1) | 0
            /** @internal */
            this._coordsToChunkIndexes = chunkCoordsToIndexesPowerOfTwo
            /** @internal */
            this._coordsToChunkLocals = chunkCoordsToLocalsPowerOfTwo
        }
    }
}





/*
 *
 *
 *
 *
 *                  PUBLIC API 
 *
 *
 *
 *
*/

/** @param x,y,z */
World.prototype.getBlockID = function (x, y, z) {
    var [ci, cj, ck] = this._coordsToChunkIndexes(x, y, z)
    var chunk = this._storage.getChunkByIndexes(ci, cj, ck)
    if (!chunk) return 0
    var [i, j, k] = this._coordsToChunkLocals(x, y, z)
    return chunk.voxels.get(i, j, k)
}

/** @param x,y,z */
World.prototype.getBlockSolidity = function (x, y, z) {
    var [ci, cj, ck] = this._coordsToChunkIndexes(x, y, z)
    var chunk = this._storage.getChunkByIndexes(ci, cj, ck)
    if (!chunk) return false
    var [i, j, k] = this._coordsToChunkLocals(x, y, z)
    return !!chunk.getSolidityAt(i, j, k)
}

/** @param x,y,z */
World.prototype.getBlockOpacity = function (x, y, z) {
    var id = this.getBlockID(x, y, z)
    return this.noa.registry.getBlockOpacity(id)
}

/** @param x,y,z */
World.prototype.getBlockFluidity = function (x, y, z) {
    var id = this.getBlockID(x, y, z)
    return this.noa.registry.getBlockFluidity(id)
}

/** @param x,y,z */
World.prototype.getBlockProperties = function (x, y, z) {
    var id = this.getBlockID(x, y, z)
    return this.noa.registry.getBlockProps(id)
}



/** @param val,x,y,z */
World.prototype.setBlockID = function (val, x, y, z) {
    var [ci, cj, ck] = this._coordsToChunkIndexes(x, y, z)
    var chunk = this._storage.getChunkByIndexes(ci, cj, ck)
    if (!chunk) return
    var [i, j, k] = this._coordsToChunkLocals(x, y, z)
    return chunk.set(i, j, k, val, x, y, z)
}


/** @param box */
World.prototype.isBoxUnobstructed = function (box) {
    var base = box.base
    var max = box.max
    for (var i = Math.floor(base[0]); i < max[0] + 1; i++) {
        for (var j = Math.floor(base[1]); j < max[1] + 1; j++) {
            for (var k = Math.floor(base[2]); k < max[2] + 1; k++) {
                if (this.getBlockSolidity(i, j, k)) return false
            }
        }
    }
    return true
}


/** client should call this after creating a chunk's worth of data (as an ndarray)  
 * If userData is passed in it will be attached to the chunk
 * @param id
 * @param array
 * @param userData
 */
World.prototype.setChunkData = function (id, array, userData) {
    setChunkData(this, id, array, userData)
}



/** 
 * Sets the distances within which to load new chunks, and beyond which 
 * to unload them. Generally you want the remove distance to be somewhat
 * farther, so that moving back and forth across the same chunk border doesn't
 * keep loading/unloading the same distant chunks.
 * 
 * Both arguments can be numbers (number of voxels), or arrays like:
 * `[horiz, vert]` specifying different horizontal and vertical distances.
 * @param {number | number[]} addDist
 * @param {number | number[]} remDist
 */
World.prototype.setAddRemoveDistance = function (addDist = 2, remDist = 3) {
    var addArr = Array.isArray(addDist) ? addDist : [addDist, addDist]
    var remArr = Array.isArray(remDist) ? remDist : [remDist, remDist]
    var minGap = 1
    if (remArr[0] < addArr[0] + minGap) remArr[0] = addArr[0] + minGap
    if (remArr[1] < addArr[1] + minGap) remArr[1] = addArr[1] + minGap
    this._chunkAddDistance = addArr
    this._chunkRemoveDistance = remArr
    // rebuild chunk distance functions and add search locations
    this._addDistanceFn = makeDistanceTestFunction(addArr[0], addArr[1])
    this._remDistanceFn = makeDistanceTestFunction(remArr[0], remArr[1])
    this._chunksSortedLocs.empty()
    // this queue holds only 1/16th the search space: i=0..max, j=0..i, k=0..max
    for (var i = 0; i <= addArr[0]; i++) {
        for (var k = 0; k <= i; k++) {
            for (var j = 0; j <= addArr[1]; j++) {
                if (!this._addDistanceFn(i, j, k)) continue
                this._chunksSortedLocs.add(i, j, k)
            }
        }
    }
    // resets state of nearby chunk search
    this._prevSortingFn = null
    this._chunkAddSearchFrom = 0
}






/** Tells noa to discard voxel data within a given `AABB` (e.g. because 
 * the game client received updated data from a server). 
 * The engine will mark all affected chunks for disposal, and will later emit 
 * new `worldDataNeeded` events (if the chunk is still in draw range).
 * Note that chunks invalidated this way will not emit a `chunkBeingRemoved` event 
 * for the client to save data from.
 */
World.prototype.invalidateVoxelsInAABB = function (box) {
    invalidateChunksInBox(this, box)
}


/** When manually controlling chunk loading, tells the engine that the 
 * chunk containing the specified (x,y,z) needs to be created and loaded.
 * > Note: has no effect when `noa.world.manuallyControlChunkLoading` is not set.
 * @param x, y, z
 */
World.prototype.manuallyLoadChunk = function (x, y, z) {
    if (!this.manuallyControlChunkLoading) throw manualErr
    var [i, j, k] = this._coordsToChunkIndexes(x, y, z)
    this._chunksKnown.add(i, j, k)
    this._chunksToRequest.add(i, j, k)
}

/** When manually controlling chunk loading, tells the engine that the 
 * chunk containing the specified (x,y,z) needs to be unloaded and disposed.
 * > Note: has no effect when `noa.world.manuallyControlChunkLoading` is not set.
 * @param x, y, z
 */
World.prototype.manuallyUnloadChunk = function (x, y, z) {
    if (!this.manuallyControlChunkLoading) throw manualErr
    var [i, j, k] = this._coordsToChunkIndexes(x, y, z)
    this._chunksToRemove.add(i, j, k)
    this._chunksToMesh.remove(i, j, k)
    this._chunksToRequest.remove(i, j, k)
    this._chunksToMeshFirst.remove(i, j, k)
}
var manualErr = 'Set `noa.world.manuallyControlChunkLoading` if you need this API'




/*
 * 
 * 
 * 
 *                  internals:
 * 
 *          tick functions that process queues and trigger events
 * 
 * 
 * 
*/

/** @internal */
World.prototype.tick = function () {
    var tickStartTime = performance.now()

    // get indexes of player's current chunk, and has it changed since last tick?
    var [ci, cj, ck] = getPlayerChunkIndexes(this)
    var chunkLocHash = (0,_util__WEBPACK_IMPORTED_MODULE_2__.locationHasher)(ci, cj, ck)
    var changedChunks = (chunkLocHash !== this._prevPlayerChunkHash)
    if (changedChunks) {
        this.emit('playerEnteredChunk', ci, cj, ck)
        this._prevPlayerChunkHash = chunkLocHash
        this._chunkAddSearchFrom = 0
    }

    // if world has changed, mark everything to be removed, and ping 
    // removals queue so that player's chunk gets loaded back quickly
    if (this._prevWorldName !== this.noa.worldName) {
        markAllChunksForRemoval(this)
        this._prevWorldName = this.noa.worldName
        this._chunkAddSearchFrom = 0
        processRemoveQueue(this)
    }

    profile_hook('start')
    profile_queues_hook('start')

    // scan for chunks to add/remove (unless client handles manually)
    if (!this.manuallyControlChunkLoading) {
        if (changedChunks) {
            findDistantChunksToRemove(this, ci, cj, ck)
            profile_hook('remQueue')
        }
        findNewChunksInRange(this, ci, cj, ck)
        profile_hook('addQueue')
    }

    // process (create or mesh) some chunks, up to max iteration time
    var ptime = Math.max(1, this.maxProcessingPerTick || 0)
    var done1 = false
    var done2 = false
    var done3 = false
    ;(0,_util__WEBPACK_IMPORTED_MODULE_2__.loopForTime)(ptime, () => {
        if (!done1) done1 = processRequestQueue(this); profile_hook('requests')
        if (!done2) done2 = processMeshingQueue(this, false); profile_hook('meshes')
        if (!done3) {
            done3 = processRemoveQueue(this)
                || processRemoveQueue(this)
                || processRemoveQueue(this)
            profile_hook('removes')
        }
        return (done1 && done2 && done3)
    }, tickStartTime)

    // if time is left over, look for low-priority extra meshing
    var dt = performance.now() - tickStartTime
    ptime -= dt
    if (ptime > 0.5) {
        lookForChunksToMesh(this)
        profile_hook('looking')
        ;(0,_util__WEBPACK_IMPORTED_MODULE_2__.loopForTime)(ptime, () => processMeshingQueue(this, false), tickStartTime)
        profile_hook('meshes')
    }

    // track whether the player's local chunk is loaded and ready or not
    var pChunk = this._storage.getChunkByIndexes(ci, cj, ck)
    this.playerChunkLoaded = !!pChunk

    profile_queues_hook('end', this)
    profile_hook('end')
}


/** @internal */
World.prototype.render = function () {
    // on render, quickly process the high-priority meshing queue
    // to help avoid flashes of background while neighboring chunks update
    var mpr = this.maxProcessingPerRender
    if (mpr > 0) (0,_util__WEBPACK_IMPORTED_MODULE_2__.loopForTime)(mpr, () => {
        return processMeshingQueue(this, true)
    })
}


/** @internal */
World.prototype._getChunkByCoords = function (x, y, z) {
    // let internal modules request a chunk object
    var [i, j, k] = this._coordsToChunkIndexes(x, y, z)
    return this._storage.getChunkByIndexes(i, j, k)
}










/*
 * 
 * 
 * 
 *              chunk queues and queue processing
 * 
 * 
 * 
*/


function initChunkQueues(world) {
    // queue meanings:
    //    Known:        all chunks existing in any queue
    //    ToRequest:    needed but not yet requested from client
    //    Pending:      requested, awaiting data event from client
    //    ToMesh:       has data, but not yet meshed (or re-meshed)
    //    ToMeshFirst:  priority version of the previous
    //    ToRemove:     chunks awaiting disposal
    //    SortedLocs:   locations in 1/16th quadrant of add area, sorted (reverse order of other queues!)
    world._chunksKnown = new _util__WEBPACK_IMPORTED_MODULE_2__.LocationQueue()
    world._chunksToMesh = new _util__WEBPACK_IMPORTED_MODULE_2__.LocationQueue()
    world._chunksPending = new _util__WEBPACK_IMPORTED_MODULE_2__.LocationQueue()
    world._chunksToRemove = new _util__WEBPACK_IMPORTED_MODULE_2__.LocationQueue()
    world._chunksToRequest = new _util__WEBPACK_IMPORTED_MODULE_2__.LocationQueue()
    world._chunksToMeshFirst = new _util__WEBPACK_IMPORTED_MODULE_2__.LocationQueue()
    world._chunksSortedLocs = new _util__WEBPACK_IMPORTED_MODULE_2__.LocationQueue()
}

// internal accessor for chunks to queue themeselves for remeshing 
// after their data changes
World.prototype._queueChunkForRemesh = function (chunk) {
    possiblyQueueChunkForMeshing(this, chunk)
}



// helper - chunk indexes of where the player is
function getPlayerChunkIndexes(world) {
    var [x, y, z] = world.noa.entities.getPosition(world.noa.playerEntity)
    return world._coordsToChunkIndexes(x, y, z)
}




// process neighborhood chunks, add missing ones to "toRequest" and "inMemory"
function findNewChunksInRange(world, ci, cj, ck) {
    var toRequest = world._chunksToRequest
    var startIx = world._chunkAddSearchFrom
    var locs = world._chunksSortedLocs
    if (startIx >= locs.arr.length) return

    // don't bother if in progress and request queue is backed up
    if (world._chunksToRequest.count() > 50) return

    // conform of chunk location sorting function
    if (world._prevSortingFn !== world.chunkSortingDistFn) {
        if (!world.chunkSortingDistFn) world.chunkSortingDistFn = defaultSortDistance
        sortQueueByDistanceFrom(locs, 0, 0, 0, world.chunkSortingDistFn, true)
        world._prevSortingFn = world.chunkSortingDistFn
    }

    // consume the pre-sorted positions array, checking each loc and its reflections
    // add new locations, and remember if any have been seen that are pending removal
    // store the recursion state in a little object to keep things clean (er?)
    checkingState.removals = 0
    checkingState.ci = ci
    checkingState.cj = cj
    checkingState.ck = ck
    var posArr = world._chunksSortedLocs.arr
    for (var i = startIx; i < posArr.length; i++) {
        var [di, dj, dk] = posArr[i]
        checkReflectedLocations(world, checkingState, di, dj, dk)
        // store progress and break early differently depending on if removals were seen
        if (checkingState.removals === 0) {
            world._chunkAddSearchFrom = i + 1
            if (toRequest.count() > 100) break
            if (i - startIx > 50) break
        } else {
            if (toRequest.count() > 50) break
            if (i - startIx > 5) break
        }
    }

    // queue should be mostly sorted, but may not have been empty
    sortQueueByDistanceFrom(toRequest, ci, cj, ck, world.chunkSortingDistFn)
}

// Helpers for checking whether to add a location, and reflections of it
var checkingState = {}
var checkReflectedLocations = (world, state, i, j, k) => {
    checkOneLocation(world, state, state.ci + i, state.cj + j, state.ck + k)
    if (i !== k) checkOneLocation(world, state, state.ci + k, state.cj + j, state.ck + i)
    if (i > 0) checkReflectedLocations(world, state, -i, j, k)
    if (j > 0) checkReflectedLocations(world, state, i, -j, k)
    if (k > 0) checkReflectedLocations(world, state, i, j, -k)
}
var checkOneLocation = (world, state, i, j, k) => {
    if (world._chunksKnown.includes(i, j, k)) {
        if (world._chunksToRemove.includes(i, j, k)) state.removals++
    } else {
        world._chunksKnown.add(i, j, k)
        world._chunksToRequest.addToFront(i, j, k)
    }
}







// rebuild queue of chunks to be removed from around (ci,cj,ck)
function findDistantChunksToRemove(world, ci, cj, ck) {
    var distFn = world._remDistanceFn
    var toRemove = world._chunksToRemove
    world._chunksKnown.forEach(([i, j, k]) => {
        if (toRemove.includes(i, j, k)) return
        if (distFn(i - ci, j - cj, k - ck)) return
        // flag chunk for removal and remove it from work queues
        world._chunksToRemove.add(i, j, k)
        world._chunksToMesh.remove(i, j, k)
        world._chunksToRequest.remove(i, j, k)
        world._chunksToMeshFirst.remove(i, j, k)
    })
    sortQueueByDistanceFrom(toRemove, ci, cj, ck, world.chunkSortingDistFn)
}


// invalidate chunks overlapping the given AABB
function invalidateChunksInBox(world, box) {
    var min = world._coordsToChunkIndexes(box.base[0], box.base[1], box.base[2])
    var max = world._coordsToChunkIndexes(box.max[0], box.max[1], box.max[2])
    for (var i = 0; i < 3; i++) {
        if (!Number.isFinite(box.base[i])) min[i] = box.base[i]
        if (!Number.isFinite(box.max[i])) max[i] = box.max[i]
    }
    world._chunksKnown.forEach(loc => {
        for (var i = 0; i < 3; i++) {
            if (loc[i] < min[i] || loc[i] >= max[i]) return
        }
        world._chunksToRemove.add(loc[0], loc[1], loc[2])
        world._chunksToMesh.remove(loc[0], loc[1], loc[2])
        world._chunksToRequest.remove(loc[0], loc[1], loc[2])
        world._chunksToMeshFirst.remove(loc[0], loc[1], loc[2])
    })
}



// when current world changes - empty work queues and mark all for removal
function markAllChunksForRemoval(world) {
    world._chunksToRemove.copyFrom(world._chunksKnown)
    world._chunksToRequest.empty()
    world._chunksToMesh.empty()
    world._chunksToMeshFirst.empty()
    var [i, j, k] = getPlayerChunkIndexes(world)
    sortQueueByDistanceFrom(world._chunksToRemove, i, j, k, world.chunkSortingDistFn)
}



// incrementally look for chunks that could be re-meshed
function lookForChunksToMesh(world) {
    var limit = 5
    var numQueued = world._chunksToMesh.count() + world._chunksToMeshFirst.count()
    if (numQueued > limit) return
    var knownLocs = world._chunksKnown.arr
    var ct = Math.min(50, knownLocs.length)
    for (var n = 0; n < ct; n++) {
        lookIndex = (lookIndex + 1) % knownLocs.length
        var [i, j, k] = knownLocs[lookIndex]
        var chunk = world._storage.getChunkByIndexes(i, j, k)
        if (!chunk) continue
        var res = possiblyQueueChunkForMeshing(world, chunk)
        if (res) numQueued++
        if (numQueued > limit) return
    }
}
var lookIndex = -1



// run through chunk tracking queues looking for work to do next
function processRequestQueue(world) {
    var toRequest = world._chunksToRequest
    if (toRequest.isEmpty()) return true
    // skip if too many outstanding requests, or if meshing queue is full
    var pending = world._chunksPending.count()
    var toMesh = world._chunksToMesh.count()
    if (pending >= world.maxChunksPendingCreation) return true
    if (toMesh >= world.maxChunksPendingMeshing) return true
    var [i, j, k] = toRequest.pop()
    requestNewChunk(world, i, j, k)
    return toRequest.isEmpty()
}


function processRemoveQueue(world) {
    var toRemove = world._chunksToRemove
    if (toRemove.isEmpty()) return true
    var [i, j, k] = toRemove.pop()
    removeChunk(world, i, j, k)
    return (toRemove.isEmpty())
}


// similar to above but for chunks waiting to be meshed
function processMeshingQueue(world, firstOnly) {
    var queue = world._chunksToMeshFirst
    if (queue.isEmpty() && !firstOnly) queue = world._chunksToMesh
    if (queue.isEmpty()) return true
    var [i, j, k] = queue.pop()
    if (world._chunksToRemove.includes(i, j, k)) return
    var chunk = world._storage.getChunkByIndexes(i, j, k)
    if (chunk) doChunkRemesh(world, chunk)
}


function possiblyQueueChunkForMeshing(world, chunk) {
    if (!(chunk._terrainDirty || chunk._objectsDirty)) return false
    if (chunk._neighborCount < chunk.minNeighborsToMesh) return false
    if (world._chunksToMesh.includes(chunk.i, chunk.j, chunk.k)) return false
    if (world._chunksToMeshFirst.includes(chunk.i, chunk.j, chunk.k)) return false
    var queue = (chunk._neighborCount === 26) ?
        world._chunksToMeshFirst : world._chunksToMesh
    queue.add(chunk.i, chunk.j, chunk.k)
    return true
}







/*
 * 
 * 
 * 
 *              chunk lifecycle - create / set / remove / modify
 * 
 * 
 * 
*/


// create chunk object and request voxel data from client
function requestNewChunk(world, i, j, k) {
    var size = world._chunkSize
    var dataArr = _chunk__WEBPACK_IMPORTED_MODULE_1__.default._createVoxelArray(world._chunkSize)
    var worldName = world.noa.worldName
    var requestID = [i, j, k, worldName].join('|')
    var x = i * size
    var y = j * size
    var z = k * size
    world._chunksPending.add(i, j, k)
    world.emit('worldDataNeeded', requestID, dataArr, x, y, z, worldName)
    profile_queues_hook('request')
}

// called when client sets a chunk's voxel data
// If userData is passed in it will be attached to the chunk
function setChunkData(world, reqID, array, userData) {
    var arr = reqID.split('|')
    var i = parseInt(arr.shift())
    var j = parseInt(arr.shift())
    var k = parseInt(arr.shift())
    var worldName = arr.join('|')
    world._chunksPending.remove(i, j, k)
    // discard data if it's for a world that's no longer current
    if (worldName !== world.noa.worldName) return
    // discard if chunk is no longer needed
    if (!world._chunksKnown.includes(i, j, k)) return
    if (world._chunksToRemove.includes(i, j, k)) return

    var chunk = world._storage.getChunkByIndexes(i, j, k)
    if (!chunk) {
        // if chunk doesn't exist, create and init
        var size = world._chunkSize
        chunk = new _chunk__WEBPACK_IMPORTED_MODULE_1__.default(world.noa, reqID, i, j, k, size, array)
        world._storage.storeChunkByIndexes(i, j, k, chunk)
        chunk.userData = userData
        world.noa.rendering.prepareChunkForRendering(chunk)
        world.emit('chunkAdded', chunk)
    } else {
        // else we're updating data for an existing chunk
        chunk._updateVoxelArray(array)
    }
    // chunk can now be meshed, and ping neighbors
    possiblyQueueChunkForMeshing(world, chunk)
    updateNeighborsOfChunk(world, i, j, k, chunk)

    profile_queues_hook('receive')
}



// remove a chunk that wound up in the remove queue
function removeChunk(world, i, j, k) {
    var chunk = world._storage.getChunkByIndexes(i, j, k)

    if (chunk) {
        world.emit('chunkBeingRemoved', chunk.requestID, chunk.voxels, chunk.userData)
        world.noa.rendering.disposeChunkForRendering(chunk)
        chunk.dispose()
        profile_queues_hook('dispose')
        updateNeighborsOfChunk(world, i, j, k, null)
    }

    world._storage.removeChunkByIndexes(i, j, k)
    world._chunksKnown.remove(i, j, k)
    world._chunksToMesh.remove(i, j, k)
    world._chunksToMeshFirst.remove(i, j, k)
}


function doChunkRemesh(world, chunk) {
    world._chunksToMesh.remove(chunk.i, chunk.j, chunk.k)
    world._chunksToMeshFirst.remove(chunk.i, chunk.j, chunk.k)
    chunk.updateMeshes()
    profile_queues_hook('mesh')
}










/*
 * 
 * 
 *          two different versions of logic to convert
 *          chunk coords to chunk indexes or local scope
 * 
 * 
*/

function chunkCoordsToIndexesGeneral(x, y, z) {
    var cs = this._chunkSize
    return [Math.floor(x / cs) | 0, Math.floor(y / cs) | 0, Math.floor(z / cs) | 0]
}
function chunkCoordsToLocalsGeneral(x, y, z) {
    var cs = this._chunkSize
    var i = (x % cs) | 0; if (i < 0) i += cs
    var j = (y % cs) | 0; if (j < 0) j += cs
    var k = (z % cs) | 0; if (k < 0) k += cs
    return [i, j, k]
}
function chunkCoordsToIndexesPowerOfTwo(x, y, z) {
    var shift = this._coordShiftBits
    return [(x >> shift) | 0, (y >> shift) | 0, (z >> shift) | 0]
}
function chunkCoordsToLocalsPowerOfTwo(x, y, z) {
    var mask = this._coordMask
    return [(x & mask) | 0, (y & mask) | 0, (z & mask) | 0]
}







/*
 * 
 * 
 * 
 *          misc helpers and implementation functions
 * 
 * 
 * 
*/


function sortQueueByDistanceFrom(queue, pi, pj, pk, distFn, reverse = false) {
    if (reverse) {
        queue.sortByDistance((i, j, k) => -distFn(pi - i, pj - j, pk - k))
    } else {
        queue.sortByDistance((i, j, k) => distFn(pi - i, pj - j, pk - k))
    }
}
var defaultSortDistance = (i, j, k) => (i * i) + (j * j) + (k * k)




// keep neighbor data updated when chunk is added or removed
function updateNeighborsOfChunk(world, ci, cj, ck, chunk) {
    var terrainChanged = (!chunk) || (chunk && !chunk.isEmpty)
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            for (var k = -1; k <= 1; k++) {
                if ((i | j | k) === 0) continue
                var neighbor = world._storage.getChunkByIndexes(ci + i, cj + j, ck + k)
                if (!neighbor) continue
                // flag neighbor, assume terrain needs remeshing
                if (terrainChanged) neighbor._terrainDirty = true
                // update neighbor counts and references, both ways
                if (chunk && !chunk._neighbors.get(i, j, k)) {
                    chunk._neighborCount++
                    chunk._neighbors.set(i, j, k, neighbor)
                }
                var nabRef = neighbor._neighbors.get(-i, -j, -k)
                if (chunk && !nabRef) {
                    neighbor._neighborCount++
                    neighbor._neighbors.set(-i, -j, -k, chunk)
                    // immediately queue neighbor if it's surrounded
                    if (neighbor._neighborCount === 26) {
                        possiblyQueueChunkForMeshing(world, neighbor)
                    }
                }
                if (!chunk && nabRef) {
                    neighbor._neighborCount--
                    neighbor._neighbors.set(-i, -j, -k, null)
                }
            }
        }
    }
}


// make a function to check if an (i,j,k) is within a sphere/ellipse of given size
function makeDistanceTestFunction(xsize, ysize) {
    var asq = xsize * xsize
    var bsq = ysize * ysize
    // spherical case
    if (xsize === ysize) return (i, j, k) => (i * i + j * j + k * k <= asq)
    // otherwise do clipped spheres for now
    if (xsize > ysize) return (i, j, k) => {
        if (Math.abs(j) > ysize) return false
        return (i * i + j * j + k * k <= asq)
    }
    return (i, j, k) => {
        var dxsq = i * i + k * k
        if (dxsq > asq) return false
        return (dxsq + j * j <= bsq)
    }
}










/*
 * 
 * 
 * 
 * 
 *                  debugging
 * 
 * 
 * 
 * 
*/

/** @internal */
World.prototype.report = function () {
    console.log('World report - playerChunkLoaded: ', this.playerChunkLoaded)
    _report(this, '  known:     ', this._chunksKnown.arr, true)
    _report(this, '  to request:', this._chunksToRequest.arr, 0)
    _report(this, '  to remove: ', this._chunksToRemove.arr, 0)
    _report(this, '  creating:  ', this._chunksPending.arr, 0)
    _report(this, '  to mesh:   ', this._chunksToMesh.arr.concat(this._chunksToMeshFirst.arr), 0)
}

function _report(world, name, arr, ext) {
    var full = 0,
        empty = 0,
        exist = 0,
        surrounded = 0,
        remeshes = []
    arr.forEach(loc => {
        var chunk = world._storage.getChunkByIndexes(loc[0], loc[1], loc[2])
        if (!chunk) return
        exist++
        remeshes.push(chunk._timesMeshed)
        if (chunk._isFull) full++
        if (chunk._isEmpty) empty++
        if (chunk._neighborCount === 26) surrounded++
    })
    var out = arr.length.toString().padEnd(8)
    out += ('exist: ' + exist).padEnd(12)
    out += ('full: ' + full).padEnd(12)
    out += ('empty: ' + empty).padEnd(12)
    out += ('surr: ' + surrounded).padEnd(12)
    if (ext) {
        var sum = remeshes.reduce((acc, val) => acc + val, 0)
        var max = remeshes.reduce((acc, val) => Math.max(acc, val), 0)
        var min = remeshes.reduce((acc, val) => Math.min(acc, val), 0)
        out += 'times meshed: avg ' + (sum / exist).toFixed(2)
        out += '  max ' + max
        out += '  min ' + min
    }
    console.log(name, out)
}



var profile_hook = (0,_util__WEBPACK_IMPORTED_MODULE_2__.makeProfileHook)(PROFILE_EVERY, 'world ticks:', 1)
var profile_queues_hook = ((every) => {
    if (!(every > 0)) return () => { }
    var iter = 0
    var counts = {}
    var queues = {}
    var started = performance.now()
    return function profile_queues_hook(state, world) {
        if (state === 'start') return
        if (state !== 'end') return counts[state] = (counts[state] || 0) + 1
        queues.toreq = (queues.toreq || 0) + world._chunksToRequest.count()
        queues.toget = (queues.toget || 0) + world._chunksPending.count()
        queues.tomesh = (queues.tomesh || 0) + world._chunksToMesh.count() + world._chunksToMeshFirst.count()
        queues.tomesh1 = (queues.tomesh1 || 0) + world._chunksToMeshFirst.count()
        queues.torem = (queues.torem || 0) + world._chunksToRemove.count()
        if (++iter < every) return
        var t = performance.now(), dt = t - started
        var res = {}
        Object.keys(queues).forEach(k => {
            var num = Math.round((queues[k] || 0) / iter)
            res[k] = `[${num}]`.padStart(5)
        })
        Object.keys(counts).forEach(k => {
            var num = Math.round((counts[k] || 0) * 1000 / dt)
            res[k] = ('' + num).padStart(3)
        })
        console.log('chunk flow: ',
            `${res.toreq}-> ${res.request || 0} req/s  `,
            `${res.toget}-> ${res.receive || 0} got/s  `,
            `${(res.tomesh)}-> ${res.mesh || 0} mesh/s  `,
            `${res.torem}-> ${res.dispose || 0} rem/s  `,
            `(meshFirst: ${res.tomesh1.trim()})`,
        )
        iter = 0
        counts = {}
        queues = {}
        started = performance.now()
    }
})(PROFILE_QUEUES_EVERY)

/***/ }),

/***/ "./node_modules/bit-twiddle/twiddle.js":
/*!*********************************************!*\
  !*** ./node_modules/bit-twiddle/twiddle.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

 "use restrict";

//Number of bits in an integer
var INT_BITS = 32;

//Constants
exports.INT_BITS  = INT_BITS;
exports.INT_MAX   =  0x7fffffff;
exports.INT_MIN   = -1<<(INT_BITS-1);

//Returns -1, 0, +1 depending on sign of x
exports.sign = function(v) {
  return (v > 0) - (v < 0);
}

//Computes absolute value of integer
exports.abs = function(v) {
  var mask = v >> (INT_BITS-1);
  return (v ^ mask) - mask;
}

//Computes minimum of integers x and y
exports.min = function(x, y) {
  return y ^ ((x ^ y) & -(x < y));
}

//Computes maximum of integers x and y
exports.max = function(x, y) {
  return x ^ ((x ^ y) & -(x < y));
}

//Checks if a number is a power of two
exports.isPow2 = function(v) {
  return !(v & (v-1)) && (!!v);
}

//Computes log base 2 of v
exports.log2 = function(v) {
  var r, shift;
  r =     (v > 0xFFFF) << 4; v >>>= r;
  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
  return r | (v >> 1);
}

//Computes log base 10 of v
exports.log10 = function(v) {
  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
}

//Counts number of bits
exports.popCount = function(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}

//Counts number of trailing zeros
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000FFFF) c -= 16;
  if (v & 0x00FF00FF) c -= 8;
  if (v & 0x0F0F0F0F) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
exports.countTrailingZeros = countTrailingZeros;

//Rounds to next power of 2
exports.nextPow2 = function(v) {
  v += v === 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}

//Rounds down to previous power of 2
exports.prevPow2 = function(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v>>>1);
}

//Computes parity of word
exports.parity = function(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return (0x6996 >>> v) & 1;
}

var REVERSE_TABLE = new Array(256);

(function(tab) {
  for(var i=0; i<256; ++i) {
    var v = i, r = i, s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = (r << s) & 0xff;
  }
})(REVERSE_TABLE);

//Reverse bits in a 32 bit word
exports.reverse = function(v) {
  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
           REVERSE_TABLE[(v >>> 24) & 0xff];
}

//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
exports.interleave2 = function(x, y) {
  x &= 0xFFFF;
  x = (x | (x << 8)) & 0x00FF00FF;
  x = (x | (x << 4)) & 0x0F0F0F0F;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;

  y &= 0xFFFF;
  y = (y | (y << 8)) & 0x00FF00FF;
  y = (y | (y << 4)) & 0x0F0F0F0F;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;

  return x | (y << 1);
}

//Extracts the nth interleaved component
exports.deinterleave2 = function(v, n) {
  v = (v >>> n) & 0x55555555;
  v = (v | (v >>> 1))  & 0x33333333;
  v = (v | (v >>> 2))  & 0x0F0F0F0F;
  v = (v | (v >>> 4))  & 0x00FF00FF;
  v = (v | (v >>> 16)) & 0x000FFFF;
  return (v << 16) >> 16;
}


//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
exports.interleave3 = function(x, y, z) {
  x &= 0x3FF;
  x  = (x | (x<<16)) & 4278190335;
  x  = (x | (x<<8))  & 251719695;
  x  = (x | (x<<4))  & 3272356035;
  x  = (x | (x<<2))  & 1227133513;

  y &= 0x3FF;
  y  = (y | (y<<16)) & 4278190335;
  y  = (y | (y<<8))  & 251719695;
  y  = (y | (y<<4))  & 3272356035;
  y  = (y | (y<<2))  & 1227133513;
  x |= (y << 1);
  
  z &= 0x3FF;
  z  = (z | (z<<16)) & 4278190335;
  z  = (z | (z<<8))  & 251719695;
  z  = (z | (z<<4))  & 3272356035;
  z  = (z | (z<<2))  & 1227133513;
  
  return x | (z << 2);
}

//Extracts nth interleaved component of a 3-tuple
exports.deinterleave3 = function(v, n) {
  v = (v >>> n)       & 1227133513;
  v = (v | (v>>>2))   & 3272356035;
  v = (v | (v>>>4))   & 251719695;
  v = (v | (v>>>8))   & 4278190335;
  v = (v | (v>>>16))  & 0x3FF;
  return (v<<22)>>22;
}

//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
exports.nextCombination = function(v) {
  var t = v | (v - 1);
  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
}



/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__extends": () => (/* binding */ __extends),
/* harmony export */   "__assign": () => (/* binding */ __assign),
/* harmony export */   "__rest": () => (/* binding */ __rest),
/* harmony export */   "__decorate": () => (/* binding */ __decorate),
/* harmony export */   "__param": () => (/* binding */ __param),
/* harmony export */   "__metadata": () => (/* binding */ __metadata),
/* harmony export */   "__awaiter": () => (/* binding */ __awaiter),
/* harmony export */   "__generator": () => (/* binding */ __generator),
/* harmony export */   "__createBinding": () => (/* binding */ __createBinding),
/* harmony export */   "__exportStar": () => (/* binding */ __exportStar),
/* harmony export */   "__values": () => (/* binding */ __values),
/* harmony export */   "__read": () => (/* binding */ __read),
/* harmony export */   "__spread": () => (/* binding */ __spread),
/* harmony export */   "__spreadArrays": () => (/* binding */ __spreadArrays),
/* harmony export */   "__spreadArray": () => (/* binding */ __spreadArray),
/* harmony export */   "__await": () => (/* binding */ __await),
/* harmony export */   "__asyncGenerator": () => (/* binding */ __asyncGenerator),
/* harmony export */   "__asyncDelegator": () => (/* binding */ __asyncDelegator),
/* harmony export */   "__asyncValues": () => (/* binding */ __asyncValues),
/* harmony export */   "__makeTemplateObject": () => (/* binding */ __makeTemplateObject),
/* harmony export */   "__importStar": () => (/* binding */ __importStar),
/* harmony export */   "__importDefault": () => (/* binding */ __importDefault),
/* harmony export */   "__classPrivateFieldGet": () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   "__classPrivateFieldSet": () => (/* binding */ __classPrivateFieldSet)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}


/***/ }),

/***/ "./node_modules/voxel-crunch/index.js":
/*!********************************************!*\
  !*** ./node_modules/voxel-crunch/index.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var bits = __webpack_require__(/*! bit-twiddle */ "./node_modules/bit-twiddle/twiddle.js")

function size(chunk) {
  var count = 0
  var chunk_len = chunk.length
  var i = 0, v, l
  while(i<chunk.length) {
    v = chunk[i]
    l = 0
    while(i < chunk_len && chunk[i] === v) {
      ++i
      ++l
    }
    count += (bits.log2(l) / 7)|0
    count += (bits.log2(v>>>0) / 7)|0
    count += 2
  }
  return count
}
exports.size = size

function encode(chunk, runs) {
  if(!runs) {
    runs = new Uint8Array(size(chunk))
  }
  var rptr = 0, nruns = runs.length
  var i = 0, v, l
  while(i<chunk.length) {
    v = chunk[i]
    l = 0
    while(i < chunk.length && chunk[i] === v) {
      ++i
      ++l
    }
    while(rptr < nruns && l >= 128) {
      runs[rptr++] = 128 + (l&0x7f)
      l >>>= 7
    }
    if(rptr >= nruns) {
      throw new Error("RLE buffer overflow")
    }
    runs[rptr++] = l
    v >>>= 0
    while(rptr < nruns && v >= 128) {
      runs[rptr++] = 128 + (v&0x7f)
      v >>>= 7
    }
    if(rptr >= nruns) {
      throw new Error("RLE buffer overflow")
    }
    runs[rptr++] = v
  }
  return runs
}
exports.encode = encode

function decode(runs, chunk) {
  var buf_len = chunk.length
  var nruns = runs.length
  var cptr = 0
  var ptr = 0
  var l, s, v, i
  while(ptr < nruns) {
    l = 0
    s = 0
    while(ptr < nruns && runs[ptr] >= 128) {
      l += (runs[ptr++]&0x7f) << s
      s += 7
    }
    l += runs[ptr++] << s
    if(ptr >= nruns) {
      throw new Error("RLE buffer underrun")
    }
    if(cptr + l > buf_len) {
      throw new Error("Chunk buffer overflow")
    }
    v = 0
    s = 0
    while(ptr < nruns && runs[ptr] >= 128) {
      v += (runs[ptr++]&0x7f) << s
      s += 7
    }
    if(ptr >= nruns) {
      throw new Error("RLE buffer underrun")
    }
    v += runs[ptr++] << s
    for(i=0; i<l; ++i) {
      chunk[cptr++] = v
    }
  }
  return chunk
}
exports.decode = decode


/***/ }),

/***/ "./src/actions.js":
/*!************************!*\
  !*** ./src/actions.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setupInteractions": () => (/* binding */ setupInteractions)
/* harmony export */ });



/*
 * 
 *      interactivity
 * 
*/


function setupInteractions(noa) {

    // on left mouse, set targeted block to be air
    noa.inputs.down.on('fire', function () {
        if (noa.targetedBlock) {
            var pos = noa.targetedBlock.position
            noa.setBlock(0, pos[0], pos[1], pos[2])
        }
    })


    // place block on alt-fire (RMB/E)
    var pickedID = 1
    noa.inputs.down.on('alt-fire', function () {
        if (noa.targetedBlock) {
            var pos = noa.targetedBlock.adjacent
            noa.addBlock(pickedID, pos[0], pos[1], pos[2])
        }
    })


    // pick block on middle fire (MMB/Q)
    noa.inputs.down.on('mid-fire', function () {
        if (noa.targetedBlock) pickedID = noa.targetedBlock.blockID
    })


    // pause (P)
    noa.inputs.bind('pause', 'P')
    noa.inputs.down.on('pause', function () {
        paused = !paused
        noa.setPaused(paused)
    })
    var paused = false



    // each tick, consume any scroll events and use them to zoom camera
    noa.on('tick', function (dt) {
        var scroll = noa.inputs.state.scrolly
        if (scroll !== 0) {
            noa.camera.zoomDistance += (scroll > 0) ? 1 : -1
            if (noa.camera.zoomDistance < 0) noa.camera.zoomDistance = 0
            if (noa.camera.zoomDistance > 10) noa.camera.zoomDistance = 10
        }
    })



}



/***/ }),

/***/ "./src/entities.js":
/*!*************************!*\
  !*** ./src/entities.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setupPlayerEntity": () => (/* binding */ setupPlayerEntity),
/* harmony export */   "shootBouncyBall": () => (/* binding */ shootBouncyBall)
/* harmony export */ });
/* harmony import */ var _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babylonjs/core/Meshes/mesh */ "./node_modules/@babylonjs/core/Meshes/mesh.js");
/* harmony import */ var _babylonjs_core_Meshes_Builders_boxBuilder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/boxBuilder */ "./node_modules/@babylonjs/core/Meshes/Builders/boxBuilder.js");
/* harmony import */ var _babylonjs_core_Meshes_Builders_sphereBuilder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/sphereBuilder */ "./node_modules/@babylonjs/core/Meshes/Builders/sphereBuilder.js");
//@ts-check






/*
 * 
 *      helpers for setting up entities
 * 
*/


function setupPlayerEntity(noa) {
    // get the player entity's ID and other info (aabb, size)
    var eid = noa.playerEntity
    var dat = noa.entities.getPositionData(eid)
    var w = dat.width
    var h = dat.height

    // make a Babylon.js mesh and scale it, etc.
    var playerMesh = _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.CreateBox('player', 1, noa.rendering.getScene())
    playerMesh.scaling.x = playerMesh.scaling.z = w
    playerMesh.scaling.y = h

    // offset of mesh relative to the entity's "position" (center of its feet)
    var offset = [0, h / 2, 0]

    // a "mesh" component to the player entity
    noa.entities.addComponent(eid, noa.entities.names.mesh, {
        mesh: playerMesh,
        offset: offset
    })
}



function shootBouncyBall(noa) {
    var ents = noa.entities
    var radius = 0.2

    if (!ballMesh) {
        ballMesh = _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.CreateSphere('ball', 6, 2 * radius, noa.rendering.getScene())
    }

    // syntatic sugar for creating a default entity
    var playPos = ents.getPosition(noa.playerEntity)
    var pos = [playPos[0], playPos[1] + 0.5, playPos[2]]
    var width = 2 * radius
    var height = 2 * radius

    var mesh = ballMesh.createInstance('ball_instance')
    var meshOffset = [0, radius, 0]
    var doPhysics = true
    var shadow = true

    var id = noa.entities.add(
        pos, width, height, // required
        mesh, meshOffset, doPhysics, shadow // optional
    )

    // adjust physics body
    var body = ents.getPhysicsBody(id)
    body.restitution = 0.8
    body.friction = 0.7
    var dir = noa.camera.getDirection()
    var imp = []
    for (var i = 0; i < 3; i++) imp[i] = 5 * dir[i]
    imp[1] += 1
    body.applyImpulse(imp)

    // add an entity collision handler, doing fake pseudo physics
    // (physics engine only does entity-terrain collisions, not entity-entity)
    if (!collideHandler) collideHandler = (id, other) => {
        var p1 = ents.getPosition(id)
        var p2 = ents.getPosition(other)
        var imp = []
        for (var i = 0; i < 3; i++) imp[i] = 2 * (p1[i] - p2[i])
        var b = ents.getPhysicsBody(id)
        b.applyImpulse(imp)
    }
    ents.addComponent(id, ents.names.collideEntities, {
        cylinder: true,
        callback: (other) => collideHandler(id, other)
    })


    // add a custom component to remove entities if they get too far away
    if (!removeComp) removeComp = ents.createComponent({
        name: 'remove',
        system: (dt, states) => {
            var p1 = ents.getPosition(noa.playerEntity)
            states.forEach(state => {
                var p2 = ents.getPosition(state.__id)
                var dist = 0
                for (var i = 0; i < 3; i++) dist += Math.abs(p1[i] - p2[i])
                if (dist > 500) ents.deleteEntity(state.__id)
            })
        }
    })
    ents.addComponent(id, removeComp)

}

var ballMesh
var collideHandler
var removeComp



/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babylonjs_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babylonjs/core */ "./node_modules/@babylonjs/core/index.js");
/* harmony import */ var _babylonjs_materials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babylonjs/materials */ "./node_modules/@babylonjs/materials/index.js");
/* harmony import */ var _game_noa__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../game/noa */ "../../game/noa/src/index.js");
/* harmony import */ var _registration__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./registration */ "./src/registration.js");
/* harmony import */ var _worldgen__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./worldgen */ "./src/worldgen.js");
/* harmony import */ var _entities__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./entities */ "./src/entities.js");
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./actions */ "./src/actions.js");
//@ts-check












var noa = new _game_noa__WEBPACK_IMPORTED_MODULE_2__.Engine({
    debug: true,
    showFPS: true,
    inverseY: true,
    inverseX: false,
    chunkSize: 32,
    chunkAddDistance: [7, 7],     // [horiz, vert]
    chunkRemoveDistance: [8, 8],     // [horiz, vert]
    blockTestDistance: 50,
    texturePath: 'textures/',
    playerStart: [0.5, 5, 0.5],
    playerHeight: 1.4,
    playerWidth: 0.6,
    playerAutoStep: true,
    useAO: true,
    AOmultipliers: [0.92, 0.8, 0.5],
    reverseAOmultiplier: 1.0,
    manuallyControlChunkLoading: false,
    originRebaseDistance: 25,
})

var blockIDs = (0,_registration__WEBPACK_IMPORTED_MODULE_3__.initRegistration)(noa)
;(0,_worldgen__WEBPACK_IMPORTED_MODULE_4__.initWorldGen)(noa, blockIDs)
;(0,_entities__WEBPACK_IMPORTED_MODULE_5__.setupPlayerEntity)(noa)
;(0,_actions__WEBPACK_IMPORTED_MODULE_6__.setupInteractions)(noa)



/***/ }),

/***/ "./src/registration.js":
/*!*****************************!*\
  !*** ./src/registration.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initRegistration": () => (/* binding */ initRegistration)
/* harmony export */ });
/* harmony import */ var _babylonjs_core_Materials_Textures_texture__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babylonjs/core/Materials/Textures/texture */ "./node_modules/@babylonjs/core/Materials/Textures/texture.js");
/* harmony import */ var _babylonjs_core_Maths_math__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babylonjs/core/Maths/math */ "./node_modules/@babylonjs/core/Maths/math.js");
/* harmony import */ var _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babylonjs/core/Meshes/mesh */ "./node_modules/@babylonjs/core/Meshes/mesh.js");
/* harmony import */ var _babylonjs_core_Meshes_Builders_boxBuilder__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/boxBuilder */ "./node_modules/@babylonjs/core/Meshes/Builders/boxBuilder.js");
/* harmony import */ var _babylonjs_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babylonjs/core */ "./node_modules/@babylonjs/core/index.js");
//@ts-check









/*
 * 
 *		Register a bunch of blocks and materials and whatnot
 * 
*/

function initRegistration(noa) {

    // block materials
    var brownish = [0.45, 0.36, 0.22]
    var greenish = [0.1, 0.8, 0.2]
    var greenish2 = [0.1, 0.6, 0.2]
    noa.registry.registerMaterial('grass', greenish, null)
    noa.registry.registerMaterial('grass2', greenish2, null)
    noa.registry.registerMaterial('dirt', brownish, null, false)
    var strs = ['a', 'b', 'c', 'd', '1', '2']
    for (var i = 0; i < 6; i++) {
        var s = strs[i]
        noa.registry.registerMaterial(s, null, s + '.png')
        noa.registry.registerMaterial('t' + s, null, 't' + s + '.png', true)
    }
    noa.registry.registerMaterial('water', [0.5, 0.5, 0.8, 0.7], null)
    noa.registry.registerMaterial('water2', [0.5, 0.5, 0.8, 0.7], null)



    // do some Babylon.js stuff with the scene, materials, etc.
    var scene = noa.rendering.getScene()

    // register a block material with a transparent texture
    // noa.registry.registerMaterial('window', brownish, 'window.png', true)

    var tmat = noa.rendering.makeStandardMaterial('')
    tmat.diffuseTexture = new _babylonjs_core_Materials_Textures_texture__WEBPACK_IMPORTED_MODULE_0__.Texture('textures/window.png', scene)
    tmat.opacityTexture = tmat.diffuseTexture
    noa.registry.registerMaterial('window', null, null, false, tmat)

    // // register a shinyDirt block with a custom render material
    // var shinyMat = noa.rendering.makeStandardMaterial('shinyDirtMat')
    // shinyMat.specularColor.copyFromFloats(1, 1, 1)
    // shinyMat.specularPower = 32
    // shinyMat.bumpTexture = new Texture('textures/stone.png', scene)
    // noa.registry.registerMaterial('shinyDirt', brownish, null, false, shinyMat)


    // object block mesh
    var mesh = _babylonjs_core__WEBPACK_IMPORTED_MODULE_4__.MeshBuilder.CreateBox('post', { size: 1 }, scene)
    var mat = _babylonjs_core_Maths_math__WEBPACK_IMPORTED_MODULE_1__.Matrix.Scaling(0.2, 1, 0.2)
    mat.setTranslation(new _babylonjs_core_Maths_math__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0.5, 0))
    mesh.bakeTransformIntoVertices(mat)
    scene.removeMesh(mesh)


    // block types registration
    var blockIDs = {}
    var _id = 1

    blockIDs.dirtID = noa.registry.registerBlock(_id++, { material: 'dirt' })
    blockIDs.shinyDirtID = noa.registry.registerBlock(_id++, { material: 'shinyDirt' })
    blockIDs.grassID = noa.registry.registerBlock(_id++, { material: 'grass' })
    blockIDs.grass2ID = noa.registry.registerBlock(_id++, { material: 'grass2' })
    blockIDs.testID1 = noa.registry.registerBlock(_id++, { material: ['b', 'd', '1', '2', 'c', 'a'] })
    blockIDs.windowID = noa.registry.registerBlock(_id++, {
        material: 'window',
        opaque: false,
    })
    blockIDs.testID2 = noa.registry.registerBlock(_id++, {
        material: ['tb', 'td', 't1', 't2', 'tc', 'ta'],
        opaque: false,
    })
    blockIDs.testID3 = noa.registry.registerBlock(_id++, { material: ['1', '2', 'a'] })
    blockIDs.waterID = noa.registry.registerBlock(_id++, {
        material: 'water',
        fluid: true
    })
    blockIDs.water2ID = noa.registry.registerBlock(_id++, {
        material: 'water2',
        fluid: true
    })
    blockIDs.customID = noa.registry.registerBlock(_id++, {
        blockMesh: mesh,
        opaque: false,
        onCustomMeshCreate: function (mesh, x, y, z) {
            mesh.rotation.y = ((x + 0.234) * 1.234 + (z + 0.567) * 6.78) % (2 * Math.PI)
        },
    })

    blockIDs.waterPole = noa.registry.registerBlock(_id++, {
        blockMesh: mesh,
        solid: true,
        opaque: false,
        material: 'water',
        fluid: true,
    })



    var make = (s) => {
        var testMat = noa.rendering.makeStandardMaterial('')
        testMat.backFaceCulling = false
        testMat.diffuseTexture = new _babylonjs_core_Materials_Textures_texture__WEBPACK_IMPORTED_MODULE_0__.Texture('textures/' + s + '.png', scene)
        testMat.diffuseTexture.hasAlpha = true

        var testMesh = _babylonjs_core__WEBPACK_IMPORTED_MODULE_4__.MeshBuilder.CreatePlane('cross:' + s, { size: 1 }, scene)
        testMesh.material = testMat
        testMesh.rotation.x += Math.PI
        testMesh.rotation.y += Math.PI / 4
        let offset = _babylonjs_core_Maths_math__WEBPACK_IMPORTED_MODULE_1__.Matrix.Translation(0, -0.5, 0)
        testMesh.bakeTransformIntoVertices(offset)
        let clone = testMesh.clone()
        clone.rotation.y += Math.PI / 2
        var result = _babylonjs_core_Meshes_mesh__WEBPACK_IMPORTED_MODULE_2__.Mesh.MergeMeshes([testMesh, clone], true)
        return result
    }

    blockIDs.testa = noa.registry.registerBlock(_id++, {
        blockMesh: make('ta'),
        opaque: false,
    })

    blockIDs.testb = noa.registry.registerBlock(_id++, {
        blockMesh: make('tb'),
        opaque: false,
    })

    blockIDs.testc = noa.registry.registerBlock(_id++, {
        blockMesh: make('tc'),
        opaque: false,
    })




    return blockIDs
}




/***/ }),

/***/ "./src/worldgen.js":
/*!*************************!*\
  !*** ./src/worldgen.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initWorldGen": () => (/* binding */ initWorldGen)
/* harmony export */ });


/*
 * 
 * 
 *		testbed world generation
 * 
 * 
*/

// this module implements two "worlds" of voxel data
var WORLD1 = 'world1'
var WORLD2 = 'world2'

// storage for data from voxels that were unloaded
var cruncher = __webpack_require__(/*! voxel-crunch */ "./node_modules/voxel-crunch/index.js")
var storage = {}
var chunkIsStored = (id) => { return !!storage[id] }
var storeChunk = (id, arr) => { storage[id] = cruncher.encode(arr.data) }
var retrieveChunk = (id, arr) => { cruncher.decode(storage[id], arr.data) }





function initWorldGen(noa, blockIDs) {

    // init world name and add binding to swap it    
    noa.worldName = WORLD1


    // catch engine's chunk removal event, and store the data
    noa.world.on('chunkBeingRemoved', function (id, array, userData) {
        storeChunk(id, array)
    })


    // catch worldgen requests, and queue them to handle asynchronously
    var requestQueue = []
    noa.world.on('worldDataNeeded', function (id, array, x, y, z, worldName) {
        requestQueue.push({ id, array, x, y, z, worldName })
    })



    // process the worldgen request queue:
    setInterval(function () {
        if (requestQueue.length === 0) return
        var req = requestQueue.shift()
        if (chunkIsStored(req.id)) {
            retrieveChunk(req.id, req.array)
        } else {
            generateChunk(req.array, req.x, req.y, req.z, req.worldName)
        }
        // pass the finished data back to the game engine
        noa.world.setChunkData(req.id, req.array)
    }, 10)




    // two versions of world data
    // `data` is an ndarray - see https://github.com/scijs/ndarray
    function generateChunk(array, x, y, z, worldName) {
        if (worldName === WORLD1) generateChunk1(array, x, y, z)
        if (worldName === WORLD2) generateChunk2(array, x, y, z)
    }

    function generateChunk1(array, x, y, z) {
        for (var i = 0; i < array.shape[0]; ++i) {
            for (var k = 0; k < array.shape[2]; ++k) {
                var height = getHeightMap(x + i, z + k, 10, 30)
                for (var j = 0; j < array.shape[1]; ++j) {
                    var b = decideBlock(x + i, y + j, z + k, height)
                    if (b) array.set(i, j, k, b)
                }
            }
        }
        if (y > -5) {
            for (var n = 10; n < 20; n++) {
                array.set(n, 20, n, blockIDs.waterPole)
                array.set(n + 1, 21, n + 1, blockIDs.waterPole)
                array.set(n, 22, 30 - n, blockIDs.windowID)
            }
        }
    }

    function generateChunk2(array, x, y, z) {
        for (var i = 0; i < array.shape[0]; ++i) {
            for (var k = 0; k < array.shape[2]; ++k) {
                var height = getHeightMap(x + i, z + k, 20, 40)
                for (var j = 0; j < array.shape[1]; ++j) {
                    var b = decideBlock(x + i, y + j, z + k, height)
                    if (b === blockIDs.grassID) b = blockIDs.grass2ID
                    if (b) array.set(i, j, k, b)
                }
            }
        }
    }





    // helpers

    // worldgen - return a heightmap for a given [x,z]
    function getHeightMap(x, z, xsize, zsize) {
        var xs = 0.8 + 2 * Math.sin(x / xsize)
        var zs = 0.4 + 2 * Math.sin(z / zsize + x / 30)
        return xs + zs
    }

    function decideBlock(x, y, z, height) {
        // general stuff
        if (y < height) {
            return (y < 0) ? blockIDs.dirtID : blockIDs.grassID
        } else {
            if (y >= 1) return 0
            // alternate by depth between two different water IDs
            return (y % 2) ? blockIDs.waterID : blockIDs.water2ID
        }
    }


}



/***/ }),

/***/ "../../game/noa/package.json":
/*!***********************************!*\
  !*** ../../game/noa/package.json ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"noa-engine","version":"0.31.0","description":"Experimental voxel game engine","main":"src/index.js","typings":"dist/src/index.d.ts","files":["/src","/dist"],"scripts":{"build":"npm run types; npm run docs","types":"tsc","docs":"typedoc --tsconfig tsdoc-config.json"},"author":"Andy Hall (https://fenomas.com)","license":"MIT","repository":{"type":"git","url":"https://github.com/fenomas/noa.git"},"bugs":{"url":"https://github.com/fenomas/noa/issues"},"dependencies":{"aabb-3d":"fenomas/aabb-3d","box-intersect":"fenomas/box-intersect","ent-comp":"^0.10.1","events":"^3.3.0","fast-voxel-raycast":"^0.1.1","game-inputs":"^0.4.0","gl-vec3":"^1.1.3","micro-game-shell":"^0.3.0","ndarray":"^1.0.19","voxel-aabb-sweep":"^0.5.0","voxel-physics-engine":"^0.11.1"},"peerDependencies":{"@babylonjs/core":"5.0.0-alpha.48"},"devDependencies":{"eslint":"^7.26.0","js-beautify":"^1.13.13","typedoc":"^0.22.5","typescript":"^4.4.3"},"keywords":["voxel","voxels","game","engine","game-engine"]}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkbabylon_gpu_issue"] = self["webpackChunkbabylon_gpu_issue"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["babylon-game_noa_node_modules_babylonjs_core_Cameras_freeCamera_js-game_noa_node_modules_baby-9206c2"], () => (__webpack_require__("./src/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=bundle.js.map