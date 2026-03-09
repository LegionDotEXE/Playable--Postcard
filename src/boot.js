// Boot.js
//   Boot       — minimal setup (could set game settings, check save data, etc.)


class boot extends Phaser.Scene {
    constructor() {
        super('Boot')
    }

    create() {
        // Go straight to the Preloader
        this.scene.start('Preloader')
    }
}
