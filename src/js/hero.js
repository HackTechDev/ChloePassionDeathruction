function Hero(game, x, y) {
    let X = 7;

    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.body.setSize(29, 37, 16, 24);
    //this.body.immovable = true;

    this.animations.add('stop', [19]);
    this.animations.add('walk', [27, 29, 31], 8, true);
    this.animations.add('jump', [19]);
    this.animations.add('fall', [19]);
    this.animations.add('die', [5, 6, 5, 6, 5, 6], 8);
    var blinkAnim = this.animations.add('blink', [0, X, 0, X, 0, X, 0], 8);
    blinkAnim.killOnComplete = true;

    this.animations.play('stop');
}

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function(direction) {
    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;
    if (this.body.velocity.x < 0)
        this.scale.x = -1;
    else if (this.body.velocity.x > 0)
        this.scale.x = 1;
};

Hero.prototype.jump = function() {
    if (this.body)
        this.body.velocity.y = -400;
};

Hero.prototype.bounce = function() {
    const SPEED = 200;
    this.body.velocity.y = -SPEED;
};

Hero.prototype.getMoveAnimName = function() {
    var name = 'stop';

    if (this.body.velocity.y < 0)
        name = 'jump';
    else if (this.body.velocity.y > 0 && !this.body.touching.down)
        name = 'fall';
    else if (this.body.velocity.x != 0 && this.body.touching.down)
        name = 'walk';

    return name;
};

Hero.prototype.die = function(next) {
    this.animations.play('die').onComplete.addOnce(function() {
        next();
    });
};

Hero.prototype.update = function() {
    const ALL_MOVE_ANIMS = ['stop', 'jump', 'fall', 'walk'];
    var newAnim = this.getMoveAnimName();
    var curAnim = this.animations.name;
    if (!curAnim || (ALL_MOVE_ANIMS.includes(curAnim) && curAnim !== newAnim))
        this.animations.play(newAnim);
};
