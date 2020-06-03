import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";

type BrowserCanvas = HTMLCanvasElement;

export type AddCanvasEventListener = (canvas: Canvas) => void;
export type RemoveCanvasEventListener = (canvasName: string) => void;
export type MoveCanvasEventListener = (canvases: Canvas[]) => void;

export type CreateCanvasFunction = (width: number, height: number) => BrowserCanvas | ServerSideCanvas;

interface Events {
    addCanvas: AddCanvasEventListener;
    removeCanvas: RemoveCanvasEventListener;
    moveCanvas: MoveCanvasEventListener;
}
type XylographEmitterEvent = StrictEventEmitter<EventEmitter, Events>;

export interface canvasParameter {
    name: string;
    hidden: boolean;
}

export interface ServerSideCanvas {
    getContext: (context: string) => Context;
}

export interface Canvas {
    getContext: (context: string) => Context;
    xylograph: canvasParameter;
}

export interface Context {}

type LayerArray = Canvas[];
type LayerNumberObject = {[key: string]: number}; 

export type xylographOption = {
    createCanvasFunction: CreateCanvasFunction;
    canvasWidth?: number;
    canvasHeight?: number;
};

export class Xylograph extends (EventEmitter as {new(): XylographEmitterEvent}) {
    private createCanvas: CreateCanvasFunction;
    private canvasWidth: number;
    private canvasHeight: number;
    private layers: LayerArray;
    private layerNumber: LayerNumberObject;

    constructor(opt: xylographOption) {
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

    addCanvas(canvasName: string): Canvas {
        const newCanvas: Canvas = this.createCanvas(this.canvasWidth, this.canvasHeight) as Canvas;
        newCanvas.xylograph = this.createXylographPropertyForCanvas(canvasName);
        
        this.layers.push(newCanvas);
        this.layerNumber[canvasName] = this.layers.length - 1;
        this.emit("addCanvas", newCanvas);
        return newCanvas; 
    }

    getCanvas(canvasName: string): Canvas {
        return this.layers[this.layerNumber[canvasName]];
    }

    removeCanvas(canvasName: string): void {
        this.layers.splice(this.layerNumber[canvasName], 1);
        delete this.layerNumber[canvasName];
        this.emit("removeCanvas", canvasName);
    }

    moveCanvas(canvases: Canvas[]): void {
        const newLayers: LayerArray = [];
        const newLayerNumber: LayerNumberObject = Object.create(null);
        for(let i = 0; i < canvases.length; i++) {
            const canvas: Canvas = canvases[i];
            newLayers.push(canvas);
            newLayerNumber[this.getCanvasName(canvas)] = newLayers.length - 1;
        }
        this.layers = newLayers;
        this.layerNumber = newLayerNumber;
        this.emit("moveCanvas", newLayers);
    }

    getCanvases(): Canvas[] {
        return this.layers;
    }

    private getCanvasName(canvas: Canvas): string {
        return canvas.xylograph.name;
    }

    private createXylographPropertyForCanvas(canvasName: string, hidden = false): canvasParameter {
        return {
            name: canvasName,
            hidden: hidden
        }
    }

    static createCanvasForBrowser(width: number, height: number): BrowserCanvas {
        const canvas: BrowserCanvas = window.document.createElement("canvas");
        canvas.setAttribute("width", width.toString());
        canvas.setAttribute("height", height.toString());
        return canvas;
    }
}