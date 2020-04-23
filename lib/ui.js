export function musicPanel(scene) {
    const volumeSlider = slider(scene, 0xff0000, 0x00ff00, 0x0000ff);

    var controlPanel = scene.rexUI.add.sizer({
        orientation: 'y',
    }).add(
        volumeSlider, //child
        0, // proportion
        'center', // align
        0, // paddingConfig
        true, // expand
    )
    return controlPanel;
}

export function slider(scene, colorPrimary, colorDark, colorLight) {
    return 
}
