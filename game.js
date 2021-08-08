//kaboom initialization code
kaboom ({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1],
})
//variables for the game
const MOVE_SPEED = 120;
const BOOTS_MOVE_SPEED = 240;
const JUMP_FORCE = 380;
const BIG_JUMP_FORCE = 450;
const ENEMY_SPEED = Math.random() * (300 - 200) + 200; 
const FALL_DEATH = 800;
let isJumping = true;
let hasPKB = false;
let CURRENT_SPEED = MOVE_SPEED;
let CURRENT_JUMP_FORCE = JUMP_FORCE;
let score = 0;
//sprite loading
loadRoot('https://i.imgur.com/');
loadSprite('player_r', 'XkyVCdu.png');
loadSprite('player_l', '6nIzXXW.png');
loadSprite('grass', '9EhfJwy.png');
loadSprite('bricks', 'ajNaSIR.png');
loadSprite('pokeball', 'folCtpb.png');
loadSprite('attack', 'wzksq7o.png');
loadSprite('coin', 'UYs9EnI.png');
loadSprite('pikachu_l', '65wMQno.png');
loadSprite('pikachu_r', '7RtdOsd.png');
loadSprite('unmetal', 'e7ySdHi.png');
loadSprite('metal', 'xkFtAgH.png');
loadSprite('boots', 'SmweKjq.png');
loadSprite('chest', '97WPe55.png');
loadSprite('pokecenter', 'nY0THDK.png');
loadSprite('grass_bg', 'AFqJ3Rd.png');
//game mechanics
scene("game", ({level, score})=> {
    layers(['bg', 'obj', 'ui'], 'obj')
//array of levels
    const maps = [
        [
            '                                                                      ',
            '                                                                       ',
            '                                                                       ',
            '                                                                       ',
            '                                                                       ',
            '                                                                       ',
            '                    -?-               xxx--                            ',
            '                                                                       ',
            '                                                                       ',
            '                  -xx      xx      x                                   ',
            '      --x                                               P              ',
            '                                                                       ',
            '-           x------x                  xxx----------                    -',
            '-                            0                        ^              ^ -',
            '-...................     .......    -..................................-',
            '-===================     =======    ===================================-',
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
        '-       xxxx                                                            xxxx      -',
        '-                                 xxxx                xxxxx                      --',
        '-           ^      ^        ^   ^         ^          ^     ^                    ---',
        '-----------------------------------------------------------------------------------',
        '-----------------------------------------------------------------------------------',]

    ];
// level configuration, drawing parameters
    const levelCfg = {
        width: 25,
        height: 25,
        '.': [sprite('grass_bg'), scale(0.1), layer('bg')],
        '=': [sprite('grass'), solid(), scale(0.1)],
        '0': [sprite('pokeball'), 'pokeball', body(), scale(0.1)],
        '-': [sprite('bricks'), solid(), 'coin-surprise', scale(0.1)],
        '^': [sprite('pikachu_l'), solid(), 'dangerous', body(), scale(0.1), {dir: -1} ],
        'x': [sprite('metal'), solid(), 'undestructable', scale(0.1)],
        '$': [sprite('coin'), 'coin', body(), scale(0.1)],
        '{': [sprite('unmetal'), solid(), scale(0.1)],
        'b': [sprite('boots'), 'boots',  body(), scale(0.1)],
        '?': [sprite('chest'), solid(), 'boots-surprise', scale(0.1)],
        'P': [sprite('pokecenter'), 'door', scale(0.5)],
    };
//game level setup constant
    const gameLevel = addLevel(maps[level], levelCfg);
//score label text
    const scoreText = add([
        text("Score: "),
        pos(20,60),
        layer('ui'),
        {
            value: "SCORE",
        }
    ]);
//score value
    const scoreLabel = add([
        text(score),
        pos(80,60),
        layer('ui'),
        {
            value: score,
        }
    ]);
//item label text
    const itemLabel = add([
        text('Item: none'),
        pos(500,60),
        layer('ui'),
        {
            value: hasPKB,
        }
    ]);
//level label text
    add([text('Level: ' + parseInt(level + 1)), pos(800 ,60), layer('ui')])
//boots mechanic
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
                this.scale = vec2(0.15)
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
//attack mechanics
    function spawnAttack (p) {
        const obj = add ([sprite ('attack'), pos(p), scale(0.1), 'attack'])
        wait (0.3, () => {
            destroy(obj)
        })
    }
//player configuration
    const player = add([
        sprite('player_r'), solid(), scale(0.15), pos(30,0), body(), origin('bot'), bigJump(), 
        { dir: vec2(1,-1)}
    ]);
//player collision resolver
    player.action(() => {
        player.resolve()
    })
//coin movement
    action('coin', (c) => {
        c.move(20,0)
    })
//enemy movement
    action('dangerous', (d) => {
        if (d.dir === - 1){
            d.changeSprite('pikachu_l')
        } else {
            d.changeSprite('pikachu_r')
        }
        d.move(d.dir * ENEMY_SPEED, 0)
    })
//enemy reaction to walls
    collides('dangerous', 'coin-surprise', (d) => {
        d.dir = -d.dir
    })
//enemy reaction to other enemies
    collides('dangerous', 'dangerous', (d) => {
        d.dir = -d.dir
    })
//attack reaction to enemies
    collides('attack', 'dangerous', (a, d) => {
        camShake(4)
        wait(1, () => {
            destroy(a)
        })
        destroy(d)
        scoreLabel.value = scoreLabel.value + 50
        scoreLabel.text = scoreLabel.value
    })
//player interaction on blocks
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
//player interaction with boots
    player.collides('boots', (b) => {
        destroy(b)
        player.biggify(10)
    })
//player interaction with pokeball
    player.collides('pokeball', (p) => {
        destroy(p)
        hasPKB = true;
        itemLabel.value = hasPKB
        itemLabel.text = 'Item: Pokeball'
    })
//player interaction with coin
    player.collides('coin', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })
//player interaction with enemy
    player.collides('dangerous', (d) => {
        if (isJumping) {
            destroy(d)
        } else {
            go('lose', { score: scoreLabel.value})
        }
    })
//player interaction with door
    player.collides('door', () => {
        keyPress('up', () => {
            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLabel.value
            })
        })
    })
//player interaction on fallin and camera position
    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH) {
            go('lose', { score: scoreLabel.value})
        }
    })
//movement action on left key press
    keyDown('left', () => {
        player.changeSprite('player_l')
        player.move(-CURRENT_SPEED, 0)
        player.dir = vec2(-2,-1)
    });
//movement action on left key press
    keyDown('right', () => {
        player.changeSprite('player_r')
        player.move(CURRENT_SPEED, 0)
        player.dir = vec2(1,-1)
    });
//player jump status
    player.action(() => {
        if (player.grounded()) {
            isJumping = false;
        }
    })
//jump action on space key press
    keyPress('space', () => {
        if (player.grounded()){
            isJumping = true;
            player.jump(CURRENT_JUMP_FORCE);
        }
    });
//attack action on down key press
    keyPress('down', () => {
        if (hasPKB){
            spawnAttack(player.pos.add(player.dir.scale(25)))
        } else {
            camShake(1) 
        }
    });

});
//lose scene rendering info
scene('lose', ({score}) => {
    add([text("Your Score is", 25), origin('center'), pos(width() / 2, height() / 2.5)])
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
})
//game launch
start('game', {level: 0, score: 0});