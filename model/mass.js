'use strict'

var MASS = MASS || {};

MASS.create = (function(s, isFreeMass)
{
// private
    var _free = (isFreeMass == undefined)? true : isFreeMass;
    var _s = s;
    var _v = VECTOR.create(0, 0);
    var _a = VECTOR.create(0, 0);
    var _f = VECTOR.create(0, 0);
    var _m = 1;
// public
    function __m()
    {
        return _m;
    }
    function _isFreeMass(isFreeMass)
    {
        if (isFreeMass !== undefined)
        {
            _free = isFreeMass;
        }
        return _free;
    }
    return {
        s: _s,
        v: _v,
        a: _a,
        f: _f,
        m: __m,
        isFreeMass: _isFreeMass
    }
});


