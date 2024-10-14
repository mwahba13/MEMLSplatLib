import { LumaSplatsThree } from '@lumaai/luma-web';
import "./SplatAction";
import { Box3,  Clock, Color,  FogExp2,  Mesh, MeshBasicMaterial, SphereGeometry, Uniform, Vector3, Vector4 } from 'three';

//basic splat - can be cropped and transformed
export class Splat{
    //luma
    private uri:string;
    private lumaSplat:LumaSplatsThree;

    //transform
    position:Vector3;
    rotation:Vector3;
    rgba:Vector4;
    opacity: number;
    
    private opacityUni:Uniform;
    private time:Uniform;

    //uniforms
    x:number;
    y:number;
    z:number;
    private colAdj:number;
    private xUni:Uniform;
    private yUni:Uniform;
    private zUni:Uniform;
    private colAdjUni:Uniform;
    
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