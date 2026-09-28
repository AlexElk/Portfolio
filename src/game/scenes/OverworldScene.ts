import * as THREE from "three";
import { Player } from "../Player";
import { InputHandler } from "../InputHandler";
import { IScene, SceneManager } from "../SceneManager";
import { CameraController } from "../CameraController";
import { HouseInteriorScene } from "./HouseInteriorScene";


export class OverworldScene implements IScene{
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    private player: Player;
    private cameraController: CameraController;
    private houses: THREE.Mesh[] = [];
    private sceneManager: SceneManager;

    constructor(domElement: HTMLElement, sceneManager: SceneManager){
        this.sceneManager = sceneManager;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101014);

        this.camera = new THREE.PerspectiveCamera(75, 256 / 224, 0.1, 1000);
        this.cameraController = new CameraController(this.camera, domElement);

        const grid = new THREE.GridHelper(30, 30, 0xffffff, 0x444444);
        this.scene.add(grid);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5,10,7);
        this.scene.add(light, new THREE.AmbientLight(0xffffff));

        this.player = new Player();
        this.scene.add(this.player.mesh);

        this.createHouse(-5, -5);
        this.createHouse(5, -8);
        this.createHouse(0, -12);
    }

    private createHouse(x: number, z: number){
        const geometry = new THREE.BoxGeometry(3,3,3);
        const material = new THREE.MeshBasicMaterial({color: 0x885a5f});
        const house = new THREE.Mesh(geometry, material);
        house.position.set(x,1.5,z);

        //Doa
        const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMat = new THREE.MeshBasicMaterial({color: 0xffcc00});
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, -0.75, 1.51);
        house.add(door);

        this.scene.add(house);
        this.houses.push(house);
    }

    public update(input: InputHandler)
    {
        this.player.update(input, this.cameraController.yaw);
        this.cameraController.update(this.player.mesh.position);

        this.houses.forEach((house) => {
            const distance = this.player.mesh.position.distanceTo(house.position);

            if (distance < 2.5 && input.keys.w){
                console.log("House entering");
                this.sceneManager.changeScene(
                    new HouseInteriorScene(this.cameraController.domElement || document.body, this.sceneManager),
                    'INTERIOR'
                );
            }
        });
    }

    public destroy(): void {
        this.scene.clear();
    }

}