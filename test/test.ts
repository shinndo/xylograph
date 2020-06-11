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
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const name = "addNamedCanvasTest";

        // Simple add
        const canvas = xg.addCanvas(name);
        expect(canvas.xylograph.name).toBe(name);

        // Canvas name conflict (1)
        const canvas1 = xg.addCanvas(name);
        expect(canvas1.xylograph.name).toBe(name + "[1]");
        
        // Canvas name conflict (2)
        xg.addCanvas(name + "[1][0]")
        const canvas11 = xg.addCanvas(name + "[1][0]");
        expect(canvas11.xylograph.name).toBe(name + "[1][1]")

        // Canvas name conflict (3)
        xg.addCanvas(name + "[1]a");
        const canvas1a1 = xg.addCanvas(name + "[1]a");
        expect(canvas1a1.xylograph.name).toBe(name + "[1]a[1]");

        // Canvas name conflict (4)
        xg.addCanvas("");
        const unnamedCanvas1 = xg.addCanvas("");
        expect(unnamedCanvas1.xylograph.name).toBe("[1]");
    });

    test("getCanvas(name)", () => {
        expect.assertions(3);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const name = "getNamedCanvasTest";

        // Simple get
        expect(xg.addCanvas(name)).toEqual(xg.getCanvas(name));

        // Canvas name conflict (1)
        xg.addCanvas(name);
        expect(xg.addCanvas(name)).toEqual(xg.getCanvas(name + "[2]"));

        // Canvas name conflict (2)
        xg.addCanvas("");
        expect(xg.addCanvas("")).toEqual(xg.getCanvas("[1]"));
    });

    test("removeCanvas(name)", () => {
        expect.assertions(4);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const name = "removeCanvasTest";

        xg.addCanvas(name);                 // add: removeCanvasTest
        const canvas1 = xg.addCanvas(name); // add: removeCanvasTest[1]
        xg.addCanvas(name);                 // add: removeCanvasTest[2]
        const canvas3 = xg.addCanvas(name); // add: removeCanvasTest[3]

        xg.removeCanvas(name);         // remove: removeCanvasTest
        xg.removeCanvas(name + "[2]"); // remove: removeCanvasTest[2]

        expect(xg.getCanvas(name)).toBeUndefined();          // removeCanvasTest    => undefined
        expect(xg.getCanvas(name + "[1]")).toEqual(canvas1); // removeCanvasTest[1]
        expect(xg.getCanvas(name + "[2]")).toBeUndefined();  // removeCanvasTest[2] => undefined
        expect(xg.getCanvas(name + "[3]")).toEqual(canvas3); // removeCanvasTest[3]
    });

    test("moveCanvas(canvasMap)", () => {
        expect.assertions(7);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });

        const topName = "top";
        const middleName = "middle";
        const bottomName = "bottom";

        const topCanvas = xg.addCanvas(topName);
        const middleCanvas = xg.addCanvas(middleName);
        const bottomCanvas = xg.addCanvas(bottomName);
        // (1) "top" (2) "middle" (3) "bottom"
        
        const newOrder = new Map<string, Canvas<MockCanvas>>();
        newOrder.set(bottomName, bottomCanvas);
        newOrder.set(middleName, middleCanvas);
        newOrder.set(topName, topCanvas);
        // (1) "top" => "bottom" (2) "middle" => "middle" (3) "bottom" => "top"
        
        xg.moveCanvas(newOrder);

        const orderIt = newOrder.entries();
        const movedCanvases = xg.getCanvases();
        expect(movedCanvases.size).toEqual(newOrder.size);
        movedCanvases.forEach((targetCanvas: Canvas<MockCanvas>, targetCanvasName: string) => {
            const orderItResult = orderIt.next();
            expect(targetCanvas).toEqual(orderItResult.value[1]);
            expect(targetCanvasName).toEqual(orderItResult.value[0]);
        });
    });

    test("getCanvases()", () => {
        expect.assertions(7);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });

        const firstName = "1st";
        const secondName = "2nd";
        const thirdName = "3rd";
        
        const addCanvasOrder = new Map<string, Canvas<MockCanvas>>();
        addCanvasOrder.set(firstName, xg.addCanvas(firstName));
        addCanvasOrder.set(secondName, xg.addCanvas(secondName));
        addCanvasOrder.set(thirdName, xg.addCanvas(thirdName));

        const orderIt = addCanvasOrder.entries();
        const targetCanvases = xg.getCanvases();
        expect(targetCanvases.size).toEqual(addCanvasOrder.size);
        targetCanvases.forEach((targetCanvas: Canvas<MockCanvas>, targetCanvasName: string) => {
            const orderItResult = orderIt.next();
            expect(targetCanvas).toEqual(orderItResult.value[1]);
            expect(targetCanvasName).toEqual(orderItResult.value[0]);
        });
    });

    test("renameCanvas(oldCanvasName, newCanvasName)", () => {
        expect.assertions(13);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });

        // Simple rename
        const oldCanvasName = "old";
        const newCanvasName = "new";
        const renameCanvas = xg.addCanvas(oldCanvasName);
        const renamed1Name = xg.renameCanvas(oldCanvasName, newCanvasName);
        expect(renamed1Name).toEqual(newCanvasName);
        expect(renameCanvas).toEqual(xg.getCanvas(newCanvasName));

        // Name conflict
        const bgCanvasName = "bg";
        const subCanvasName = "sub";
        const mainCanvasName = "main";
        const bgCanvas = xg.addCanvas(bgCanvasName);        // "bg"
        const rename2Canvas = xg.addCanvas(subCanvasName);  // "sub"
        const mainCanvas = xg.addCanvas(mainCanvasName);    // "main"
        const renamed2Name = xg.renameCanvas(subCanvasName, mainCanvasName);     // "sub" => "main[1]"
        expect(renamed2Name).toEqual(mainCanvasName + "[1]");
        expect(rename2Canvas).toEqual(xg.getCanvas(mainCanvasName + "[1]"))

        // All canvas check
        const checkArray: {canvas: Canvas<MockCanvas>, canvasName: string}[] = [];
        checkArray.push({canvas: renameCanvas, canvasName: newCanvasName});
        checkArray.push({canvas: bgCanvas, canvasName: bgCanvasName});
        checkArray.push({canvas: rename2Canvas, canvasName: mainCanvasName + "[1]"});
        checkArray.push({canvas: mainCanvas, canvasName: mainCanvasName});
        const checkIt = checkArray.entries();

        const renamedCanvases = xg.getCanvases();

        expect(renamedCanvases.size).toEqual(checkArray.length);
        renamedCanvases.forEach((targetCanvas: Canvas<MockCanvas>, targetCanvasName: string) => {
            const checkItValue = checkIt.next().value[1];
            expect(targetCanvas).toEqual(checkItValue.canvas);
            expect(targetCanvasName).toEqual(checkItValue.canvasName);
        });
    });

    test.todo("duplicateCanvas(targetName, newCanvasName?)");
    test.todo("margeCanvas(baseCanvas, margeCanvas[], compositeOperation)");
    test.todo("resize()");
    test.todo("createOutputStream()");
    test.todo("toDataURL()");
    test.todo("toBlob()");
});

describe("Event", () => {
    test("addCanvas", () => {
        expect.assertions(2);
        const tag = "addCanvasEvent";
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(tag)
        });

        // Set event handler
        xg.on("addCanvas", (canvas: Canvas<MockCanvas>, canvasName: string) => {
            expect(canvas.tag).toBe(tag);
            expect(canvasName).toBe(tag);
        });

        xg.addCanvas(tag); // Fire event
    });

    test("removeCanvas", () => {
        expect.assertions(1);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const name = "removeCanvasEvent";

        // Set event handler
        xg.on("removeCanvas", (canvasName: string) => {
            expect(canvasName).toBe(name);
        });

        xg.addCanvas(name);
        xg.removeCanvas(name); // Fire event
    });

    test("moveCanvas", () => {
        expect.assertions(7);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const newOrder = new Map<string, Canvas<MockCanvas>>();

        // Set event handler
        xg.on("moveCanvas", (canvases: Map<string, Canvas<MockCanvas>>) => {
            const orderIt = newOrder.entries();
            expect(canvases.size).toEqual(newOrder.size);
            canvases.forEach((canvas: Canvas<MockCanvas>, key: string) => {
                const orderItResult = orderIt.next();
                expect(canvas).toEqual(orderItResult.value[1]);
                expect(key).toEqual(orderItResult.value[0]);
            });
        });

        const firstName = "1st";
        const secondName = "2nd";
        const thirdName = "3rd";

        const firstCanvas = xg.addCanvas(firstName);
        const secondCanvas = xg.addCanvas(secondName);
        const thirdCanvas = xg.addCanvas(thirdName);
        // (1) "1st" (2) "2nd" (3) "3rd"

        newOrder.set(secondName, secondCanvas);
        newOrder.set(thirdName, thirdCanvas);
        newOrder.set(firstName, firstCanvas);
        // (1) "1st" => "2nd" (2) "2nd" => "3rd" (3) "3rd" => "1st"

        xg.moveCanvas(newOrder); // Fire event
    });

    test("renameCanvas", () => {
        expect.assertions(4);
        const tag = "renameCanvasEvent";
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(tag)
        });

        const oldName = "oldName";
        const newName = "newName";

        // Set event handler
        xg.on("renameCanvas", (canvas: Canvas<MockCanvas>, newCanvasName: string, targetCanvasName: string) => {
            expect(canvas.tag).toBe(tag);
            expect(newCanvasName).toBe(newName + "[1]");
            expect(targetCanvasName).toBe(oldName);
        });

        xg.addCanvas(oldName); // "oldName"
        xg.addCanvas(newName); // "newName"

        // Fire event
        const renamedName = xg.renameCanvas(oldName, newName);  // "oldName" => "newName[1]" (name conflict)
        expect(renamedName).toBe(newName + "[1]");
    });
});

describe("Static", () => {
    test.todo("createHTMLCanvas()");
    test.todo("createCanvasFromImage()");
});