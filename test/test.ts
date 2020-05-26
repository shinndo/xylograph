import { Xylograph, Canvas, Context } from "../src/index";
import { createCanvas } from "canvas";
import { create } from "domain";

interface MockCanvas {
    tag?: string;
}

const createCanvasFunctionMock = (tag?: string) => {
    return (w: number, h:number): MockCanvas => {
        const mockCanvas: MockCanvas = {};
        if(typeof tag == "string") mockCanvas.tag = tag; 
        return mockCanvas;
    }
};


describe("Xylograph class", () => {
    test("Instantiate", () => {
        expect.assertions(1);
        const notThrowInstantiate = () => {
            const xg: Xylograph = new Xylograph({
                createCanvasFunction: createCanvas
            });
        }
        expect(notThrowInstantiate).not.toThrow();
    });

    test("addCanvas()", () => {
        expect.assertions(1);
        const tag: string = "addCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock(tag)
        });
        const canvas: MockCanvas = xg.addCanvas() as MockCanvas;
        expect(canvas.tag).toBe(tag);
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

    test("getCanvas()", () => {
        expect.assertions(1);        
        const tag: string = "getCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock(tag)
        });
        expect(xg.addCanvas()).toEqual(xg.getCanvas("0"));
    });

    test("getCanvas(name)", () => {
        expect.assertions(1);
        const name: string = "getNamedCanvasTest";
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvasFunctionMock()
        });
        expect(xg.addCanvas(name)).toEqual(xg.getCanvas(name));
    });

    test.todo("removeCanvas(name)");
});

describe("Event", () => {
    test("addCanvas", () => {
        expect.assertions(1);
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvas
        });
        xg.on("addCanvas", (canvas: Canvas, cxt: Context) => {
            expect("ok").toBe("ok");
        });
        xg.addCanvas();
    });
});

describe("Canvas API Compatibility", () => {
    test("Canvas.getContext('2d')", () => {
        expect.assertions(1);
        const xg: Xylograph = new Xylograph({
            createCanvasFunction: createCanvas
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

