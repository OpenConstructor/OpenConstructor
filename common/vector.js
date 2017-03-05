'use strict'

var VECTOR = VECTOR || {};

VECTOR.create = (function(x, y)
{
// private
    var _x = x;
    var _y = y;
// public
    function __x(scalar)
    {
        if (scalar !== undefined)
        {
            _x = scalar;
        }
        return _x;
    }
    function __y(scalar)
    {
        if (scalar !== undefined)
        {
            _y = scalar;
        }
        return _y;
    }
    function _get()
    {
        return [_x, _y];
    }
    function _set(x, y)
    {
        _x = x;
        _y = y;
    }
    function _add(other)
    {
        var [x, y] = other.get();
        _x += x;
        _y += y;
    }
    function _sub(other)
    {
        var [x, y] = other.get();
        _x -= x;
        _y -= y;
    }
    function _mul(scalar)
    {
        _x *= scalar;
        _y *= scalar;
    }
    function _div(scalar)
    {
        _x /= scalar;
        _y /= scalar;
    }
    function _toJSON()
    {
        return {"x": _x, "y": _y};
    }
    return {
        x: __x,
        y: __y,
        get: _get,
        set: _set,
        add: _add,
        sub: _sub,
        mul: _mul,
        div: _div,
        toJSON: _toJSON
    };
});    

VECTOR.add = function(v1, v2)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return new VECTOR.create(x1+x2, y1+y2);
}
VECTOR.sub = function(v1, v2)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return new VECTOR.create(x1-x2, y1-y2);
}
VECTOR.mul = function(v, s)
{
    var [x, y] = v.get();
    return new VECTOR.create(x*s, y*s);
}
VECTOR.div = function(v, s)
{
    var [x, y] = v.get();
    return new VECTOR.create(x/s, y/s);
}
VECTOR.magSq = function(v)
{
    var [x, y] = v.get();
    return x*x + y*y;
}
VECTOR.mag = function(v)
{
    return Math.sqrt(VECTOR.magSq(v));
}
VECTOR.dot = function(v1, v2)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return x1*x2 + y1*y2;
}
VECTOR.hat = function(v)
{
    var mag = VECTOR.mag(v);
    if (mag !== 0)
    {
        return VECTOR.div(v, mag);
    }
    return VECTOR.create(0, 0);
}
VECTOR.project = function(v1, v2)
{
    var v2hat = VECTOR.hat(v2);
    // from https://en.wikipedia.org/wiki/Dot_product#Scalar_projection_and_first_properties
    return VECTOR.mul(v2hat, VECTOR.dot(v1, v2hat));
}
VECTOR.equal = function(v1, v2)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return (x1 == x2) && (y1 == y2);
}
VECTOR.compare = function(v1, v2, tolerance)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return Math.abs(x2 - x1) <= tolerance &&
           Math.abs(y2 - y1) <= tolerance;
}
