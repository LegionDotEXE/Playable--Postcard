// Playable Postcard
// Saurav Shah
// Prototype For PLayable Postcard 
//                      -----------------Final Verfication Pending


// Main.js Prefab

'use strict'

// Game configuration object
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
        Preloader,
        menuScene, 
        PostcardScene, 
        //messageScene 
    ]
}

// Start the game!
const game = new Phaser.Game(config)