import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";

export type AddCanvasEventListener = {
    <T>(canvas: Canvas<T>): void
};

export type RemoveCanvasEventListener =  {
    (canvasName: string): void;
};

export type MoveCanvasEventListener = {
    <T>(canvases: Canvas<T>[]): void;
};

interface Events {
    addCanvas: AddCanvasEventListener;
    removeCanvas: RemoveCanvasEventListener;
    moveCanvas: MoveCanvasEventListener;
}
type XylographEmitterEvent = StrictEventEmitter<EventEmitter, Events>;

export interface CanvasParameter {
    name: string;
    hidden: boolean;
}

interface XylographCanvas {
    xylograph: CanvasParameter;
};

export type Canvas<T> = T & XylographCanvas;

type LayerArray<T> = Canvas<T>[];
type LayerNumberObject = {[key: string]: number}; 

export type CreateCanvasFunction<T> = (width: number, height: number) => T;

export type xylographOption<T> = {
    createCanvasFunction: CreateCanvasFunction<T>;
    canvasWidth?: number;
    canvasHeight?: number;
};

export class Xylograph<T> extends (EventEmitter as {new(): XylographEmitterEvent}) {
    private createCanvas: CreateCanvasFunction<T>;
    private canvasWidth: number;
    private canvasHeight: number;
    private layers: LayerArray<T>;
    private layerNumber: LayerNumberObject;

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
        
        // Init layers
        this.layers = [];
        this.layerNumber = Object.create(null);
    }

    addCanvas(canvasName: string): Canvas<T> {
        if(typeof canvasName !== "string") {
            canvasName = "unnamed";
        }

        // canvasName duplicate check
        while(typeof this.layerNumber[canvasName] !== "undefined") canvasName = this.canvasNameIncrement(canvasName);

        const newCanvas: Canvas<T> = this.createCanvas(this.canvasWidth, this.canvasHeight) as Canvas<T>;
        newCanvas.xylograph = this.createXylographPropertyForCanvas(canvasName);
        
        this.layers.push(newCanvas);
        this.layerNumber[canvasName] = this.layers.length - 1;
        this.emit("addCanvas", newCanvas);
        return newCanvas; 
    }

    getCanvas(canvasName: string): Canvas<T> {
        return this.layers[this.layerNumber[canvasName]];
    }

    removeCanvas(canvasName: string): void {
        if(typeof canvasName !== "string") return;
        if(typeof this.layerNumber[canvasName] === "undefined") return;

        // Remove canvas
        this.layers.splice(this.layerNumber[canvasName], 1);
        delete this.layerNumber[canvasName];

        // Update layerNumber
        for(let i = 0; i < this.layers.length; i++) {
            this.layerNumber[this.layers[i].xylograph.name] = i;
        }
        
        this.emit("removeCanvas", canvasName);
    }

    moveCanvas(canvases: LayerArray<T>): void {
        if(!Array.isArray(canvases)) return;

        // Create new layers and layerNumber
        const newLayers: LayerArray<T> = [];
        const newLayerNumber: LayerNumberObject = Object.create(null);
        for(let i = 0; i < canvases.length; i++) {
            const canvas: Canvas<T> = canvases[i];
            newLayers.push(canvas);
            newLayerNumber[this.getCanvasName(canvas)] = newLayers.length - 1;
        }

        this.layers = newLayers;
        this.layerNumber = newLayerNumber;

        this.emit("moveCanvas", newLayers);
    }

    getCanvases(): LayerArray<T> {
        return this.layers;
    }

    private getCanvasName(canvas: Canvas<T>): string {
        return canvas.xylograph.name;
    }

    private canvasNameIncrement(canvasName: string): string {
        const incrementMark: RegExpMatchArray | null = canvasName.match(/\[[0-9]+\]$/);
        if(!incrementMark) return canvasName + "[1]";
        const num = parseInt(incrementMark.toString().slice(1, -1));
        return canvasName.replace(/\[[0-9]+\]$/, "[" + (num + 1) + "]");
    }

    private createXylographPropertyForCanvas(canvasName: string, hidden = false): CanvasParameter {
        return {
            name: canvasName,
            hidden: hidden
        }
    }

    static createCanvasForBrowser(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = window.document.createElement("canvas");
        canvas.setAttribute("width", width.toString());
        canvas.setAttribute("height", height.toString());
        return canvas;
    }
}