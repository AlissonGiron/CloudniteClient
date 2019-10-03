import * as BABYLON from 'babylonjs';
import { OBJFileLoader } from 'babylonjs-loaders';
import { ShadowGenerator, AbstractMesh } from "babylonjs";
import { Team, Player } from '../Entities/Player';

export default class RenderManager {
    public shadowGenerator: ShadowGenerator;
    public ground: AbstractMesh;
    public camera: BABYLON.ArcRotateCamera;
    public scene: BABYLON.Scene;
    public canvas: HTMLCanvasElement;
    public engine: BABYLON.Engine;

    constructor() {
        this.canvas = document.getElementById('game') as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        this.scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.CannonJSPlugin());
        this.scene.gravity.set(0,0,0);
        this.camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 10, new BABYLON.Vector3(0, 1.5, 0), this.scene);

        // Limites para a camera
        this.camera.lowerRadiusLimit = 5;
        this.camera.upperRadiusLimit = 30;
        this.camera.upperBetaLimit = Math.PI * (2/4);

        this.camera.attachControl(this.canvas, true);

        // Arrumar texturas
        OBJFileLoader.OPTIMIZE_WITH_UV = true;

        var light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0,-1,0), this.scene);
        light.intensity = 1;
        light.position = new BABYLON.Vector3(0,10,0);

        // @ts-ignore
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, light);

        this.LoadSkyBox();
        this.LoadMap();
    }

    LoadSkyBox = () => {
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 3000.0, this.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../src/textures/skybox", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial; 
    }

    LoadPlayer = (player, key, sessionId, callback) => {
        var newPlayer = new Player(key);
        newPlayer.Team = player.team == 0 ? Team.Blue : Team.Red;
        var charObj = "chr_blue.obj";

        if(newPlayer.Team == Team.Red) {
            charObj = "chr_red.obj";
        }

        BABYLON.SceneLoader.ImportMesh("", "../src/scenes/Char/", charObj, this.scene, (newMeshes: any) => {

            var moveX = -80;

            if(newPlayer.Team == Team.Red) {
                moveX *= -1;
            }

            newMeshes[0].position.set(player.position.x + moveX, player.position.y, player.position.z);

            newMeshes[0].material = this.CreatePlayerMaterial(newPlayer.Team);

            newMeshes.forEach((mesh) => {
                this.shadowGenerator.addShadowCaster(mesh);
                mesh.receiveShadows = true;
            });

            newMeshes[0].scaling = new BABYLON.Vector3(2, 2, 2);
            newMeshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(newMeshes[0], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10, restitution: 0.3, friction: 0 }, this.scene);
            
            newMeshes[0].physicsImpostor.physicsBody.collisionFilterGroup = 1;
            newMeshes[0].physicsImpostor.physicsBody.collisionFilterMask = 2;

            this.shadowGenerator.addShadowCaster(newMeshes[0]);
            
            if (key === sessionId) {
                this.camera.parent = newMeshes[0];
            }

            newMeshes[0].position.y = this.ground.position.y - 8;

            newPlayer.Body = newMeshes[0];
            newPlayer.InitialPosition = newMeshes[0].position;

            callback(newPlayer);
        });
    };

    LoadMap = () => BABYLON.SceneLoader.ImportMesh("", "../src/scenes/", "cloudniteMap.obj", this.scene, (newMeshes) => {
        var material = new BABYLON.StandardMaterial("material", this.scene);
        material.diffuseTexture = new BABYLON.Texture("../src/scenes/cloudniteMap.png", this.scene);
        material.specularTexture = new BABYLON.Texture("../src/scenes/cloudniteMap.png", this.scene);
        material.emissiveTexture = new BABYLON.Texture("../src/scenes/cloudniteMap.png", this.scene);
        material.ambientTexture = new BABYLON.Texture("../src/scenes/cloudniteMap.png", this.scene);
        newMeshes[0].material = material;
    
        newMeshes[0].scaling = new BABYLON.Vector3(20, 20, 20);
    
        newMeshes.forEach((mesh) => {
            this.shadowGenerator.addShadowCaster(mesh);
            mesh.receiveShadows = true;
            mesh.checkCollisions = true;
        });
    
        newMeshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(newMeshes[0], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10, restitution: 0.3, friction: 0 }, this.scene);
        newMeshes[0].physicsImpostor.physicsBody.collisionFilterGroup = 1;
    
        // @ts-ignore
        this.ground = newMeshes[0];
    });

    CreatePlayerMaterial = (team: Team) => {
        var material = new BABYLON.StandardMaterial("material", this.scene);

        if(team == Team.Blue) {
            material.diffuseTexture = new BABYLON.Texture("../src/scenes/Char/chr_blue.png", this.scene);
            material.specularTexture = new BABYLON.Texture("../src/scenes/Char/chr_blue.png", this.scene);
            material.emissiveTexture = new BABYLON.Texture("../src/scenes/Char/chr_blue.png", this.scene);
            material.ambientTexture = new BABYLON.Texture("../src/scenes/Char/chr_blue.png", this.scene);
        }
        else {
            material.diffuseTexture = new BABYLON.Texture("../src/scenes/Char/chr_red.png", this.scene);
            material.specularTexture = new BABYLON.Texture("../src/scenes/Char/chr_red.png", this.scene);
            material.emissiveTexture = new BABYLON.Texture("../src/scenes/Char/chr_red.png", this.scene);
            material.ambientTexture = new BABYLON.Texture("../src/scenes/Char/chr_red.png", this.scene);
        }

        return material;
    }
}