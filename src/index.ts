// Canvas
type GetContextFunction = (type: "2d") => any;
type ToDataURLFunction = () => string;
export interface CanvasProperty {
    name: string;
    compositeOperation: string;
    hidden: boolean;
}
interface XylographCanvas {
    xylograph: CanvasProperty;
    readonly width: number;
    readonly height: number;
    getContext: GetContextFunction,
    toDataURL: ToDataURLFunction
}
export type Canvas<T> = T & XylographCanvas;
export type CanvasArray<T> = Canvas<T>[];
type CanvasIndexMap = {[canvasName: string]: number};

// Xylograph function type
interface DefaultXylographFunctionTypes {
    createCanvas: (w: number, h: number) => any;
    canvasToImage: (canvas: any) => any;
    canvasToBinary: (canvas: any, ...options: any) => any;
}

// Xylograph option
export type xylographOption<FunctionType extends DefaultXylographFunctionTypes = DefaultXylographFunctionTypes> = {
    createCanvas: FunctionType['createCanvas'];
    canvasToImage: FunctionType['canvasToImage'];
    canvasToBinary: FunctionType['canvasToBinary'];
    canvasWidth?: number;
    canvasHeight?: number;
};

// Xylograph Class
export class Xylograph<CanvasType, FunctionType extends DefaultXylographFunctionTypes = DefaultXylographFunctionTypes> {
    private _createCanvas: FunctionType['createCanvas'];
    private _canvasToImage: FunctionType['canvasToImage'];
    private _canvasToBinary: FunctionType['canvasToBinary'];
    private canvasWidth: number;
    private canvasHeight: number;
    private canvases: CanvasArray<CanvasType>;
    private canvasIndexes: CanvasIndexMap;

    constructor(opt: xylographOption<FunctionType>) {

        // Set canvas size
        this.canvasWidth = (opt.canvasWidth)? opt.canvasWidth : 200;
        this.canvasHeight = (opt.canvasHeight)? opt.canvasHeight : 200;

        // Set createCanvas function
        if(!opt.createCanvas) {
            throw new Error("createCanvas function is undefined.");
        }
        this._createCanvas = opt.createCanvas;

        // Set createImage function
        if(!opt.canvasToImage) {
            throw new Error("canvasToImage function is undefined.");
        }
        this._canvasToImage = opt.canvasToImage;

        // Set createBinary function
        if(!opt.canvasToBinary) {
            throw new Error("canvasToBinary function is undefined.");
        }
        this._canvasToBinary = opt.canvasToBinary;

        // Init canvas array
        this.canvases = [];
        this.canvasIndexes = Object.create(null);
    }

    public addCanvas(canvasName: string, afterOf?: number | string, canvas?: Canvas<CanvasType>): Canvas<CanvasType> {
        if(typeof canvasName !== "string") {
            canvasName = "unnamed";
        }

        // Get available canvasName
        canvasName = this._getAvailableCanvasName(canvasName);

        if(!canvas) {
            canvas = this._createCanvas(this.canvasWidth, this.canvasHeight) as Canvas<CanvasType>;
            this._setDefaultCanvasProperty(canvas, canvasName);
        } else {
            this._setCanvasNameToProperty(canvas, canvasName);
        }
        
        this._insertCanvas(canvas, canvasName, afterOf);

        return canvas; 
    }

    public getCanvas(canvasName: string): Canvas<CanvasType> | undefined {
        return this.canvases[this.canvasIndexes[canvasName]];
    }

    public removeCanvas(canvasName: string): void {
        if(typeof canvasName !== "string" || !this.getCanvas(canvasName)) return;

        // Remove canvas
        this.canvases.splice(this.canvasIndexes[canvasName], 1);
        delete this.canvasIndexes[canvasName];

        // Update layerNumber	
        for(let i = 0; i < this.canvases.length; i++) {	
            this.canvasIndexes[this._getCanvasNameFromProperty(this.canvases[i])] = i;
        }
    }

    public renameCanvas(targetCanvasName: string, newCanvasName: string): string | undefined {
        if(typeof targetCanvasName !== "string" || typeof newCanvasName !== "string" || !this.getCanvas(targetCanvasName)) return undefined;

        // Get available newCanvasName
        newCanvasName = this._getAvailableCanvasName(newCanvasName);

        // Rename
        this.canvasIndexes[newCanvasName] = this.canvasIndexes[targetCanvasName];
        delete this.canvasIndexes[targetCanvasName];
        const canvas = this.getCanvas(newCanvasName) as Canvas<CanvasType>;
        this._setCanvasNameToProperty(canvas, newCanvasName);

        return newCanvasName;
    }

    public moveCanvas(canvasNames: string[]): void {
        if(!Array.isArray(canvasNames)) return;
        
        const newCanvases: CanvasArray<CanvasType> = [];
        for(let i = 0; i < canvasNames.length; i++) {
            const canvasName = canvasNames[i];
            const canvas = this.getCanvas(canvasName);
            if(canvas) {
                newCanvases.push(canvas);
            }     
        }

        this._replaceCanvases(newCanvases);
    }

    public duplicateCanvas(originCanvasName: string, duplicateCanvasName?: string): Canvas<CanvasType> | undefined {
        if(typeof originCanvasName !== "string") return;
        duplicateCanvasName = (typeof duplicateCanvasName === "string")? this._getAvailableCanvasName(duplicateCanvasName) : this._getAvailableCanvasName(originCanvasName);

        const originCanvas = this.getCanvas(originCanvasName);
        if(!originCanvas) return;
        const newCanvas = this._copyCanvas(originCanvas);
        this._setCanvasNameToProperty(newCanvas, duplicateCanvasName);
        this._insertCanvas(newCanvas, duplicateCanvasName, originCanvasName);

        return newCanvas;
    }

    public mergeCanvas(mergeCanvasNames: string[], forceCompositeOperation?: string): Canvas<CanvasType> | undefined {
        if(!Array.isArray(mergeCanvasNames)) return;

        const mergeTargetCanvasNames: string[] = [];
        const canvasNames = this.getCanvasNames();
        for(let i = 0; i < mergeCanvasNames.length; i++) {
            const mergeCanvasName = mergeCanvasNames[i];
            if(canvasNames.includes(mergeCanvasName)) mergeTargetCanvasNames.push(mergeCanvasName);
        }

        const newCanvases: CanvasArray<CanvasType> = [];
        const newCanvasIndexes: CanvasIndexMap = Object.create(null);

        // Create the canvas array after merging
        for(let i = 0, newIndex = 0; i < this.canvases.length; i++) {
            const canvas = this.canvases[i];
            const canvasName = this._getCanvasNameFromProperty(canvas);
            if(!mergeTargetCanvasNames.includes(canvasName) || mergeTargetCanvasNames[0] === canvasName) {
                newCanvases.push(canvas);
                newCanvasIndexes[canvasName] = newIndex;
                newIndex++;
            }
        }

        const baseCanvas = this.getCanvas(mergeTargetCanvasNames[0]) as Canvas<CanvasType>;
        const mergeCanvases: CanvasArray<CanvasType> = [];
        for(let i = 1; i < mergeTargetCanvasNames.length; i++) {
            mergeCanvases.push(this.getCanvas(mergeTargetCanvasNames[i]) as Canvas<CanvasType>);
        }

        this._mergeCanvases(baseCanvas, mergeCanvases, forceCompositeOperation);

        this.canvases = newCanvases;
        this.canvasIndexes = newCanvasIndexes;

        return baseCanvas;
    }

    public getCanvases(): CanvasArray<CanvasType> {
        return this.canvases;
    }

    public setCanvases(canvases: CanvasArray<CanvasType>): void {
        if(!Array.isArray(canvases)) return;
        this._replaceCanvases(canvases);
        return;
    }

    public getCanvasNames(): string[] {
        const canvasNames: string[] = [];
        for(let i = 0; i < this.canvases.length; i++) {
            canvasNames.push(this.canvases[i].xylograph.name);
        }
        return canvasNames;
    }

    public resize(width: number, height: number, sx?: number, sy?: number, sw?: number, sh?: number): void {
        if(typeof width !== "number" || typeof height !== "number") return;
        if(typeof sx !== "number") sx = 0;
        if(typeof sy !== "number") sy = 0;

        for(let i = 0; i < this.canvases.length; i++) {
            const originCanvas = this.canvases[i];
            const newCanvas = this._createCanvas(width, height) as Canvas<CanvasType>;
            const newCtx = newCanvas.getContext("2d");
            newCtx.drawImage(this._canvasToImage(originCanvas), sx, sy, sw || originCanvas.width, sh || originCanvas.height, 0, 0, width, height);
            this._setCloneOfCanvasProperty(newCanvas, originCanvas);
            this.canvases[i] = newCanvas;
        }

        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    public toDataURL(): string {
        const baseCanvas = this._createCanvas(this.canvasWidth, this.canvasHeight) as Canvas<CanvasType>;
        this._setDefaultCanvasProperty(baseCanvas, "");
        this._mergeCanvases(baseCanvas, this.canvases);
        return baseCanvas.toDataURL();
    }

    public toBinary(...args: any[]): ReturnType<FunctionType['canvasToBinary']> {
        const baseCanvas = this._createCanvas(this.canvasWidth, this.canvasHeight) as Canvas<CanvasType>;
        this._setDefaultCanvasProperty(baseCanvas, "");
        this._mergeCanvases(baseCanvas, this.canvases);
        args.unshift(baseCanvas);
        return this._canvasToBinary.apply(this, args as [any, any[]]);
    }

    private _insertCanvas(canvas: Canvas<CanvasType>, canvasName: string, afterOf?: number | string | undefined): void {
        if(!canvas || typeof canvasName !== "string") return; 

        if(typeof afterOf === "number") {
            // afterOf: index number => canvas name
            if(this.canvases.length >= 2 && afterOf < this.canvases.length - 1) {
                afterOf = this._getCanvasNameFromProperty(this.canvases[afterOf]);
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
                newCanvasIndexes[this._getCanvasNameFromProperty(newCanvases[i])] = i;
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

    private _getCanvasNameFromProperty(canvas: Canvas<CanvasType>): string {
        return canvas.xylograph.name;
    }

    private _setCanvasNameToProperty(canvas: Canvas<CanvasType>, canvasName: string): void {
        canvas.xylograph.name = canvasName;
    }

    private _getAvailableCanvasName(canvasName: string): string {
        while(typeof this.canvasIndexes[canvasName] !== "undefined") canvasName = this._canvasNameIncrement(canvasName);
        return canvasName;
    }

    private _canvasNameIncrement(canvasName: string): string {
        const incrementMark: RegExpMatchArray | null = canvasName.match(/\[[0-9]+\]$/);
        if(!incrementMark) return canvasName + "[1]";
        const num = parseInt(incrementMark.toString().slice(1, -1));
        return canvasName.replace(/\[[0-9]+\]$/, "[" + (num + 1) + "]");
    }

    private _setDefaultCanvasProperty(canvas: Canvas<CanvasType>, canvasName: string, compositeOperation = "source-over", hidden = false): void {
        canvas.xylograph = {
            name: canvasName,
            compositeOperation: compositeOperation,
            hidden: hidden
        }
    }

    private _setCloneOfCanvasProperty(destCanvas: Canvas<CanvasType>, originCanvas: Canvas<CanvasType>): void {
        const originProperty = originCanvas.xylograph;
        destCanvas.xylograph = {
            name: originProperty.name,
            compositeOperation: originProperty.compositeOperation,
            hidden: originProperty.hidden
        };
    }

    private _copyCanvas(originCanvas: Canvas<CanvasType>): Canvas<CanvasType> {
        const width = (typeof originCanvas.width === "number")? originCanvas.width : this.canvasWidth;
        const height = (typeof originCanvas.height === "number")? originCanvas.height : this.canvasHeight;

        const newCanvas = this._createCanvas(width, height) as Canvas<CanvasType>;
        const newCtx = newCanvas.getContext("2d");
        const originCtx = originCanvas.getContext("2d");
        newCtx.putImageData(originCtx.getImageData(0, 0, width, height), 0, 0);
        this._setCloneOfCanvasProperty(newCanvas, originCanvas);
        return newCanvas 
    }

    private _replaceCanvases(canvases: CanvasArray<CanvasType>): CanvasArray<CanvasType> {
        const newCanvases: CanvasArray<CanvasType> = [];
        const newCanvasIndexes: CanvasIndexMap = Object.create(null);
        for(let i = 0; i < canvases.length; i++) {
            const canvas = canvases[i];
            if(canvas) {
                const canvasName = this._getCanvasNameFromProperty(canvas);
                newCanvases.push(canvas);
                newCanvasIndexes[canvasName] = i;
            }
        }
        
        this.canvases = newCanvases;
        this.canvasIndexes = newCanvasIndexes;
        return newCanvases;
    }

    private _mergeCanvases(baseCanvas: Canvas<CanvasType>, mergeCanvases: CanvasArray<CanvasType>, forceCompositeOperation?: string): Canvas<CanvasType> {
        const baseCtx = baseCanvas.getContext("2d");
        for(let i = 0; i < mergeCanvases.length; i++) {
            const canvas = mergeCanvases[i];
            if(canvas.xylograph.hidden) continue;
            baseCtx.globalCompositeOperation = (forceCompositeOperation)? forceCompositeOperation : canvas.xylograph.compositeOperation;
            baseCtx.drawImage(this._canvasToImage(canvas), 0, 0, canvas.width, canvas.height, 0, 0, baseCanvas.width, baseCanvas.height);
        }

        baseCtx.globalCompositeOperation = baseCanvas.xylograph.compositeOperation;
        return baseCanvas;
    }
}