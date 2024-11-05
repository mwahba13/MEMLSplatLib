import * as three from "three";
import * as Splat from "../src/Splat";
import * as SplatQueue from "../src/SplatQueue";

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
let vest_splat = new Splat.Splat("https://lumalabs.ai/capture/3eb8494d-5dda-43ea-96fd-c5b6802f394d");

//add splat objects to queue
splatQueue.AddSplatToQueue(vest_splat);

//-----RENDER LOOP--------
animate();

function animate()
{
    renderer.setAnimationLoop(function () {
        renderer.render(scene, camera);
        splatQueue.Tick();
    })
}