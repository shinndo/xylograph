import * as fs from 'fs';
import * as path from 'path';
import * as appRoot from 'app-root-path';
import * as Canvas from 'canvas';
import {Xylograph} from '../../src/index';


// Create Xylograph
const xg = new Xylograph({
    // canvasLibrary: Canvas,
    createCanvasFunction: Canvas.createCanvas,
});

// EventListner
xg.on('addCanvas', (canvas, ctx) => {
    console.log("Add canvas");
});
// xg.on('change', (canvas, ctx) => {
//     if(!canvas.isChanged()) return;
// });
// xg.canvas.on('change', (canvas, ctx) => {});
// xg.canvas.context.on('change', (canvas, ctx) => {});

// // New Layer
xg.addCanvas();
// xg.addImage(stream, w, h, x, y, dx, dw,);

// xg.getCanvas(0);
// xg.getCanvas('background');
// xg.getContext(0);
// xg.getContext('background');

// xg.ctx[0].fillRect(); // call 'change' event.
// xg.getContext(0).fillRect();
// // Run script to context
// xg.ctx[0].run((ctx) => {

// });
// xg.canvas[0].run((canvas, ctx) => {

// });
