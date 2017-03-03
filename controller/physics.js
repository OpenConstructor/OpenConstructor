'use strict'

var PHYSICS = PHYSICS || {};

PHYSICS.instance = (function()
{
// private
    function _checkNan(v)
    {
        if (v.x() != v.x() || 
            v.y() != v.y())
        {
            v.set(0, 0);
        }
    }
    function _clearForces()
    {
        MODEL.instance.masses.forEach(function(mass) {
            mass.f.set(0, 0);
        });
    }
    function _gForce()
    {
        MODEL.instance.masses.forEach(function(mass) {
            // "g"ravity
            mass.f.y(mass.f.y() + MODEL.instance.g());
        });
    }
    function _fForce()
    {
        MODEL.instance.masses.forEach(function(mass) {
            // "f"riction (damping) opposes velocity
            mass.f.add(VECTOR.mul(mass.v, -1 * MODEL.instance.f()));
        });
    }
    function _kForce()
    {
        MODEL.instance.springs.forEach(function(spr) {
            // hoo"k"e's law (springiness)
            let ds = VECTOR.sub(spr.m2.s, spr.m1.s);
            let length = VECTOR.mag(ds); // distance between m1 and m2
            let dh = VECTOR.hat(ds);     // direction from m1 to m2
            // hooke's law:  F=kX
            // here, positive magnitude = inward (attraction to other mass)
            let fMag = MODEL.instance.k() * (length - spr.restlength());
            spr.m1.f.add(VECTOR.mul(dh, fMag));
            spr.m2.f.add(VECTOR.mul(dh, -fMag));

        });
    }
    function _integrate(dt)
    {
        var state = { dt: dt }
        MODEL.instance.masses.forEach(function(mass) {
            // F=ma -> a=F/m
            // Euler's method
            mass.s.add(VECTOR.mul(mass.v, this.dt));
            mass.v.add(VECTOR.mul(mass.a, this.dt));
            mass.a = VECTOR.div(mass.f, mass.m());
        }, state);
    }
    function _collide()
    {
        // hacky for now
        // TODO: replace with barsprings or walls around the model area in the model itself
        // and make this function just iterate through them and apply the correction
        MODEL.instance.masses.forEach(function(mass) {
            if(mass.s.y() < 0 || mass.s.y() > MODEL.instance.height())
            {
                mass.s.y((mass.s.y() < 0)? 0 : MODEL.instance.height());
                // hack: not really friction
                mass.v.x(mass.v.x() * (1 - MODEL.instance.surfaceFriction()));
                mass.v.y(mass.v.y() * MODEL.instance.surfaceReflection());
            }
            if(mass.s.x() < 0 || mass.s.x() > MODEL.instance.width())
            {
                mass.s.x(mass.s.x() < 0? 0 : MODEL.instance.width());
                // hack: not really friction
                mass.v.y(mass.v.y() * (1 - MODEL.instance.surfaceFriction()));
                mass.v.x(mass.v.x() * MODEL.instance.surfaceReflection());
                if(MODEL.instance.waveMode() === MODEL.WaveModes.AUTOREVERSE)
                {
                    MODEL.instance.waveDirection((mass.s.x()===0)? 1 : -1);
                }
            }
        });
    }
    function _subtick(dt)
    {
        // calculate forces
        _clearForces();
        _gForce();
        _fForce();
        _kForce();
        // apply forces
        _integrate(dt);
        // collide
        _collide();
    }
// public
    function _tick(dt)
    {
        // physics engine is run with significant oversampling and
        // frameskip in order to make springs look sufficiently "rigid".
        var kFrameskip = 10;
        var kOversampling = 10;
        for (var i = 0; i < kFrameskip; i++)
        {
            for (var j = 0; j < kOversampling; j++)
            {
                _subtick(dt/kOversampling);
            }
        }
    }
    return {
        tick: _tick
    };
})();
// singleton

