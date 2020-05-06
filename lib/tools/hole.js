import Phaser from 'phaser';
const MIN_RADIUS = 25;
const ALMOST_BLACK = 0x020202;
const VELOCITY = 0.25;

const DESTROY_AT_DISTANCE = 5;

export default class Hole {
    label = 'Black';

    onDown(scene, {x, y}) {
        if (scene.holes.remaining < 1) {
            scene.bubbleText(x, y, `Max Holes Reached!\nNext at ${scene.holes.nextAt}\n Points`);
            return;
        }

        this.downAt = {x,y};
        this.graphics = scene.add.graphics(x, y);
        this.graphics.depth = -1;
        this.scene = scene;
    }
    
    onPointerMove(scene, {x, y}) {
        if (this.downAt) {
            const dist = Phaser.Math.Distance.Between(this.downAt.x, this.downAt.y, x, y);
            this.drawCircle(this.downAt, dist);
        }
    }
    
    drawCircle({x, y}, radius){
        if (this.graphics) {
            this.graphics.clear();
            this.graphics.fillStyle(ALMOST_BLACK, 0.90);
            this.graphics.fillCircle(x, y, radius);
        }
    }

    onUp(scene, {x, y}) {
        if (!this.downAt) {
            return;
        }

        if (this.graphics) {
            this.graphics.clear();
            this.graphics.destroy();
        }

        scene.events.emit('useHole');

        let radius = Phaser.Math.Distance.Between(this.downAt.x, this.downAt.y, x, y);
        if (radius < MIN_RADIUS) {
            radius = MIN_RADIUS;
        }

        let hitRadius = radius * 0.01;
        if (hitRadius < DESTROY_AT_DISTANCE) {
            hitRadius = DESTROY_AT_DISTANCE;
        }


        const obj = scene.add.circle(this.downAt.x, this.downAt.y, radius, ALMOST_BLACK, 0.8);
        // const obj = scene.add.image(this.downAt.x, this.downAt.y, 'white');
        // obj.displayWidth = radius;
        // obj.displayHeight = radius;
        // obj.setTint(0x000000);
        // obj.setBlendMode(Phaser.BlendModes.MULTIPLY);

        scene.matter.add.gameObject(obj, {
            label: this.label,
            shape: 'circle', 
            radius: radius,
            hitRadius: hitRadius,
            isSensor: true,
            ignoreGravity: true,
            frictionAir: 0,
            plugin: {
                attractors: [this.attractor.bind(this)]
            }
        });

        obj.name = 'hole';
        obj.setVelocity(0, VELOCITY);
        obj.setDepth(-1);
        obj.setData('destroy-invisible', true);


        if (radius == MIN_RADIUS) {
            const tween = scene.tweens.add({
                targets: obj,
                // alpha: { from: 4, to: 0 },
                scale: { from: 0, to: 1 },
                ease: 'Elastic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 500,
                repeat: 0,            // -1: infinity
                yoyo: false,
                onComplete: () => {
                    tween.remove();
                },
            });
        }

        this.downAt = false;
    }

    attractor(bodyA, bodyB) {
        if (bodyB.label == this.label) {
            return;
        }

        const height = this.scene.game.config.height;

        // only consider bodies in view
        if (bodyA.position.y - bodyA.radius > height) {
            return;
        }

        const Matter = Phaser.Physics.Matter.Matter;
        var bToA = Matter.Vector.sub(bodyB.position, bodyA.position),
            distanceSq = Matter.Vector.magnitude(bToA) || 0.0001,
            normal = Matter.Vector.normalise(bToA),
            magnitude = -0.002 * (bodyA.mass * bodyB.mass / distanceSq),
            force = Matter.Vector.mult(normal, magnitude);

        if (distanceSq < bodyA.hitRadius && bodyB.gameObject) {
            this.disappear(bodyB.gameObject, bodyA);
        } else {
            Matter.Body.applyForce(bodyB, bodyB.position, force);
        }
    }

    disappear(obj, cause) {
        if (!obj._disappearing) {
            obj._disappearing = this.scene.tweens.add({
                targets: obj,
                // alpha: { from: 4, to: 0 },
                scale: {from: obj.scale, to: 0 },
                ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 250,
                repeat: 0,            // -1: infinity
                yoyo: false,
                onComplete: () => {
                    if (cause && cause.radius) {
                        const points = parseInt(MIN_RADIUS / cause.radius * 100);
                        this.scene.events.emit('points', {points, x: cause.position.x, y: cause.position.y});
                    }
                    obj.destroy();
                    obj._disappearing.remove();
                },
            });
        }
    }
}
