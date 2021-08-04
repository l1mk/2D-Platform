kaboom ({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1],
})

const MOVE_SPEED = 120;
const JUMP_FORCE = 360;
let score = 0;

loadRoot('https://i.imgur.com/');
loadSprite('player', 'XkyVCdu.png');
loadSprite('grass', '9EhfJwy.png');
loadSprite('bricks', 'ajNaSIR.png');
loadSprite('pokeball', 'folCtpb.png');
loadSprite('pikachu', '65wMQno.png');

scene("game", ()=> {
    layers(['bg', 'obj', 'ui'], 'obj')

    const map = [
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '                                                        ',
        '           ------                   ----------          ',
        '                                                        ',
        '                          $                          ^  ',
        '===================  ==========    =====================',
    ];

    const levelCfg = {
        width: 25,
        height: 25,
        '=': [sprite('grass'), solid(), scale(0.1)],
        '$': [sprite('pokeball'), solid(), scale(0.1)],
        '-': [sprite('bricks'), solid(), scale(0.1)],
        '^': [sprite('pikachu'), solid(), scale(0.1)]
    };

    const gameLevel = addLevel(map, levelCfg);

    const scoreLabel = add([
        text('Score'),
        pos(30,60),
        layer('ui'),
        {
            value: 'score',
        }
    ]);

    const player = add([
        sprite('player'), solid(), scale(0.15), pos(30,0), body(), origin('bot')
    ]);

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    });

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    });

    keyPress('space', () => {
        if (player.grounded()){
            player.jump(JUMP_FORCE)
        }
    });



});

start('game');