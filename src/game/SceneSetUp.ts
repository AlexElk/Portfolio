import { send } from "node:process";
import * as THREE from "three";

export function createScene(container: HTMLElement)
{
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e24);


    const VIRTUAL_WIDTH = 256;
    const VIRTUAL_HEIGHT = 224;
    const HOLOGRAM_SCALE = 4;

    const camera = new THREE.PerspectiveCamera(
        75,
        VIRTUAL_WIDTH / VIRTUAL_HEIGHT,
        0.1,
        1000
    );
    camera.position.set(0, 6, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setSize(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, false);

    const hologramRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    hologramRenderer.setSize(VIRTUAL_WIDTH * HOLOGRAM_SCALE, VIRTUAL_HEIGHT * HOLOGRAM_SCALE, false);
    hologramRenderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;

    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';

    //Styles to Stretch the canvas
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.objectFit = 'contain'; //contain or fill

    canvas.style.imageRendering = 'pixelated'; //chrome, edge and apparently safari
    canvas.style.setProperty('image-rendering', 'crisp-edges'); //firefox
    canvas.style.setProperty('image-rendering', '-moz-crisp-edges');
    canvas.style.setProperty('image-rendering', '-webkit-optimize-contrast');

    const hologramCanvas = hologramRenderer.domElement;
    hologramCanvas.style.position = 'absolute';
    hologramCanvas.style.top = '50%';
    hologramCanvas.style.left = '50%';
    hologramCanvas.style.transform = 'translate(-50%, -50%)';
    hologramCanvas.style.width = '100%';
    hologramCanvas.style.height = '100%';
    hologramCanvas.style.objectFit = 'contain';
    hologramCanvas.style.pointerEvents = 'none';
    hologramCanvas.style.zIndex = '1';

    container.appendChild(renderer.domElement);
    container.appendChild(hologramCanvas);

    const renderHolograms = (scene: THREE.Scene, camera: THREE.Camera) => {
        const previousBackground = scene.background;
        const previousLayerMask = camera.layers.mask;
        try {
            scene.background = null;
            camera.layers.set(1);
            hologramRenderer.render(scene, camera);
        } finally {
            scene.background = previousBackground;
            camera.layers.mask = previousLayerMask;
        }
    };

    //Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5,10,7);
    scene.add(light, new THREE.AmbientLight(0xffffff));

    //Suelo
    //const grid = new THREE.GridHelper(20, 20, 0xffffff, 0x444444);
    //scene.add(grid);

    const resizeObserver = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (!width || !height) return;

        const renderHeight = VIRTUAL_HEIGHT;
        const renderWidth = Math.max(1, Math.round(renderHeight * width / height));
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(renderWidth, renderHeight, false);
        hologramRenderer.setSize(
            renderWidth * HOLOGRAM_SCALE,
            renderHeight * HOLOGRAM_SCALE,
            false
        );
    });
    resizeObserver.observe(container);

    const cleanup = () => {
        resizeObserver.disconnect();
        container.removeChild(renderer.domElement);
        container.removeChild(hologramCanvas);
        renderer.dispose();
        hologramRenderer.dispose();

    };

    return { scene, camera, renderer, renderHolograms, cleanup};
}