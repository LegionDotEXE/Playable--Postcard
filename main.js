// Playable Postcard - Main Config
// Author: Saurav Shah
// Prototype For PLayable Postcard 
//                      -----------------Final Verfication Pending




'use strict'

// Game configuration object
let config = {
    type: Phaser.AUTO,           // Auto-detect WebGL or Canvas
    width: 800,                  // Wide enough for desktop postcard feel
    height: 550,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false         // Set to true to see collision boxes
        }
    },
    // Scenes listed in order; Boot loads first
    scene: [ Boot, MenuScene, PostcardScene, MessageScene ]
}

// Start the game!
const game = new Phaser.Game(config)