var PlayState = {};

const LEVEL_COUNT = 2;

window.onload = function() {
    // let game = new Phaser.Game(docoment.window.width, do, Phaser.AUTO, 'game');
    // let game = new Phaser.Game('100', '100', Phaser.AUTO, 'game');
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play', true, false, {
        level: 0
    });
};

//===================================

PlayState.preload = function() {
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');

    this.game.load.image('background', 'images/background.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png')
    this.game.load.image('icon:coin', 'images/zombi_head.png');
    this.game.load.image('font:numbers', 'images/numbers.png');
    this.game.load.image('key', 'images/key.png');

    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    // this.game.load.audio('music', 'audio/stomp.wav');
    this.game.load.audio('music', 'audio/bgm.mp3');

    this.game.load.spritesheet('coin', 'images/zombi.png', 24, 24,4);
    //this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    this.game.load.spritesheet('spider', 'images/enemy.png', 64, 64, 36);

    //this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
    this.game.load.spritesheet('hero', 'images/player.png', 64, 64, 36);

    this.game.load.spritesheet('door', 'images/door.png', 42, 66);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);
    this.game.load.spritesheet('deco', 'images/decor.png', 42, 42);
};

PlayState.init = function(args) {
    this.game.renderer.renderSession.roundPixels = true;
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
    });

    this.keys.up.onDown.add(function() {
        if (this.hero.body.touching.down) {
            this.hero.isJumping = true;
            this.hero.jump();
            this.sfx.jump.play();
        }
    }, this);
    this.keys.up.onUp.add(function() {
        this.hero.isJumping = false;
    }, this);

    this.coinCount = 0;
    this.heroHasKey = false;
    this.heroMovingToDoor = false;

    // this.level = 1;
    this.level = (args.level || 0) % LEVEL_COUNT;
};

PlayState.create = function() {
    const VOLUME = 0.2;

    this.sfx = {
        jump: this.game.add.audio('sfx:jump', VOLUME),
        coin: this.game.add.audio('sfx:coin', VOLUME),
        key: this.game.add.audio('sfx:key', VOLUME),
        door: this.game.add.audio('sfx:door', VOLUME),
        stomp: this.game.add.audio('sfx:stomp', VOLUME),
    };

    this.game.add.image(0, 0, 'background');

    this.loadLevel(this.game.cache.getJSON(`level:${this.level}`));

    if (!this.music)
        this.music = this.game.add.audio('music');
    this.music.loopFull();

    this.heroInDoor = false;

    this.createUI();

    this.game.input.enabled = true;
};

PlayState.createUI = function() {
    this.ui = this.game.add.group();
    this.ui.position.set(10, 10);

    this.keyIcon = this.game.make.image(0, 0, 'icon:key');
    this.ui.add(this.keyIcon);
    this.keyIcon.anchor.set(0, .5);

    var coinIcon = this.game.add.sprite(this.keyIcon.position.x + this.keyIcon.width + 10, 0, 'icon:coin');
    this.ui.add(coinIcon);
    this.keyIcon.position.y = coinIcon.height / 2;

    const NUMBERS_STR = '0123456789X';
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26, NUMBERS_STR, 6);
    var coinCountIcon = this.game.make.image(
        coinIcon.position.x + coinIcon.width,
        coinIcon.height / 2,
        this.coinFont
    );
    coinCountIcon.anchor.set(0, 0.5);
    this.coinFont.text = `x${this.coinCount}`;
    this.ui.add(coinCountIcon);
};

PlayState.heroDoorDelta = null;

PlayState.update = function() {
    this.handleCollisions();

    // if (!this.heroMovingToDoor)
    //     this.handleInput();
    // else {
    this.handleInput();
    this.handleDoorEnding();
};
