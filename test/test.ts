import { Xylograph, Canvas, CreateCanvasFunction } from "../src/index";
import { createCanvas } from "canvas";

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


describe("Xylograph", () => {
    test("constructor", () => {
        expect.assertions(1);
        const notThrowInstantiate = () => {
            new Xylograph<MockCanvas>({
                createCanvasFunction: createCanvasFunctionMock()
            });
        }
        expect(notThrowInstantiate).not.toThrow();
    });

    test("addCanvas(name)", () => {
        expect.assertions(5);
        const name = "addNamedCanvasTest";
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const canvas = xg.addCanvas(name);
        expect(canvas.xylograph.name).toBe(name);
        const canvas1 = xg.addCanvas(name);
        expect(canvas1.xylograph.name).toBe(name + "[1]");
        xg.addCanvas(name + "[1][0]")
        const canvas11 = xg.addCanvas(name + "[1][0]");
        expect(canvas11.xylograph.name).toBe(name + "[1][1]")
        xg.addCanvas(name + "[1]a");
        const canvas1a1 = xg.addCanvas(name + "[1]a");
        expect(canvas1a1.xylograph.name).toBe(name + "[1]a[1]");
        xg.addCanvas("");
        const unnamedCanvas1 = xg.addCanvas("");
        expect(unnamedCanvas1.xylograph.name).toBe("[1]");
    });

    test("getCanvas(name)", () => {
        expect.assertions(3);
        const name = "getNamedCanvasTest";
        const xg = new Xylograph<MockCanvas>({
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
        const name = "removeCanvasTest";
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        xg.addCanvas(name);
        const canvas1 = xg.addCanvas(name);
        xg.addCanvas(name);
        const canvas3 = xg.addCanvas(name);
        xg.removeCanvas(name);
        xg.removeCanvas(name + "[2]");
        expect(xg.getCanvas(name)).toBeUndefined();
        expect(xg.getCanvas(name + "[2]")).toBeUndefined();
        expect(xg.getCanvas(name + "[1]")).toEqual(canvas1);
        expect(xg.getCanvas(name + "[3]")).toEqual(canvas3);
    });

    test("moveCanvas(canvas[])", () => {
        expect.assertions(1);
        const name = "moveCanvas";
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const topCanvas = xg.addCanvas("top");
        const middleCanvas = xg.addCanvas(name);
        const bottomCanvas = xg.addCanvas("bottom");
        const canvases = [bottomCanvas, middleCanvas, topCanvas];
        xg.moveCanvas(canvases);

        const movedCanvases = xg.getCanvases();
        expect(movedCanvases).toEqual(canvases);
    });

    test("getCanvases()", () => {
        expect.assertions(1);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const addCanvases = [xg.addCanvas("1st"), xg.addCanvas("2nd"), xg.addCanvas("3rd")];
        expect(xg.getCanvases()).toEqual(addCanvases);
    });

    test("renameCanvas(oldCanvasName, newCanvasName)", () => {
        expect.assertions(2);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });

        const oldCanvasName = "old";
        const newCanvasName = "new";
        const oldCanvas = xg.addCanvas(oldCanvasName);
        xg.renameCanvas(oldCanvasName, newCanvasName);
        expect(oldCanvas).toEqual(xg.getCanvas(newCanvasName));

        const bgCanvasName = "bg";
        const subCanvasName = "sub";
        const mainCanvasName = "main";
        xg.addCanvas(bgCanvasName);
        const subCanvas = xg.addCanvas(subCanvasName);
        xg.addCanvas(mainCanvasName);
        xg.renameCanvas(subCanvasName, mainCanvasName);
        expect(subCanvas).toEqual(xg.getCanvas(mainCanvasName + "[1]"))

    });

    test.todo("duplicateCanvas(targetName, newCanvasName?)");
    test.todo("resize()");
});

describe("Event", () => {
    test("addCanvas", () => {
        expect.assertions(2);
        const tag = "addCanvasEvent";
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(tag)
        });
        xg.on("addCanvas", (canvas: Canvas<MockCanvas>, canvasName: string) => {
            expect(canvas.tag).toBe(tag);
            expect(canvasName).toBe(tag);
        });
        xg.addCanvas(tag);
    });

    test("removeCanvas", () => {
        expect.assertions(1);
        const name = "removeCanvasEvent";
        const xg = new Xylograph<MockCanvas>({
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
        const moveCanvases: Canvas<MockCanvas>[] = Array(3);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        xg.on("moveCanvas", (canvases: Canvas<MockCanvas>[]) => {
            expect(canvases).toEqual(moveCanvases);
        });
        moveCanvases[2] = xg.addCanvas("1st");
        moveCanvases[0] = xg.addCanvas("2nd");
        moveCanvases[1] = xg.addCanvas("3rd")
        xg.moveCanvas(moveCanvases);
    });

    test("renameCanvas", () => {
        expect.assertions(3);
        const tag = "renameCanvasEvent";
        const oldName = "oldName";
        const newName = "newName";
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(tag)
        });
        xg.on("renameCanvas", (canvas: Canvas<MockCanvas>, newCanvasName: string, oldCanvasName: string) => {
            expect(canvas.tag).toBe(tag);
            expect(newCanvasName).toBe(newName);
            expect(oldCanvasName).toBe(oldName);
        });
        xg.addCanvas(oldName);
        xg.renameCanvas(oldName, newName);
    });
});

describe("Static", () => {
    test.todo("createHTMLCanvas()");
    test.todo("createCanvasFromImage()");
});