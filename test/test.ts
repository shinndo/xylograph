import { Xylograph, Canvas, CanvasArray } from "../src/index";
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

const createImageFunctionMock = (canvas: Canvas<MockCanvas>) => {
    return;
};

describe("Xylograph", () => {
    test("constructor", () => {
        expect.assertions(1);
        const notThrowInstantiate = () => {
            new Xylograph<MockCanvas>({
                createCanvasFunction: createCanvasFunctionMock(),
                createImageFunction: createImageFunctionMock
            });
        }
        expect(notThrowInstantiate).not.toThrow();
    });

    test("addCanvas(name)", () => {
        expect.assertions(10);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(),
            createImageFunction: createImageFunctionMock
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
            createCanvasFunction: createCanvasFunctionMock(),
            createImageFunction: createImageFunctionMock
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
            createCanvasFunction: createCanvasFunctionMock(),
            createImageFunction: createImageFunctionMock
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

    test("renameCanvas(oldCanvasName, newCanvasName)", () => {
        expect.assertions(13);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(),
            createImageFunction: createImageFunctionMock
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

        const renamedCanvases = xg.getCanvases();

        expect(renamedCanvases.length).toEqual(canvasNames.length);
        for(let i = 0; i < renamedCanvases.length; i++) {
            const canvas = renamedCanvases[i];
            const canvasName = canvasNames[i];
            expect(canvas).toEqual(xg.getCanvas(canvasName));
            expect(canvas.xylograph.name).toEqual(canvasName);
        }
    });

    test("moveCanvas(canvasName[])", () => {
        expect.assertions(7);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(),
            createImageFunction: createImageFunctionMock
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
        
        // Move canvas with unavailable name
        xg.moveCanvas(["not_exist", newOrder[0], undefined as any, newOrder[1], "hoga", newOrder[2], undefined]);

        const movedCanvases = xg.getCanvases();
        expect(movedCanvases.length).toEqual(newOrder.length);
        for(let i = 0; i < movedCanvases.length; i++) {
            const canvas = movedCanvases[i];
            const newOrderName = newOrder[i];
            expect(canvas).toEqual(xg.getCanvas(newOrderName));
            expect(canvas.xylograph.name).toEqual(newOrderName);
        }
    });

    
    test("duplicateCanvas(targetCanvasName, duplicateCanvasName?)", () => {
        expect.assertions(11);
        const canvasWidth = 10;
        const canvasHeight = 10;
        const xg1 = new Xylograph<NodeCanvas.Canvas>({
            createCanvasFunction: NodeCanvas.createCanvas,
            createImageFunction: (canvas: Canvas<NodeCanvas.Canvas>) => {
                const img = new NodeCanvas.Image();
                img.src = canvas.toBuffer("image/png");
                return img;
            },
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
    });

    test("mergeCanvas(canvasNames[], forceCompositeOperation?)", () => {
        const xg = new Xylograph<NodeCanvas.Canvas>({
            createCanvasFunction: NodeCanvas.createCanvas,
            createImageFunction: (canvas: Canvas<NodeCanvas.Canvas>) => {
                const img = new NodeCanvas.Image();
                img.src = canvas.toBuffer("image/png");
                return img;
            },
            canvasWidth: 5,
            canvasHeight: 5
        });

        const notExistName = "hoge";
        const bgCanvasName1 = "bg1";
        const bgCanvasName2 = "bg2";
        const normal1CanvasName1 = "normal1-1";
        const normal1CanvasName2 = "normal1-2";
        const hiddenCanvasName1 = "hidden1";
        const hiddenCanvasName2 = "hidden2";
        const multiCanvasName1 = "multi1";
        const multiCanvasName2 = "multi2";
        const notMergeCanvasName1 = "not-merge1";
        const normal2CanvasName1 = "normal2-1";
        const normal2CanvasName2 = "normal2-2";
        const screenCanvasName1 = "screen1";
        const screenCanvasName2 = "screen2";
        const notMergeCanvasName2 = "not-merge2";

        // bg canvas
        const bgCanvas = xg.addCanvas(bgCanvasName1);
        bgCanvas.xylograph.compositeOperation = "source-over";
        const bgCtx = bgCanvas.getContext("2d");
        bgCtx.fillStyle = "#808080";
        bgCtx.fillRect(0, 0, 5, 5);
        xg.duplicateCanvas(bgCanvasName1, bgCanvasName2);

        // normal1 canvas
        const normal1Canvas = xg.addCanvas(normal1CanvasName1);
        normal1Canvas.xylograph.compositeOperation = "source-over";
        const normal1Ctx = normal1Canvas.getContext("2d");
        normal1Ctx.fillStyle = "#FF0000";
        normal1Ctx.fillRect(0, 0, 1, 5);
        xg.duplicateCanvas(normal1CanvasName1, normal1CanvasName2);

        // hidden canvas
        const hiddenCanvas = xg.addCanvas(hiddenCanvasName1);
        hiddenCanvas.xylograph.compositeOperation = "source-over";
        hiddenCanvas.xylograph.hidden = true;
        const hiddenCtx = hiddenCanvas.getContext("2d");
        hiddenCtx.fillStyle = "#000000";
        hiddenCtx.fillRect(0, 0, 5, 5);
        xg.duplicateCanvas(hiddenCanvasName1, hiddenCanvasName2);

        // multi canvas
        const multiCanvas = xg.addCanvas(multiCanvasName1);
        multiCanvas.xylograph.compositeOperation = "multiply";
        const multiCtx = multiCanvas.getContext("2d");
        multiCtx.fillStyle = "#0000FF";
        multiCtx.fillRect(0, 1, 5, 1);
        xg.duplicateCanvas(multiCanvasName1, multiCanvasName2);

        // not-merge1 canvas
        const notMerge1Canvas = xg.addCanvas(notMergeCanvasName1);
        notMerge1Canvas.xylograph.compositeOperation = "source-over";
        const notMerge1Ctx = notMerge1Canvas.getContext("2d");
        notMerge1Ctx.fillStyle = "#FFFFFF";
        notMerge1Ctx.fillRect(0, 0, 5, 5);

        // normal2 canvas
        const normal2Canvas = xg.addCanvas(normal2CanvasName1);
        normal2Canvas.xylograph.compositeOperation = "source-over";
        const normal2Ctx = normal2Canvas.getContext("2d");
        normal2Ctx.fillStyle = "#00FF00";
        normal2Ctx.fillRect(3, 0, 1, 5);
        xg.duplicateCanvas(normal2CanvasName1, normal2CanvasName2);

        // screen canvas
        const screenCanvas = xg.addCanvas(screenCanvasName1);
        screenCanvas.xylograph.compositeOperation = "screen";
        const screenCtx = screenCanvas.getContext("2d");
        screenCtx.fillStyle = "#FFFF00";
        screenCtx.fillRect(0, 3, 5, 1);
        xg.duplicateCanvas(screenCanvasName1, screenCanvasName2);

        // not-merge2 canvas
        const notMerge2Canvas = xg.addCanvas(notMergeCanvasName2);
        notMerge2Canvas.xylograph.compositeOperation = "source-over";
        const notMerge2Ctx = notMerge2Canvas.getContext("2d");
        notMerge2Ctx.fillStyle = "#FFFFFF";
        notMerge2Ctx.fillRect(0, 0, 5, 5);

        // merge 1
        const mergedCanvas1 = xg.mergeCanvas([bgCanvasName1, normal1CanvasName1, hiddenCanvasName1, multiCanvasName1, normal2CanvasName1, notExistName, screenCanvasName1]) as Canvas<NodeCanvas.Canvas>;
        expect(Array.from(mergedCanvas1.getContext("2d").getImageData(0, 0, 5, 5).data)).toEqual([
            255,   0,   0, 255, 128, 128, 128, 255, 128, 128, 128, 255,   0, 255,   0, 255, 128, 128, 128, 255,
              0,   0,   0, 255,   0,   0, 128, 255,   0,   0, 128, 255,   0, 255,   0, 255,   0,   0, 128, 255,
            255,   0,   0, 255, 128, 128, 128, 255, 128, 128, 128, 255,   0, 255,   0, 255, 128, 128, 128, 255,
            255, 255,   0, 255, 255, 255, 128, 255, 255, 255, 128, 255, 255, 255,   0, 255, 255, 255, 128, 255,
            255,   0,   0, 255, 128, 128, 128, 255, 128, 128, 128, 255,   0, 255,   0, 255, 128, 128, 128, 255
        ]);
        expect(xg.getCanvasNames()).toEqual([bgCanvasName1, bgCanvasName2, normal1CanvasName2, hiddenCanvasName2, multiCanvasName2, notMergeCanvasName1, normal2CanvasName2, screenCanvasName2, notMergeCanvasName2]);

        // merge 2
        const mergedCanvas2 = xg.mergeCanvas([normal1CanvasName2, bgCanvasName2, hiddenCanvasName2, normal2CanvasName2, notExistName, screenCanvasName2, multiCanvasName2], "source-over") as Canvas<NodeCanvas.Canvas>;
        expect(Array.from(mergedCanvas2.getContext("2d").getImageData(0, 0, 5, 5).data)).toEqual([
            128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255,   0, 255,   0, 255, 128, 128, 128, 255,
              0,   0, 255, 255,   0,   0, 255, 255,   0,   0, 255, 255,   0,   0, 255, 255,   0,   0, 255, 255,
            128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255,   0, 255,   0, 255, 128, 128, 128, 255,
            255, 255,   0, 255, 255, 255,   0, 255, 255, 255,   0, 255, 255, 255,   0, 255, 255, 255,   0, 255,
            128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255,   0, 255,   0, 255, 128, 128, 128, 255
        ]);
        expect(xg.getCanvasNames()).toEqual([bgCanvasName1, normal1CanvasName2, notMergeCanvasName1, notMergeCanvasName2]);
    });

    test("getCanvases()", () => {
        expect.assertions(7);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(),
            createImageFunction: createImageFunctionMock
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

        const targetCanvases = xg.getCanvases();
        expect(targetCanvases.length).toEqual(addCanvasOrder.length);
        for(let i = 0; i < targetCanvases.length; i++) {
            const canvas = targetCanvases[i];
            const addCanvasName = addCanvasOrder[i];
            expect(canvas).toEqual(xg.getCanvas(addCanvasName));
            expect(canvas.xylograph.name).toEqual(addCanvasName);

        }
    });

    test("setCanvases(canvas[])", () => {
        expect.assertions(9);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(),
            createImageFunction: createImageFunctionMock
        });

        const oldCanvasName = "old";
        const newCanvasName = "new";

        // Add old canvases
        const oldCanvasNames: string[] = [];
        oldCanvasNames.push(xg.addCanvas(oldCanvasName).xylograph.name);
        oldCanvasNames.push(xg.addCanvas(oldCanvasName).xylograph.name);
        const oldCanvases = xg.getCanvases();

        // Check old canvases
        expect(oldCanvasNames.length).toEqual(oldCanvases.length);
        for(let i = 0; i < oldCanvases.length; i++) {
            expect(oldCanvases[i].xylograph.name).toEqual(oldCanvasNames[i]);
        }

        // Ready new canvases
        const newCanvases: CanvasArray<MockCanvas> = [];
        const newCanvasNames: string[] = [];
        
        const newCanvas1 = createCanvasFunctionMock()(0, 0) as Canvas<MockCanvas>;
        const newCanvas1Name = newCanvasName;
        newCanvas1.xylograph = { name: newCanvas1Name, compositeOperation: "test", hidden: false};
        newCanvases.push(newCanvas1);
        newCanvasNames.push(newCanvas1Name);
        const newCanvas2 = createCanvasFunctionMock()(0, 0) as Canvas<MockCanvas>;
        const newCanvas2Name = newCanvasName + "[1]";
        newCanvas2.xylograph = { name: newCanvas2Name, compositeOperation: "test", hidden: false};
        newCanvases.push(newCanvas2);
        newCanvasNames.push(newCanvas2Name);

        // Set new canvases with undefined
        xg.setCanvases([undefined as any, newCanvases[0], undefined as any, newCanvases[1], undefined as any]);

        // Check new canases
        const replacedCanvases = xg.getCanvases();
        expect(replacedCanvases.length).toEqual(newCanvases.length);
        expect(replacedCanvases.length).toEqual(newCanvasNames.length);
        for(let i = 0; i < replacedCanvases.length; i++) {
            const canvas = replacedCanvases[i];
            const newCanvas = newCanvases[i];
            const newCanvasName = newCanvasNames[i];
            expect(canvas).toEqual(newCanvas);
            expect(canvas.xylograph.name).toEqual(newCanvasName);
        }
    });

    test("getCanvasNames()", () => {
        expect.assertions(8);
        const xg = new Xylograph<MockCanvas>({
            createCanvasFunction: createCanvasFunctionMock(),
            createImageFunction: createImageFunctionMock
        });
        
        const firstName = "1st";
        const secondName = "2nd";
        const thirdName = "3rd";

        const addCanvasNames: string[] = [];
        addCanvasNames.push(xg.addCanvas(firstName).xylograph.name);
        addCanvasNames.push(xg.addCanvas(secondName).xylograph.name);
        addCanvasNames.push(xg.addCanvas(thirdName).xylograph.name);

        const canvasNames = xg.getCanvasNames();
        const canvases = xg.getCanvases();

        expect(canvasNames.length).toEqual(addCanvasNames.length);
        expect(canvasNames.length).toEqual(canvases.length);
        for(let i = 0; i < canvasNames.length; i++) {
            const canvasName = canvasNames[i];
            expect(canvasName).toEqual(addCanvasNames[i])
            expect(canvasName).toEqual(canvases[i].xylograph.name);
        }
    });

    test("resize(width, height, sx?, sy?, sw?, sh?)", () => {
        function createXylograph() {
            return new Xylograph<NodeCanvas.Canvas>({
                createCanvasFunction: NodeCanvas.createCanvas,
                createImageFunction: (canvas: Canvas<NodeCanvas.Canvas>) => {
                    const img = new NodeCanvas.Image();
                    img.src = canvas.toBuffer("image/png");
                    return img;
                },
                canvasWidth: 10,
                canvasHeight: 10
            });
        }

        function fillCanvas(canvas: Canvas<NodeCanvas.Canvas>, innerColor: string, outerColor: string) {
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = outerColor;
            ctx.fillRect(0, 0, 10, 10);
            ctx.fillStyle = innerColor;
            ctx.fillRect(2, 2, 6, 6);
        }

        function getSampleColor(canvas: Canvas<NodeCanvas.Canvas>) {
            const w = canvas.width;
            const h = canvas.height;
            const ctx = canvas.getContext("2d");
            const imageBytes = ctx.getImageData(0, 0, w, h).data;

            const halfWidth = Math.floor(w / 2);
            const halfHeight = Math.floor(h / 2);
            return {
                //  [r, g, b]
                tl: [imageBytes[0], imageBytes[1], imageBytes[2]],
                tr: [imageBytes[w * 4 - 4], imageBytes[w * 4 - 3], imageBytes[w * 4 - 2]],
                bl: [imageBytes[w * (h - 1) * 4], imageBytes[w * (h - 1) * 4 + 1], imageBytes[w * (h - 1) * 4 + 2]],
                br: [imageBytes[w * h * 4 - 4], imageBytes[w * h * 4 - 3], imageBytes[w * h * 4 - 2]],
                tc: [imageBytes[halfWidth * 4], imageBytes[halfWidth * 4 + 1], imageBytes[halfWidth * 4 + 2]],
                lc: [imageBytes[w * halfHeight * 4], imageBytes[w * halfHeight * 4 + 1], imageBytes[w * halfHeight * 4 + 2]],
                rc: [imageBytes[w * halfHeight * 4 + w * 4 - 4], imageBytes[w * halfHeight * 4 + w * 4 - 3], imageBytes[w * halfHeight * 4 + w * 4 - 2]],
                bc: [imageBytes[w * (h - 1) * 4 + halfWidth * 4], imageBytes[w * (h - 1) * 4 + halfWidth * 4 + 1], imageBytes[w * (h - 1) * 4 + halfWidth * 4 + 2]],
                c: [imageBytes[w * halfHeight * 4 + halfWidth * 4], imageBytes[w * halfHeight * 4 + halfWidth * 4 + 1], imageBytes[w * halfHeight * 4 + halfWidth * 4 + 2]]
            };
        }

        function colorCheck(canvas: Canvas<NodeCanvas.Canvas>, centerColor: "r" | "g" | "b", perimeterColor: "r" | "g" | "b") {
            const sampleColors = getSampleColor(canvas);

            switch(centerColor) {
                case "r":
                    expect(sampleColors.c[0]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.c[1]).toBeLessThan(128);
                    expect(sampleColors.c[2]).toBeLessThan(128);
                    break;
                case "g":
                    expect(sampleColors.c[0]).toBeLessThan(128);
                    expect(sampleColors.c[1]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.c[2]).toBeLessThan(128);
                    break;
                case "b":
                    expect(sampleColors.c[0]).toBeLessThan(128);
                    expect(sampleColors.c[1]).toBeLessThan(128);
                    expect(sampleColors.c[2]).toBeGreaterThanOrEqual(128);
                    break;
            }

            switch(perimeterColor) {
                case "r":
                    expect(sampleColors.tc[0]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.tc[1]).toBeLessThan(128);
                    expect(sampleColors.tc[2]).toBeLessThan(128);
                    expect(sampleColors.lc[0]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.lc[1]).toBeLessThan(128);
                    expect(sampleColors.lc[2]).toBeLessThan(128);
                    expect(sampleColors.rc[0]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.rc[1]).toBeLessThan(128);
                    expect(sampleColors.rc[2]).toBeLessThan(128);
                    expect(sampleColors.bc[0]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.bc[1]).toBeLessThan(128);
                    expect(sampleColors.bc[2]).toBeLessThan(128);
                    break;
                case "g":
                    expect(sampleColors.tc[0]).toBeLessThan(128);
                    expect(sampleColors.tc[1]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.tc[2]).toBeLessThan(128);
                    expect(sampleColors.lc[0]).toBeLessThan(128);
                    expect(sampleColors.lc[1]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.lc[2]).toBeLessThan(128);
                    expect(sampleColors.rc[0]).toBeLessThan(128);
                    expect(sampleColors.rc[1]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.rc[2]).toBeLessThan(128);
                    expect(sampleColors.bc[0]).toBeLessThan(128);
                    expect(sampleColors.bc[1]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.bc[2]).toBeLessThan(128);
                    break;
                case "b":
                    expect(sampleColors.tc[0]).toBeLessThan(128);
                    expect(sampleColors.tc[1]).toBeLessThan(128);
                    expect(sampleColors.tc[2]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.lc[0]).toBeLessThan(128);
                    expect(sampleColors.lc[1]).toBeLessThan(128);
                    expect(sampleColors.lc[2]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.rc[0]).toBeLessThan(128);
                    expect(sampleColors.rc[1]).toBeLessThan(128);
                    expect(sampleColors.rc[2]).toBeGreaterThanOrEqual(128);
                    expect(sampleColors.bc[0]).toBeLessThan(128);
                    expect(sampleColors.bc[1]).toBeLessThan(128);
                    expect(sampleColors.bc[2]).toBeGreaterThanOrEqual(128);
                    break;
            }
        }

        expect.assertions(4 * 2 * 5 * 3) // 4 xylograph * 2 canvas * 5 samplePixel * 3 channel

        const canvas1Name = "canvas1";
        const canvas2Name = "canvas2";
        const canvas1InnerColor = "#FF0000";
        const canvas1OuterColor = "#00FF00";
        const canvas2InnerColor = "#0000FF";
        const canvas2OuterColor = "#FF0000";

        const xg1 = createXylograph();
        const xg2 = createXylograph();
        const xg3 = createXylograph();
        const xg4 = createXylograph();

        fillCanvas(xg1.addCanvas(canvas1Name), canvas1InnerColor, canvas1OuterColor);
        fillCanvas(xg2.addCanvas(canvas1Name), canvas1InnerColor, canvas1OuterColor);
        fillCanvas(xg3.addCanvas(canvas1Name), canvas1InnerColor, canvas1OuterColor);
        fillCanvas(xg4.addCanvas(canvas1Name), canvas1InnerColor, canvas1OuterColor);
        fillCanvas(xg1.addCanvas(canvas2Name), canvas2InnerColor, canvas2OuterColor);
        fillCanvas(xg2.addCanvas(canvas2Name), canvas2InnerColor, canvas2OuterColor);
        fillCanvas(xg3.addCanvas(canvas2Name), canvas2InnerColor, canvas2OuterColor);
        fillCanvas(xg4.addCanvas(canvas2Name), canvas2InnerColor, canvas2OuterColor);

        xg1.resize(5, 5);
        xg2.resize(5, 5, 2, 2, 6, 6);
        xg3.resize(20, 20);
        xg4.resize(20, 20, 2, 2, 6, 6);

        colorCheck(xg1.getCanvas(canvas1Name) as Canvas<NodeCanvas.Canvas>, "r", "g");
        colorCheck(xg1.getCanvas(canvas2Name) as Canvas<NodeCanvas.Canvas>, "b", "r");
        colorCheck(xg2.getCanvas(canvas1Name) as Canvas<NodeCanvas.Canvas>, "r", "r");
        colorCheck(xg2.getCanvas(canvas2Name) as Canvas<NodeCanvas.Canvas>, "b", "b");
        colorCheck(xg3.getCanvas(canvas1Name) as Canvas<NodeCanvas.Canvas>, "r", "g");
        colorCheck(xg3.getCanvas(canvas2Name) as Canvas<NodeCanvas.Canvas>, "b", "r");
        colorCheck(xg4.getCanvas(canvas1Name) as Canvas<NodeCanvas.Canvas>, "r", "r");
        colorCheck(xg4.getCanvas(canvas2Name) as Canvas<NodeCanvas.Canvas>, "b", "b");
    });

    test("toDataURL()", () => {
        expect.assertions(1);

        function createXylograph() {
            return new Xylograph<NodeCanvas.Canvas>({
                createCanvasFunction: NodeCanvas.createCanvas,
                createImageFunction: (canvas: Canvas<NodeCanvas.Canvas>) => {
                    const img = new NodeCanvas.Image();
                    img.src = canvas.toBuffer("image/png");
                    return img;
                },
                canvasWidth: 10,
                canvasHeight: 10
            });
        }

        const canvasName = "canvas";

        const xg1 = createXylograph();

        const ctx1 = xg1.addCanvas(canvasName).getContext("2d");
        ctx1.fillStyle = "#808080";
        ctx1.fillRect(0, 0, 10, 10);

        const ctx2 = xg1.addCanvas(canvasName).getContext("2d");
        ctx2.fillStyle = "#FF0000"
        ctx2.fillRect(0, 0, 5, 10);

        const ctx3 = xg1.addCanvas(canvasName).getContext("2d");
        ctx3.fillStyle = "#0000FF";
        ctx3.fillRect(0, 5, 10, 5);

        const xg2 = createXylograph();

        const expectCanvas = xg2.addCanvas(canvasName);
        const expectCtx = expectCanvas.getContext("2d");
        expectCtx.fillStyle = "#808080";
        expectCtx.fillRect(0, 0, 10, 10);
        expectCtx.fillStyle = "#FF0000"
        expectCtx.fillRect(0, 0, 5, 10);
        expectCtx.fillStyle = "#0000FF";
        expectCtx.fillRect(0, 5, 10, 5);

        expect(xg1.toDataURL()).toEqual(expectCanvas.toDataURL());
    });

    test.todo("createOutputStream()");
    test.todo("toBlob()");
});

describe("Static", () => {
    test.todo("createHTMLCanvas()");
    test.todo("createCanvasFromImage()");
});