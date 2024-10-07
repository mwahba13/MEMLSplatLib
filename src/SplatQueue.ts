import { Splat } from './Splat';
import { Camera, Clock,  Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader, Scene} from 'three';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader.js';



export class SplatQueue {

    //scene properties
    currentScene : Scene;

    //splat properties
    currentSplat: Splat;
    currentSplatIndex: number;
    splats: Splat[];

    //time properties
    sequenceLength: number;
    timer: Clock;

    isFinished: boolean;
    hasStarted: boolean;
    loop: boolean;

    camera:Camera;

    constructor(scene: Scene, camera: Camera)
    {
        this.currentSplatIndex = 0  ;
        this.timer = new Clock();
        this.timer.stop();
        this.sequenceLength = -1;
        this.splats = [];
        this.currentScene = scene;
        this.isFinished = false;
        this.hasStarted = false;
        this.loop = false;
        this.camera = camera;
    }

    public AddSplatToQueue(splat:Splat)
    {
        if(this.splats.length == 0)
        {
            this.currentSplat = splat;
            this.currentSplat.AddToScene(this.currentScene);
            this.sequenceLength = splat.sceneTimer;
            
        }

        this.splats.push(splat);

    }

    public LoadSceneByIndex(i:number)
    {
        console.log("load splat");
        if(!this.isFinished)
            {
                if(this.timer.getElapsedTime() == 0 && this.hasStarted)
                {
                    console.log("start timer");
                    this.timer.start();
                }

                this.currentSplatIndex = i;
                if(this.currentSplatIndex >= this.splats.length)
                {
                    return;
                }
                else
                {
                    //remove old scene
                    this.currentSplat.RemoveFromScene();
    
                    //add new scene
                    this.currentSplat = this.splats[this.currentSplatIndex];
    
    
                    this.currentSplat.AddToScene(this.currentScene);
    
                    this.currentSplat.StartScene();
                    this.sequenceLength = this.currentSplat.sceneTimer;
    
                    this.timer.start();
                    //transition to next scene
                }
                
            }
    }

    public Tick()
    {
        //check if time is up
        if(!this.isFinished)
        {
            this.LoadNextSplat();

            if(this.isFinished)
            {
                return ;
            }

            this.currentSplat.Tick(this.timer);
        }
    }

    public StartSplatQueue()
    {
        this.hasStarted = true;
    }

    private LoadNextSplat()
    {
        if(!this.isFinished)
        {
            if(this.timer.getElapsedTime() == 0 && this.hasStarted)
            {
                console.log("start timer");
                this.timer.start();
            }
            //if time is up, load next splat
            if(this.timer.getElapsedTime() > this.sequenceLength)
            {
                this.currentSplatIndex++;
                if(this.currentSplatIndex >= this.splats.length)
                {
                    //we hit the end
                    console.log("end of queue");
                    this.isFinished = true;
                    this.timer.stop();

                    this.currentSplat.EndScene();
                    this.currentSplat.RemoveFromScene();

                    this.OnFinish();
                }
                else
                {
                    //remove old scene
                    this.currentSplat.EndScene();
                    this.currentSplat.RemoveFromScene();

                    this.camera.position.set(0,0,0);
    
                    //add new scene
                    this.currentSplat = this.splats[this.currentSplatIndex];
                    this.currentSplat.AddToScene(this.currentScene);
    
                    this.currentSplat.StartScene();
                    this.sequenceLength = this.currentSplat.sceneTimer;
    
                    this.timer.start();
                    //transition to next scene
                }
            } 
        }
        
    }

    private OnFinish()
    {
        if(this.loop)
        {
            this.timer = new Clock();
            this.isFinished = false;
            this.hasStarted = true;
            this.currentSplatIndex = 0;
            this.LoadSceneByIndex(0);            
        }
    }

}
