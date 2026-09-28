import { send } from "node:process";
import * as THREE from "three";

export function createScene(container: HTMLElement)
{
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e24);


    const VIRTUAL_WIDTH = 256;
    const VIRTUAL_HEIGHT = 224;

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

    container.appendChild(renderer.domElement);

    //Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5,10,7);
    scene.add(light, new THREE.AmbientLight(0xffffff));

    //Suelo
    //const grid = new THREE.GridHelper(20, 20, 0xffffff, 0x444444);
    //scene.add(grid);

    const HandleResize = () => {
        // camera.aspect = VIRTUAL_WIDTH / VIRTUAL_HEIGHT;
        // camera.updateProjectionMatrix();
        // renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', HandleResize);

    const cleanup = () => {
        window.removeEventListener('resize', HandleResize);
        container.removeChild(renderer.domElement);
        renderer.dispose();

    };

    return { scene, camera, renderer, cleanup};
}