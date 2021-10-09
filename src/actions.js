


/*
 * 
 *      interactivity
 * 
*/


export function setupInteractions(noa) {

    // on left mouse, set targeted block to be air
    noa.inputs.down.on('fire', function () {
        if (noa.targetedBlock) {
            var pos = noa.targetedBlock.position
            noa.setBlock(0, pos[0], pos[1], pos[2])
        }
    })


    // place block on alt-fire (RMB/E)
    var pickedID = 1
    noa.inputs.down.on('alt-fire', function () {
        if (noa.targetedBlock) {
            var pos = noa.targetedBlock.adjacent
            noa.addBlock(pickedID, pos[0], pos[1], pos[2])
        }
    })


    // pick block on middle fire (MMB/Q)
    noa.inputs.down.on('mid-fire', function () {
        if (noa.targetedBlock) pickedID = noa.targetedBlock.blockID
    })


    // pause (P)
    noa.inputs.bind('pause', 'P')
    noa.inputs.down.on('pause', function () {
        paused = !paused
        noa.setPaused(paused)
    })
    var paused = false



    // each tick, consume any scroll events and use them to zoom camera
    noa.on('tick', function (dt) {
        var scroll = noa.inputs.state.scrolly
        if (scroll !== 0) {
            noa.camera.zoomDistance += (scroll > 0) ? 1 : -1
            if (noa.camera.zoomDistance < 0) noa.camera.zoomDistance = 0
            if (noa.camera.zoomDistance > 10) noa.camera.zoomDistance = 10
        }
    })



}

