import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from "three";

export class Compass{
    xPoints:Vector3[] = [];
    yPoints:Vector3[] = [];
    zPoints:Vector3[] = [];

    AddToScene(scene:THREE.Scene){
        //X line = red
        const xMat = new LineBasicMaterial({color:0xfc0303});
        this.xPoints.push(new Vector3(0,0,0));
        this.xPoints.push(new Vector3(10,0,0));
        const xGeom = new BufferGeometry().setFromPoints(this.xPoints);
        const xLine = new Line(xGeom,xMat);

        //Y line = blue
        const yMat = new LineBasicMaterial({color:0xfbff00});
        this.yPoints.push(new Vector3(0,0,0));
        this.yPoints.push(new Vector3(0,10,0));
        const yGeom = new BufferGeometry().setFromPoints(this.yPoints);
        const yLine = new Line(yGeom,yMat);
        
        //Z line = Green
        const zMat = new LineBasicMaterial({color:0x33ff00});
        this.zPoints.push(new Vector3(0,0,0));
        this.zPoints.push(new Vector3(0,0,10));   
        const zGeom = new BufferGeometry().setFromPoints(this.zPoints);
        const zLine = new Line(zGeom,zMat);
        
        scene.add(xLine);
        scene.add(yLine);
        scene.add(zLine);
        
    }
}