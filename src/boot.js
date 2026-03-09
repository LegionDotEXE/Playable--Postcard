// Boot.js
//   Boot       — minimal setup (could set game settings, check save data, etc.)


class Boot extends Phaser.Scene {
    constructor() {
        super('Boot')
    }

    create() {
        // Nothing to load here — go straight to the Preloader
        this.scene.start('Preloader')
    }
}
