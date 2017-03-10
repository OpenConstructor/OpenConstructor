'use strict'

// PHYSICS defines a singleton containing the physics engine.  The engine is called
// once per frame (via its tick() function) and updates the positions of all masses
// and springs in the MODEL.
var PHYSICS = PHYSICS || {};

// Creates the physics engine.
PHYSICS.instance = (function()
{
// private
    // Checks whether a vector has a NaN component.  It is futile to
    // directly compare (value === NaN) because all comparisons with NaN return
    // false.  Hence we compare the value against itself, which will only
    // return false if it is NaN.  This function is not used normally but is
    // provided for ease of debugging in case you start getting NaNs
    // everywhere.
    function _checkNan(v)
    {
        if (v.x() != v.x() || 
            v.y() != v.y())
        {
            v.set(0, 0);
        }
    }
    // For each mass in the model, zero the mass's force accumulator.
    function _clearForces()
    {
        MODEL.instance.masses.forEach(function(mass) {
            mass.f.set(0, 0);
        });
    }
    // For each mass in the model, apply gravity.
    function _gForce()
    {
        MODEL.instance.masses.forEach(function(mass) {
            // "g"ravity
            var gravity = undefined;
            switch (MODEL.instance.gravityDirection())
            {
            case MODEL.GravityDirections.DOWN:
                gravity = MODEL.instance.g();
                break;
            case MODEL.GravityDirections.UP:
                gravity = -1 * MODEL.instance.g();
                break;
            case MODEL.GravityDirections.OFF:
                gravity = 0;
                break;
            }
            mass.f.y(mass.f.y() + gravity);
        });
    }
    // For each mass in the model, apply friction.
    function _fForce()
    {
        MODEL.instance.masses.forEach(function(mass) {
            // "f"riction (damping) opposes velocity
            mass.f.add(VECTOR.mul(mass.v, -1 * MODEL.instance.f()));
        });
    }
    // For each spring in the model, apply springwise force to both masses in
    // the spring.
    function _kForce()
    {
        MODEL.instance.springs.forEach(function(spr) {
            // hoo"k"e's law (springiness)
            var ds = VECTOR.sub(spr.m2.s, spr.m1.s);
            var length = VECTOR.mag(ds); // distance between m1 and m2
            var dh = VECTOR.hat(ds);     // direction from m1 to m2
            // hooke's law:  F=kX
            // here, positive magnitude = inward (attraction to other mass)
            var fMag = MODEL.instance.k() * (length - spr.restlength());
            spr.m1.f.add(VECTOR.mul(dh, fMag));
            spr.m2.f.add(VECTOR.mul(dh, -fMag));

        });
    }
    // For each barspring, see if there are masses lying within 0.01 units of it,
    // and if it is simulate the normal force if the system has a net force
    // squeezing the two together.
    function _collisionForce() {
        MODEL.instance.masses.forEach(function(mass) {
            MODEL.instance.springs.forEach(function(spr) {
                if (spr.isBar())
                {
                    var m1 = spr.m1;
                    var m2 = spr.m2;

                    if (mass === m1 || mass === m2)
                    {
                        return;
                    }
                    var tangent = VECTOR.sub(m2.s, m1.s);
                    var par = VECTOR.hat(tangent);
                    var perp = VECTOR.create(-par.y(), par.x());

                    var relPos = VECTOR.sub(mass.s, m1.s);
                    var s = VECTOR.dot(relPos, par)/VECTOR.mag(tangent);
                    if ((Math.abs(VECTOR.dot(relPos, perp)) < 0.010) && s >= 0 && s <= 1)
                    {
                        // if the mass is in contact with the spring, see if
                        // the two are accelerating towards each other
                        // if they are, add a normal force to both bodies that exactly
                        // cancels the relative acceleration, ie.
                        // find F_normal such that a_rel' = 0 and apply it to both bodies
                        // TODO: add in friction

                        var massPerp = VECTOR.dot(VECTOR.mul(mass.f, 1.0/mass.m()), perp);
                        var springPerp = VECTOR.dot(VECTOR.add(VECTOR.mul(m1.f, (1.0-s)/m1.m()), VECTOR.mul(spr.m2.f, s/m2.m())), perp);

                        var inDir = -Math.sign(VECTOR.dot(relPos, perp));
                        var relAccel = massPerp - springPerp;
                        console.log([VECTOR.dot(relPos, perp), relAccel]);
                        if (Math.sign(relAccel) == inDir)
                        {
                            // they're headed towards each other; apply the normal force
                            // that's related to the "effective mass" of the spring;
                            // the mass of the spring if it were acting like a single
                            // mass in this contact calculation, derived by
                            // seeing how a force applied at the point of contact
                            // causes that point to accelerate
                            // then the normal force is simply the force such that
                            // the relative acceleration of the two objects is zero
                            var mEff = 1.0/((1.0-s)*(1.0-s)/m1.m() - s*s/m2.m());
                            var fNormPerp = -relAccel*mass.m()*mEff/((mass.m() + mEff));
                            console.log("n ", fNormPerp);

                            var fNorm = VECTOR.mul(perp, fNormPerp);
                            // TODO: add forces at the end so that all collisions are treated equally
                            mass.f.add(fNorm);
                            m1.f.add(VECTOR.mul(fNorm, -(1.0-s)));
                            m2.f.add(VECTOR.mul(fNorm, -s));
                        }
                    }
                }
            });
        });
    }
    // Given the force on each mass, calculate each mass's new acceleration,
    // velocity and position.
    function _integrate(dt)
    {
        var state = { dt: dt }
        MODEL.instance.masses.forEach(function(mass) {
            // F=ma -> a=F/m
            // Euler's method
            if (mass.isFreeMass())
            {
                // The order is important.  We must update each accumulator
                // using the value calculated last frame (not this frame).
                // Therefore we must add s += v before calculating the new v,
                // etc.
                mass.s.add(VECTOR.mul(mass.v, this.dt));
                mass.v.add(VECTOR.mul(mass.a, this.dt));
                mass.a = VECTOR.div(mass.f, mass.m());
            }
        }, state);
    }
    // For each mass, check whether the mass has collided with the model
    // boundary, and update its position and velocity to make it bounce off.
    // If colliding with the left and right walls, perform auto-reverse.
    function _collide()
    {
        MODEL.instance.masses.forEach(function(mass) {
            // floor and ceiling
            if(mass.s.y() < 0 || mass.s.y() > MODEL.instance.height())
            {
                mass.s.y((mass.s.y() < 0)? 0 : MODEL.instance.height());
                // hack: "friction" directly affects velocity which is not
                // how static friction works in the real world.
                mass.v.x(mass.v.x() * (1 - MODEL.instance.surfaceFriction()));
                mass.v.y(mass.v.y() * MODEL.instance.surfaceReflection());
            }
            // left and right wall
            if(mass.s.x() < 0 || mass.s.x() > MODEL.instance.width())
            {
                mass.s.x(mass.s.x() < 0? 0 : MODEL.instance.width());
                // hack: "friction" directly affects velocity which is not
                // how static friction works in the real world.
                mass.v.y(mass.v.y() * (1 - MODEL.instance.surfaceFriction()));
                mass.v.x(mass.v.x() * MODEL.instance.surfaceReflection());
                // If auto-reverse mode is on, hitting a wall should make the
                // model reverse direction, but only if it isn't the same wall
                // the model last hit.  Without this "debouncing", models will
                // constantly switch direction as long as they are touching a
                // wall.
                if (MODEL.instance.waveMode() === MODEL.WaveModes.AUTOREVERSE)
                {
                    if (mass.s.x() <= 0)
                    {
                        // hit left wall
                        if (MODEL.instance.lastWall() !== MODEL.Walls.LEFT)
                        {
                            MODEL.instance.lastWall(MODEL.Walls.LEFT);
                            MODEL.instance.waveDirection(MODEL.instance.waveDirection()*-1);
                        }
                    }
                    else
                    {
                        // hit right wall
                        if (MODEL.instance.lastWall() !== MODEL.Walls.RIGHT)
                        {
                            MODEL.instance.lastWall(MODEL.Walls.RIGHT);
                            MODEL.instance.waveDirection(MODEL.instance.waveDirection()*-1);
                        }
                    }
                }
            }
        });
    }

    // Check all the barsprings for collisions in the previous frame.
    function _collideBars(dt)
    {
        // Algorithm is O(ns), could be sped up to O((n + s) log n) fairly
        // trivially, but that appears to be counter to the goal of this project I think?

        // NOTE: There is a ton of repeated work because I wasn't sure
        // how best to cache mass positions. If there is a guarantee that
        // no masses can be spawned within a subtick, adding a stage pre-integration
        // to collect mass positions referenceable by index would be enough.
        // NOTE: limit one collision per mass per subtick.
        // Eh, this works for now I guess
        var impulses = [];
        // Right now we generate the bounding boxes of the movement of each
        // mass. This will be compared with the bounding boxes of the barsprings
        // to quickly eliminate the majority of cases where there isn't any
        // overlap between the two.
        var getMassBox = function(mass) {
            // NOTE: DO NOT MUTATE endPos
            var endPos = mass.s;
            var startPos = VECTOR.add(endPos, VECTOR.mul(mass.v, -dt));
            var minX = Math.min(endPos.x(), startPos.x());
            var maxX = Math.max(endPos.x(), startPos.x());
            var minY = Math.min(endPos.y(), startPos.y());
            var maxY = Math.max(endPos.y(), startPos.y());
            return {
                mass: mass,
                box: {
                    left: minX,
                    right: maxX,
                    top: maxY,
                    bottom: minY
                }
            };
        }

        var intersects = function(a, b) {
            if (a.right < b.left || a.left > b.right ||
                    a.top < b.bottom || a.bottom > b.top)
            {
                return false;
            }
              else
            {
                return true;
            }
        };
        var massBoxes = MODEL.instance.masses.map(getMassBox);

        MODEL.instance.springs.forEach(function(spring) {
            if (!spring.isBar())
            {
                return;
            }

            var m1Box = getMassBox(spring.m1).box;
            var m2Box = getMassBox(spring.m2).box;

            var minX = Math.min(m1Box.left, m2Box.left);
            var maxX = Math.max(m1Box.right, m2Box.right);
            var minY = Math.min(m1Box.bottom, m2Box.bottom);
            var maxY = Math.max(m1Box.top, m2Box.top);

            var springBox = {
                left: minX,
                right: maxX,
                bottom: minY,
                top: maxY
            };

            massBoxes.forEach(function(massBox) {
                // skip the mass if it's part of the spring; the spring
                // can't collide with itself
                if (massBox.mass === spring.m1 || massBox.mass === spring.m2)
                {
                    return;
                }
                if (intersects(massBox.box, springBox))
                {
                    var mass = massBox.mass;
                    var m1 = spring.m1;
                    var m2 = spring.m2;

                    // calculate the point of collision using the
                    // set of equations
                    // s_mass(t) = x*s_m1(t) + (1-x)*s_m2(t),
                    // which is nontrivially solvable, because it ends up
                    // being a system of parabolas, so let's use the somewhat
                    // simpler (and linearly solvable) case where we project
                    // s_mass(t) onto the normal of the spring, in the frame of
                    // one of the endpoints (modelling when the mass is collinear
                    // with the spring):
                    // (s_mass(t)-m1(t)).orth(m1(t)-m2(t)) = 0
                    // (mass.s - m1.s + (mass.v - m1.v)*t).orth(m2.s - m1.s + (m2.v - m1.v)*t) = 0
                    // let A = mass.s - m1.s, B = mass.v - m1.v, C = m2.s - m1.s, and D = m2.v - m1.v:
                    // (A + B*t).orth(C + D*t) = 0
                    // (Ax + Bx*t, Ay + By*t).(-Cy - Dy*t, Cx + Dx*t) = 0
                    //
                    // which turns into at^2 + bt + c = 0 for some a, b, c
                    //
                    // which you can then solve for t
                    // and see if either root of t (if -dt <= t <= 0) corresponds 
                    // to a moment when
                    // 0 <= s <= 1 (when the mass is between m1 and m2)
                    // if it does, we've found our moment of collision!
                    var A = VECTOR.sub(mass.s, m1.s);
                    var B = VECTOR.sub(mass.v, m1.v);
                    var C = VECTOR.sub(m2.s, m1.s);
                    var D = VECTOR.sub(m2.v, m1.v);

                    var a = -B.x()*D.y() + B.y()*D.x();
                    var b = -A.x()*D.y() - B.x()*C.y() + B.y()*C.x() + A.y()*D.x();
                    var c = -A.x()*C.y() + A.y()*C.x();
                    
                    var ts = [];

                    // if a is not zero
                    if (Math.abs(a) > 0.000001)
                    {

                        // no real solution
                        if (b*b - 4.0*a*c < 0)
                        {
                            return;
                        }
                        ts = [(-b+Math.sqrt(b*b - 4.0*a*c))/(2*a),
                                  (-b-Math.sqrt(b*b - 4.0*a*c))/(2*a)];
                    }
                    else
                    {
                        // solve linear system if it's solvable
                        if (Math.abs(b) > 0.0000001)
                        {
                            ts = [-c/b];
                        }
                        else
                        {
                            return;
                        }
                    }

                    var results = ts.map(function(t) {
                        // (s_mass(t)-m1(t)).norm(m2(t)-m1(t)) = -s*L
                        // where L = |m2(t) - m1(t)|
                        
                        if (t < -dt || t > 0) {
                            return null;
                        }
                        var L = VECTOR.mag(VECTOR.add(C, VECTOR.mul(D,t)));
                        var s = VECTOR.dot(VECTOR.add(A, VECTOR.mul(B, t)),
                                          VECTOR.hat(VECTOR.add(C, VECTOR.mul(D, t))))/L;
                        if (s < 0 || s > 1) {
                            return null;
                        }
                        return { t: t, s: s };
                    })
                    .filter(function(x) { return x !== null; });

                    if (results.length === 0) {
                        return;
                    }

                    // find the point of collision that happened first
                    var firstResult = null;
                    results.forEach(function(result) {
                        if (firstResult === null || firstResult.t > result.t)
                        {
                            firstResult = result;
                        }
                    });

                    var t = firstResult.t;
                    var s = firstResult.s;
                    console.log(t, s);
                    
                    // we can solve for the collision response by assuming
                    //   - conservation of momentum,
                    //   - conservation of angular momentum (at two points), and
                    //   - assuming the collision is characterized by e and mu so that
                    //      v_m_COM_after . normal = -e * (v_m_COM_before . normal)
                    //      v_m_COM_after . tangent = mu * (v_m_COM_before . tangent)
                    //  this gives us six unknowns for the three impulse vectors,
                    //  so that math should check out
                    //
                    //  let j_m, j_1, and j_2 represent the three impulses that will
                    //  affect the three masses involved in this collision
                    //  let's do all the math using normal and tangent as the basis vectors
                    //  and also on a separate piece of paper because it's kind of involved
                    //  TODO: describe the derivation of impulses here
                    //  TODO: all that math^^^

                    // calculate the positions of the barspring at the point of collision
                    var s1 = VECTOR.add(VECTOR.mul(m1.v, t), m1.s);
                    var s2 = VECTOR.add(VECTOR.mul(m2.v, t), m2.s);

                    var par = VECTOR.hat(VECTOR.sub(s2, s1));
                    var perp = VECTOR.create(-par.y(), par.x());

                    var vCOM = VECTOR.mul(
                        VECTOR.add(VECTOR.mul(mass.v, mass.m()), VECTOR.add(VECTOR.mul(m1.v, m1.m()), VECTOR.mul(m2.v, m2.m()))),
                        1.0/(mass.m() + m1.m() + m2.m()));
                    var vrel = VECTOR.sub(mass.v, vCOM);

                    var vrel_perp = VECTOR.dot(vrel, perp);
                    var vrel_par = VECTOR.dot(vrel, par);

                    var jm_perp = VECTOR.mul(
                        perp,
                        -1.0 * mass.m() * (1 + spring.reflection()) * vrel_perp);
                    var jm_par = VECTOR.mul(
                        par,
                        -mass.m() * spring.friction() * vrel_par);
                    var jm = VECTOR.add(jm_perp, jm_par);
                    var j1 = VECTOR.add(
                                VECTOR.mul(jm_perp, -(1.0 - s)),
                                VECTOR.mul(jm_par, -(m1.m()/(m1.m() + m2.m()))));
                    var j2 = VECTOR.add(
                                VECTOR.mul(jm_perp, -s),
                                VECTOR.mul(jm_par, -(m2.m()/(m1.m() + m2.m()))));
                    // now push all three impulses into the impulse array
                    // this is so that more simultaneous collisions can take place
                    // in a sensible-ish manner; there's really no nice solution
                    // that also guarantees halting
                    impulses.push({
                      mass: mass,
                      amount: jm,
                      time: t
                    });
                    impulses.push({
                      mass: m1,
                      amount: j1,
                      time: t
                    });
                    impulses.push({
                      mass: m2,
                      amount: j2,
                      time: t
                    });
                }
            });
        });

        impulses.forEach(function(impulse) {
            var mass = impulse.mass;
            // Rewind to the time of impact, add in the force and wind back to present time
            // NOTE: This operation is noncommutative, so the order that impulses are applied
            // matters, but hopefully the error isn't too much
            mass.s.add(VECTOR.mul(mass.v, impulse.time));
            mass.v.add(VECTOR.mul(impulse.amount, 1.0/mass.m()));
            mass.s.add(VECTOR.mul(mass.v, -impulse.time));
        });
    }

    // Run a single tick of the physics engine.  Takes (dt), which is the
    // amount of simulated time measured in seconds.
    function _subtick(dt)
    {
        // calculate forces
        _clearForces();
        _gForce();
        _fForce();
        _kForce();
        _collisionForce();
        // apply forces
        _integrate(dt);
        // collide
        _collide();
        // collide more
        _collideBars(dt);
    }
// public
    // Should be called once per frame.
    function _tick(dt)
    {
        // The physics engine is run with lots of oversampling and frameskip in
        // order to make springs look sufficiently "rigid".  This wrapper
        // function achieves this by calling the primitive "tick" function
        // many times per frame.
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

