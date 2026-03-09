// Menuscene.js
class menuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    create() {
        let W = this.scale.width
        let H = this.scale.height

        // Late night starry sky background with title text, as planned.
        let bg = this.add.graphics()
        bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a1030, 0x1a1030, 1) 
        bg.fillRect(0, 0, W, H)

        // Random Dots Generator for Stars
        for (let i = 0; i < 150; i++) {
            let x = Phaser.Math.Between(0, W)
            let y = Phaser.Math.Between(0, H)
            let r = Math.random() < 0.3 ? 3 : (Math.random() < 0.6 ? 2 : 1.5)
            let star = this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.4, 1))

            // Twinkle effect
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(800, 2000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1500)
            })
        }

        // // Postcard frame
        // let card = this.add.graphics()
        // card.lineStyle(3, 0xd4a853, 1)
        // card.strokeRect(W / 2 - 260, H / 2 - 160, 520, 320)
        // card.fillStyle(0xfdf6e3, 1)
        // card.fillRect(W / 2 - 260, H / 2 - 160, 520, 320)

        // Title and instructions text
        this.add.text(W / 2, H / 2 - 80, 'A Late-Night Postcard', {
            fontSize: '32px',
            fill: '#df430b',
            fontFamily: 'Georgia, serif',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        this.add.text(W / 2, H / 2 - 40, 'for Samir', {
            fontSize: '22px',
            fill: '#f0c060',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic'
        }).setOrigin(0.5)

        this.add.text(W / 2, H / 2 + 10, 'Find all 5 hidden memories\nhidden around the study table.', {
            fontSize: '16px',
            fill: '#da7707',
            fontFamily: 'Courier New, monospace',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5)

        // Start button
        let btnBg = this.add.rectangle(W / 2, H / 2 + 80, 200, 50, 0xd4a853)
            .setInteractive({ useHandCursor: true })

        let btnText = this.add.text(W / 2, H / 2 + 80, 'Open Postcard', {
            fontSize: '16px',
            fill: '#1a0a00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Hover effect on button
        btnBg.on('pointerover',  () => { btnBg.setFillStyle(0xf0c060) })
        btnBg.on('pointerout',   () => { btnBg.setFillStyle(0xd4a853) })
        btnBg.on('pointerdown',  () => { this.startGame() })

        // Start game on spacebar press as well
        this.input.keyboard.once('keydown-SPACE', () => { this.startGame() })

        // Small hint
        this.add.text(W / 2, H / 2 + 125, '(or press SPACE)', {
            fontSize: '12px',
            fill: '#888866',
            fontFamily: 'Courier New'
        }).setOrigin(0.5)
    }

    startGame() {
        // Fade out then switch to the main postcard scene
        this.cameras.main.fadeOut(400, 0, 0, 0)
        this.time.delayedCall(400, () => {
            this.scene.start('PostcardScene')
        })
    }
}