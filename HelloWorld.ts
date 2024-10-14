import * as three from "three";
import * as Splat from "./src/Splat";
import * as SplatQueue from "./src/SplatQueue";
import { DebugAction } from "./src/SplatAction";

//Example showing capability to have multiple splats strung together in sequence

//---INITIALIZATION---
//https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

//setup renderer 
let renderer = new three.WebGLRenderer({});
renderer.setSize(window.innerWidth, window.innerHeight, false);
document.body.appendChild(renderer.domElement);

//init scene
let scene = new three.Scene();

//init camera
let camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;

//init splat queue
let splatQueue = new SplatQueue.SplatQueue(scene, camera);

//init splat objects
let statue_splat = new Splat.Splat("https://lumalabs.ai/capture/f45a5f26-3b70-4bfa-9c7a-5d95a1df942f");
statue_splat.sceneTimer = 5;
statue_splat.EnqueueSplatAction(new DebugAction(statue_splat), 2);


let deer_splat = new Splat.Splat("https://lumalabs.ai/capture/422972cb-59f7-46e0-87dc-36015cb7286b");
deer_splat.sceneTimer = 5;

let vest_splat = new Splat.Splat("https://lumalabs.ai/capture/067b46c8-d737-42be-9112-a4654a506855");
vest_splat.sceneTimer = 5;

//add splat objects to queue
splatQueue.AddSplatToQueue(statue_splat);
splatQueue.AddSplatToQueue(deer_splat);
splatQueue.AddSplatToQueue(vest_splat);


//-----RENDER LOOP--------
splatQueue.StartSplatQueue();
animate();

function animate()
{
    renderer.setAnimationLoop(function () {
        renderer.render(scene, camera);
        splatQueue.Tick();
    })
}