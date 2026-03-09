// PostcardScene.js
// The main scene

class postcardScene extends Phaser.Scene {
    constructor() {
        super('PostcardScene')
    }

    // Game state variables initialization
    init() {
        this.TOTAL_MEMORIES = 5       // how many clickable objects exist
        this.memoriesFound   = 0      // counter for found memories
        this.popupOpen       = false  // blocks double-clicks while popup shows
    }

    // Build the scene
    create() {
        let W = this.scale.width
        let H = this.scale.height


        // Audio setup - play ambient track
        try {
            this.ambientSound = this.sound.add('ambient', { loop: true, volume: 0.25 })
            this.ambientSound.play()
        } catch (e) {                       // Just in case the audio files are missing or fail to load
            console.warn('Ambient audio not available')
        }

        //  background 
        this.drawBackground(W, H)

        //  Interactive objects definition
        this.objectDefs = [
            {
                key:    'mug',
                x:      580,
                y:      280,
                label:  '☕ Coffee Mug',
                memory: '"Remember pulling that all-nighter\nbefore the 120 final?\nYou drank three of these.\nI drank four. I win."'
            },
            {
                key:    'laptop',
                x:      370,
                y:      260,
                label:  '💻 Laptop',
                memory: '"You always had 47 tabs open.\n\'I need all of them\', you said.\nYou needed none of them.\nBut somehow the project shipped."'
            },
            {
                key:    'books',
                x:      180,
                y:      310,
                label:  '📚 Stack of Books',
                memory: '"You borrowed my Data Structures\nbook and highlighted everything.\nEVERYTHING.\nIt is basically a coloring book now."'
            },
            {
                key:    'lamp',
                x:      650,
                y:      160,
                label:  '🔆 Desk Lamp',
                memory: '"The lamp was always on your side.\nMy side stayed dark.\nSomehow that felt like a metaphor\nfor our friendship."'
            },
            {
                key:    'notes',
                x:      290,
                y:      370,
                label:  '📝 Crumpled Notes',
                memory: '"You wrote \'TODO: understand this\'\non literally every page.\nSame, buddy. Same.\n(You still owe me $50, btw.)"'
            }
        ]

        this.interactiveObjects = []
        this.objectDefs.forEach((def) => {
            this.interactiveObjects.push(this.createInteractiveObject(def, false))
        })

        //  UI bar at bottom with counter and instructions
        this.drawUI(W, H)
        this.updateCounter()

    }

    // Study table, floor, window
    drawBackground(W, H) {
        let g = this.add.graphics()

        // Room floor
        g.fillStyle(0x2b2030, 1)
        g.fillRect(0, 0, W, H)

        // Table surface
        g.fillStyle(0x8b5e3c, 1)
        g.fillRect(80, 90, W - 160, H - 140)

        // Wood grain lines
        g.lineStyle(1, 0x7a4f30, 0.4)
        for (let y = 110; y < H - 80; y += 18) {
            g.beginPath()
            g.moveTo(80, y)
            g.lineTo(W - 80, y + Phaser.Math.Between(-3, 3))
            g.strokePath()
        }

        // Table edge shadow
        g.fillStyle(0x5a3a20, 1)
        g.fillRect(80, H - 60, W - 160, 12)

        // plain dark fill for prototype
        g.fillStyle(0x1a2a4a, 1)
        g.fillRect(250, 0, 300, 85)
        g.lineStyle(3, 0x8b7355, 1)
        g.strokeRect(250, 0, 300, 85)
        g.lineStyle(1, 0x5a6a8a, 0.5)
        g.lineBetween(400, 0, 400, 85)
        g.lineBetween(250, 42, 550, 42)
    }


    //  Draw each 
    createInteractiveObject(def, alreadyFound) {
        let container = this.add.container(def.x, def.y)

        // Draw the object
        let graphic = this.add.graphics()
        this['draw_' + def.key](graphic, alreadyFound)
        container.add(graphic)

        // Invisible hit area (64×64 min for touch targets)
        let hitZone = this.add.rectangle(0, 0, 80, 80, 0xffffff, 0)
            .setInteractive({ useHandCursor: true })
        container.add(hitZone)

        // Hover label
        let label = this.add.text(0, -50, def.label, {
            fontSize: '13px',
            fill: '#fffbe8',
            fontFamily: 'Courier New',
            backgroundColor: '#33220088',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setAlpha(0)
        container.add(label)


        // hover effects: scale up + show label
        hitZone.on('pointerover', () => {
            if (this.popupOpen) return
            this.tweens.add({ targets: container, scaleX: 1.12, scaleY: 1.12, duration: 120, ease: 'Back.easeOut' })
            label.setAlpha(1)
        })

        hitZone.on('pointerout', () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120 })
            label.setAlpha(0)
        })

        // Click: show memory popup
        hitZone.on('pointerdown', () => {
            if (this.popupOpen) return
            this.showMemoryPopup(def, container, graphic, label)
        })

        container.memoryKey   = def.key
        container.alreadyFound = alreadyFound
        return container
    }

    // Coffee mug
    draw_mug(g, faded) {
        let c = faded ? 0x887766 : 0xf0ece0
        g.fillStyle(c, 1)
        g.fillRoundedRect(-18, -20, 36, 38, 6)
        g.fillStyle(faded ? 0x665544 : 0xd4a853, 1)
        g.fillRect(-18, -20, 36, 8)
        g.lineStyle(3, faded ? 0x665544 : 0xa07030, 1)
        g.strokeRoundedRect(-18, -20, 36, 38, 6)
        g.lineStyle(4, faded ? 0x887766 : 0xd0b090, 1)
        g.beginPath()
        g.arc(22, -5, 12, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(90))
        g.strokePath()
        g.fillStyle(0x3d1c02, 1)
        g.fillRect(-15, -12, 30, 6)
    }

    // top-down view
    draw_laptop(g, faded) {
        let body = faded ? 0x556677 : 0x778899
        g.fillStyle(body, 1)
        g.fillRoundedRect(-55, -30, 110, 65, 5)
        g.fillStyle(faded ? 0x445566 : 0x223344, 1)
        g.fillRect(-48, -23, 96, 48)
        g.fillStyle(faded ? 0x334455 : 0x6699cc, 0.4)
        g.fillRect(-48, -23, 96, 30)
        g.lineStyle(1, faded ? 0x556677 : 0x99aacc, 0.5)
        for (let ky = 15; ky <= 20; ky += 5) {
            g.lineBetween(-40, ky, 40, ky)
        }
        if (!faded) {
            g.fillStyle(0xff6633, 1)
            g.fillRoundedRect(12, 5, 38, 14, 3)
            this.add.text(31, 12, 'CMPM 120', {
                fontSize: '8px', fill: '#ffffff', fontFamily: 'Courier New'
            }).setOrigin(0.5)
        }
    }

    // Stack of books
    draw_books(g, faded) {
        let colors  = faded ? [0x556644, 0x445566, 0x664455] : [0x4a7c4e, 0x3a5f8a, 0x8a3a3a]
        let offsets = [{ x: 3, y: 0 }, { x: -2, y: -16 }, { x: 1, y: -30 }]
        offsets.forEach((off, i) => {
            g.fillStyle(colors[i], 1)
            g.fillRect(-28 + off.x, -20 + off.y, 56, 14)
            g.lineStyle(1, 0x000000, 0.3)
            g.strokeRect(-28 + off.x, -20 + off.y, 56, 14)
            g.lineStyle(2, 0xffffff, 0.2)
            g.lineBetween(-24 + off.x, -20 + off.y, -24 + off.x, -6 + off.y)
        })
    }

    // Desk lamp
    draw_lamp(g, faded) {
        let col = faded ? 0x887744 : 0xd4a853
        g.fillStyle(col, 1)
        g.fillCircle(0, 20, 14)
        g.lineStyle(5, col, 1)
        g.lineBetween(0, 20, -10, -10)
        g.lineBetween(-10, -10, 5, -28)
        g.fillStyle(faded ? 0x998833 : 0xffcc44, 1)
        g.fillTriangle(-18, -18, 28, -18, 5, -38)
        if (!faded) {
            g.fillStyle(0xffee88, 0.15)
            g.fillTriangle(-50, 30, 80, 30, 5, -30)
        }
    }

    // Notes with scribbles
    draw_notes(g, faded) {
        let c = faded ? 0xaaaaaa : 0xf5f0dc
        let sheets = [
            { angle: -8, x: -5, y:  5 },
            { angle:  5, x:  5, y: -5 },
            { angle: -2, x:  0, y:  0 }
        ]
        sheets.forEach(s => {
            let cos = Math.cos(Phaser.Math.DegToRad(s.angle))
            let sin = Math.sin(Phaser.Math.DegToRad(s.angle))
            let hw = 35, hh = 24
            let pts = [
                { x: s.x - hw, y: s.y - hh },
                { x: s.x + hw, y: s.y - hh },
                { x: s.x + hw, y: s.y + hh },
                { x: s.x - hw, y: s.y + hh }
            ].map(p => ({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }))
            g.fillStyle(c, 1)
            g.fillPoints(pts, true)
            g.lineStyle(1, 0xccccaa, 0.5)
            g.strokePoints(pts, true)
        })
        if (!faded) {
            g.lineStyle(1, 0x554433, 0.6)
            for (let ly = -12; ly <= 12; ly += 6) {
                g.lineBetween(-25, ly, 15 + Phaser.Math.Between(-5, 5), ly)
            }
        }
    }

    //  counter bar and instructions at bottom of screen
    drawUI(W, H) {
        let uiBar = this.add.graphics()
        uiBar.fillStyle(0x0d0d1a, 0.85)
        uiBar.fillRect(0, H - 48, W, 48)

        this.add.text(16, H - 30, 'Memories Found:', {
            fontSize: '16px', fill: '#d4a853', fontFamily: 'Courier New'
        })

        this.counterText = this.add.text(185, H - 30, `0 / ${this.TOTAL_MEMORIES}`, {
            fontSize: '16px', fill: '#ffffff', fontFamily: 'Courier New', fontStyle: 'bold'
        })

        this.add.text(W - 16, H - 30, 'Click glowing objects to find memories', {
            fontSize: '13px', fill: '#888877', fontFamily: 'Courier New'
        }).setOrigin(1, 0)

        this.add.text(W / 2, 8, '[Press M to jump to Message Scene]', {
            fontSize: '11px', fill: '#555544', fontFamily: 'Courier New'
        }).setOrigin(0.5, 0)

        this.input.keyboard.once('keydown-M', () => { this.triggerPostcardFlip() })
    }

    //  refresh counter text with pulse tween
    updateCounter() {
        this.counterText.setText(`${this.memoriesFound} / ${this.TOTAL_MEMORIES}`)
        this.tweens.add({ targets: this.counterText, scaleX: 1.3, scaleY: 1.3, duration: 100, yoyo: true })
    }

    //  overlay + memory card on click
    showMemoryPopup(def, container, graphic, label) {
        this.popupOpen = true
        try { this.sound.play('click', { volume: 0.5 }) } catch(e) {}

        let W = this.scale.width
        let H = this.scale.height

        // Dim overlay
        let overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(10)

        // Popup card
        let popup = this.add.graphics().setDepth(11)
        popup.fillStyle(0xfdf6e3, 1)
        popup.fillRoundedRect(W / 2 - 210, H / 2 - 120, 420, 220, 12)
        popup.lineStyle(3, 0xd4a853, 1)
        popup.strokeRoundedRect(W / 2 - 210, H / 2 - 120, 420, 220, 12)

        // Memory number badge
        let badge = this.add.graphics().setDepth(12)
        badge.fillStyle(0xd4a853, 1)
        badge.fillCircle(W / 2 - 175, H / 2 - 100, 20)
        let badgeText = this.add.text(W / 2 - 175, H / 2 - 100, `${this.memoriesFound + 1}`, {
            fontSize: '16px', fill: '#1a0a00', fontStyle: 'bold', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(13)

        // Memory title and body text
        let titleTxt = this.add.text(W / 2 - 140, H / 2 - 105, def.label, {
            fontSize: '15px', fill: '#7b4f2e', fontFamily: 'Georgia, serif', fontStyle: 'bold italic'
        }).setDepth(13)

        let bodyTxt = this.add.text(W / 2, H / 2 - 40, def.memory, {
            fontSize: '15px', fill: '#2c1810', fontFamily: 'Georgia, serif',
            align: 'center', lineSpacing: 8
        }).setOrigin(0.5).setDepth(13)

        let closeTxt = this.add.text(W / 2, H / 2 + 80, '[ click anywhere to continue ]', {
            fontSize: '12px', fill: '#a08060', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(13)

        //  for the full build, might add a "Show me again later" button here 
        // that doesn't mark the memory as found, just closes the popup?
        let popupElements = [overlay, popup, badge, badgeText, titleTxt, bodyTxt, closeTxt]

        // Dismiss on next click
        this.input.once('pointerdown', () => {
            this.closePopup(popupElements, def, container, graphic, label)
        })
    }


    //  closePopup — destroy popup and update game state
    closePopup(popupElements, def, container, graphic, label) {
        popupElements.forEach(el => el.destroy())
        this.popupOpen = false

        if (!container.alreadyFound) {
            container.alreadyFound = true
            this.memoriesFound++

            graphic.setAlpha(0.5)

            this.add.text(container.x + 20, container.y - 25, '✓', {
                fontSize: '20px', fill: '#88ffaa', fontFamily: 'Arial'
            })

            this.updateCounter()

            if (this.memoriesFound >= this.TOTAL_MEMORIES) {
                this.time.delayedCall(600, () => this.triggerPostcardFlip())
            }
        }
    }

    // 
    triggerPostcardFlip() {
        try { this.sound.play('chime', { volume: 0.6 }) } catch(e) {}

        let W = this.scale.width
        let H = this.scale.height

        this.add.text(W / 2, H / 2, '✨ All Memories Found! ✨', {
            fontSize: '26px', fill: '#ffd700', fontFamily: 'Georgia, serif',
            fontStyle: 'bold', stroke: '#3a2000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(20)

        if (this.ambientSound) this.ambientSound.stop()

        // Full build still pending
        // For now, just a delayed fade-out to the next scene
        this.time.delayedCall(1200, () => {
            try { this.sound.play('flip', { volume: 0.5 }) } catch(e) {}
            this.cameras.main.fadeOut(400, 0, 0, 0)
            this.time.delayedCall(400, () => { this.scene.start('MessageScene') })
        })
    }
}