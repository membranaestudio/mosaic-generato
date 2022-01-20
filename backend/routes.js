const generateThumbnails = require('./mosaic')
const fs = require('fs')
require('dotenv').config()

module.exports = app => {
    app.post('/process', (req, res) => {
        try {
            fs.accessSync('./tmp.txt')
            res.json({ msg: 'Hay un proceso corriendo actualmente. Por favor espere que termine.' })
        } catch (error) {
            fs.writeFileSync('./tmp.txt', 'Generando')
            generateThumbnails('./images')
            res.json({ msg: 'Tarea en proceso' })            
        }
    })

    app.get('/paths', async (req, res) => {
        const PATHS_PER_PAGE = 10
        const carouselThumbsDir = './public/thumbs_carousel'
        const mosaicsDir = './public/mosaics'
        try {
            fs.accessSync(carouselThumbsDir, fs.constants.F_OK)
            fs.accessSync(mosaicsDir, fs.constants.F_OK)
            const carousels = fs.readdirSync(carouselThumbsDir)
            const mosaics = fs.readdirSync(mosaicsDir)

            const pages = Math.ceil(mosaics / PATHS_PER_PAGE)

            const resJson = {
                mosaics: mosaics.map(path => `${process.env.SERVER}/mosaics/${path}`),
                carousels: carousels.map(path => `${process.env.SERVER}/thumbs_carousel/${path}`)
            }
            res.json(resJson)
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: `No se encuentra el directorio ${carouselThumbsDir}` })
        }
    })
}