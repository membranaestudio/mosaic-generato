const fs = require('fs')
const {
    CELL,
    CELL_EXTRACT,
    CAROUSEL_THUMBSIZE,
    emitter,
    IMAGE_SIZE,
    imagesDir,
    thumbsDir,
    mosaicsDir
} = require('./config/mosaic')
const sharp = require('sharp')
const { Vector3 } = require('three')

/**
 * Crea un mosaico con cada una de
 * las imagenes y la serie de thumbs
 * anteriormente
 * @param {String} imagePath 
 * @param {Array<String>} thumbnails 
 */
async function createMosaic(imagePath, thumbnails) {
    let buffer
    let mosaic = await sharp({
        create: {
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
        }
    })
    try {
        console.log(`Creando mosaico ${imagePath}`)
        const image = await sharp(`${imagesDir}/${imagePath}`)
            .resize(IMAGE_SIZE / CELL, IMAGE_SIZE / CELL)
            .toColourspace('lab')
            .toBuffer()
        for (let top = 0; top < IMAGE_SIZE / CELL; top += CELL_EXTRACT) {
            console.time(`fila${top}_${imagePath}`)
            for (let left = 0; left < IMAGE_SIZE / CELL; left += CELL_EXTRACT) {
                let distances = []
                await sharp(image).extract({
                    top,
                    left,
                    width: CELL_EXTRACT,
                    height: CELL_EXTRACT
                }).raw().toBuffer()
                .then(async data => {
                    const colorExtracted = new Vector3(...data)
                    thumbnails.forEach((thumb) => {
                        distances.push(colorExtracted.distanceTo(thumb.rgb))
                    })
                    const nearestColorIndex = distances.findIndex((distance, i, distances) => distance === Math.min(...distances))
                    const nearestThumb = thumbnails[nearestColorIndex]
                    buffer = await mosaic
                        .composite([{ input: nearestThumb.thumbnail, top:top*CELL, left:left*CELL }])
                        .jpeg()
                        .toBuffer()
                    mosaic = sharp(buffer)
                })
            }
            console.timeEnd(`fila${top / CELL_EXTRACT}_${imagePath}`)
        }
        console.log('Matriz de imagen guardada', imagePath)
        mosaic.toFile(`${mosaicsDir}/${imagePath}`)
        /* mosaic.toFile(`${mosaicsDir}/${imagePath}`).then(() => {
            db.Mosaic.create({ path: imagePath, matrix: JSON.stringify(matriz) })
        }) */
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

/**
 * Crea un thumbnail cuadrado con las medidas
 * especificadas.
 * @param {String} path Ruta de la imagen para procesar
 * @param {Number} thumbSize Tamaño del thumb
 * @param {String} dir Donde se guardara el thumb
 * @param {Booleab} process Si se van a analizar los colores
 * @param {Boolean} save Guardar en el sistema de archivos
 * @param {Boolean} verbose Mostrar informacion en la consola
 * @returns Object
 */
async function createThumbnail(path, thumbSize, dir, process = true, save = false, verbose = false) {
    try {
        const thumbnail = await sharp(`${imagesDir}/${path}`).resize(thumbSize, thumbSize).toBuffer()
        
        if (save) {
            try {
                fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK);                
            } catch (error) {
                console.log(error)
                fs.mkdirSync(dir)
            }
            await sharp(thumbnail).toFile(`${dir}/${path}`)
            console.log(`Thumb generado ${path}`)
        }

        if(verbose) console.log('Thumbnail generado')
        if (process) {
            const { dominant } = await sharp(thumbnail).toColourspace('lab').stats()
            const rgb = new Vector3(dominant.r, dominant.g, dominant.b)
            return { thumbnail, rgb }
        }
        
    } catch (error) {
        console.log(error)
    }
}

/**
 * Prepara todo para el comienzo
 * de creación de mosaicos
 * @param {Array} thumbnails Lista de rutas a los mosaicos generados
 */
function generateMosaics(thumbnails) {
    fs.access(imagesDir, fs.constants.F_OK, function (err) {
        if (err) {
            console.log(err)
            return
        }
        try {
            fs.accessSync(mosaicsDir, fs.constants.R_OK || fs.constants.W_OK)            
        } catch (error) {
            fs.mkdirSync(mosaicsDir)
        }
        const files = fs.readdirSync(imagesDir)

        let mosaicPromises = []
        for (const imagePath of files) {
            try {
                fs.accessSync(`${thumbsDir}/${imagePath}`, fs.constants.F_OK)
            } catch (error) {
                mosaicPromises.push(createMosaic(imagePath, thumbnails))
            }
        }
        Promise.all(mosaicPromises).then(() => {
            emitter.emit('mosaic-generated')
        })
    })
}

/**
 * Metodo que crea los thumbs para
 * formar los mosaicos y los thumbs
 * que forman parte del carousel
 * @param {String} dir Ruta a la carpeta donde estan las imagenes principales
 */
module.exports = function generateThumbnails(dir) {
    let thumbs = []
    let carouselThumbs = []
    fs.access(dir, fs.constants.F_OK, async (err) => {
        if (err) {
            console.log(err)
            return
        }
        const files = fs.readdirSync(dir)
        console.log('Empezando proceso...')
        files.forEach(path => {
            try {
                thumbs.push(createThumbnail(path, CELL, thumbsDir))
                carouselThumbs.push(createThumbnail(path, CAROUSEL_THUMBSIZE, './public/s', false, true))
            } catch (error) {
                console.log(error)
            }
        })
        Promise.all(thumbs).then((thumbnails) => {
            console.log('Thumbs de mosaicos generados');
            generateMosaics(thumbnails)
        })
        Promise.all(carouselThumbs).then(() => console.log('Thumbs de carousel guardados'))
    })
}
