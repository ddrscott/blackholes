import Phaser from 'phaser';
const random = () => Phaser.Math.RND.frac();

export const AIR_FRICTION = 0.01;

export function create(scene, x, y, radius, velocity) {
    if (radius === undefined) {
        radius = random() * 10 + 5;
    }

    // const star = scene.add.circle(x, y, radius, 0xFFFFFF, 1);
    const star = scene.add.image(x, y, 'white');
    scene.matter.add.gameObject(star, {
        shape: 'circle', 
        radius: radius,
        isSensor: true,
        mass: 1000 * Math.pow(1/radius, 2) * Math.PI,
        // density: 1,
        ignoreGravity: true,
        frictionAir: AIR_FRICTION,
    });
    star.displayHeight = radius;
    star.displayWidth = radius;
    star.radius = radius;
    star.name = 'star';
    if (velocity) {
        star.setVelocity(...velocity);
    } else {
        star.setVelocity(0, radius / 3);
    }
    star.setData('wrap', true);
    star.setBlendMode(Phaser.BlendModes.ADD);
    return star
}
