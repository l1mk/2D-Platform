kaboom ({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1],
})

const MOVE_SPEED = 120;
const JUMP_FORCE = 380;
const BIG_JUMP_FORCE = 450;
const ENEMY_SPEED = 20;
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

scene("game", ({score})=> {
    layers(['bg', 'obj', 'ui'], 'obj')

    const map = [
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                    -?-                                 ',
        '                                                        ',
        '                                                        ',
        '                  -xx      xx      x                    ',
        '                                                        ',
        '                                                        ',
        '           x------x                  xxx----------      ',
        '                                                        ',
        '                          0                          ^  ',
        '===================  ==========    =====================',
    ];

    const levelCfg = {
        width: 25,
        height: 25,
        '=': [sprite('grass'), solid(), scale(0.1)],
        '0': [sprite('pokeball'), solid(), scale(0.1)],
        '-': [sprite('bricks'), solid(), 'coin-surprise', scale(0.1)],
        '^': [sprite('pikachu'), solid(), 'dangerous', body(), scale(0.1)],
        'x': [sprite('metal'), solid(), 'undestructable', scale(0.1)],
        '$': [sprite('coin'), solid(), 'coin', body(), scale(0.1)],
        '{': [sprite('unmetal'), solid(), scale(0.1)],
        'b': [sprite('boots'), solid(), 'boots', scale(0.1)],
        '?': [sprite('chest'), solid(), 'boots-surprise', scale(0.1)],
    };

    const gameLevel = addLevel(map, levelCfg);

    const scoreLabel = add([
        text(score),
        pos(30,60),
        layer('ui'),
        {
            value: score,
        }
    ]);

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
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(0.18)
                CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
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
        go('lose', { score: scoreLabel.value})
    })

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    });

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    });

    keyPress('space', () => {
        if (player.grounded()){
            player.jump(CURRENT_JUMP_FORCE)
        }
    });



});

scene('lose', ({score}) => {
    add([text(score, 32), origin('center', pos(width()/2, height()/2))])
})

start('game', {score: 0});