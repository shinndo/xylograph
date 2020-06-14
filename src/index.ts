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
export type CanvasArray<T> = Canvas<T>[];


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
export type SetCanvasesEventListener = {
    <T>(canvases: CanvasMap<T>): void;
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
        return this.canvases.get(canvasName);
    }

    public removeCanvas(canvasName: string): void {
        if(typeof canvasName !== "string") return;
        if(typeof this.canvases.get(canvasName) === "undefined") return;

        // Remove canvas
        this.canvases.delete(canvasName);
        
        this.emit("removeCanvas", canvasName);
    }

    public moveCanvas(canvasNames: string[]): void {
        if(!Array.isArray(canvasNames)) return;
        
        const newCanvases = new Map<string, Canvas<T>>();
        for(let i = 0; i < canvasNames.length; i++) {
            const canvasName = canvasNames[i];
            const canvas = this.getCanvas(canvasName);
            if(canvas) {
                newCanvases.set(canvasNames[i], canvas);
            }     
        }

        this.setCanvases(newCanvases);
        this.emit("moveCanvas", newCanvases);
    }

    public renameCanvas(targetCanvasName: string, newCanvasName: string): string | undefined {
        if(typeof targetCanvasName !== "string" || typeof newCanvasName !== "string" || !this.canvases.has(targetCanvasName)) return undefined;

        // Get available newCanvasName
        newCanvasName = this.getAvailableCanvasName(newCanvasName);

        const newCanvases = new Map<string, Canvas<T>>();
        this.canvases.forEach((canvas: Canvas<T>, currentCanvasName: string) => {
            let canvasName = currentCanvasName;
            if(currentCanvasName === targetCanvasName) {
                canvasName = newCanvasName;
                this.setCanvasNameToProperty(canvas, newCanvasName);
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

    public setCanvases(canvases: CanvasMap<T> | CanvasArray<T>): void {
        if(!Array.isArray(canvases) && !(canvases instanceof Map)) return;

        if(canvases instanceof Map) {
            // TODO: canvses type check
            this.canvases = canvases;

        } else if(Array.isArray(canvases)) {
            const mapArray: [string, Canvas<T>][] = [];
            for(let i = 0; i < canvases.length; i++) {
                const canvas = canvases[i];
                mapArray.push([this.getCanvasNameFromProperty(canvas), canvas]);
            }
            this.canvases = new Map<string, Canvas<T>>(mapArray);
        }

        this.emit("SetCanvases", this.canvases);
        return;
    }

    private insertCanvas(canvas: Canvas<T>, canvasName: string, afterOf?: number | string | undefined): void {
        if(typeof afterOf === "number") {
            // afterOf: index number => canvas name
            if(this.canvases.size >= 2 && afterOf < this.canvases.size - 1) {
                const namesIt = this.canvases.keys();
                for(let i = 0; i <= (afterOf as number); i++) {
                    const itResult = namesIt.next();
                    if(i === afterOf) {
                        afterOf = itResult.value;
                    }
                }
            } else {
                // Specified index number is invalid
                afterOf = undefined;
            }
        } else if(typeof afterOf === "string") {
            // Specified canvas name is invalid
            if(!this.canvases.has(afterOf)) afterOf = undefined;
        }

        if(typeof afterOf === "undefined") {
            // Insert last
            this.canvases.set(canvasName, canvas);
        } else {
            // Insert specified position
            const newCanvases = new Map<string, Canvas<T>>();
            this.canvases.forEach((canvas: Canvas<T>, canvasName: string) => {
                newCanvases.set(canvasName, canvas);
                if(canvasName === afterOf) {
                    newCanvases.set(canvasName, canvas);
                }
            });
            this.canvases = newCanvases;
        }
    }

    private getCanvasNameFromProperty(canvas: Canvas<T>): string {
        return canvas.xylograph.name;
    }

    private setCanvasNameToProperty(canvas: Canvas<T>, canvasName: string): void {
        canvas.xylograph.name = canvasName;
    }

    private getAvailableCanvasName(canvasName: string): string {
        while(this.canvases.has(canvasName)) canvasName = this.canvasNameIncrement(canvasName);
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