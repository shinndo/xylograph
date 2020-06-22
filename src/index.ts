// Canvas
type GetContextFunction = (type: "2d") => any;
export interface CanvasProperty {
    name: string;
    compositeOperation: string;
    hidden: boolean;
}
interface XylographCanvas {
    xylograph: CanvasProperty;
    readonly width: number;
    readonly height: number;
    getContext: GetContextFunction
}
export type Canvas<T> = T & XylographCanvas; // Prioritize T
export type CanvasArray<T> = Canvas<T>[];
export type CanvasIndexMap = {[canvasName: string]: number};

// Xylograph option
export type CreateCanvasFunction<T> = (width: number, height: number) => T;
export type CopyCanvasFunction<T> = (originCanvas: Canvas<T>) => Canvas<T>;
export type CreateImageFunction<T> = (canvas: Canvas<T>) => any;
export type xylographOption<T> = {
    createCanvasFunction: CreateCanvasFunction<T>;
    createImageFunction: CreateImageFunction<T>;
    canvasWidth?: number;
    canvasHeight?: number;
    copyCanvasFunction?: CopyCanvasFunction<T>;
};

// Class
export class Xylograph<T> {
    private createCanvas: CreateCanvasFunction<T>;
    private createImage: CreateImageFunction<T>;
    private canvasWidth: number;
    private canvasHeight: number;
    private canvases: CanvasArray<T>;
    private canvasIndexes: CanvasIndexMap;

    constructor(opt: xylographOption<T>) {

        // Set canvas size
        this.canvasWidth = (opt.canvasWidth)? opt.canvasWidth : 200;
        this.canvasHeight = (opt.canvasHeight)? opt.canvasHeight : 200;

        // Set createCanvas function
        if(!opt.createCanvasFunction) {
            throw new Error("createCanvas function is undefined.");
        }
        this.createCanvas = opt.createCanvasFunction;

        // Set copyCanvas function
        if(opt.copyCanvasFunction) {
            this.copyCanvas = opt.copyCanvasFunction;
        }

        if(!opt.createImageFunction) {
            throw new Error("createCanvas function is undefined.");
        }
        this.createImage = opt.createImageFunction;

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
            this.setDefaultCanvasProperty(canvas, canvasName);
        } else {
            this.setCanvasNameToProperty(canvas, canvasName);
        }
        
        this.insertCanvas(canvas, canvasName, afterOf);

        return canvas; 
    }

    public getCanvas(canvasName: string): Canvas<T> | undefined {
        return this.canvases[this.canvasIndexes[canvasName]];
    }

    public removeCanvas(canvasName: string): void {
        if(typeof canvasName !== "string" || !this.getCanvas(canvasName)) return;

        // Remove canvas
        this.canvases.splice(this.canvasIndexes[canvasName], 1);
        delete this.canvasIndexes[canvasName];

        // Update layerNumber	
        for(let i = 0; i < this.canvases.length; i++) {	
            this.canvasIndexes[this.getCanvasNameFromProperty(this.canvases[i])] = i;
        }
    }

    public renameCanvas(targetCanvasName: string, newCanvasName: string): string | undefined {
        if(typeof targetCanvasName !== "string" || typeof newCanvasName !== "string" || !this.getCanvas(targetCanvasName)) return undefined;

        // Get available newCanvasName
        newCanvasName = this.getAvailableCanvasName(newCanvasName);

        // Rename
        this.canvasIndexes[newCanvasName] = this.canvasIndexes[targetCanvasName];
        delete this.canvasIndexes[targetCanvasName];
        const canvas = this.getCanvas(newCanvasName) as Canvas<T>;
        this.setCanvasNameToProperty(canvas, newCanvasName);

        return newCanvasName;
    }

    public moveCanvas(canvasNames: string[]): void {
        if(!Array.isArray(canvasNames)) return;
        
        const newCanvases: CanvasArray<T> = [];
        for(let i = 0; i < canvasNames.length; i++) {
            const canvasName = canvasNames[i];
            const canvas = this.getCanvas(canvasName);
            if(canvas) {
                newCanvases.push(canvas);
            }     
        }

        this.replaceCanvases(newCanvases);
    }

    public duplicateCanvas(originCanvasName: string, duplicateCanvasName?: string): Canvas<T> | undefined {
        if(typeof originCanvasName !== "string") return;
        duplicateCanvasName = (typeof duplicateCanvasName === "string")? this.getAvailableCanvasName(duplicateCanvasName) : this.getAvailableCanvasName(originCanvasName);

        const originCanvas = this.getCanvas(originCanvasName);
        if(!originCanvas) return;
        const newCanvas = this.copyCanvas(originCanvas);
        this.setCanvasNameToProperty(newCanvas, duplicateCanvasName);
        this.insertCanvas(newCanvas, duplicateCanvasName, originCanvasName);

        return newCanvas;
    }

    public margeCanvas(margeCanvasNames: string[], forceCompositeOperation?: string): Canvas<T> | undefined {
        if(!Array.isArray(margeCanvasNames)) return;

        const margeTargetCanvasNames: string[] = [];
        const canvasNames = this.getCanvasNames();
        for(let i = 0; i < margeCanvasNames.length; i++) {
            const margeCanvasName = margeCanvasNames[i];
            if(canvasNames.includes(margeCanvasName)) margeTargetCanvasNames.push(margeCanvasName);
        }

        const newCanvases: CanvasArray<T> = [];
        const newCanvasIndexes: CanvasIndexMap = Object.create(null);

        // Create the canvas array after merging
        for(let i = 0; i < this.canvases.length; i++) {
            const canvas = this.canvases[i];
            const canvasName = this.getCanvasNameFromProperty(canvas);
            if(!margeTargetCanvasNames.includes(canvasName) || margeTargetCanvasNames[0] === canvasName) {
                newCanvases.push(canvas);
                newCanvasIndexes[canvasName] = i;
            }
        }

        const margeCanvases: CanvasArray<T> = [];
        for(let i = 0; i < margeTargetCanvasNames.length; i++) {
            margeCanvases.push(this.getCanvas(margeTargetCanvasNames[i]) as Canvas<T>);
        }

        this.margeCanvases(margeCanvases, forceCompositeOperation);

        this.canvases = newCanvases;
        this.canvasIndexes = newCanvasIndexes;

        return margeCanvases[0];
    }

    public getCanvases(): CanvasArray<T> {
        return this.canvases;
    }

    public setCanvases(canvases: CanvasArray<T>): void {
        if(!Array.isArray(canvases)) return;
        this.replaceCanvases(canvases);
        return;
    }

    public getCanvasNames(): string[] {
        const canvasNames: string[] = [];
        for(let i = 0; i < this.canvases.length; i++) {
            canvasNames.push(this.canvases[i].xylograph.name);
        }
        return canvasNames;
    }

    private insertCanvas(canvas: Canvas<T>, canvasName: string, afterOf?: number | string | undefined): void {
        if(!canvas || typeof canvasName !== "string") return; 

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
            const newCanvasIndexes: CanvasIndexMap = Object.create(null);
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

    private setDefaultCanvasProperty(canvas: Canvas<T>, canvasName: string, compositeOperation = "source-over", hidden = false): void {
        canvas.xylograph = {
            name: canvasName,
            compositeOperation: compositeOperation,
            hidden: hidden
        }
    }

    private setCloneOfCanvasProperty(destCanvas: Canvas<T>, originCanvas: Canvas<T>): void {
        const originProperty = originCanvas.xylograph;
        destCanvas.xylograph = {
            name: originProperty.name,
            compositeOperation: originProperty.compositeOperation,
            hidden: originProperty.hidden
        };
    }

    private copyCanvas(originCanvas: Canvas<T>): Canvas<T> {
        const width = (typeof originCanvas.width === "number")? originCanvas.width : this.canvasWidth;
        const height = (typeof originCanvas.height === "number")? originCanvas.height : this.canvasHeight;

        const newCanvas = this.createCanvas(width, height) as Canvas<T>;
        const newCtx = newCanvas.getContext("2d");
        const originCtx = originCanvas.getContext("2d");
        newCtx.putImageData(originCtx.getImageData(0, 0, width, height), 0, 0);
        this.setCloneOfCanvasProperty(newCanvas, originCanvas);
        return newCanvas 
    }

    private replaceCanvases(canvases: CanvasArray<T>): CanvasArray<T> {
        const newCanvases: CanvasArray<T> = [];
        const newCanvasIndexes: CanvasIndexMap = Object.create(null);
        for(let i = 0; i < canvases.length; i++) {
            const canvas = canvases[i];
            if(canvas) {
                const canvasName = this.getCanvasNameFromProperty(canvas);
                newCanvases.push(canvas);
                newCanvasIndexes[canvasName] = i;
            }
        }
        
        this.canvases = newCanvases;
        this.canvasIndexes = newCanvasIndexes;
        return newCanvases;
    }

    private margeCanvases(canvases: CanvasArray<T>, forceCompositeOperation?: string): Canvas<T> {
        const baseCanvas = canvases[0];
        const baseCtx = baseCanvas.getContext("2d");
        for(let i = 1; i < canvases.length; i++) {
            const canvas = canvases[i];
            if(canvas.xylograph.hidden) continue;
            baseCtx.globalCompositeOperation = (forceCompositeOperation)? forceCompositeOperation : canvas.xylograph.compositeOperation;
            baseCtx.drawImage(this.createImage(canvas), 0, 0, canvas.width, canvas.height, 0, 0, baseCanvas.width, baseCanvas.height);
        }

        baseCtx.globalCompositeOperation = baseCanvas.xylograph.compositeOperation;
        return baseCanvas;
    }

    static createHTMLCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = window.document.createElement("canvas");
        canvas.setAttribute("width", width.toString());
        canvas.setAttribute("height", height.toString());
        return canvas;
    }

    static createHTMLImage(canvas: Canvas<HTMLCanvasElement>): HTMLImageElement {
        const image = window.document.createElement("img");
        image.src = canvas.toDataURL("image/png");
        return image;
    }
}