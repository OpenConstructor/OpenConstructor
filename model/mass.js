'use strict'

var MASS = MASS || {};

MASS.mass = (function(s, isFreeMass)
{
// private
    var _s = s;
    var _m = 1;
    var _free = (isFreeMass == undefined)? true : isFreeMass;
    var _v = VECTOR.vec2d(0, 0);
// public
    function __m()
    {
        return _m;
    }
    function _isFreeMass()
    {
        return _free;
    }
    return {
        s: _s,
        v: _v,
        m: __m,
        isFreeMass: _isFreeMass
    }
});


