// Preloader.js


class preloader extends Phaser.Scene {   
    constructor() {
        super('Preloader')
    }

    preload() {
        this.load.path = './assets/'

        // Loading bar setup
        let width  = this.cameras.main.width
        let height = this.cameras.main.height

        // Track background
        this.add.rectangle(width / 2, height / 2, 400, 24, 0x333355)

        // Progress Bar starting with 0 width
        let bar = this.add.rectangle(width / 2 - 198, height / 2, 4, 20, 0xffd700)
        bar.setOrigin(0, 0.5)

        // Primary Text: Courier New

        this.add.text(width / 2, height / 2 - 30, 'Loading...', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5)

        // Update bar width as each file finishes
        this.load.on('progress', (value) => {
            bar.width = 396 * value
        })

        // Image Assets

        this.load.image('bg-table',   'images/bg-table.jpg')    // study table background
        this.load.image('obj-mug',    'images/mug.png')     // coffee mug
        this.load.image('obj-laptop', 'images/laptop.png')  // laptop
        this.load.image('obj-books',  'images/books.png')   // stack of books
        this.load.image('obj-lamp',   'images/lamp.png')    // desk lamp
        this.load.image('obj-notes',  'images/notes.png')   // crumpled notes

        // Audio Assets
        this.load.audio('ambient', 'audio/ambient.wav')  
        this.load.audio('click',   'audio/click.ogg')    
        this.load.audio('chime',   'audio/chime.mp3')    
        this.load.audio('flip',    'audio/flip.wav')     

        // Optional module to keep the game running even if assets fail to load - For Prototype
        this.load.on('loaderror', (file) => {
            console.warn('Optional asset not found:', file.key, file.url)
        })
    }

    create() {
        // Start the Menu Scene after loading is complete
        this.scene.start('MenuScene')
    }
}