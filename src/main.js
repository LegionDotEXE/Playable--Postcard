// Playable Postcard
// Saurav Shah

// An interactive nostalgia top-down animation scene -  click objects on a late-night study desk
// to uncover hidden memories. Features atmospheric lighting, particle 
// effects, interactive clutter, and a heartfelt postcard finale.

// Total amount of work: ~40 hours (spread over a week or two, not all at once)


// Main.js Prefab

'use strict'

// Game configurations
let config = {
    type: Phaser.AUTO,           
    width: 800,                  
    height: 600,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false         
        }
    },
    
    scene: [ 
        boot, 
        preloader,
        menuscene, 
        postcardscene, 
        messagescene 
    ]
}

// Start the game!
const game = new Phaser.Game(config)