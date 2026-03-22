// PostcardScene.js
// The main scene
// FINAL BUILD 

class postcardscene extends Phaser.Scene {
    constructor() {
        super('PostcardScene')
    }

    // Game state variables initialization
    init() {
        this.TOTAL_MEMORIES = 5       // how many clickable objects exist
        this.memoriesFound   = 0      // counter for found memories
        this.popupOpen       = false  // blocks double-clicks while popup shows
        this.lampClicked     = false  // tracks lamp click state
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

        //  Lamp glow effect 
        this.createLampGlow(W, H)

        //  Decorative desk clutter drawn first so interactive objects always sit on top
        this.addDeskClutter(W, H)   

        //  Interactive objects definition - organized positions on table
        this.objectDefs = [
            {
                key:    'mug',
                x:      200,
                y:      400,
                scale:  0.14,  // Larger - mugs feel substantial
                label:  'Coffee Mug',
                memory: '"Remember pulling that all-nighter\nbefore the physics final?\nYou drank three of these.\nI drank four. I win."'
            },
            {
                key:    'laptop',
                x:      400,
                y:      300,
                scale:  0.18,  
                label:  'Laptop',
                memory: '"You always had 47 tabs open.\n\'I need all of them\', you said.\nYou needed none of them.\nBut somehow the project shipped."'
            },
            {
                key:    'books',
                x:      600,
                y:      380,
                scale:  0.13, 
                label:  'Stack of Books',
                memory: '"You borrowed my Data Structures\nbook and highlighted everything.\nEVERYTHING.\nIt is basically a coloring book now."'
            },
            {
                key:    'lamp',
                x:      650,
                y:      200,
                scale:  0.10,  
                label:  'Desk Lamp',
                memory: '"The lamp was always on your side.\nMy side stayed dark.\nSomehow that felt like a metaphor\nfor our friendship."'
            },
            {
                key:    'notes',
                x:      150,
                y:      220,
                scale:  0.09,  
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

    //  Create atmospheric lamp glow with flicker animation
    createLampGlow(W, H) {
        // Radial gradient glow around lamp position
        this.lampGlow = this.add.circle(650, 200, 200, 0xffd700, 0.10).setDepth(0)
        
        // Subtle flicker effect (realistic bulb behavior)
        this.tweens.add({
            targets: this.lampGlow,
            alpha: 0.05,
            duration: 2500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        })
    }

    //  Steam rising from the coffee mug — 3 wisp lines that float up and reset
    createSteamEffect(mugX, mugY) {
        for (let i = 0; i < 3; i++) {
            let offsetX = (i - 1) * 8          // spread wisps: -8, 0, +8
            let startY  = mugY - 30             // just above the mug rim

            let wisp = this.add.graphics()
            wisp.lineStyle(2, 0xddddcc, 0.6)
            wisp.lineBetween(0, 0, 0, -14)
            wisp.setPosition(mugX + offsetX, startY)
            wisp.setDepth(4)                    // above the mug sprite (depth 3)

            // Float upward, fade out, then reset to start position
            this.tweens.add({
                targets: wisp,
                y: startY - 22,
                alpha: 0,
                duration: 1200 + i * 300,
                repeat: -1,
                delay: i * 400,
                onRepeat: () => {
                    wisp.y = startY
                    wisp.setAlpha(0.6)
                }
            })
        }
    }

    //  Add decorative clutter for lived-in desk atmosphere
    addDeskClutter(W, H) {
        // Headphones near laptop 
        let headphones = this.add.image(420, 320, 'decor-headphones')
            .setScale(0.10)
            .setDepth(1)
            .setAlpha(0.85)

        // Sticky notes scattered
        let sticky1 = this.add.image(180, 250, 'decor-sticky')
            .setScale(0.08)
            .setDepth(1)
            .setRotation(-0.15)
            .setAlpha(0.8)

        let sticky2 = this.add.image(550, 240, 'decor-sticky')
            .setScale(0.07)
            .setDepth(1)
            .setRotation(0.1)
            .setAlpha(0.75)

        // Pen/pencil near notes
        let pen = this.add.image(170, 240, 'decor-pen')
            .setScale(0.09)
            .setDepth(1)
            .setRotation(-0.3)

        // Coaster under mug
        let coaster = this.add.image(200, 415, 'decor-coaster')
            .setScale(0.11)
            .setDepth(0)
            .setAlpha(0.7)

        // Phone with faint screen glow
        let phone = this.add.image(580, 350, 'decor-phone')
            .setScale(0.08)
            .setDepth(1)
            .setRotation(0.2)

        // Empty snack wrapper 
        let wrapper = this.add.image(320, 420, 'decor-wrapper')
            .setScale(0.07)
            .setDepth(1)
            .setRotation(0.25)
            .setAlpha(0.75)

        // Store clutter for potential future interactions
        this.clutter = [headphones, sticky1, sticky2, pen, coaster, phone, wrapper]
    }

    //  Draw background
    drawBackground(W, H) {
        let bg = this.add.image(W / 2, H / 2, 'bg-table')
        bg.setDisplaySize(W, H)
        bg.setDepth(0)
    }

    //  Draw each interactive object as a sprite with hover and click effects
    createInteractiveObject(def, alreadyFound) {
        let sprite = this.add.image(def.x, def.y, 'obj-' + def.key)
        
        sprite.setScale(def.scale || 0.10)
        
        if (alreadyFound) sprite.setAlpha(0.45)

        sprite.setInteractive({ useHandCursor: true })
        sprite.setDepth(3)  // FIX: raised from 2 → 3 so sprites always sit above depth-1 clutter

        let label = this.add.text(def.x, def.y - 50, def.label, {
            fontSize: '13px',
            fill: '#fffbe8',
            fontFamily: 'Courier New',
            backgroundColor: '#33220088',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setAlpha(0).setDepth(4)  // FIX: raised label depth to match

        // Idle pulse — subtle alpha breathe to hint the object is clickable
        if (!alreadyFound) {
            sprite.idleTween = this.tweens.add({
                targets: sprite,
                alpha: 0.75,
                duration: 1800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 800)  // stagger so objects don't pulse in sync
            })
        }

        // hover effects
        sprite.on('pointerover', () => {
            if (this.popupOpen) return
            this.tweens.add({ 
                targets: sprite, 
                scaleX: def.scale * 1.2, 
                scaleY: def.scale * 1.2, 
                duration: 120, 
                ease: 'Back.easeOut' 
            })
            label.setAlpha(1)
        })

        sprite.on('pointerout', () => {
            this.tweens.add({ 
                targets: sprite, 
                scaleX: def.scale, 
                scaleY: def.scale, 
                duration: 120 
            })
            label.setAlpha(0)
        })

        // show memory popup
        sprite.on('pointerdown', () => {
            if (this.popupOpen) return
            
            if (def.key === 'lamp') {
                this.lampClicked = true
                // Intensify glow 
                this.tweens.add({
                    targets: this.lampGlow,
                    alpha: 0.25,
                    duration: 300,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                                            // It is to test if the lamp glow responds to clicks w/o breaking
                        this.tweens.add({
                            targets: this.lampGlow,
                            alpha: 0.05,
                            duration: 2500,
                            ease: 'Sine.easeInOut',
                            yoyo: true,
                            repeat: -1
                        })
                    }
                })
            }
            
            this.showMemoryPopup(def, sprite, label)
        })

        sprite.memoryKey    = def.key
        sprite.alreadyFound = alreadyFound
        sprite.defScale     = def.scale             // For reference only! 

        // Steam rising from the mug
        if (def.key === 'mug' && !alreadyFound) {
            this.createSteamEffect(def.x, def.y)
        }

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
    }

    //  refresh counter text with pulse tween
    updateCounter() {
        this.counterText.setText(`${this.memoriesFound} / ${this.TOTAL_MEMORIES}`)
        this.tweens.add({ 
            targets: this.counterText, 
            scaleX: 1.3, 
            scaleY: 1.3, 
            duration: 100, 
            yoyo: true 
        })
    }

    //  overlay + memory card on click
    showMemoryPopup(def, sprite, label) {
        this.popupOpen = true

        // FIX: removed this.sound.get() guard — .get() returns null before first play, blocking the sound entirely
        try { 
            this.sound.play('click', { volume: 0.5 })
        } catch(e) { 
            console.warn('Click sound playback failed:', e.message)
        }

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

            // Stop idle pulse and lock alpha so the fade-out looks clean
            if (sprite.idleTween) sprite.idleTween.stop()
            sprite.setAlpha(0.45)

            // Sparkle burst on discovery — small stars fly out from the object
            for (let i = 0; i < 6; i++) {
                let angle = (i / 6) * Math.PI * 2
                let star = this.add.text(sprite.x, sprite.y, '✦', {
                    fontSize: '14px', fill: '#ffd700', fontFamily: 'Arial'
                }).setOrigin(0.5).setDepth(5)
                this.tweens.add({
                    targets: star,
                    x: sprite.x + Math.cos(angle) * 50,
                    y: sprite.y + Math.sin(angle) * 50,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => star.destroy()
                })
            }

            this.add.text(sprite.x + 20, sprite.y - 30, '✓', {
                fontSize: '20px', fill: '#88ffaa', fontFamily: 'Arial'
            })

            this.updateCounter()

            if (this.memoriesFound >= this.TOTAL_MEMORIES) {
                this.time.delayedCall(600, () => this.triggerPostcardFlip())
            }
        }
    }

    triggerPostcardFlip() {
        try { this.sound.play('chime', { volume: 0.6 }) } catch(e) {}

        let W = this.scale.width
        let H = this.scale.height

        // Fade to black overlay
        let fadeOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(30)
        this.tweens.add({
            targets: fadeOverlay,
            alpha: 0.7,
            duration: 600
        })

        // Celebration text with scale-in
        // this.add.text(W / 2, H / 2 - 60, 'All Memories Found!', {
        //     fontSize: '28px', fill: '#ffd700', fontFamily: 'Georgia, serif',
        //     fontStyle: 'bold', stroke: '#3a2000', strokeThickness: 4
        // }).setOrigin(0.5).setDepth(20).setScale(0.8)

        // Animate celebration text
        let celebrateText = this.add.text(W / 2, H / 2 - 60, 'All Memories Found!', {
            fontSize: '28px', fill: '#ffd700', fontFamily: 'Georgia, serif',
            fontStyle: 'bold', stroke: '#3a2000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(31).setAlpha(0)

        this.tweens.add({
            targets: celebrateText,
            alpha: 1,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 400,
            ease: 'Back.easeOut',
            yoyo: true,
            repeat: 2
        })

        if (this.ambientSound) this.ambientSound.stop()

        // Final message with progressive reveal
        let finalMessage = this.add.text(W / 2, H / 2, 'Thank you for exploring these memories.\nEvery late night, every shared moment,\nevery "TODO: understand this"...\nit all mattered.', {
            fontSize: '15px', fill: '#f0c060', fontFamily: 'Georgia, serif',
            align: 'center', lineSpacing: 8
        }).setOrigin(0.5).setDepth(32).setAlpha(0)

        this.tweens.add({
            targets: finalMessage,
            alpha: 1,
            duration: 800,
            delay: 400,
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.scene.start('MessageScene')
                })
            }
        })
    }
}