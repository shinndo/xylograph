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
                createCanvasFunction: createCanvas as CreateCanvasFunction
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
});

describe("Event", () => {
    test("addCanvas", () => {
        expect.assertions(1);
        const tag: string = "addCanvasEvent";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvas as CreateCanvasFunction
        });
        xg.on("addCanvas", (canvas: Canvas) => {
            expect(canvas.xylograph.name).toBe(tag);
        });
        xg.addCanvas(tag);
    });

    test("removeCanvas", () => {
        expect.assertions(1);
        const name: string = "removeCanvasEvent";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvas as CreateCanvasFunction
        });
        xg.on("removeCanvas", (canvasName: string) => {
            expect(canvasName).toBe(name);
        });
        xg.addCanvas(name);
        xg.removeCanvas(name);
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

