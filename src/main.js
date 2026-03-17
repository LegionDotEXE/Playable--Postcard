// Playable Postcard
// Saurav Shah
// Prototype For PLayable Postcard 
//                      -----------------Final Verfication Pending


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