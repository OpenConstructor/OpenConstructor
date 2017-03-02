'use strict'

var PHYSICS = PHYSICS || {};

PHYSICS.physics = (function()
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
        MODEL.model.masses.forEach(function(mass) {
            mass.f.set(0, 0);
        });
    }
    function _gForce()
    {
        MODEL.model.masses.forEach(function(mass) {
            // "g"ravity
            mass.f.y(mass.f.y() + MODEL.model.g());
        });
    }
    function _fForce()
    {
        MODEL.model.masses.forEach(function(mass) {
            // "f"riction (damping) opposes velocity
            mass.f.add(VECTOR.mul(mass.v, -1 * MODEL.model.f()));
        });
    }
    function _kForce()
    {
        MODEL.model.springs.forEach(function(spr) {
            let ds = VECTOR.sub(spr.m2.s, spr.m1.s);
            let length = VECTOR.mag(ds); // distance between m1 and m2
            let dh = VECTOR.hat(ds);     // direction from m1 to m2
            // "k" is hooke's law:  F=kX
            // here, positive magnitude = inward (attraction to other mass)
            let fMag = MODEL.model.k() * (length - spr.restlength());

            spr.m1.f.add(VECTOR.mul(dh, fMag));
            spr.m2.f.add(VECTOR.mul(dh, -fMag));

        });
    }
    function _integrate(dt)
    {
        var state = { dt: dt }
        MODEL.model.masses.forEach(function(mass) {
            // F=ma -> a=F/m
            // Euler's method
            mass.s.add(VECTOR.mul(mass.v, this.dt));
            mass.v.add(VECTOR.mul(mass.a, this.dt));
            mass.a = VECTOR.div(mass.f, mass.m());
        }, state);
    }
    function _collide()
    {
        // hacky, floor only for now
        // TODO: replace with barsprings or walls around the model area in the model itself
        // and make this function just iterate through them and apply the correction
        MODEL.model.masses.forEach(function(mass) {
            if(mass.s.y() < 0)
            {
                mass.s.y(0);
                mass.v.x(mass.v.x() * (1 - MODEL.model.surfaceFriction()));  // hack: not really friction
                mass.v.y(mass.v.y() * MODEL.model.surfaceReflection());
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
