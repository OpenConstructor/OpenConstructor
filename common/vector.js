'use strict'

var VECTOR = VECTOR || {};

VECTOR.vec2d = (function(x, y)
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
        let [x, y] = other.get();
        _x += x;
        _y += y;
    }
    function _sub(other)
    {
        let [x, y] = other.get();
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

    return {
        x: __x,
        y: __y,
        get: _get,
        set: _set,
        add: _add,
        sub: _sub,
        mul: _mul,
        div: _div
    };
});    

VECTOR.add = function(v1, v2)
{
    let [x1, y1] = v1.get();
    let [x2, y2] = v2.get();
    return new VECTOR.vec2d(x1+x2, y1+y2);
}
VECTOR.sub = function(v1, v2)
{
    let [x1, y1] = v1.get();
    let [x2, y2] = v2.get();
    return new VECTOR.vec2d(x1-x2, y1-y2);
}
VECTOR.mul = function(v, s)
{
    let [x, y] = v.get();
    return new VECTOR.vec2d(x*s, y*s);
}
VECTOR.div = function(v, s)
{
    let [x, y] = v.get();
    return new VECTOR.vec2d(x/s, y/s);
}
VECTOR.magSq = function(v)
{
    let [x, y] = v.get();
    return x*x + y*y;
}
VECTOR.mag = function(v)
{
    return Math.sqrt(VECTOR.magSq(v));
}
VECTOR.dot = function(v1, v2)
{
    let [x1, y1] = v1.get();
    let [x2, y2] = v2.get();
    return x1*x2 + y1*y2;
}
VECTOR.unit = function(v)
{
    return VECTOR.div(v, VECTOR.mag(v));
}
VECTOR.project = function(v1, v2)
{
    let v2hat = VECTOR.unit(v2);
    // from https://en.wikipedia.org/wiki/Dot_product#Scalar_projection_and_first_properties
    return VECTOR.mul(v2hat, VECTOR.dot(v1, v2hat));
}
VECTOR.equal = function(v1, v2)
{
    let [x1, y1] = v1.get();
    let [x2, y2] = v2.get();
    return (x1 == x2) && (y1 == y2);
}
VECTOR.compare = function(v1, v2, tolerance)
{
    let [x1, y1] = v1.get();
    let [x2, y2] = v2.get();
    return Math.abs(x2 - x1) <= tolerance &&
           Math.abs(y2 - y1) <= tolerance;
}
