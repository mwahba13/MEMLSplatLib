import { LumaSplatsThree } from '@lumaai/luma-web';
import { Box3, BoxGeometry, Camera, Clock, Color, Fog, FogExp2, Light, Mesh, MeshBasicMaterial, PlaneGeometry, PointLight, SRGBColorSpace, SphereGeometry, TextureLoader, Uniform, Vector3, Vector4 } from 'three';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader.js';

//basic splat - can be cropped and transformed
export class Splat{
    //luma
    uri:string;
    lumaSplat:LumaSplatsThree;

    //transform
    position:Vector3;
    rotation:Vector3;
    rgba:Vector4;
    opacity: number;
    opacityUni:Uniform;
    time:Uniform;

    //uniforms
    x:number;
    y:number;
    z:number;
    colAdj:number;
    xUni:Uniform;
    yUni:Uniform;
    zUni:Uniform;
    colAdjUni:Uniform;
    
    //box
    boundingBox:Box3;
    debugDrawBoundingBox: boolean;

    //scene
    scene:THREE.Scene;

    //timing
    sceneTimer:number;

    //actions
    splatActions:SplatAction[];
    splatActionIndex:number;

    //interp
    interpXt:number = 0.;
    interpYt:number = 0.;
    interpZt:number = 0.;

    //fog
    sceneFog:FogExp2;
    backgrndColor:Color;

    constructor(uri:string, pos:Vector3 = new Vector3(0,0,0), rot:Vector3 = new Vector3(0,0,0))
    {
        this.opacityUni = new Uniform(1);
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.colAdj = 0;
        this.xUni = new Uniform(1);
        this.yUni = new Uniform(1);
        this.zUni = new Uniform(1);
        this.opacity = 1;
        this.time = new Uniform(0);

        this.uri = uri;
        this.position = pos;
        this.rotation = rot;
        this.lumaSplat = new LumaSplatsThree({
            source:uri,
            onBeforeRender:()=>{
                this.opacityUni.value = this.opacity;
                this.time.value = performance.now()/1000;
                this.xUni.value = this.x;
                this.yUni.value = this.y;
                this.zUni.value = this.z;
            }
        });
        this.boundingBox = new Box3;
        this.sceneTimer = 0;

        this.splatActions = [];
        this.splatActionIndex = 0;
        
    }

    public EnqueueSplatAction(action:SplatAction, time:number)
    {
        action.actionTime = time;
        this.splatActions.push(action);
    }

    public AddToScene(scene:THREE.Scene)
    {
        this.scene = scene;

        if(this.debugDrawBoundingBox)
        {
            //minSphere - red
            const minGeom = new SphereGeometry(.1);
            const minMat = new MeshBasicMaterial({color:0xf54242 });
            const minSphere = new Mesh(minGeom,minMat);

            //max Sphere - green
            const maxGeom = new SphereGeometry(.1);
            const maxMat = new MeshBasicMaterial({color:0x72f542 });
            const maxSphere = new Mesh(maxGeom,maxMat);

            let localMin = this.lumaSplat.worldToLocal(this.boundingBox.min);
            let localMax = this.lumaSplat.worldToLocal(this.boundingBox.max);


            minSphere.position.set(localMin.x,localMin.y,localMin.z);
            maxSphere.position.set(localMax.x,localMax.y,localMax.z);

            scene.add(minSphere);
            scene.add(maxSphere);
        }

        this.lumaSplat.position.set(this.position.x,this.position.y,this.position.z);
        this.lumaSplat.rotation.set(this.rotation.x,this.rotation.y,this.rotation.z);

        scene.add(this.lumaSplat);

        if(this.sceneFog)
        {
            scene.fog = this.sceneFog;
        }

        scene.background = this.backgrndColor;
        
    }

    public RemoveFromScene()
    {
        this.scene.remove(this.lumaSplat);
    }

    public SetShaderHooks()
    {

        this.lumaSplat.setShaderHooks({
            vertexShaderHooks:{
                additionalUniforms:{
                    minX:['float',new Uniform(this.boundingBox.min.x)],
                    maxX:['float',new Uniform(this.boundingBox.max.x)],
                    minY:['float',new Uniform(this.boundingBox.min.y)],
                    maxY:['float',new Uniform(this.boundingBox.max.y)],
                    minZ:['float',new Uniform(this.boundingBox.min.z)],
                    maxZ:['float',new Uniform(this.boundingBox.max.z)],
                    opacity:['float',this.opacityUni],
                    time:['float',this.time],
                    x:['float',this.xUni],
                    y:['float',this.yUni],
                    z:['float',this.zUni],
                },
                getSplatColor:`
                    (vec4 rgba, vec3 pos, uint layersBitmask){
                        return rgba;
                        
                    }
                `,
                getSplatTransform:`
                    (vec3 pos, uint layersBitMask)
                    {
                        float x = 0.;
                        float y = 0.;
                        float z = 0.;
                        return mat4(
                            1.,0.,0.,0.,
                            0.,1.,0.,0.,
                            0.,0.,1.,0.,
                            x, y, z, 1.                         
                        );
                    }
                `,
            }
        })
    }

    public StartScene()
    {

    }

    public EndScene()
    {

    }

    protected OnTick(clock:Clock){

    }

    public Tick(clock:Clock)
    {
        this.OnTick(clock);
        //if we havent hit the end of the splat action queue
        if(this.splatActionIndex != -1)
        {
            let currentAction = this.splatActions[this.splatActionIndex];
            if(currentAction)
            {
                if(clock.elapsedTime >= currentAction.actionTime)
                {
                    //hit time to execute action
                    if(this.splatActions[this.splatActionIndex].executeAction(clock))
                    {
            
                        //increment index
                        this.splatActionIndex++;
                        if(this.splatActions.length == this.splatActionIndex)
                        {
                            this.splatActionIndex = -1;
                        }
                    }

        
                }
            }

        }


    }

    public SetFogObj(color:Color, density:number)
    {
        this.sceneFog = new FogExp2(color,density);
    }

    public SetBackgroundColor(color:Color)
    {
        this.backgrndColor = color;
    }

    public SetPosition(newX:number,newY:number,newZ:number)
    {
        this.position = new Vector3(newX,newY,newZ);
    }

    public SetRotation(newX:number,newY:number,newZ:number)
    {
        this.rotation = new Vector3(newX,newY,newZ);
    }
}


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

abstract class SplatAction {

    actionTime:number = 0;

    protected splatOwner:Splat;
    public abstract executeAction(clock:Clock): boolean;
    
    constructor(splat:Splat)
    {
        this.splatOwner = splat;
        this.actionTime = 0;
    }
}

export class DebugAction extends SplatAction{

    public executeAction(clock:Clock): boolean {
        console.log("action executed");
        return true;

    }

}

export class ChangeXValueAction extends SplatAction{

    param:number;

    constructor(splat:Splat,num:number)
    {
        super(splat);
        this.param = num;
    }

    public executeAction(clock:Clock): boolean {
        this.splatOwner.x = this.param;
        return true;

    }
}

export class ChangeYValueAction extends SplatAction{
    param:number;

    constructor(splat:Splat,num:number)
    {
        super(splat);
        this.param = num;
    }
    
    public override executeAction(clock:Clock):boolean {
        let newY = this.param;
        this.splatOwner.y = newY; 
        return true;

    }
}

export class ChangeZValueAction extends SplatAction{

    param:number;

    constructor(splat:Splat,num:number)
    {
        super(splat);
        this.param = num;
    }

    public executeAction(clock:Clock): boolean {
        let newZ = this.param;
        this.splatOwner.z = newZ; 
        return true;
    }
}

export class SetXInterpAction extends SplatAction
{
    x:number;
    y:number;
    timeRange:number = -1;
    constructor(splat:Splat,num:number)
    {
        super(splat);
    }

    public executeAction(clock: Clock): boolean {




        return false;
    }
}