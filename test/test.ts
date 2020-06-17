import { Xylograph, Canvas, CreateCanvasFunction } from "../src/index";
import * as NodeCanvas from "canvas";

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
        expect.assertions(10);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });
        const name = "addNamedCanvasTest";
        const afterName = "afterTest";

        // Simple add
        const canvas = xg.addCanvas(name);                       // "addNamedCanvasTest"
        expect(canvas.xylograph.name).toBe(name);

        /*
         *  [0] => "addNamedCanvasTest"
         */

        // Insert canvas (invalid: length < 2)
        xg.addCanvas(afterName, 0);                              // "afterTest"
        const canvases1 = xg.getCanvases();
        expect(canvases1[1].xylograph.name).toBe(afterName);

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest"
         */

        // Canvas name conflict (1)
        const canvas1 = xg.addCanvas(name);                      // "addNamedCanvasTest[1]"
        expect(canvas1.xylograph.name).toBe(name + "[1]");

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest"
         *  [2] => "addNamedCanvasTest[1]"
         */

        // Insert canvas (invalid: afterOf > length - 1)
        xg.addCanvas(afterName + "2", 3);                        // "afterTest2"
        const canvases2 = xg.getCanvases();
        expect(canvases2[3].xylograph.name).toBe(afterName + "2");

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest"
         *  [2] => "addNamedCanvasTest[1]"
         *  [3] => "afterTest2"
         */
        
        // Canvas name conflict (2)
        xg.addCanvas(name + "[1][0]");                           // "addNamedCanvasTest[1][0]"
        const canvas11 = xg.addCanvas(name + "[1][0]");          // "addNamedCanvasTest[1][1]"
        expect(canvas11.xylograph.name).toBe(name + "[1][1]");

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest"
         *  [2] => "addNamedCanvasTest[1]"
         *  [3] => "afterTest2"
         *  [4] => "addNamedCanvasTest[1][0]"
         *  [5] => "addNamedCanvasTest[1][1]"
         */

        // Canvas name conflict (3)
        xg.addCanvas(name + "[1]a");                             // "addNamedCanvasTest[1]a"
        const canvas1a1 = xg.addCanvas(name + "[1]a");           // "addNamedCanvasTest[1]a[1]"
        expect(canvas1a1.xylograph.name).toBe(name + "[1]a[1]");

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest"
         *  [2] => "addNamedCanvasTest[1]"
         *  [3] => "afterTest2"
         *  [4] => "addNamedCanvasTest[1][0]"
         *  [5] => "addNamedCanvasTest[1][1]"
         *  [6] => "addNamedCanvasTest[1]a"
         *  [7] => "addNamedCanvasTest[1]a[1]"
         */

        // Canvas name conflict (4)
        xg.addCanvas("");                                        // ""
        const unnamedCanvas1 = xg.addCanvas("");                 // "[1]"
        expect(unnamedCanvas1.xylograph.name).toBe("[1]");

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest"
         *  [2] => "addNamedCanvasTest[1]"
         *  [3] => "afterTest2"
         *  [4] => "addNamedCanvasTest[1][0]"
         *  [5] => "addNamedCanvasTest[1][1]"
         *  [6] => "addNamedCanvasTest[1]a"
         *  [7] => "addNamedCanvasTest[1]a[1]"
         *  [8] => ""
         *  [9] => "[1]"
         */

        
        // Insert canvas (canvasName) and name conflict
        xg.addCanvas(afterName, name);                           // "afterTest[1]"
        const canvases3 = xg.getCanvases();
        expect(canvases3[1].xylograph.name).toBe(afterName + "[1]");

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest[1]"
         *  [2] => "afterTest"
         *  [3] => "addNamedCanvasTest[1]"
         *  [4] => "afterTest2"
         *  [5] => "addNamedCanvasTest[1][0]"
         *  [6] => "addNamedCanvasTest[1][1]"
         *  [7] => "addNamedCanvasTest[1]a"
         *  [8] => "addNamedCanvasTest[1]a[1]"
         *  [9] => ""
         *  [10] => "[1]"
         */

        // Insert canvas (canvasIndex)
        xg.addCanvas(afterName + "3", 2);                        // "afterTest3"
        const canvases4 = xg.getCanvases();
        expect(canvases4[3].xylograph.name).toBe(afterName + "3");

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest[1]"
         *  [2] => "afterTest"
         *  [3] => "afterTest3"
         *  [4] => "addNamedCanvasTest[1]"
         *  [5] => "afterTest2"
         *  [6] => "addNamedCanvasTest[1][0]"
         *  [7] => "addNamedCanvasTest[1][1]"
         *  [8] => "addNamedCanvasTest[1]a"
         *  [9] => "addNamedCanvasTest[1]a[1]"
         *  [10] => ""
         *  [11] => "[1]"
         */


        // Insert canvas (invalid canvas name)
        xg.addCanvas(afterName + "4", name + "hoge");            // "afterTest4"
        const canvases5 = xg.getCanvases();
        expect(canvases5[12].xylograph.name).toBe(afterName + "4");

        /*
         *  [0] => "addNamedCanvasTest"
         *  [1] => "afterTest[1]"
         *  [2] => "afterTest"
         *  [3] => "afterTest3"
         *  [4] => "addNamedCanvasTest[1]"
         *  [5] => "afterTest2"
         *  [6] => "addNamedCanvasTest[1][0]"
         *  [7] => "addNamedCanvasTest[1][1]"
         *  [8] => "addNamedCanvasTest[1]a"
         *  [9] => "addNamedCanvasTest[1]a[1]"
         *  [10] => ""
         *  [11] => "[1]"
         *  [12] => "afterTest4"
         */
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

    test("moveCanvas(canvasName[])", () => {
        expect.assertions(7);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock()
        });

        const topName = "top";
        const middleName = "middle";
        const bottomName = "bottom";

        xg.addCanvas(topName);
        xg.addCanvas(middleName);
        xg.addCanvas(bottomName);
        // (1) "top" (2) "middle" (3) "bottom"
        
        const newOrder: string[] = [];
        newOrder.push(bottomName);
        newOrder.push(middleName);
        newOrder.push(topName);
        // (1) "top" => "bottom" (2) "middle" => "middle" (3) "bottom" => "top"
        
        xg.moveCanvas(newOrder);

        const orderIt = newOrder.values();
        const movedCanvases = xg.getCanvases();
        expect(movedCanvases.length).toEqual(newOrder.length);
        movedCanvases.forEach((targetCanvas: Canvas<MockCanvas>) => {
            const orderCanvasName = orderIt.next().value;
            expect(targetCanvas).toEqual(xg.getCanvas(orderCanvasName));
            expect(targetCanvas.xylograph.name).toEqual(orderCanvasName);
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
        xg.addCanvas(firstName)
        xg.addCanvas(secondName)
        xg.addCanvas(thirdName)

        const addCanvasOrder: string[] = [];
        addCanvasOrder.push(firstName);
        addCanvasOrder.push(secondName);
        addCanvasOrder.push(thirdName);

        const orderIt = addCanvasOrder.values();
        const targetCanvases = xg.getCanvases();
        expect(targetCanvases.length).toEqual(addCanvasOrder.length);
        targetCanvases.forEach((targetCanvas: Canvas<MockCanvas>) => {
            const orderCanvasName = orderIt.next().value;
            expect(targetCanvas).toEqual(xg.getCanvas(orderCanvasName));
            expect(targetCanvas.xylograph.name).toEqual(orderCanvasName);
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
        xg.addCanvas(bgCanvasName);                         // "bg"
        const rename2Canvas = xg.addCanvas(subCanvasName);  // "sub"
        xg.addCanvas(mainCanvasName);                       // "main"
        const renamed2Name = xg.renameCanvas(subCanvasName, mainCanvasName);     // "sub" => "main[1]"
        expect(renamed2Name).toEqual(mainCanvasName + "[1]");
        expect(rename2Canvas).toEqual(xg.getCanvas(mainCanvasName + "[1]"))

        // All canvas check
        const canvasNames: string[] = [];
        canvasNames.push(newCanvasName);
        canvasNames.push(bgCanvasName);
        canvasNames.push(mainCanvasName + "[1]");
        canvasNames.push(mainCanvasName);
        const canvasNamesIt = canvasNames.values();

        const renamedCanvases = xg.getCanvases();

        expect(renamedCanvases.length).toEqual(canvasNames.length);
        renamedCanvases.forEach((targetCanvas: Canvas<MockCanvas>) => {
            const canvasName = canvasNamesIt.next().value;
            expect(targetCanvas).toEqual(xg.getCanvas(canvasName));
            expect(targetCanvas.xylograph.name).toEqual(canvasName);
        });
    });

    test("duplicateCanvas(targetCanvasName, duplicateCanvasName?)", () => {
        expect.assertions(14);
        const canvasWidth = 10;
        const canvasHeight = 10;
        const xg1 = new Xylograph<NodeCanvas.Canvas>({
            createCanvasFunction: NodeCanvas.createCanvas,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight
        });

        const originCanvasName = "originCanvas";
        const duplicateCanvasName = "duplicateCanvas";
        const testCompositeMode = "test-composite";
        const testHiddenMode = true;        

        // Simple copy
        const originCanvas = xg1.addCanvas(originCanvasName);
        originCanvas.xylograph.compositeOperation = testCompositeMode;
        originCanvas.xylograph.hidden = testHiddenMode;
        const originCtx = originCanvas.getContext("2d");
        originCtx.fillStyle = "#FF0000";
        originCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        const duplicateCanvas1 = xg1.duplicateCanvas(originCanvasName) as Canvas<NodeCanvas.Canvas>;
        expect(duplicateCanvas1.xylograph.name).toEqual(originCanvasName + "[1]");
        expect(duplicateCanvas1.getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight).data).toEqual(originCanvas.getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight).data);
        expect(duplicateCanvas1.xylograph.compositeOperation).toEqual(testCompositeMode);
        expect(duplicateCanvas1.xylograph.hidden).toEqual(testHiddenMode);

        // Specified name
        const duplicateCanvas2 = xg1.duplicateCanvas(originCanvasName, duplicateCanvasName) as Canvas<NodeCanvas.Canvas>;
        expect(duplicateCanvas2.xylograph.name).toEqual(duplicateCanvasName);

        // Deep copy
        const testCompositeMode2 = "test-composite2";
        originCtx.fillStyle = "#00FF00";
        originCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        originCanvas.xylograph.compositeOperation = testCompositeMode2;
        originCanvas.xylograph.hidden = !testHiddenMode;
        expect(duplicateCanvas1.getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight).data).not.toEqual(originCanvas.getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight).data);
        expect(duplicateCanvas1.xylograph.compositeOperation).not.toEqual(originCanvas.xylograph.compositeOperation);
        expect(duplicateCanvas1.xylograph.hidden).not.toEqual(originCanvas.xylograph.hidden);

        // Insert position
        // [0] => "originCanvas"
        // [1] => "duplicateCanvas"
        // [2] => "originCanvas[1]"
        const duplicateCanvas3 = xg1.duplicateCanvas(duplicateCanvasName, duplicateCanvasName) as Canvas<NodeCanvas.Canvas>;
        // [0] => "originCanvas"
        // [1] => "duplicateCanvas"
        // [2] => "duplicateCanvas[1]"
        // [3] => "originCanvas[1]"
        expect(duplicateCanvas3.xylograph.name).toEqual(duplicateCanvasName + "[1]");
        expect(xg1.getCanvases()[2]).toEqual(duplicateCanvas3);

        // Specified originCanvas is not exist
        expect(xg1.duplicateCanvas("noname")).toBeUndefined();
        
        // Specified copyCanvasFunction
        let copyFunctionRunned = false;
        const shallowChangeName = "shallow";
        const xg2 = new Xylograph<NodeCanvas.Canvas>({
            createCanvasFunction: NodeCanvas.createCanvas,
            copyCanvasFunction: (originCanvas: Canvas<NodeCanvas.Canvas>) => {
                copyFunctionRunned = true;
                return originCanvas;
            },
            canvasWidth: 1,
            canvasHeight: 1
        });
        const shallowOriginCanvas = xg2.addCanvas(originCanvasName);
        const shallowDuplicateCanvas = xg2.duplicateCanvas(originCanvasName, duplicateCanvasName) as Canvas<NodeCanvas.Canvas>;
        expect(copyFunctionRunned).toEqual(true);
        expect(shallowDuplicateCanvas.xylograph.name).toEqual(duplicateCanvasName);
        shallowOriginCanvas.xylograph.name = shallowChangeName;
        expect(shallowDuplicateCanvas.xylograph.name).toEqual(shallowChangeName);
    });

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
        const newOrder: string[] = [];

        // Set event handler
        xg.on("moveCanvas", (canvases: Canvas<MockCanvas>[]) => {
            const orderIt = newOrder.values();
            expect(canvases.length).toEqual(newOrder.length);
            canvases.forEach((targetCanvas: Canvas<MockCanvas>) => {
                const orderCanvasName = orderIt.next().value;
                expect(targetCanvas).toEqual(xg.getCanvas(orderCanvasName));
                expect(targetCanvas.xylograph.name).toEqual(orderCanvasName);
            });
        });

        const firstName = "1st";
        const secondName = "2nd";
        const thirdName = "3rd";

        xg.addCanvas(firstName);
        xg.addCanvas(secondName);
        xg.addCanvas(thirdName);
        // (1) "1st" (2) "2nd" (3) "3rd"

        newOrder.push(secondName);
        newOrder.push(thirdName);
        newOrder.push(firstName);
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