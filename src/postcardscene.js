// PostcardScene.js
// The main scene
// FINAL BUILD 

class postcardscene extends Phaser.Scene {
    constructor() {
        super('PostcardScene')
    }

    // Game state variables initialization
    init() {
        this.TOTAL_MEMORIES  = 5       // how many clickable objects exist
        this.memoriesFound   = 0       // counter for found memories
        this.popupOpen       = false   // blocks double-clicks while popup shows
        this.lampClicked     = false   // tracks lamp click state
        this.clutterTouched  = {}      // tracks which clutter items the player has clicked
        this.dragTarget      = null    // currently dragged sprite (manual drag system)
        this.dragOffsetX     = 0       // pointer offset so sprite doesn't jump on grab
        this.dragOffsetY     = 0
        this.toastActive     = false   // debounce so only one clutter toast shows at a time
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
        } catch (e) {                       // Not to break the game if audio fails to load
            console.warn('Ambient audio not available')
        }

        //  background
        this.drawBackground(W, H)

        //  Lamp glow effect 
        this.createLampGlow(W, H)

        //  Decorative desk clutter drawn first so interactive objects always sit on top
        this.addDeskClutter(W, H)

        //  Interactive objects with hover and click effects, core elements
        this.objectDefs = [
            {
                key:      'mug',
                x:        200,
                y:        400,
                scale:    0.14,  
                label:    'Coffee Mug',
                requires: ['spinner'],                          // must check the spinner first
                notYet:   "Samir would be horrified.\nUse the spinner first.",
                memory:   '"Remember pulling that all-nighter\nbefore the physics final?\nYou drank three of these.\nI drank four. I win."'
            },
            {
                key:      'laptop',
                x:        400,
                y:        300,
                scale:    0.19,  
                label:    'Laptop',
                requires: ['headphones'],                   // must check the headphones first
                notYet:   "You can\'t just open the laptop\nwithout your study playlist going.\nCheck the vibe first.",
                memory:   '"You always had 47 tabs open.\n\'I need all of them\', you said.\nYou needed none of them.\nBut somehow the project shipped."'
            },
            {
                key:      'books',
                x:        600,
                y:        380,
                scale:    0.13, 
                label:    'Stack of Books',
                requires: ['phone'],                    // must check the phone first
                notYet:   "You were reading those texts\ninstead of the chapter.\nAdmit it. Check the phone.",
                memory:   '"You borrowed my Data Structures\nbook and highlighted everything.\nEVERYTHING.\nIt is basically a coloring book now."'
            },
            {
                key:      'lamp',
                x:        650,
                y:        200,
                scale:    0.09,  
                label:    'Desk Lamp',
                requires: [],               // Considering lamp as first memory, so its always clickable
                notYet:   '',
                memory:   '"The lamp was always on your side.\nMy side stayed dark.\nSomehow that felt like a metaphor\nfor our friendship."'
            },
            {
                key:      'notes',
                x:        150,
                y:        220,
                scale:    0.09,  
                label:    'Crumpled Notes',
                requires: ['pen'],  // must find the pen first
                notYet:   "You haven\'t even found the pen yet.\nHow were these written?",
                memory:   '"You wrote \'TODO: understand this\'\non literally every page.\nSame, buddy. Same.\n(You still owe me $50, btw.)"'
            }
        ]

        this.interactiveObjects = []
        this.objectDefs.forEach((def) => {
            this.interactiveObjects.push(this.createInteractiveObject(def, false))
        })

        //  Scene-level pointer events for manual drag system
        this.input.on('pointermove', (pointer) => {
            if (!this.dragTarget || !pointer.isDown) return
            this.dragTarget.x = pointer.x + this.dragOffsetX
            this.dragTarget.y = pointer.y + this.dragOffsetY

            // If dragging the mug, move its label and steam wisps too
            if (this.dragTarget.dragLabel) {
                this.dragTarget.dragLabel.x = this.dragTarget.x
                this.dragTarget.dragLabel.y = this.dragTarget.y - 50
            }
            if (this.dragTarget.steamWisps) {
                this.dragTarget.steamWisps.forEach(wisp => {
                    wisp.x = this.dragTarget.x + wisp.offsetX
                    wisp.steamStartY = this.dragTarget.y - 30
                })
            }
        })

        this.input.on('pointerup', () => {
            if (!this.dragTarget) return
            this.dragTarget.setDepth(this.dragTarget.restDepth || 3)
            if (this.dragTarget.idleTween && !this.dragTarget.alreadyFound) {
                this.dragTarget.idleTween.resume()
            }
            this.dragTarget = null
        })

        //  UI bar at bottom with counter and instructions
        this.drawUI(W, H)
        this.updateCounter()
    }

    //  Create atmospheric lamp glow with flicker animation
    createLampGlow(W, H) {
        // Radial gradient glow around lamp position
        this.lampGlow = this.add.circle(650, 200, 200, 0xffd700, 0.10).setDepth(0)
        
        // Subtle flicker effect to the lamp glow
        this.tweens.add({
            targets: this.lampGlow,
            alpha: 0.05,
            duration: 2500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        })
    }

    // Create steam particle effect for the mug memory
    // Not required, but why not add a little extra flair to the coffee mug?

    createSteamEffect(mugX, mugY) {
        let wisps = []

        for (let i = 0; i < 3; i++) {
            let offsetX = (i - 1) * 8          
            let startY  = mugY - 30             // just above the mug rim

            let wisp = this.add.graphics()
            wisp.lineStyle(2, 0xddddcc, 0.6)
            wisp.lineBetween(0, 0, 0, -14)
            wisp.setPosition(mugX + offsetX, startY)
            wisp.setDepth(4)                    
            wisp.offsetX = offsetX              // store relative offset for drag updates

            // Float upward, fade out, then reset to start position
            this.tweens.add({
                targets: wisp,
                y: startY - 22,
                alpha: 0,
                duration: 1200 + i * 300,
                repeat: -1,
                delay: i * 400,
                onRepeat: () => {
                    wisp.y = wisp.steamStartY   // use stored start so drag moves are respected
                    wisp.setAlpha(0.6)
                }
            })

            wisp.steamStartY = startY           // initial start Y, updated on drag
            wisps.push(wisp)
        }

        return wisps
    }

    //  Add decorative clutter for lived-in desk atmosphere
    addDeskClutter(W, H) {
        // Headphones near laptop 
        let headphones = this.add.image(420, 320, 'decor-headphones')
            .setScale(0.15)
            .setDepth(2)
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

        // Pen,pencil near notes 
        let pen = this.add.image(170, 240, 'decor-pen')
            .setScale(0.15)
            .setDepth(2)
            .setRotation(-0.3)

        // Fidget spinner 
        let spinner = this.add.image(200, 415, 'decor-spinner')
            .setScale(0.15)
            .setDepth(2)
            .setAlpha(0.7)

        // Phone 
        let phone = this.add.image(580, 350, 'decor-phone')
            .setScale(0.13)
            .setDepth(2)
            .setRotation(0.2)

        // Calculator
        let calculator = this.add.image(320, 420, 'decor-calculator')
            .setScale(0.13)
            .setDepth(2)
            .setRotation(0.25)
            .setAlpha(0.75)

        // Message definitions for clutter items
        let clutterMessages = {
            'headphones': "Oh, the headphones.\nSamir had these on during every 'study session'.\nStudied zero minutes. Vibed infinitely.",
            'pen':        "A pen. Actual ink. On paper.\nSamir insisted this was 'better for retention'.\nHis retention was terrible.",
            'spinner':    "A fidget spinner.\nNot even ironic anymore.\nStill somehow calming though. Try it.",
            'phone':      "72 unread messages.\nAll of them memes Samir sent\nat 2am during finals week.\nEvery. Single. One.",
            'calculator': "A calculator.\nBecause apparently mental math\nwas 'too much pressure'.\nSame, honestly."
        }

        // Make clutter items interactive with hover and click effects
        let clutterMap = {
            'headphones': { item: headphones, msgKey: 'headphones' },
            'pen':        { item: pen,        msgKey: 'pen'        },
            'spinner':    { item: spinner,    msgKey: 'spinner'    },
            'phone':      { item: phone,      msgKey: 'phone'      },
            'calculator': { item: calculator,    msgKey: 'calculator' }
        }

        
        Object.entries(clutterMap).forEach(([key, def]) => {
            let item = def.item
            item.setInteractive({ useHandCursor: true })
            item.restDepth = 2

            item.on('pointerdown', (pointer) => {
                // Start manual drag
                this.dragTarget    = item
                this.dragOffsetX   = item.x - pointer.x
                this.dragOffsetY   = item.y - pointer.y
                item.setDepth(5)

                // Mark as touched on first interaction
                if (!this.clutterTouched[key]) {
                    this.clutterTouched[key] = true
                    // Small bounce to confirm the interaction
                    this.tweens.add({
                        targets: item,
                        scaleX: item.scaleX * 1.3,
                        scaleY: item.scaleY * 1.3,
                        duration: 100,
                        yoyo: true,
                        ease: 'Back.easeOut'
                    })
                }
            })

            item.on('pointerup', (pointer) => {
                // Only show toast on click, not at end of a drag
                let moved = Phaser.Math.Distance.Between(
                    pointer.downX, pointer.downY, pointer.x, pointer.y
                )
                if (moved < 10) {
                    this.showClutterToast(clutterMessages[def.msgKey])
                }
            })
        })

        // Store clutter for potential future interactions
        this.clutter = [headphones, sticky1, sticky2, pen, spinner, phone, calculator]
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
        sprite.setDepth(3)
        sprite.restDepth = 3

        let label = this.add.text(def.x, def.y - 50, def.label, {
            fontSize: '13px',
            fill: '#fffbe8',
            fontFamily: 'Courier New',
            backgroundColor: '#33220088',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setAlpha(0).setDepth(4)

        sprite.dragLabel = label    // store reference to label on sprite for drag updates

        // Idle pulse tween for unfound memories to draw attention
        if (!alreadyFound) {
            sprite.idleTween = this.tweens.add({
                targets: sprite,
                alpha: 0.75,
                duration: 1800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 800)  // stagger start times so they don't all pulse in unison
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

        // pointerdown — start drag (non-lamp) and register click intent
        sprite.on('pointerdown', (pointer) => {
            if (this.popupOpen) return

            // Start manual drag for all except lamp
            if (def.key !== 'lamp') {
                this.dragTarget  = sprite
                this.dragOffsetX = sprite.x - pointer.x
                this.dragOffsetY = sprite.y - pointer.y
                sprite.setDepth(6)
                if (sprite.idleTween) sprite.idleTween.pause()
                label.setAlpha(0)
            }

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
        })

        // pointerup : if not a drag, show memory popup
        sprite.on('pointerup', (pointer) => {
            if (this.popupOpen) return
            // Only show popup if this wasn't a drag (moved less than 10px)
            let moved = Phaser.Math.Distance.Between(
                pointer.downX, pointer.downY, pointer.x, pointer.y
            )
            if (moved < 10) {
                this.showMemoryPopup(def, sprite, label)
            }
        })

        sprite.memoryKey    = def.key
        sprite.alreadyFound = alreadyFound
        sprite.defScale     = def.scale             // For reference only! 

        // Steam rising from the mug — wisps stored on sprite so drag can move them
        if (def.key === 'mug' && !alreadyFound) {
            sprite.steamWisps = this.createSteamEffect(def.x, def.y)
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

    //  When player clicks a clutter item, show a temporary toast message with a sarcastic comment
    showClutterToast(message) {
        // Only one toast at a time — if one is already showing, skip
        if (this.toastActive) return
        this.toastActive = true

        let W = this.scale.width

        let toast = this.add.text(W / 2, 80, message, {
            fontSize: '14px',
            fill: '#fdf6e3',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            align: 'center',
            lineSpacing: 6,
            backgroundColor: '#1a0a0099',
            padding: { x: 16, y: 10 }
        }).setOrigin(0.5, 0).setAlpha(0).setDepth(20)

        // Slide in from top, hold, then fade out
        this.tweens.add({
            targets: toast,
            alpha: 1,
            y: 90,
            duration: 250,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2200, () => {
                    this.tweens.add({
                        targets: toast,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            toast.destroy()
                            this.toastActive = false
                        }
                    })
                })
            }
        })
    }

    //  Not-yet popup — shown when player clicks a memory before touching required clutter
    showNotYetPopup(def) {
        let W = this.scale.width
        let H = this.scale.height

        // Dim overlay
        let overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(10)

        // Popup card — slightly smaller and warmer tint than the memory popup
        let popup = this.add.graphics().setDepth(11)
        popup.fillStyle(0xfdf0d8, 1)
        popup.fillRoundedRect(W / 2 - 190, H / 2 - 90, 380, 170, 12)
        popup.lineStyle(3, 0xc0392b, 1)
        popup.strokeRoundedRect(W / 2 - 190, H / 2 - 90, 380, 170, 12)

        // "Not yet" icon
        let iconTxt = this.add.text(W / 2, H / 2 - 65, '✋', {
            fontSize: '28px'
        }).setOrigin(0.5).setDepth(13)

        // Themed message from the objectDef
        let msgTxt = this.add.text(W / 2, H / 2 - 20, def.notYet, {
            fontSize: '15px',
            fill: '#2c1810',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setDepth(13)

        let closeTxt = this.add.text(W / 2, H / 2 + 55, '[ click to dismiss ]', {
            fontSize: '12px', fill: '#a08060', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(13)

        // Pulse the close hint
        this.tweens.add({
            targets: closeTxt,
            alpha: 0.3,
            duration: 600,
            yoyo: true,
            repeat: -1
        })

        let popupElements = [overlay, popup, iconTxt, msgTxt, closeTxt]

        // Delayed dismiss: small delay prevents the opening click from immediately closing the popup
        this.time.delayedCall(100, () => {
            this.input.once('pointerdown', () => {
                popupElements.forEach(el => el.destroy())
                this.popupOpen = false
            })
        })
    }

    //  showMemoryPopup — display a memory popup when the player clicks a memory
    showMemoryPopup(def, sprite, label) {
        try { 
            this.sound.play('click', { volume: 0.5 })
        } catch(e) { 
            console.warn('Click sound playback failed:', e.message)
        }

        // Check if required clutter items have been touched before showing the memory
        let unmet = (def.requires || []).filter(key => !this.clutterTouched[key])
        if (unmet.length > 0) {
            this.popupOpen = true   // block further clicks while not-yet popup is open
            this.showNotYetPopup(def)
            return
        }

        this.popupOpen = true   // block further clicks while memory popup is open

        let W = this.scale.width
        let H = this.scale.height

        // Dim overlay
        let overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(10)

        // Minimal popup card — just the memory text and dismiss hint
        let popup = this.add.graphics().setDepth(11)
        popup.fillStyle(0xfdf6e3, 1)
        popup.fillRoundedRect(W / 2 - 200, H / 2 - 90, 400, 180, 12)
        popup.lineStyle(2, 0xd4a853, 1)
        popup.strokeRoundedRect(W / 2 - 200, H / 2 - 90, 400, 180, 12)

        // Memory text
        let bodyTxt = this.add.text(W / 2, H / 2 - 20, def.memory, {
            fontSize: '15px', fill: '#2c1810', fontFamily: 'Georgia, serif',
            align: 'center', lineSpacing: 8
        }).setOrigin(0.5).setDepth(13)

        let closeTxt = this.add.text(W / 2, H / 2 + 65, '[ click anywhere to continue ]', {
            fontSize: '12px', fill: '#a08060', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(13)

        let popupElements = [overlay, popup, bodyTxt, closeTxt]

        // Delayed dismiss : Copied from not-yet popup
        this.time.delayedCall(100, () => {
            this.input.once('pointerdown', () => {
                this.closePopup(popupElements, def, sprite, label)
            })
        })
    }

    //  closePopup 
    closePopup(popupElements, def, sprite, label) {
        popupElements.forEach(el => el.destroy())
        this.popupOpen = false

        if (!sprite.alreadyFound) {
            sprite.alreadyFound = true
            this.memoriesFound++

            // Dim the sprite and stop idle tween if it exists 
            if (sprite.idleTween) sprite.idleTween.stop()
            sprite.setAlpha(0.45)

            // Sparkle burst on discovery
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

        // let finalMessage = this.add.text(W / 2, H / 2, 'Thank you for exploring these memories.\nEvery late night, every shared moment,\nevery "TODO: understand this"...\nit all mattered.', {
        //     fontSize: '15px', fill: '#f0c060', fontFamily: 'Georgia, serif',
        //     align: 'center', lineSpacing: 8
        // }).setOrigin(0.5).setDepth(32).setAlpha(0)

        this.tweens.add({
            targets: celebrateText,
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