import { Room } from 'colyseus.js';
import { Player } from '../Entities/Player';

export default class GameManager {
    private UpdatesPerSecond: number;
    private Room: Room;
    private scene: BABYLON.Scene;
    public Players: Array<Player>;

    constructor(room, scene) {
        this.Room = room;
        this.scene = scene;
        this.UpdatesPerSecond = 15;

        this.Players = new Array<Player>();

        setInterval(this.Update, (1000 / this.UpdatesPerSecond));
    }

    AddPlayer = (player: Player) => {
        this.Players.push(player);
    }

    GetPlayer = (key: string) => {
        return this.Players.filter(e => e.Id == key)[0];
    }

    DeletePlayer = (key: string) => {
        this.Players = this.Players.filter(e => e.Id != key);
    }

    Update = () => {
        var player = this.GetPlayer(this.Room.sessionId);

        if(player) {
            this.Room.send(['position', { name: player.Id, x: player.Body.position.x, z: player.Body.position.z, y: player.Body.position.y }]);
            
            this.Room.send(['attack', { name: player.Id, attack: player.executeAttack }]);
            player.executeAttack = false;

            var vecToLocal = (vector, mesh) => {
                var m = mesh.getWorldMatrix();
                var v = BABYLON.Vector3.TransformCoordinates(vector, m);
                return v;		 
            }

            var origin = player.Body.position;
        
            var forward = new BABYLON.Vector3(0,0,1);		
            forward = vecToLocal(forward, player.Body);
        
            var direction = forward.subtract(origin);
            direction = BABYLON.Vector3.Normalize(direction);
        
            var length = 100;
        
            var ray = new BABYLON.Ray(origin, direction, length);
    
            var hit = this.scene.pickWithRay(ray);

            BABYLON.RayHelper.CreateAndShow(ray, this.scene, new BABYLON.Color3(1, 1, 0.1));
    
            if (hit.pickedMesh) {
                debugger
            }
        }
    }
}