const EventEmitter = require('events')
const fs = require('fs')

const emitter = new EventEmitter()
emitter.addListener('mosaic-generated', () => {
    // Enviar email
    console.log('Mosaicos guardados en base de datos.')
    fs.unlink('./tmp.txt', err => console.log('No se pudo eliminar el archivo temporal.', err))
})

module.exports = {
    CAROUSEL_THUMBSIZE: 96,
    CELL_EXTRACT: 1,
    CELL: 10,
    IMAGE_SIZE: 2000,
    imagesDir: './images',
    thumbsDir: './thumbnails',
    mosaicsDir: './public/mosaics',
    emitter
}