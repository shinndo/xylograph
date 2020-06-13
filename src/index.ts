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
export type CanvasMap<T> = Map<string, Canvas<T>>;
export type CanvasArray<T> = [string, Canvas<T>][];


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
    <T>(canvases: CanvasMap<T>): void;
};
export type RenameCanvasEventListener = {
    <T>(canvas: Canvas<T>, newCanvasName: string, targetCanvasName: string): void;
};
interface Events {
    addCanvas: AddCanvasEventListener;
    removeCanvas: RemoveCanvasEventListener;
    moveCanvas: MoveCanvasEventListener;
    renameCanvas: RenameCanvasEventListener;
}
type XylographEmitterEvent = StrictEventEmitter<EventEmitter, Events>;


// Class
export class Xylograph<T> extends (EventEmitter as {new(): XylographEmitterEvent}) {
    private createCanvas: CreateCanvasFunction<T>;
    private canvasWidth: number;
    private canvasHeight: number;
    private canvases: CanvasMap<T>;

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
        this.canvases = new Map<string, Canvas<T>>();
    }

    public addCanvas(canvasName: string): Canvas<T> {
        if(typeof canvasName !== "string") {
            canvasName = "unnamed";
        }

        // canvasName duplicate check
        while(typeof this.canvases.get(canvasName) !== "undefined") canvasName = this.canvasNameIncrement(canvasName);

        const newCanvas: Canvas<T> = this.createCanvas(this.canvasWidth, this.canvasHeight) as Canvas<T>;
        newCanvas.xylograph = this.createCanvasProperties(canvasName);
        
        this.canvases.set(canvasName, newCanvas);
        this.emit("addCanvas", newCanvas, canvasName);
        return newCanvas; 
    }

    public getCanvas(canvasName: string): Canvas<T> | undefined {
        return this.canvases.get(canvasName);
    }

    public removeCanvas(canvasName: string): void {
        if(typeof canvasName !== "string") return;
        if(typeof this.canvases.get(canvasName) === "undefined") return;

        // Remove canvas
        this.canvases.delete(canvasName);
        
        this.emit("removeCanvas", canvasName);
    }

    public moveCanvas(canvases: CanvasMap<T> | CanvasArray<T>): void {
        if(!Array.isArray(canvases) && !(canvases instanceof Map)) return;

        if(canvases instanceof Map) {
            // TODO: canvses type check
            this.canvases = canvases;
            this.emit("moveCanvas", this.canvases);
            return;
        } else if(!Array.isArray(canvases)) {
            // TODO: canvses type check
            this.canvases = new Map<string, Canvas<T>>(canvases);
            this.emit("moveCanvas", this.canvases);
            return;
        }       
    }

    public renameCanvas(targetCanvasName: string, newCanvasName: string): string | undefined {
        if(typeof targetCanvasName !== "string" || typeof newCanvasName !== "string" || !this.canvases.has(targetCanvasName)) return undefined;

        // newCanvasName duplicate check
        while(this.canvases.has(newCanvasName)) newCanvasName = this.canvasNameIncrement(newCanvasName);

        const newCanvases = new Map<string, Canvas<T>>();
        this.canvases.forEach((canvas: Canvas<T>, currentCanvasName: string) => {
            let canvasName = currentCanvasName;
            if(currentCanvasName === targetCanvasName) {
                canvasName = newCanvasName;
                this.setCanvasName(canvas, newCanvasName);
            }

            newCanvases.set(canvasName, canvas);
        });

        this.canvases = newCanvases;

        this.emit("renameCanvas", this.canvases.get(newCanvasName) as Canvas<T>, newCanvasName, targetCanvasName);
        return newCanvasName;
    }

    public getCanvases(): CanvasMap<T> {
        return this.canvases;
    }

    private getCanvasName(canvas: Canvas<T>): string {
        return canvas.xylograph.name;
    }

    private setCanvasName(canvas: Canvas<T>, canvasName: string): void {
        canvas.xylograph.name = canvasName;
    }

    private canvasNameIncrement(canvasName: string): string {
        const incrementMark: RegExpMatchArray | null = canvasName.match(/\[[0-9]+\]$/);
        if(!incrementMark) return canvasName + "[1]";
        const num = parseInt(incrementMark.toString().slice(1, -1));
        return canvasName.replace(/\[[0-9]+\]$/, "[" + (num + 1) + "]");
    }

    private createCanvasProperties(canvasName: string, compositeOperation = "source-over", hidden = false): CanvasProperty {
        return {
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