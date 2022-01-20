import './assets/scss/main.scss'
import gsap from 'gsap'
import ax from './axios'
import {
    Mesh, Scene, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, WebGLRenderer, TextureLoader, Vector2, Raycaster, BoxGeometry, Object3D, Vector3, Plane
} from 'three';

window.onload = () => {
    const loader = new TextureLoader();
    let resolucion = 100
    let scene, master
    let mouse = new Vector2()
    let initialCameraPosition = new Vector3(1, 1, 100)
    const materiales = []

    function loadTexture(img, index) {
        return new Promise(resolve => loader.load(img.path, texture => resolve(texture)))
    }
    
    function loadImages(thumbs) {
        Promise.all(thumbs.map(loadTexture)).then(textures => {
            main(textures, thumbs)
        });
    }

    function lerp(a, b, x) {
        return a + x * (b - a);
    }
    
    function createPlanes(textures, matrix) {
        const tam_celda = 1
        const geometry = new PlaneGeometry(tam_celda, tam_celda);
        master = new Object3D()
        scene.add(master);
        textures.forEach(function(textura){
            materiales.push(new MeshBasicMaterial({ map: textura}))
        })
        for (let y = 0; y < resolucion; y++) {
            for (let x = 0; x < resolucion; x++) {
                const mesh = new Mesh(geometry, materiales[matrix[x][y]]);
                mesh.userData = { y, x }
                const rand = Math.floor(Math.random() * resolucion) - resolucion / 2
                mesh.position.set(rand, rand, 0)
                mesh.rotation.set(2, 2, 0)
                master.add(mesh)
            }
        }
    }

    function setMaterial(matrix) {
        master.children.forEach(function(plano){
            plano.material = materiales[matrix[plano.userData.x][plano.userData.y]]
        })
    }

    function main(textures, thumbs) {
        const canvas = document.querySelector('canvas');
        const raycaster = new Raycaster()
        const tam = 500;
        const renderer = new WebGLRenderer({ canvas });
        scene = new Scene();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(tam, tam);
        const camera = new PerspectiveCamera(60, 1, 0.1, 200);
        camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z)
        let matrix = thumbs[0].matrix
        createPlanes(textures, matrix)
        setMaterial(matrix)

        function render() {
            requestAnimationFrame(render);
            renderer.render(scene, camera);
            const tiltX = lerp(master.rotation.x, -mouse.y * 0.3, 0.1);
            const tiltY = lerp(master.rotation.y, mouse.x * 0.3, 0.1);
            master.rotation.set(tiltX, tiltY, 0);
        }

        function intercambiar() {
            const timeline = gsap.timeline(
                {defaults: { duration: 2, ease: 'sine.inOut' },
                onComplete() {
                    canvas.addEventListener('dblclick', seleccionar, false)
                    setMaterial(matrix)
                    organizar()
                }
            })
            master.children.forEach(function(plano){
                timeline.to(plano.scale, { x: 0, y: 0 }, 0)
                .to(plano.rotation, { x: 2, y: 2 }, 0)
                .to(plano.position, { x: "random(-100, 100)", y: "random(-100, 100)" }, 0)
            })            
            // timeline.play()
        }

        function organizar() {
            const timeline = gsap.timeline({defaults: { duration: 2, ease: 'sine.inOut' }})
            master.children.forEach(function(plano){
                timeline.to(plano.scale, { x: 1, y: 1},0)
                .to(plano.rotation, { x: 0, y: 0},0)
                .to(plano.position, { x: resolucion / 2 - plano.userData.y, y: resolucion / 2 - plano.userData.x},0)
            })
            // timeline.play()
        }

        function seleccionar(event) {
            canvas.removeEventListener('dblclick', seleccionar)
            const pointer = new Vector2()
            pointer.x = (event.offsetX / tam) * 2 - 1;
            pointer.y = - (event.offsetY / tam) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(master.children);
            if (intersects.length > 0) {
                camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z)
                amount = 0
                const id = matrix[intersects[0].object.userData.x][intersects[0].object.userData.y]
                matrix = thumbs[id].matrix
                intercambiar()
            }
        }

        const mouseMoveHandler = e => {
            mouse.x = (e.offsetX / tam) * 2 - 1;
            mouse.y = - (e.offsetY / tam) * 2 + 1;
        }

        canvas.addEventListener('mousemove', mouseMoveHandler);
        canvas.addEventListener('dblclick', seleccionar, false)

        let clicked = false
        let amount = 0

        canvas.addEventListener('wheel', e => {
            clicked = e.deltaY < 0
            amount += e.deltaY > 0 ? -0.05 : 0.05
            amount = Math.min(Math.max(amount, 0), .8)
            const pointer = new Vector2()
            pointer.x = (e.offsetX / tam) * 2 - 1;
            pointer.y = - (e.offsetY / tam) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(master.children);
            if (intersects.length > 0) {
                const texturePosition = intersects[0].object.position
                const interpolation = new Vector3().lerpVectors(initialCameraPosition, texturePosition, amount)
                camera.position.set(interpolation.x, interpolation.y, interpolation.z)
                if (amount > 0) {
                    canvas.removeEventListener('mousemove', mouseMoveHandler);
                    mouse.set(0, 0)
                } else {
                    canvas.addEventListener('mousemove', mouseMoveHandler);
                }
            }
        })

        /* render()
        organizar() */
    }

    if(document.getElementById('btnGenerate')) {
        document.getElementById('btnGenerate').addEventListener('click', e => {
            ax.post('/').then(response => {
                alert(response.data.msg)
            }).catch(error => alert('Hubo un error al generar el mosaico'))
        })
    }
    
    if(document.getElementById('btnLoad')) {
        document.getElementById('btnLoad').addEventListener('click', e => {
            ax.post('grids').then(response => {
                const canvas = document.getElementsByTagName('canvas')[0]
                canvas.style.display = 'block'
                if (Array.isArray(response.data.thumbs) && response.data.thumbs.length > 0) {
                    resolucion = response.data.resolution ?? resolucion
                    loadImages(response.data.thumbs)
                }
            }).catch(error => console.info(error))
        })
    }

    /* ax.post('grids').then(response => {
        const canvas = document.getElementsByTagName('canvas')[0]
        canvas.style.display = 'block'
        if (Array.isArray(response.data.thumbs) && response.data.thumbs.length > 0) {
            resolucion = response.data.resolution ?? resolucion
            loadImages(response.data.thumbs)
        }
    }).catch(error => console.info(error)) */
}