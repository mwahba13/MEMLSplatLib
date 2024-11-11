import { Splat } from "../../src/Splat";


export class Dandelion extends Splat
{
    override SetShaderHooks(): void {
        super.lumaSplat.setShaderHooks({
            vertexShaderHooks:{
                additionalUniforms:{
                    minX:['float',new Uniform(super.boundingBox.min.x)],
                    maxX:['float',new Uniform(super.boundingBox.max.x)],
                    minY:['float',new Uniform(super.boundingBox.min.y)],
                    maxY:['float',new Uniform(super.boundingBox.max.y)],
                    minZ:['float',new Uniform(super.boundingBox.min.z)],
                    maxZ:['float',new Uniform(super.boundingBox.max.z)],
                    opacity:['float',super.opacityUni],
                    time:['float',super.time],
                    x:['float',super.xUni],
                    y:['float',super.yUni],
                    z:['float',super.zUni],
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
}