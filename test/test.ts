import { Xylograph, Canvas, Context, CreateCanvasFunction } from "../src/index";
import { createCanvas } from "canvas";

interface MockCanvas {
    tag?: string;
}

const createCanvasFunctionMock = (tag?: string) => {
    return (w: number, h:number): Canvas => {
        const mockCanvas: MockCanvas = {};
        if(typeof tag == "string") mockCanvas.tag = tag; 
        return mockCanvas as Canvas;
    }
};


describe("Xylograph", () => {
    test("constructor", () => {
        expect.assertions(1);
        const notThrowInstantiate = () => {
            const xg: Xylograph = new Xylograph({
                createCanvasFunction: createCanvasFunctionMock()
            });
        }
        expect(notThrowInstantiate).not.toThrow();
    });

    test("addCanvas(name)", () => {
        expect.assertions(5);
        const name: string = "addNamedCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const canvas: Canvas = xg.addCanvas(name);
        expect(canvas.xylograph.name).toBe(name);
        const canvas1: Canvas = xg.addCanvas(name);
        expect(canvas1.xylograph.name).toBe(name + "[1]");
        xg.addCanvas(name + "[1][0]")
        const canvas11: Canvas = xg.addCanvas(name + "[1][0]");
        expect(canvas11.xylograph.name).toBe(name + "[1][1]")
        xg.addCanvas(name + "[1]a");
        const canvas1a1: Canvas = xg.addCanvas(name + "[1]a");
        expect(canvas1a1.xylograph.name).toBe(name + "[1]a[1]");
        xg.addCanvas("");
        const unnamedCanvas1: Canvas = xg.addCanvas("");
        expect(unnamedCanvas1.xylograph.name).toBe("[1]");
    });

    test("getCanvas(name)", () => {
        expect.assertions(3);
        const name: string = "getNamedCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        expect(xg.addCanvas(name)).toEqual(xg.getCanvas(name));
        xg.addCanvas(name);
        expect(xg.addCanvas(name)).toEqual(xg.getCanvas(name + "[2]"));
        xg.addCanvas("");
        expect(xg.addCanvas("")).toEqual(xg.getCanvas("[1]"));
    });

    test("removeCanvas(name)", () => {
        expect.assertions(4);
        const name: string = "removeCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        xg.addCanvas(name);
        const canvas1: Canvas = xg.addCanvas(name);
        xg.addCanvas(name);
        const canvas3: Canvas = xg.addCanvas(name);
        xg.removeCanvas(name);
        xg.removeCanvas(name + "[2]");
        expect(xg.getCanvas(name)).toBeUndefined();
        expect(xg.getCanvas(name + "[2]")).toBeUndefined();
        expect(xg.getCanvas(name + "[1]")).toEqual(canvas1);
        expect(xg.getCanvas(name + "[3]")).toEqual(canvas3);
    });

    test("moveCanvas(canvas[])", () => {
        expect.assertions(1);
        const name: string = "moveCanvas";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const topCanvas: Canvas = xg.addCanvas("top");
        const middleCanvas: Canvas = xg.addCanvas(name);
        const bottomCanvas: Canvas = xg.addCanvas("bottom");
        const canvases: Canvas[] = [bottomCanvas, middleCanvas, topCanvas];
        xg.moveCanvas(canvases);

        const movedCanvases: Canvas[] = xg.getCanvases();
        expect(movedCanvases).toEqual(canvases);
    });

    test("getCanvases()", () => {
        expect.assertions(1);
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const addCanvases: Canvas[] = [xg.addCanvas("1st"), xg.addCanvas("2nd"), xg.addCanvas("3rd")];
        expect(xg.getCanvases()).toEqual(addCanvases);
    });
});

describe("Event", () => {
    test("addCanvas", () => {
        expect.assertions(1);
        const tag: string = "addCanvasEvent";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock(tag)
        });
        xg.on("addCanvas", (canvas: Canvas) => {
            expect((canvas as MockCanvas).tag).toBe(tag);
        });
        xg.addCanvas(tag);
    });

    test("removeCanvas", () => {
        expect.assertions(1);
        const name: string = "removeCanvasEvent";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        xg.on("removeCanvas", (canvasName: string) => {
            expect(canvasName).toBe(name);
        });
        xg.addCanvas(name);
        xg.removeCanvas(name);
    });

    test("moveCanvas", () => {
        expect.assertions(1);
        const moveCanvases: Canvas[] = Array(3);
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        xg.on("moveCanvas", (canvases: Canvas[]) => {
            expect(canvases).toEqual(moveCanvases);
        });
        moveCanvases[2] = xg.addCanvas("1st");
        moveCanvases[0] = xg.addCanvas("2nd");
        moveCanvases[1] = xg.addCanvas("3rd")
        xg.moveCanvas(moveCanvases);
    });
});