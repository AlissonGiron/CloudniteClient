import Keycode from "keycode.js";
import GameManager from './GameManager';
import { Vector3 } from "babylonjs";

export default class InputManager { 
    private keyboard = { x: 0, y: 0 };
    private isLocked = false;

    constructor(key, renderManager, gameManager: GameManager) {
        window.addEventListener("keydown", (e) => {
            var forward = renderManager.camera.getFrontPosition(1).subtract(renderManager.camera.position);
            forward.y = 0;
            var diffAngle = Math.atan2(forward.x,forward.z);
            var angle = 0;

            if (e.which === Keycode.A) 
            {
                angle = diffAngle - (Math.PI/2);
                this.keyboard.x = -1;
            }
            else if (e.which === Keycode.D) 
            {
                angle = diffAngle + (Math.PI/2);
                this.keyboard.x = 1;
            } 
            else if (e.which === Keycode.W)
            {
                angle = diffAngle;
                this.keyboard.y = 1;
            } 
            else if (e.which === Keycode.S)
            {
                angle = diffAngle + (Math.PI);
                this.keyboard.y = -1;
            }

            gameManager.GetPlayer(key).Move(renderManager.camera.getDirection(new Vector3(this.keyboard.x, 0, this.keyboard.y)), 25);
        });

        window.addEventListener("click", (e) => { 
            gameManager.GetPlayer(key).executeAttack = true;
        });

        window.addEventListener("keyup", (e) => {
            if (e.which === Keycode.A)
            {
                this.keyboard.x = 0;
            } 
            else if (e.which === Keycode.D) 
            {
                this.keyboard.x = 0;
            } 
            else if (e.which === Keycode.W) 
            {
                this.keyboard.y = 0;
            } 
            else if (e.which === Keycode.S)
            {
                this.keyboard.y = 0;
            }
            else if (e.which === Keycode.SPACE) 
            {
                gameManager.GetPlayer(key).executeAttack = true;
            }

            gameManager.GetPlayer(key).Move(renderManager.camera.getDirection(new Vector3(this.keyboard.x, 0, this.keyboard.y)), 25);
        });

        renderManager.scene.onPointerDown = (evt) => {
            if (!this.isLocked) {
                renderManager.canvas.requestPointerLock = renderManager.canvas.requestPointerLock || renderManager.canvas.msRequestPointerLock || renderManager.canvas.mozRequestPointerLock || renderManager.canvas.webkitRequestPointerLock;
                if (renderManager.canvas.requestPointerLock) {
                    renderManager.canvas.requestPointerLock();
                }
            }
        };
        
        var pointerlockchange = () => {
            //@ts-ignore
            var controlEnabled = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null;
            
            if (!controlEnabled) {
                this.isLocked = false;
            } else {
                this.isLocked = true;
            }
        };
        
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    }
}