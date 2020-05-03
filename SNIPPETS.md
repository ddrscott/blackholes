# Snippets

A collection of misc hard fought snippets that I don't want to "lose" in the bowels of git history.

```javascript
drawTitles(scene) {
    const {name, x_increment, y_increment} = this.stage;
    const {width, height} = this.game.config;

    const label = this.add.text(0, 0, '', {
        fontFamily: FONT_FAMILY,
        fontSize: parseInt(y_increment/25 * 12),
        color: COLORS.darkHex,
        resolution: window.devicePixelRatio
    });

    const title = this.add.text(0, 0, '', {
        fontFamily: FONT_FAMILY,
        fontSize: parseInt(y_increment/25 * 20),
        color: COLORS.darkHex,
        resolution: window.devicePixelRatio
    });

    const volume = scene.rexUI.add.numberBar({
        slider: {
            track: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 5, 0xffffff, 0.3),
            // indicator: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 5, COLORS.outline),
            thumb: scene.add.image(0, 0, 'music').setTint(COLORS.dark),
            input: 'click',
            width: scene.game.config.width / 6,
        },
        space: { left: 0, right: 10, top: 5, bottom: 0, icon: 10, slider: 10, },
        value: this.current_track ? this.current_track.volume : 0.5
    }).on('valuechange', val => this.game.sound && this.game.sound.setVolume(val) ); //this.current_track && this.current_track.setVolume(val) );

    var controlPanel = scene.rexUI.add.sizer({
        orientation: 'y',
    }).add( label, 0, 'left', 0, false)
        .add( title, 0, 'left', 0, false)
        .add( volume, 0, 'left', 0, false)
        .setAnchor({
            left: 'left+10',
            top: '0%+10'
        })
        .layout();
}
```
