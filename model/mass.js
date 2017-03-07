'use strict'

// MASS represents a free or fixed mass in the MODEL.  It wraps all of the
// mass's physical properties and state, such as mass, position, velocity, etc.
var MASS = MASS || {};

// Creates a new mass, given a VECTOR (s) containing its position (in meters).
// The optional parameter (isFreeMass) can be unspecified or true to create a
// free mass, or false to create a fixed mass that cannot move.
MASS.create = (function(s, isFreeMass)
{
// private
    // true if this is a free mass, false if it is a fixed mass
    var _free = (isFreeMass == undefined)? true : isFreeMass;
    // position VECTOR (in meters)
    var _s = s;
    // velocity VECTOR (in m/s)
    var _v = VECTOR.create(0, 0);
    // acceleration VECTOR (in m/s^2)
    var _a = VECTOR.create(0, 0);
    // force VECTOR (in Newtons)
    var _f = VECTOR.create(0, 0);
    // mass in kg (arbitrarily set to 1 kg)
    var _m = 1;
// public
    // accessors
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

// Find whether a given item exposes all the same public members as a mass.
// If it looks like a mass, and quacks like a mass, then it is a mass.
// See:  https://en.wikipedia.org/wiki/Duck_typing
MASS.isMass = function(candidate)
{
    // If any of these members are undefined, then it isn't a mass.  The
    // "!!" is an ugly hack that coerces the return value to true or false.
    return (candidate !== undefined) && (candidate !== null) &&
           !!(candidate.s && candidate.v && candidate.a && candidate.v &&
           candidate.f && candidate.m && candidate.isFreeMass);
}
