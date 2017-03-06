'use strict'

// VECTOR wraps the (x, y) coordinates of a two-dimensional vector and defines
// common vector math functions.
var VECTOR = VECTOR || {};

// Creates a new vector, given its initial (x, y) coordinates.
// Returns the newly-created vector.
VECTOR.create = (function(x, y)
/** @lends VECTOR# */
{
// private
    var _x = x;
    var _y = y;
// public
    // Accessor for my x-coordinate.
    // Takes the new x-coordinate (or undefined to leave unchanged).
    // Returns the x-coordinate.
    function __x(scalar)
    {
        if (scalar !== undefined)
        {
            _x = scalar;
        }
        return _x;
    }
    // Accessor for my y-coordinate.
    function __y(scalar)
    {
        if (scalar !== undefined)
        {
            _y = scalar;
        }
        return _y;
    }
    // Getter for my x- and y-coordinate pair.
    // Returns the coordinates, as an array [x, y].
    function _get()
    {
        return [_x, _y];
    }
    // Setter for my x- and y-coordinate pair.
    // Takes the new x- and y- coordinates as scalars.
    function _set(x, y)
    {
        _x = x;
        _y = y;
    }
    // Add another VECTOR to myself.
    function _add(other)
    {
        var [x, y] = other.get();
        _x += x;
        _y += y;
    }
    // Subtract another VECTOR from myself.
    function _sub(other)
    {
        var [x, y] = other.get();
        _x -= x;
        _y -= y;
    }
    // Multiply myself by a scalar.  Both coordinates are multiplied by the
    // scalar.
    function _mul(scalar)
    {
        _x *= scalar;
        _y *= scalar;
    }
    // Divide myself by a scalar.  Both coordinates are divided by the
    // scalar.  Be careful when dividing by zero.
    function _div(scalar)
    {
        _x /= scalar;
        _y /= scalar;
    }
    // Emit a simple object containing my x- and y-coordinates.  Used by
    // JSON.stringify() during model export.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
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

// Find the vector sum of two vectors.
// Return a newly-created vector containing the result.
VECTOR.add = function(v1, v2)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return new VECTOR.create(x1+x2, y1+y2);
}
// Find the vector sum of two vectors.
// Return a newly-created vector containing the result.
VECTOR.sub = function(v1, v2)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return new VECTOR.create(x1-x2, y1-y2);
}
// Find the product of a vector and a scalar.  Both vector coordinates are
// multiplied by the scalar.
// Return a newly-created vector containing the result.
VECTOR.mul = function(v, s)
{
    var [x, y] = v.get();
    return new VECTOR.create(x*s, y*s);
}
// Find the quotient of a vector and a scalar.  Both vector coordinates are
// divided by the scalar.  Be careful when dividing by zero.
// Return a newly-created vector containing the result.
VECTOR.div = function(v, s)
{
    var [x, y] = v.get();
    return new VECTOR.create(x/s, y/s);
}
// Find the square of a vector's magnitude:  that is, x^2 + y^2.
VECTOR.magSq = function(v)
{
    var [x, y] = v.get();
    return x*x + y*y;
}
// Find a vector's magnitude:  that is, sqrt(x^2 + y^2).  This is also known as
// the length of the vector, or the distance between x and y.
VECTOR.mag = function(v)
{
    return Math.sqrt(VECTOR.magSq(v));
}
// Find the dot product of two vectors.
VECTOR.dot = function(v1, v2)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return x1*x2 + y1*y2;
}
// Find the unit-vector pointing in the same direction as a vector.
// Returns a newly-created vector containing the result.
VECTOR.hat = function(v)
{
    var mag = VECTOR.mag(v);
    if (mag !== 0)
    {
        return VECTOR.div(v, mag);
    }
    return VECTOR.create(0, 0);
}
// Finds the projection of v1 pointing in the direction of v2.
// See https://en.wikipedia.org/wiki/Dot_product#Scalar_projection_and_first_properties
// Returns a newly-created vector containing the result.
VECTOR.project = function(v1, v2)
{
    var v2hat = VECTOR.hat(v2);
    return VECTOR.mul(v2hat, VECTOR.dot(v1, v2hat));
}
// Checks whether the components of the first vector equal the components of the
// second vector.  Returns true if they are equal, otherwise false.
VECTOR.equal = function(v1, v2)
{
    var [x1, y1] = v1.get();
    var [x2, y2] = v2.get();
    return (x1 == x2) && (y1 == y2);
}
