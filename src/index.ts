import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";


// Canvas
export interface CanvasProperty {
    name: string;
    compositeOperation: string;
    hidden: boolean;
}
interface XylographCanvas {
    xylograph: CanvasProperty;
}
export type Canvas<T> = T & XylographCanvas;
export type CanvasArray<T> = Canvas<T>[];
export type CanvasIndexMap = {[canvasName: string]: number};

// Xylograph option
export type CreateCanvasFunction<T> = (width: number, height: number) => T;
export type xylographOption<T> = {
    createCanvasFunction: CreateCanvasFunction<T>;
    canvasWidth?: number;
    canvasHeight?: number;
};


// Event
export type AddCanvasEventListener = {
    <T>(canvas: Canvas<T>, canvasName: string): void
};
export type RemoveCanvasEventListener =  {
    (canvasName: string): void;
};
export type MoveCanvasEventListener = {
    <T>(canvases: CanvasArray<T>): void;
};
export type SetCanvasesEventListener = {
    <T>(canvases: CanvasArray<T>): void;
};
export type RenameCanvasEventListener = {
    <T>(canvas: Canvas<T>, newCanvasName: string, targetCanvasName: string): void;
};
interface Events {
    addCanvas: AddCanvasEventListener;
    removeCanvas: RemoveCanvasEventListener;
    moveCanvas: MoveCanvasEventListener;
    SetCanvases: SetCanvasesEventListener;
    renameCanvas: RenameCanvasEventListener;
}
type XylographEmitterEvent = StrictEventEmitter<EventEmitter, Events>;


// Class
export class Xylograph<T> extends (EventEmitter as {new(): XylographEmitterEvent}) {
    private createCanvas: CreateCanvasFunction<T>;
    private canvasWidth: number;
    private canvasHeight: number;
    private canvases: CanvasArray<T>;
    private canvasIndexes: CanvasIndexMap;

    constructor(opt: xylographOption<T>) {
        super();

        // Set canvas size
        this.canvasWidth = (opt.canvasWidth)? opt.canvasWidth : 200;
        this.canvasHeight = (opt.canvasHeight)? opt.canvasHeight : 200;

        // Set createCanvas function
        if(!opt.createCanvasFunction) {
            throw new Error("createCanvas function is undefined.");
        }
        this.createCanvas = opt.createCanvasFunction;

        // Init canvas array
        this.canvases = [];
        this.canvasIndexes = Object.create(null);
    }

    public addCanvas(canvasName: string, afterOf?: number | string, canvas?: Canvas<T>): Canvas<T> {
        if(typeof canvasName !== "string") {
            canvasName = "unnamed";
        }

        // Get available canvasName
        canvasName = this.getAvailableCanvasName(canvasName);

        if(!canvas) {
            canvas = this.createCanvas(this.canvasWidth, this.canvasHeight) as Canvas<T>;
            this.setDefaultCanvasProperties(canvas, canvasName);
        } else {
            this.setCanvasNameToProperty(canvas, canvasName);
        }
        
        this.insertCanvas(canvas, canvasName, afterOf);

        this.emit("addCanvas", canvas, canvasName);
        return canvas; 
    }

    public getCanvas(canvasName: string): Canvas<T> | undefined {
        return this.canvases[this.canvasIndexes[canvasName]];
    }

    public removeCanvas(canvasName: string): void {
        if(typeof canvasName !== "string") return;
        if(typeof this.canvases[this.canvasIndexes[canvasName]] === "undefined") return;

        // Remove canvas
        this.canvases.splice(this.canvasIndexes[canvasName], 1);
        delete this.canvasIndexes[canvasName];

        // Update layerNumber	
        for(let i = 0; i < this.canvases.length; i++) {	
            this.canvasIndexes[this.getCanvasNameFromProperty(this.canvases[i])] = i;
        }
        
        this.emit("removeCanvas", canvasName);
    }

    public moveCanvas(canvasNames: string[]): void {
        if(!Array.isArray(canvasNames)) return;
        
        const newCanvases: CanvasArray<T> = [];
        for(let i = 0; i < canvasNames.length; i++) {
            const canvas = this.getCanvas(canvasNames[i]);
            if(canvas) {
                newCanvases.push(canvas);
            }     
        }

        this.setCanvases(newCanvases);
        this.emit("moveCanvas", newCanvases);
    }

    public renameCanvas(targetCanvasName: string, newCanvasName: string): string | undefined {
        if(typeof targetCanvasName !== "string" || typeof newCanvasName !== "string" || typeof this.canvases[this.canvasIndexes[targetCanvasName]] === "undefined") return undefined;

        // Get available newCanvasName
        newCanvasName = this.getAvailableCanvasName(newCanvasName);

        // Rename
        this.canvasIndexes[newCanvasName] = this.canvasIndexes[targetCanvasName];
        delete this.canvasIndexes[targetCanvasName];
        const canvas = this.canvases[this.canvasIndexes[newCanvasName]];
        this.setCanvasNameToProperty(canvas, newCanvasName);

        this.emit("renameCanvas", canvas, newCanvasName, targetCanvasName);
        return newCanvasName;
    }

    public getCanvases(): CanvasArray<T> {
        return this.canvases;
    }

    public setCanvases(canvases: CanvasArray<T>): void {
        if(!Array.isArray(canvases)) return;

        // Create new canvasIndexes
        const newCanvasIndexes: CanvasIndexMap = Object.create(null);
        for(let i = 0; i < canvases.length; i++) {
            newCanvasIndexes[this.getCanvasNameFromProperty(canvases[i])] = i;
        }
        this.canvases = canvases;
        this.canvasIndexes = newCanvasIndexes;

        this.emit("SetCanvases", this.canvases);
        return;
    }

    private insertCanvas(canvas: Canvas<T>, canvasName: string, afterOf?: number | string | undefined): void {
        if(typeof afterOf === "number") {
            // afterOf: index number => canvas name
            if(this.canvases.length >= 2 && afterOf < this.canvases.length - 1) {
                afterOf = this.getCanvasNameFromProperty(this.canvases[afterOf]);
            } else {
                // Specified index number is invalid
                afterOf = undefined;
            }
        } else if(typeof afterOf === "string") {
            // Specified canvas name is invalid
            if(typeof this.canvasIndexes[afterOf] !== "number") afterOf = undefined;
        }

        if(typeof afterOf === "string") {
            // Create new canvas array
            const insertAfterOf = this.canvasIndexes[afterOf];
            let newCanvases = this.canvases.slice(0, insertAfterOf + 1);
            newCanvases.push(canvas);
            newCanvases = newCanvases.concat(this.canvases.slice(insertAfterOf + 1));

            // Create new canvas index map
            const newCanvasIndexes = Object.create(null);
            for(let i = 0; i < newCanvases.length; i++) {	
                newCanvasIndexes[this.getCanvasNameFromProperty(newCanvases[i])] = i;
            }

            // Set new array and map
            this.canvases = newCanvases;
            this.canvasIndexes = newCanvasIndexes;
        } else {
            // Add to end
            this.canvases.push(canvas);
            this.canvasIndexes[canvasName] = this.canvases.length - 1;
        }
    }

    private getCanvasNameFromProperty(canvas: Canvas<T>): string {
        return canvas.xylograph.name;
    }

    private setCanvasNameToProperty(canvas: Canvas<T>, canvasName: string): void {
        canvas.xylograph.name = canvasName;
    }

    private getAvailableCanvasName(canvasName: string): string {
        while(typeof this.canvasIndexes[canvasName] !== "undefined") canvasName = this.canvasNameIncrement(canvasName);
        return canvasName;
    }

    private canvasNameIncrement(canvasName: string): string {
        const incrementMark: RegExpMatchArray | null = canvasName.match(/\[[0-9]+\]$/);
        if(!incrementMark) return canvasName + "[1]";
        const num = parseInt(incrementMark.toString().slice(1, -1));
        return canvasName.replace(/\[[0-9]+\]$/, "[" + (num + 1) + "]");
    }

    private setDefaultCanvasProperties(canvas: Canvas<T>, canvasName: string, compositeOperation = "source-over", hidden = false): void {
        canvas.xylograph = {
            name: canvasName,
            compositeOperation: compositeOperation,
            hidden: hidden
        }
    }

    static createHTMLCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = window.document.createElement("canvas");
        canvas.setAttribute("width", width.toString());
        canvas.setAttribute("height", height.toString());
        return canvas;
    }
}