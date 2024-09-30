import { Splat } from './Splat';
import { Camera, Clock,  Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader} from 'three';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader.js';



export class SplatQueue {

    //scene properties
    currentScene : THREE.Scene;

    //splat properties
    currentSplat: Splat;
    currentSplatIndex: number;
    splats: Splat[];

    //time properties
    sequenceLength: number;
    timer:THREE.Clock;

    isFinished: boolean;
    hasStarted:boolean;

    camera:Camera;

    constructor(scene:THREE.Scene)
    {
        this.currentSplatIndex = 0  ;
        this.timer = new Clock();
        this.timer.stop();
        this.sequenceLength = -1;
        this.splats = [];
        this.currentScene = scene;
        this.isFinished = false;
        this.hasStarted = false;
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

        let geo = new PlaneGeometry();
        let loader = new TIFFLoader();
        let planeMesh = new Mesh();


        console.log("load credits");

        const texture = new TextureLoader().load('tex/SparkEndCard.jpg');

        const mat = new MeshBasicMaterial({map:texture});
        planeMesh.geometry = geo;
        planeMesh.material = mat;
        planeMesh.position.set(0,0,4);

        this.currentScene.add(planeMesh)
        //this.currentScene.background = new Color("white");
    }

}
