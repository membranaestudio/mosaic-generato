(function() {
    Document.prototype.addSlideToPrimary = function(img) {
        const slide = this.createElement('li')
        
        slide.style.display = 'none'
        const imgElem = this.createElement('img')
        imgElem.src = img
        slide.classList.add('splide__slide')
        slide.append(imgElem)
        this.getElementsByClassName('splide__list')[0].append(slide)
    
        return slide
    }
    
    HTMLCollection.prototype.showUp = function() {
        for (const item of this) item.style.display = 'block'
    }
})()