import { Splat } from "./Splat";
import { Clock } from "three";

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
