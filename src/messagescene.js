// Messagescene.js

class messagescene extends Phaser.Scene {
    constructor() {
        super('MessageScene')
    }

    create() {
        let W = this.scale.width
        let H = this.scale.height

        // ----- Background -----
        let bg = this.add.graphics()
        bg.fillStyle(0xfdf6e3, 1)
        bg.fillRect(0, 0, W, H)

        // ----- Postcard outer border -----
        let border = this.add.graphics()
        border.lineStyle(5, 0xb8864e, 1)
        border.strokeRect(30, 30, W - 60, H - 60)
        border.lineStyle(2, 0xd4a853, 1)
        border.strokeRect(38, 38, W - 76, H - 76)

        // ----- Vertical divider (left = message, right = address) -----
        let divider = this.add.graphics()
        divider.lineStyle(2, 0xc8a87a, 0.8)
        divider.lineBetween(W / 2, 50, W / 2, H - 50)

        // ----- Address lines on right side -----
        let lines = this.add.graphics()
        lines.lineStyle(1, 0xd4b896, 0.7)
        for (let ly = 120; ly <= H - 80; ly += 28) {
            lines.lineBetween(W / 2 + 20, ly, W - 50, ly)
        }

        // ----- Postage stamp (top right) -----
        let stamp = this.add.graphics()
        stamp.fillStyle(0xc0392b, 1)
        stamp.fillRect(W - 130, 50, 90, 115)
        stamp.lineStyle(2, 0xffffff, 1)
        stamp.strokeRect(W - 124, 56, 78, 103)
        this.add.text(W - 85, 105, '🏔️', { fontSize: '30px' }).setOrigin(0.5)

        // Perforated stamp edge dots
        let dots = this.add.graphics()
        dots.fillStyle(0xfdf6e3, 1)
        for (let i = 0; i <= 10; i++) {
            dots.fillCircle(W - 130 + i * 9, 50, 3)
            dots.fillCircle(W - 130 + i * 9, 165, 3)
        }
        for (let j = 0; j <= 12; j++) {
            dots.fillCircle(W - 130, 50 + j * 9.6, 3)
            dots.fillCircle(W - 40,  50 + j * 9.6, 3)
        }

        // Postmark circle
        let postmark = this.add.graphics()
        postmark.lineStyle(2, 0x886644, 0.6)
        postmark.strokeCircle(W - 155, 75, 28)
        postmark.lineBetween(W - 183, 75, W - 127, 75)
        this.add.text(W - 155, 75, 'UCSC\n2024', {
            fontSize: '9px', fill: '#886644', fontFamily: 'Courier New', align: 'center'
        }).setOrigin(0.5)

        // ----- TO / FROM block (right side) -----
        this.add.text(W / 2 + 30, 85, 'TO:', {
            fontSize: '13px', fill: '#5a3a20', fontFamily: 'Courier New', fontStyle: 'bold'
        })
        this.add.text(W / 2 + 30, 110, 'Samir Ghimire', {
            fontSize: '18px', fill: '#2c1810', fontFamily: 'Georgia, serif', fontStyle: 'italic'
        })
        this.add.text(W / 2 + 30, 140, 'The best study buddy\n(who owes me $50)', {
            fontSize: '13px', fill: '#7a5030', fontFamily: 'Georgia, serif',
            fontStyle: 'italic', lineSpacing: 4
        })

        this.add.text(W / 2 + 30, H - 120, 'FROM:', {
            fontSize: '11px', fill: '#5a3a20', fontFamily: 'Courier New'
        })
        this.add.text(W / 2 + 30, H - 100, 'Saurav — Room 314', {
            fontSize: '14px', fill: '#2c1810', fontFamily: 'Georgia, serif', fontStyle: 'italic'
        })

        // ----- Personal message (left side) -----
        this.add.text(50, 60, 'Dear Samir,', {
            fontSize: '22px', fill: '#2c1810', fontFamily: 'Georgia, serif', fontStyle: 'italic bold'
        })

        let message = [
            'You survived another year as my',
            'roommate — which, honestly, deserves',
            'its own award.',
            '',
            'Thanks for the late nights, the bad',
            'takeout decisions, and always having',
            'a charger when I forgot mine (again).',
            '',
            "You're stuck with me until graduation.",
            'Might as well enjoy it.',
            '',
            'Now please — pay me back. 🙏',
        ]

        message.forEach((line, i) => {
            this.add.text(55, 105 + i * 26, line, {
                fontSize: '15px', fill: '#3d2010', fontFamily: 'Georgia, serif', lineSpacing: 4
            })
        })

        // Signature
        this.add.text(55, H - 95, '— Your Partner in Crime,', {
            fontSize: '14px', fill: '#7a4020', fontFamily: 'Georgia, serif', fontStyle: 'italic'
        })
        this.add.text(55, H - 70, 'Saurav  ✌️', {
            fontSize: '22px', fill: '#2c1810', fontFamily: 'Georgia, serif', fontStyle: 'bold italic'
        })

        // ----- Play Again button -----
        let btn = this.add.rectangle(W / 2, H - 22, 160, 28, 0xd4a853)
            .setInteractive({ useHandCursor: true })

        this.add.text(W / 2, H - 22, 'Play Again', {
            fontSize: '13px', fill: '#1a0a00', fontFamily: 'Courier New', fontStyle: 'bold'
        }).setOrigin(0.5)

        btn.on('pointerover',  () => { btn.setFillStyle(0xf0c060) })
        btn.on('pointerout',   () => { btn.setFillStyle(0xd4a853) })
        btn.on('pointerdown',  () => {
            this.cameras.main.fadeOut(300, 0, 0, 0)
            this.time.delayedCall(300, () => { this.scene.start('MenuScene') })
        })

        // ----- Fade in -----
        this.cameras.main.fadeIn(600, 255, 240, 210)
    }
}