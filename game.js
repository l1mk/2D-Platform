kaboom ({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1],
})

const MOVE_SPEED = 120;
const BOOTS_MOVE_SPEED = 240;
const JUMP_FORCE = 380;
const BIG_JUMP_FORCE = 450;
const ENEMY_SPEED = 40;
const FALL_DEATH = 800;
let isJumping = true;
let CURRENT_SPEED = MOVE_SPEED;
let CURRENT_JUMP_FORCE = JUMP_FORCE;
let score = 0;

loadRoot('https://i.imgur.com/');
loadSprite('player', 'XkyVCdu.png');
loadSprite('grass', '9EhfJwy.png');
loadSprite('bricks', 'ajNaSIR.png');
loadSprite('pokeball', 'folCtpb.png');
loadSprite('pikachu', '65wMQno.png');
loadSprite('coin', 'UYs9EnI.png');
loadSprite('unmetal', 'e7ySdHi.png');
loadSprite('metal', 'xkFtAgH.png');
loadSprite('boots', 'SmweKjq.png');
loadSprite('chest', '97WPe55.png');
loadSprite('pokecenter', 'nY0THDK.png');
loadSprite('grass_bg', 'AFqJ3Rd.png');

scene("game", ({level, score})=> {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            '                                                                      ',
            '                                                                      ',
            '                                                                      ',
            '                                                                      ',
            '                                                                      ',
            '                                                                      ',
            '                    -?-               xxx--                           ',
            '                                                                      ',
            '                                                                      ',
            '                  -xx      xx      x                                  ',
            '      --x                                               P             ',
            '                                                                      ',
            '           x------x                  xxx----------                    ',
            '                            0                        ^              ^ ',
            '...................     .......    ...................................',
            '===================     =======    ===================================',
        ],
        [
        '                                                                                  ',
        '                                                                                  ',
        '                                                                                  ',
        '                                            ^   0                                 ',
        '             x?xx                   xxxxxxxxxxxxxxxxxx?xxxxx                      ',            
        '                                                                                  ',
        '                         ^                                                        ',
        '            xx xxx        xxx            xxxxx             xxxx         ^         ',
        '                                                                 xxxx             ',
        '                   x                                   x  x                        ',
        '-                        ^                                                        -',
        '-                  xxxxxxxxx      xx      xxxxx x      x        ^xx               -',
        '-                                                                                 -',
        '-                                      xx                           xxxx          -',
        '-       xxxx                                                            xxxx     -',
        '-                                 xxxx                xxxxx                      --',
        '-           ^      ^        ^   ^         ^          ^     ^                    ---',
        '----------------------------------------------------------------------------------',
        '----------------------------------------------------------------------------------',]

    ];

    const levelCfg = {
        width: 25,
        height: 25,
        '.': [sprite('grass_bg'), scale(0.1), layer('bg')],
        '=': [sprite('grass'), solid(), scale(0.1)],
        '0': [sprite('pokeball'), solid(), body(), scale(0.1)],
        '-': [sprite('bricks'), solid(), 'coin-surprise', scale(0.1)],
        '^': [sprite('pikachu'), solid(), 'dangerous', body(), scale(0.1)],
        'x': [sprite('metal'), solid(), 'undestructable', scale(0.1)],
        '$': [sprite('coin'), 'coin', body(), scale(0.1)],
        '{': [sprite('unmetal'), solid(), scale(0.1)],
        'b': [sprite('boots'), 'boots',  body(), scale(0.1)],
        '?': [sprite('chest'), solid(), 'boots-surprise', scale(0.1)],
        'P': [sprite('pokecenter'), 'door', scale(0.5)],

    };

    const gameLevel = addLevel(maps[level], levelCfg);

    const scoreText = add([
        text("SCORE"),
        pos(20,60),
        layer('ui'),
        {
            value: "SCORE",
        }
    ]);

    const scoreLabel = add([
        text(score),
        pos(80,60),
        layer('ui'),
        {
            value: score,
        }
    ]);

    add([text('level ' + parseInt(level + 1)), pos(800 ,60)])

    function bigJump(){
        let timer = 0;
        let isBig = false;
        return {
            update() {
                if (isBig){
                    timer -= dt()
                    if (timer <= 0){
                        this.smallify()
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify(){
                this.scale = vec2(0.1)
                CURRENT_SPEED = MOVE_SPEED
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(0.18)
                CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                CURRENT_SPEED = BOOTS_MOVE_SPEED
                timer = time
                isBig = true
            }
        }
    }

    const player = add([
        sprite('player'), solid(), scale(0.15), pos(30,0), body(), origin('bot'), bigJump()
    ]);

    action('coin', (c) => {
        c.move(20,0)
    })

    action('dangerous', (d) => {
        d.move(-ENEMY_SPEED, 0)
    })

    player.on("headbump", (obj) =>{
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0,1))
            destroy(obj)
        
        }
        if (obj.is('undestructable')){
            gameLevel.spawn('$', obj.gridPos.sub(0,1))
            destroy(obj)
            gameLevel.spawn('{', obj.gridPos.sub(0,0))
        }
        if (obj.is('boots-surprise')){
            gameLevel.spawn('b', obj.gridPos.sub(0,1))
            destroy(obj)
        }
    })

    player.collides('boots', (b) => {
        destroy(b)
        player.biggify(5)
    })

    player.collides('coin', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    player.collides('dangerous', (d) => {
        if (isJumping) {
            destroy(d)
        } else {
            go('lose', { score: scoreLabel.value})
        }
    })

    player.collides('door', () => {
        keyPress('up', () => {
            go('game', {
                level: (level + 1),
                score: scoreLabel.value
            })
        })
    })

    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH) {
            go('lose', { score: scoreLabel.value})
        }
    })

    keyDown('left', () => {
        player.move(-CURRENT_SPEED, 0)
    });

    keyDown('right', () => {
        player.move(CURRENT_SPEED, 0)
    });

    player.action(() => {
        if (player.grounded()) {
            isJumping = false;
        }
    })

    keyPress('space', () => {
        if (player.grounded()){
            isJumping = true;
            player.jump(CURRENT_JUMP_FORCE);
        }
    });



});

scene('lose', ({score}) => {
    add([text("Your Score is", 25), origin('center'), pos(width() / 2, height() / 2.5)])
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
})

start('game', {level: 0, score: 0});