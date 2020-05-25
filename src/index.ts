import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";
import {unsupportedWarning, isBrowser} from "./util";
import * as nodeCanvas from "canvas";
import { throws } from "assert";

declare type CanvasEventListener = (canvas: Canvas, context: Context) => void;
declare type CreateCanvasFunction = (width: number, height: number) => Canvas;
declare type CreateCanvasFunctionUnionType = CreateCanvasFunction | ((width: number, height: number, type?: "pdf" | "svg" | undefined) => nodeCanvas.Canvas) | (() => void);

interface Events {
    addCanvas: CanvasEventListener;
}

export interface Canvas {
    // getContext: (context: string) => Context;
}

export interface Context {}

export type xgOption = {
    createCanvasFunction?: CreateCanvasFunction;
    canvasWidth?: number;
    canvasHeight?: number;
};

export class Xylograph {
    private createCanvas: CreateCanvasFunction;
    private canvasWidth: number;
    private canvasHeight: number;
    private layers: Canvas[];
    private events: StrictEventEmitter<EventEmitter, Events>;

    constructor(opt?: xgOption) {
        opt = opt || {};

        // Set canvas size
        this.canvasWidth = (opt.canvasWidth)? opt.canvasWidth : 200;
        this.canvasHeight = (opt.canvasHeight)? opt.canvasHeight : 200;

        // Set createCanvas function
        if(isBrowser()) {
            this.createCanvas =  this.createCanvasForBrowser;
        } else {
            if(opt.createCanvasFunction) {
                this.createCanvas = opt.createCanvasFunction;
            } else {
                throw Error("createCanvas function is undefined.")
            }
        }
        
        // Init layers
        this.layers = [];

        // Init event
        this.events = new EventEmitter();
    }

    on(event: string, listener: CanvasEventListener): this {
        // TODO: stringで受け取ったイベント名でEventEmitterにイベント登録できるようにする
        if(event === "addCanvas") this.events.on("addCanvas", listener);
        return this;
    }

    addCanvas(): this {
        this.layers.push(this.createCanvas(this.canvasWidth, this.canvasHeight));
        this.events.emit("addCanvas", {}, {});
        return this; 
    }

    private createCanvasForBrowser(width: number, height: number): Canvas {
        const canvas: HTMLCanvasElement = window.document.createElement("canvas");
        canvas.setAttribute("width", width.toString());
        canvas.setAttribute("height", height.toString());
        return canvas;
    }
}
