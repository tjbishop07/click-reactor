// Inspired by a Pen from Akimitsu Hamamuro (https://codepen.io/akm2/pen/rHIsa)
import React, { useEffect, useContext, useState } from 'react';
import GameContext from "../state/context";
import * as dat from 'dat.gui';
import { databaseRef } from '../config/firebase';
import { useAuth } from '../state/auth';

export default function ReactionButton(props) {

    const { propReaction } = props;
    const gameContext = useContext(GameContext);
    const [reactionState, setReactionState] = useState(null);
    const [showFadingText, setShowFadingText] = useState(false);
    const [canvas, setCanvas] = useState(document.getElementById('button-canvas'));
    const [canvasContext, setCanvasContext] = useState(null);

    const { user } = useAuth();

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    Vector.add = function (a, b) {
        return new Vector(a.x + b.x, a.y + b.y);
    };

    Vector.sub = function (a, b) {
        return new Vector(a.x - b.x, a.y - b.y);
    };

    Vector.scale = function (v, s) {
        return v.clone().scale(s);
    };

    Vector.random = function () {
        return new Vector(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );
    };

    Vector.prototype = {
        set: function (x, y) {
            if (typeof x === 'object') {
                y = x.y;
                x = x.x;
            }
            this.x = x || 0;
            this.y = y || 0;
            return this;
        },

        add: function (v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        },

        sub: function (v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        },

        scale: function (s) {
            this.x *= s;
            this.y *= s;
            return this;
        },

        length: function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },

        lengthSq: function () {
            return this.x * this.x + this.y * this.y;
        },

        normalize: function () {
            var m = Math.sqrt(this.x * this.x + this.y * this.y);
            if (m) {
                this.x /= m;
                this.y /= m;
            }
            return this;
        },

        angle: function () {
            return Math.atan2(this.y, this.x);
        },

        angleTo: function (v) {
            var dx = v.x - this.x,
                dy = v.y - this.y;
            return Math.atan2(dy, dx);
        },

        distanceTo: function (v) {
            var dx = v.x - this.x,
                dy = v.y - this.y;
            return Math.sqrt(dx * dx + dy * dy);
        },

        distanceToSq: function (v) {
            var dx = v.x - this.x,
                dy = v.y - this.y;
            return dx * dx + dy * dy;
        },

        lerp: function (v, t) {
            this.x += (v.x - this.x) * t;
            this.y += (v.y - this.y) * t;
            return this;
        },

        clone: function () {
            return new Vector(this.x, this.y);
        },

        toString: function () {
            return '(x:' + this.x + ', y:' + this.y + ')';
        }
    };

    function GravityPoint(x, y, radius, targets) {
        Vector.call(this, x, y);
        this.radius = radius;
        this.currentRadius = radius * 0.5;

        this._targets = {
            particles: targets.particles || [],
            gravities: targets.gravities || []
        };
        this._speed = new Vector();
    }

    GravityPoint.RADIUS_LIMIT = 65;
    GravityPoint.interferenceToPoint = true;

    GravityPoint.prototype = (function (o) {
        var s = new Vector(0, 0), p;
        for (p in o) s[p] = o[p];
        return s;
    })({
        gravity: 0.05,
        isMouseOver: false,
        dragging: false,
        destroyed: false,
        _easeRadius: 0,
        _dragDistance: null,
        _collapsing: false,

        hitTest: function (p) {
            return this.distanceTo(p) < this.radius;
        },

        startDrag: function (dragStartPoint) {
            this._dragDistance = Vector.sub(dragStartPoint, this);
            this.dragging = true;
        },

        drag: function (dragToPoint) {
            this.x = dragToPoint.x - this._dragDistance.x;
            this.y = dragToPoint.y - this._dragDistance.y;
        },

        endDrag: function () {
            this._dragDistance = null;
            this.dragging = false;
        },

        addSpeed: function (d) {
            this._speed = this._speed.add(d);
        },

        collapse: function (e) {
            this.currentRadius *= 1.75;
            this._collapsing = true;
        },

        render: function (ctx) {
            if (this.destroyed) return;

            var particles = this._targets.particles, i, len;

            for (i = 0, len = particles.length; i < len; i++) {
                particles[i].addSpeed(Vector.sub(this, particles[i]).normalize().scale(this.gravity));
            }

            this._easeRadius = (this._easeRadius + (this.radius - this.currentRadius) * 0.07) * 0.95;
            this.currentRadius += this._easeRadius;
            if (this.currentRadius < 0) this.currentRadius = 0;

            if (this._collapsing) {
                this.radius *= 0.75;
                if (this.currentRadius < 1) {
                    this.destroyed = true;
                    console.log('set show fade true');
                    setShowFadingText(true);
                    gameContext.updateScore(particles.length);
                    gameContext.updateActivityLog({ body: `Reaction triggered. Particles found: ${particles.length}` });
                }
                this._draw(ctx);
                const p = new Particle(
                    Math.floor(Math.random() * window.innerWidth - 1 * 2) + 1 + 1,
                    Math.floor(Math.random() * window.innerHeight - 1 * 2) + 1 + 1,
                    1
                );
                p.addSpeed(Vector.random());
                this._targets.particles.push(p);
                return;
            }

            var gravities = this._targets.gravities,
                g, absorp,
                area = this.radius * this.radius * Math.PI, garea;

            for (i = 0, len = gravities.length; i < len; i++) {
                g = gravities[i];
                if (g === this || g.destroyed) continue;
                if (
                    (this.currentRadius >= g.radius || this.dragging) &&
                    this.distanceTo(g) < (this.currentRadius + g.radius) * 0.85
                ) {
                    g.destroyed = true;
                    this.gravity += g.gravity;
                    absorp = Vector.sub(g, this).scale(g.radius / this.radius * 0.5);
                    this.addSpeed(absorp);
                    garea = g.radius * g.radius * Math.PI;
                    this.currentRadius = Math.sqrt((area + garea * 3) / Math.PI);
                    this.radius = Math.sqrt((area + garea) / Math.PI);
                }
                g.addSpeed(Vector.sub(this, g).normalize().scale(this.gravity));
            }

            if (GravityPoint.interferenceToPoint && !this.dragging) {
                this.add(this._speed);
            }

            this._speed = new Vector();
            if (this.currentRadius > GravityPoint.RADIUS_LIMIT) this.collapse();
            this._draw(ctx);
        },

        _draw: function (ctx) {
            var grd, r;
            ctx.save();
            grd = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius * 25);
            grd.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grd.addColorStop(1, 'rgba(255, 255, 255, .1)');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 5, 0, Math.PI * 2, false);
            ctx.fillStyle = grd;
            ctx.fill();
            r = Math.random() * this.currentRadius * 0.7 + this.currentRadius * 0.3;
            grd = ctx.createRadialGradient(this.x, this.y, r, this.x, this.y, this.currentRadius);
            grd.addColorStop(0, '#ffffff');
            grd.addColorStop(1, Math.random() < 0.2 ? 'rgba(255, 196, 0, 0.15)' : 'rgba(0, 0, 0, 0.75)');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false);
            ctx.fillStyle = grd;
            ctx.fill();
            ctx.restore();
        }
    });

    function Particle(x, y, radius) {
        Vector.call(this, x, y);
        this.radius = radius;
        this._latest = new Vector();
        this._speed = new Vector();
    }

    Particle.prototype = (function (o) {
        var s = new Vector(0, 0), p;
        for (p in o) s[p] = o[p];
        return s;
    })({
        addSpeed: function (d) {
            this._speed.add(d);
        },
        update: function () {
            if (this._speed.length() > 12) this._speed.normalize().scale(12);
            this._latest.set(this);
            this.add(this._speed);
        }
    });

    useEffect(() => {

        setReactionState(propReaction);
        console.log('canvas update');

        var PARTICLE_RADIUS = 1,
            G_POINT_RADIUS = 10;

        var context,
            bufferCvs, bufferCtx,
            screenWidth, screenHeight,
            mouse = new Vector(),
            gravities = [],
            particles = [],
            grad,
            trans,
            gui, control;

        function resize(e) {
            if (canvas) {
                screenWidth = canvas.width = window.innerWidth;
                screenHeight = canvas.height = window.innerHeight;
                bufferCvs.width = screenWidth;
                bufferCvs.height = screenHeight;
                context = canvas.getContext('2d');
                bufferCtx = bufferCvs.getContext('2d');
                var cx = canvas.width * 0.5,
                    cy = canvas.height * 0.5;
                grad = context.createRadialGradient(cx, cy, 0, cx, cy, Math.sqrt(cx * cx + cy * cy));
                grad.addColorStop(0, '#ad5389');
                grad.addColorStop(1, '#3c1053');
                trans = context.createRadialGradient(cx, cy, 0, cx, cy, Math.sqrt(cx * cx + cy * cy));
                trans.addColorStop(0, 'rgba(0, 0, 0, 0)');
                trans.addColorStop(1, 'rgba(0, 0, 0, 0)');
            }
        }

        function mouseMove(e) {
            mouse.set(e.clientX, e.clientY);
            var i, g, hit = false;
            for (i = gravities.length - 1; i >= 0; i--) {
                g = gravities[i];
                if ((!hit && g.hitTest(mouse)) || g.dragging)
                    g.isMouseOver = hit = true;
                else
                    g.isMouseOver = false;
            }
            canvas.style.cursor = hit ? 'pointer' : 'default';
        }

        function mouseDown(e) {
            for (var i = gravities.length - 1; i >= 0; i--) {
                if (gravities[i].isMouseOver) {
                    gravities[i].startDrag(mouse);
                    return;
                }
            }
            gravities.push(new GravityPoint(e.clientX, e.clientY, G_POINT_RADIUS, {
                particles: particles,
                gravities: gravities
            }));
        }

        function mouseUp(e) {
            for (var i = 0, len = gravities.length; i < len; i++) {
                if (gravities[i].dragging) {
                    gravities[i].endDrag();
                    break;
                }
            }
        }

        function doubleClick(e) {
            for (var i = gravities.length - 1; i >= 0; i--) {
                if (gravities[i].isMouseOver) {
                    gravities.push(new GravityPoint(e.clientX, e.clientY, G_POINT_RADIUS, {
                        particles: particles,
                        gravities: gravities
                    }));
                    break;
                }
            }
        }

        function addParticle(num) {
            var i, p;
            for (i = 0; i < num; i++) {
                p = new Particle(
                    Math.floor(Math.random() * screenWidth - PARTICLE_RADIUS * 2) + 1 + PARTICLE_RADIUS,
                    Math.floor(Math.random() * screenHeight - PARTICLE_RADIUS * 2) + 1 + PARTICLE_RADIUS,
                    PARTICLE_RADIUS
                );
                p.addSpeed(Vector.random());
                particles.push(p);
            }
        }

        function removeParticle(num) {
            if (particles.length < num) num = particles.length;
            for (var i = 0; i < num; i++) {
                particles.pop();
            }
        }

        control = {
            particleNum: 2
        };

        // canvas = document.getElementById('button-canvas');
        setCanvas(document.getElementById('button-canvas'));
        bufferCvs = document.createElement('canvas');
        window.addEventListener('resize', resize, false);
        resize(null);
        addParticle(control.particleNum);
        if (canvas) {
            canvas.addEventListener('mousemove', mouseMove, false);
            canvas.addEventListener('mousedown', mouseDown, false);
            canvas.addEventListener('mouseup', mouseUp, false);
            canvas.addEventListener('dblclick', doubleClick, false);
        }

        gui = new dat.GUI();
        gui.add(control, 'particleNum', 0, 500).step(1).name('Particle Num').onChange(function () {
            var n = (control.particleNum | 0) - particles.length;
            if (n > 0)
                addParticle(n);
            else if (n < 0)
                removeParticle(-n);
        });
        gui.add(GravityPoint, 'interferenceToPoint').name('Interference Between Point');
        gui.close();

        let fadeCount = 30;
        var loop = function () {
            let i, len, g, p;

            if (context && bufferCtx) {

                context.save();
                context.fillStyle = grad;
                context.fillRect(0, 0, screenWidth, screenHeight); // Make screen all black if no fillStyle specified. Good for a dark mode?
                context.restore();

                for (i = 0, len = gravities.length; i < len; i++) {
                    g = gravities[i];
                    if (g.dragging) g.drag(mouse);
                    g.render(context);
                    if (g.destroyed) {
                        gravities.splice(i, 1);
                        len--;
                        i--;
                    }
                }

                bufferCtx.save();
                bufferCtx.globalCompositeOperation = 'destination-out';
                bufferCtx.globalAlpha = 0.2; // NOTE: Turn this number down/up to create longer/shorter tails
                bufferCtx.fillRect(0, 0, screenWidth, screenHeight);
                bufferCtx.restore();

                len = particles.length;
                bufferCtx.save();
                bufferCtx.fillStyle = 'rgba(255, 255, 255, 1)';
                bufferCtx.lineCap = 'round';
                bufferCtx.lineWidth = PARTICLE_RADIUS * 2;
                bufferCtx.beginPath();
                for (i = 0; i < len; i++) {
                    p = particles[i];
                    p.update();
                    bufferCtx.moveTo(p.x, p.y);
                    bufferCtx.lineTo(p._latest.x, p._latest.y);
                }
                bufferCtx.stroke();
                bufferCtx.save();
                bufferCtx.fillStyle = 'rgba(255, 255, 255, 1)';
                bufferCtx.beginPath();
                for (i = 0; i < len; i++) {
                    p = particles[i];
                    bufferCtx.moveTo(p.x, p.y);
                    bufferCtx.arc(p.x, p.y, p.radius, 0, Math.PI / 2, false);
                }


                console.log('show fade', showFadingText);
                if (showFadingText) {
                    fadeCount = fadeCount - 1;
                    bufferCtx.textAlign = "center";
                    bufferCtx.font = `${i + 20}px Arial`;
                    bufferCtx.fillText(`+ ${i}`, window.innerWidth / 2, ((window.innerHeight / 2) / 2) + fadeCount);
                    if (fadeCount === 0) {
                        // setShowFadingText(false);
                        bufferCtx.fillStyle = `rgba(255, 255, 255, 0)`;
                        // bufferCtx.fillText(`+ ${i}`, window.innerWidth / 2, window.innerHeight / 2);
                        fadeCount = 80;
                        console.log('reset');
                    } else {
                        console.log('set text', fadeCount);
                        bufferCtx.fillStyle = `rgba(255, 255, 255, .${fadeCount})`;
                    }
                    // bufferCtx.save();
                } else {
                    bufferCtx.fill();
                    bufferCtx.save();
                }

                bufferCtx.restore();
                context.drawImage(bufferCvs, 0, 0);
            }

            requestAnimationFrame(loop);
        };

        loop();

    }, [canvas]);

    return (
        <React.Fragment>
            <canvas id="button-canvas"></canvas>
        </React.Fragment>
    );
}