import { updateSize } from './transitioner'
const overlay = document.getElementById('overlay')
const tooltip = document.getElementById('tooltip')
const arrow = document.getElementById('arrow')
const btnNext = document.getElementById('tooltipNext')
const btnPrev = document.getElementById('tooltipPrev')
import tour from './tour.json'

const stages = tour.stages

let i = -1

export function hideAndExtend() {
    document.getElementById('tooltip-wrapper').style.display = 'none'
    document.getElementById('header').style.visibility = 'inherit'
    document.getElementById('carousel').classList.toggle('extended')
    updateSize()
}

export default function placeTooltip(inc) {
    i += inc
    if (i === 0) {
        btnPrev.style.visibility = 'hidden'
    } else if (i === (stages.length - 1)) {
        btnNext.textContent = 'FINALIZAR'
        btnPrev.style.visibility = 'inherit'
    } else if (i === stages.length) {
        hideAndExtend()
        return false
    } else {
        btnNext.textContent = 'SIGUIENTE'
        btnPrev.classList.remove('disabled')
        btnNext.classList.remove('disabled')
        btnPrev.disabled = false
        btnPrev.style.visibility = 'inherit'
    }
    document.getElementById('title').textContent = stages[i].title
    document.getElementById('description').textContent = stages[i].description
    
    const bullets = document.getElementById('bullets').childNodes
    for (const bullet of bullets) {
        bullet.classList.remove('active')
    }
    if(i < stages.length) bullets[i].classList.add('active')

    const target = document.getElementById(stages[i].element)
    const params = target.getBoundingClientRect()
    const movil = window.matchMedia('(max-width: 640px)')
    const breakpoint = movil.matches ? 'movil' : 'pc'
    const { arrowPosition, tooltipPosition } = stages[i].breakpoints[breakpoint]
    
    const arrowProperties = arrow.getBoundingClientRect()
    const tooltipProperties = tooltip.getBoundingClientRect()
    let pos = ''
    let offsetX = 0, offsetY = 0

    if (params.left < 1 && stages[i].element === 'btnSearch') {
        arrowPosition.x = 'left'
        tooltipPosition.x = 'right'
        arrowPosition.dir = -180
    }

    switch (arrowPosition.x) {
        case 'left':
            offsetX = arrowProperties.width + 10
            pos = `translateX(${-arrowProperties.width - 10}px)`
            break;
        case 'left-inner':
            offsetX = 0
            pos = `translateX(0px)`
            break;
        case 'center':
            pos = `translateX(${params.left + params.width / 2 - arrowProperties.width / 2}px)`
            break;
        case 'right':
            offsetX = -arrowProperties.width - 30
            pos = `translateX(${tooltipProperties.width + 15}px)`
            break;
        case 'right-inner':
            offsetX = 0
            pos = `translateX(${tooltipProperties.width - arrowProperties.width - 20}px)`
            break;

        default:
            break;
    }
    switch (arrowPosition.y) {
        case 'top':
            offsetY = arrowProperties.height
            pos += ` translateY(${-arrowProperties.height}px)`
            break;
        case 'top-inner':
            offsetY = 0
            pos += ` translateY(0px)`
            break;
        case 'middle':
            pos += ` translateY(${tooltipProperties.top + tooltipProperties.height / 2 - arrowProperties.height / 2}px)`
            break;
        case 'bottom':
            offsetY = -arrowProperties.height
            pos += ` translateY(${tooltipProperties.height}px)`
            break;
        case 'bottom-inner':
            offsetY = 0
            pos += ` translateY(${tooltipProperties.height - arrowProperties.height}px)`
            break;

        default:
            break;
    }

    pos += ` rotate(${arrowPosition.dir}deg)`

    arrow.style.transform = pos
    pos = ''
    switch (tooltipPosition.y) {
        case 'top':
            pos = `translateY(${params.top - tooltipProperties.height + offsetY}px)`
            break;
        case 'top-inner':
            pos = `translateY(${params.top + offsetY}px)`
            break;
        case 'middle':
            pos = `translateY(${params.top + params.height / 2 - tooltipProperties.height / 2}px)`
            break;
        case 'bottom':
            pos = `translateY(${params.bottom + 10 + offsetY}px)`
            break;
        case 'bottom-inner':
            pos = `translateY(${params.bottom - tooltipProperties.height + offsetY}px)`
            break;

        default:
            break;
    }

    switch (tooltipPosition.x) {
        case 'left':
            pos += ` translateX(${params.left - tooltipProperties.width + offsetX}px)`
            break;
        case 'left-inner':
            pos += ` translateX(${params.left + offsetX}px)`
            break;
        case 'center':
            pos += ` translateX(${params.left + params.width / 2 - tooltipProperties.width / 2 + offsetX}px)`
            break;
        case 'right':
            pos += ` translateX(${params.right + offsetX}px)`
            break;
        case 'right-inner':
            pos += ` translateX(${params.right - tooltipProperties.width + offsetX}px)`
            break;

        default:
            break;
    }
    tooltip.style.transform = pos

    overlay.style.left = `${params.left}px`
    overlay.style.top = `${params.top}px`
    overlay.style.width = `${params.right - params.left}px`
    overlay.style.height = `${params.bottom - params.top}px`
}

btnNext.addEventListener('click', () => placeTooltip(1))

btnPrev.addEventListener('click', () => placeTooltip(-1))
