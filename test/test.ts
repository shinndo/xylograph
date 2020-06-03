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


describe("Xylograph class", () => {
    test("Instantiate", () => {
        expect.assertions(1);
        const notThrowInstantiate = () => {
            const xg: Xylograph = new Xylograph({
                createCanvasFunction: createCanvasFunctionMock()
            });
        }
        expect(notThrowInstantiate).not.toThrow();
    });

    test("addCanvas(name)", () => {
        expect.assertions(1);
        const tag: string = "addNamedCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock(tag)
        });
        const canvas: MockCanvas = xg.addCanvas(tag) as MockCanvas;
        expect(canvas.tag).toBe(tag);
    });

    test("getCanvas(name)", () => {
        expect.assertions(1);
        const name: string = "getNamedCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        expect(xg.addCanvas(name)).toEqual(xg.getCanvas(name));
    });

    test("removeCanvas(name)", () => {
        expect.assertions(1);
        const name: string = "removeCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        xg.addCanvas(name);
        xg.removeCanvas(name);
        expect(xg.getCanvas(name)).toBeUndefined();
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

describe("Canvas API Compatibility", () => {
    test("Canvas.getContext('2d')", () => {
        expect.assertions(1);
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvas as CreateCanvasFunction
        });
        expect(true).toBe(false);
    });

    test("Context.FillStyle =", () => {
        expect.assertions(1);
        expect(true).toBe(false);
    });

    test("Context.FillRect()", () => {
        expect.assertions(1);
        expect(true).toBe(false);
    });
});

