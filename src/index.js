//@ts-check

import '@babylonjs/core'
import '@babylonjs/materials'
import { Engine } from '../../../game/noa'

import { initRegistration } from './registration'
import { initWorldGen } from './worldgen'
import { setupPlayerEntity } from './entities'
import { setupInteractions } from './actions'



var noa = new Engine({
    debug: true,
    showFPS: true,
    inverseY: true,
    inverseX: false,
    chunkSize: 32,
    chunkAddDistance: [7, 7],     // [horiz, vert]
    chunkRemoveDistance: [8, 8],     // [horiz, vert]
    blockTestDistance: 50,
    texturePath: 'textures/',
    playerStart: [0.5, 5, 0.5],
    playerHeight: 1.4,
    playerWidth: 0.6,
    playerAutoStep: true,
    useAO: true,
    AOmultipliers: [0.92, 0.8, 0.5],
    reverseAOmultiplier: 1.0,
    manuallyControlChunkLoading: false,
    originRebaseDistance: 25,
})

var blockIDs = initRegistration(noa)
initWorldGen(noa, blockIDs)
setupPlayerEntity(noa)
setupInteractions(noa)

