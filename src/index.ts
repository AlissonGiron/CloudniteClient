import "./index.css";
import { client } from "./game/network";
import { StateHandler } from "../../server/src/rooms/StateHandler";

import GameManager from './game/Managers/GameManager';
import RenderManager from './game/Managers/RenderManager';
import InputManager from './game/Managers/InputManager';

let renderManager: RenderManager = new RenderManager();

client.joinOrCreate<StateHandler>("game").then(room => {
    var gameManager: GameManager = new GameManager(room, renderManager.scene);
    new InputManager(room.sessionId, renderManager, gameManager);

    room.state.players.onAdd = (player, key) => renderManager.LoadPlayer(player, key, room.sessionId, (newPlayer) => gameManager.AddPlayer(newPlayer));

    room.state.onChange = (change) => {

        var reset = change.filter(e => e.field == "reset")[0];

        if(reset) {
            gameManager.Players.forEach(element => {
                element.Reset();
            });
        }

        var state = change.filter(e => e.field == "state")[0];

        if (state) {
            //@ts-ignore
            showMessage(state.value.message, state.value.priority, state.value.time)
        }

        var domination = change.filter(e => e.field == "domination")[0];

        if(domination) {
            var team = domination.value.team;
            var percentage = domination.value.percentage;

            var progressBar = document.getElementById("dominationBarProgress");

            progressBar.style.width = percentage + "%";

            if(team == 0) {
                progressBar.style.backgroundColor = "blue";
            }
            else {
                progressBar.style.backgroundColor = "red";
            }
        }
    }

    room.state.players.onChange = (player) => {
        var p = gameManager.GetPlayer(player.name);
        
        if(room.sessionId !== player.name) {

            if(p) {
                p.SetPosition(player.position);
            }
        }
        else {
            //@ts-ignore
            updateLife(player.life);

            if(player.life != p.LastLife) {
                p.TakeDamage();
            }

            if(player.life > p.LastLife) {
                p.Reset();
            }

            p.LastLife = player.life;
        }

        if(player.executeAttack) {
            if(p) {
                p.Attack(renderManager.scene);
            }
        }
    };

    room.state.players.onRemove = (player, key) => {
        // @ts-ignore
        this.scene.removeMesh(gameManager.GameState.GetPlayer(key).Body);
        gameManager.DeletePlayer(key);
    };

    renderManager.scene.registerBeforeRender(() => {
        gameManager.Players.forEach(element => {
            if(element.Pivot != null)
            {
                element.Pivot.rotation.y -= 0.5;

                if(element.AttackMesh != null) {
                    element.AttackMesh.rotation.z -= 5;
                }
            }
        });
    });

    window.addEventListener('resize', () => renderManager.engine.resize());
});

renderManager.engine.runRenderLoop(() => renderManager.scene.render());