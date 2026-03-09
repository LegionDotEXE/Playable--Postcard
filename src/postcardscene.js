// PostcardScene.js
// The main scene

// PROTOTYPE 

class PostcardScene extends Phaser.Scene {   
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

        // let savedData = this.getSavedProgress()

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
                label:  'Coffee Mug',
                memory: '"Remember pulling that all-nighter\nbefore the physics final?\nYou drank three of these.\nI drank four. I win."'
            },
            {
                key:    'laptop',
                x:      370,
                y:      260,
                label:  'Laptop',
                memory: '"You always had 47 tabs open.\n\'I need all of them\', you said.\nYou needed none of them.\nBut somehow the project shipped."'
            },
            {
                key:    'books',
                x:      180,
                y:      310,
                label:  'Stack of Books',
                memory: '"You borrowed my Data Structures\nbook and highlighted everything.\nEVERYTHING.\nIt is basically a coloring book now."'
            },
            {
                key:    'lamp',
                x:      650,
                y:      160,
                label:  'Desk Lamp',
                memory: '"The lamp was always on your side.\nMy side stayed dark.\nSomehow that felt like a metaphor\nfor our friendship."'
            },
            {
                key:    'notes',
                x:      290,
                y:      370,
                label:  'Crumpled Notes',
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

    //  Draw background
    drawBackground(W, H) {
        let bg = this.add.image(W / 2, H / 2, 'bg-table')
        bg.setDisplaySize(W, H)
    }

    //  Draw each interactive object as a sprite with hover and click effects
    createInteractiveObject(def, alreadyFound) {
        let sprite = this.add.image(def.x, def.y, 'obj-' + def.key)
        sprite.setScale(0.18)

        if (alreadyFound) sprite.setAlpha(0.45)

        sprite.setInteractive({ useHandCursor: true })

        let label = this.add.text(def.x, def.y - 50, def.label, {
            fontSize: '13px',
            fill: '#fffbe8',
            fontFamily: 'Courier New',
            backgroundColor: '#33220088',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setAlpha(0)

        // hover effects: scale up + show label
        sprite.on('pointerover', () => {
            if (this.popupOpen) return
            this.tweens.add({ targets: sprite, scaleX: 0.21, scaleY: 0.21, duration: 120, ease: 'Back.easeOut' })
            label.setAlpha(1)
        })

        sprite.on('pointerout', () => {
            this.tweens.add({ targets: sprite, scaleX: 0.18, scaleY: 0.18, duration: 120 })
            label.setAlpha(0)
        })

        // Click: show memory popup
        sprite.on('pointerdown', () => {
            if (this.popupOpen) return
            this.showMemoryPopup(def, sprite, label)
        })

        sprite.memoryKey    = def.key
        sprite.alreadyFound = alreadyFound
        return sprite
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
    showMemoryPopup(def, sprite, label) {   
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
            this.closePopup(popupElements, def, sprite, label)
        })
    }

    //  closePopup — destroy popup and update game state
    closePopup(popupElements, def, sprite, label) {
        popupElements.forEach(el => el.destroy())
        this.popupOpen = false

        if (!sprite.alreadyFound) {
            sprite.alreadyFound = true
            this.memoriesFound++

            sprite.setAlpha(0.45)    

            this.add.text(sprite.x + 20, sprite.y - 30, '✓', {  
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

        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(30)    

        this.add.text(W / 2, H / 2 - 60, 'All Memories Found!', {   
            fontSize: '26px', fill: '#ffd700', fontFamily: 'Georgia, serif',
            fontStyle: 'bold', stroke: '#3a2000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(20)

        if (this.ambientSound) this.ambientSound.stop()

        // Full build still pending
        // For now, just a delayed fade-out to the next scene
        this.add.text(W / 2, H / 2, '[ PROTOTYPE END ]\nMessageScene coming in full build.', {    // FIX: replaces MessageScene transition
            fontSize: '15px', fill: '#ccccaa', fontFamily: 'Courier New',
            align: 'center', lineSpacing: 6
        }).setOrigin(0.5).setDepth(31)

        // Play Again button
        let btn = this.add.rectangle(W / 2, H / 2 + 80, 180, 44, 0xd4a853)
            .setDepth(31).setInteractive({ useHandCursor: true })
        this.add.text(W / 2, H / 2 + 80, 'Play Again', {
            fontSize: '16px', fill: '#1a0a00', fontFamily: 'Courier New', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(32)

        btn.on('pointerover', () => btn.setFillStyle(0xf0c060))
        btn.on('pointerout',  () => btn.setFillStyle(0xd4a853))
        btn.on('pointerdown', () => { this.scene.restart() })
    }

    // getSavedProgress() { ... }
    // saveProgress(key)  { ... }
    // clearProgress()    { ... }
}