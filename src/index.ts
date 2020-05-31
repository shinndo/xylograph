import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";

type BrowserCanvas = HTMLCanvasElement;

export type AddCanvasEventListener = (canvas: Canvas) => void;
export type RemoveCanvasEventListener = (canvasName: string) => void;

export type CreateCanvasFunction = (width: number, height: number) => BrowserCanvas | ServerSideCanvas;

interface Events {
    addCanvas: AddCanvasEventListener;
    removeCanvas: RemoveCanvasEventListener;
}

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

export type xylographOption = {
    createCanvasFunction: CreateCanvasFunction;
    canvasWidth?: number;
    canvasHeight?: number;
};

export class Xylograph extends EventEmitter implements StrictEventEmitter<EventEmitter, Events> {
    private createCanvas: CreateCanvasFunction;
    private canvasWidth: number;
    private canvasHeight: number;
    private layers: {[key: string]: Canvas};

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
        this.layers = {};
    }

    addCanvas(canvasName: string): Canvas {
        const newCanvas: Canvas = this.createCanvas(this.canvasWidth, this.canvasHeight) as Canvas;
        newCanvas.xylograph = this.createXylographPropertyForCanvas(canvasName);
        
        this.layers[canvasName] = newCanvas;
        this.emit("addCanvas", newCanvas);
        return newCanvas; 
    }

    getCanvas(canvasName: string): Canvas {
        return this.layers[canvasName];
    }

    removeCanvas(canvasName: string): void {
        delete this.layers[canvasName];
        this.emit("removeCanvas", canvasName);
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