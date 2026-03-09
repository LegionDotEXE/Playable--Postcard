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

        this.add.text(width / 2, height / 2 - 30, 'Loading...', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5)

        // Update bar width as each file finishes
        this.load.on('progress', (value) => {
            bar.width = 396 * value
        })

        // ---- Audio assets ----

        this.load.audio('ambient', 'audio/ambient.mp3')
        this.load.audio('click',   'audio/click.mp3')
        this.load.audio('chime',   'audio/chime.mp3')
        this.load.audio('flip',    'audio/flip.mp3')
        
        // Optional module to keep the play running even if assets fail to load - For Prototype
        this.load.on('loaderror', (file) => {
            console.warn('Optional asset not found:', file.key)
        })
    }

    create() {
        // All assets loaded — hand off to the title screen
        this.scene.start('MenuScene')
    }
}