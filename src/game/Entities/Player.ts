import { Vector3 } from "babylonjs";

export enum Team {
    Blue,
    Red
}

export class Player {
    public Id: string;
    public Team: Team;

    public Body: BABYLON.AbstractMesh;
    public Pivot: BABYLON.AbstractMesh;
    public AttackMesh: BABYLON.AbstractMesh;
    public LastLife: number;

    public executeAttack: boolean;

    public InitialPosition: any;

    constructor(id) {
        this.Id = id;
        this.executeAttack = false;
        this.LastLife = 10;
    }

    Reset = () => {
        this.SetPosition(this.InitialPosition);
    }

    TakeDamage = () => {
        this.Move({ x: Math.random() * 100, z: Math.random() * 100 }, 100);

        setTimeout(() => {
            this.Move({ x: 0, z: 0 }, 0);
        }, 100);
    }

    Attack = (scene) => {
        if(this.Pivot != null) 
        {
            return;
        }

        this.Pivot = BABYLON.MeshBuilder.CreateBox("myPivot", { size: 0.1 }, scene);
        this.Pivot.isVisible = false;
        this.AttackMesh = BABYLON.MeshBuilder.CreateBox("myBox", { depth: 2, width: 0.2, height: 0.5 }, scene);

        this.Pivot.parent = this.Body;
        this.AttackMesh.parent = this.Pivot;
        
        this.AttackMesh.position.x = this.Pivot.position.x + 2;
        this.AttackMesh.position.y = this.Pivot.position.y + 1.5;

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseColor = new BABYLON.Color3(1,1,1);
        myMaterial.specularColor = new BABYLON.Color3(1,1,1);
        myMaterial.emissiveColor = new BABYLON.Color3(1,1,1);
        myMaterial.ambientColor = new BABYLON.Color3(1,1,1);

        this.AttackMesh.material = myMaterial;

        setTimeout(() => {
            this.AttackMesh.dispose();
            this.Pivot.dispose();

            this.Pivot = null;
            this.AttackMesh = null;
        }, 300);
    }

    Move = (direction, impulse) => {
        let impulseDirection = new Vector3(direction.x, 0, direction.z);
        impulseDirection.normalize();
       
        // @ts-ignore
        this.Body.physicsImpostor.setLinearVelocity(impulseDirection.scale(impulse));
    }

    SetPosition = (position) => this.Body.position.set(position.x, position.y, position.z);
}