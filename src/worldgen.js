

/*
 * 
 * 
 *		testbed world generation
 * 
 * 
*/

// this module implements two "worlds" of voxel data
var WORLD1 = 'world1'
var WORLD2 = 'world2'

// storage for data from voxels that were unloaded
var cruncher = require('voxel-crunch')
var storage = {}
var chunkIsStored = (id) => { return !!storage[id] }
var storeChunk = (id, arr) => { storage[id] = cruncher.encode(arr.data) }
var retrieveChunk = (id, arr) => { cruncher.decode(storage[id], arr.data) }





export function initWorldGen(noa, blockIDs) {

    // init world name and add binding to swap it    
    noa.worldName = WORLD1


    // catch engine's chunk removal event, and store the data
    noa.world.on('chunkBeingRemoved', function (id, array, userData) {
        storeChunk(id, array)
    })


    // catch worldgen requests, and queue them to handle asynchronously
    var requestQueue = []
    noa.world.on('worldDataNeeded', function (id, array, x, y, z, worldName) {
        requestQueue.push({ id, array, x, y, z, worldName })
    })



    // process the worldgen request queue:
    setInterval(function () {
        if (requestQueue.length === 0) return
        var req = requestQueue.shift()
        if (chunkIsStored(req.id)) {
            retrieveChunk(req.id, req.array)
        } else {
            generateChunk(req.array, req.x, req.y, req.z, req.worldName)
        }
        // pass the finished data back to the game engine
        noa.world.setChunkData(req.id, req.array)
    }, 10)




    // two versions of world data
    // `data` is an ndarray - see https://github.com/scijs/ndarray
    function generateChunk(array, x, y, z, worldName) {
        if (worldName === WORLD1) generateChunk1(array, x, y, z)
        if (worldName === WORLD2) generateChunk2(array, x, y, z)
    }

    function generateChunk1(array, x, y, z) {
        for (var i = 0; i < array.shape[0]; ++i) {
            for (var k = 0; k < array.shape[2]; ++k) {
                var height = getHeightMap(x + i, z + k, 10, 30)
                for (var j = 0; j < array.shape[1]; ++j) {
                    var b = decideBlock(x + i, y + j, z + k, height)
                    if (b) array.set(i, j, k, b)
                }
            }
        }
        if (y > -5) {
            for (var n = 10; n < 20; n++) {
                array.set(n, 20, n, blockIDs.waterPole)
                array.set(n + 1, 21, n + 1, blockIDs.waterPole)
                array.set(n, 22, 30 - n, blockIDs.windowID)
            }
        }
    }

    function generateChunk2(array, x, y, z) {
        for (var i = 0; i < array.shape[0]; ++i) {
            for (var k = 0; k < array.shape[2]; ++k) {
                var height = getHeightMap(x + i, z + k, 20, 40)
                for (var j = 0; j < array.shape[1]; ++j) {
                    var b = decideBlock(x + i, y + j, z + k, height)
                    if (b === blockIDs.grassID) b = blockIDs.grass2ID
                    if (b) array.set(i, j, k, b)
                }
            }
        }
    }





    // helpers

    // worldgen - return a heightmap for a given [x,z]
    function getHeightMap(x, z, xsize, zsize) {
        var xs = 0.8 + 2 * Math.sin(x / xsize)
        var zs = 0.4 + 2 * Math.sin(z / zsize + x / 30)
        return xs + zs
    }

    function decideBlock(x, y, z, height) {
        // general stuff
        if (y < height) {
            return (y < 0) ? blockIDs.dirtID : blockIDs.grassID
        } else {
            if (y >= 1) return 0
            // alternate by depth between two different water IDs
            return (y % 2) ? blockIDs.waterID : blockIDs.water2ID
        }
    }


}

