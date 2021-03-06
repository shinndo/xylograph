import * as fs from 'fs';
import * as path from 'path';
import * as root from 'app-root-path';
import * as NodeCanvas from "canvas";
import {Xylograph, Canvas} from '../../src/index';

type binaryMimeType = "application/pdf" | "image/jpeg" | "image/png" | "raw";

interface XylographFunctionTypes {
    createCanvas: (w: number, h: number) => NodeCanvas.Canvas;
    canvasToImage: (canvas: Canvas<NodeCanvas.Canvas>) => NodeCanvas.Image;
    canvasToBinary: (canvas: Canvas<NodeCanvas.Canvas>, mimeType?: binaryMimeType) => Buffer;
}

async function loadLocalImage(filepath: string): Promise<NodeCanvas.Image> {
    return new Promise((resolve, rejects) => {
        fs.readFile(filepath, (err, data) => {
            if(err) rejects(err);
            const img = new NodeCanvas.Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => rejects(err);
            img.src = data;
        });
    });
}

(async function main() {
    const width = 800;
    const height = 600;
    const frameWidth = 40;

    // Create Xylograph
    const xg = new Xylograph<NodeCanvas.Canvas, XylographFunctionTypes>({
        createCanvas: NodeCanvas.createCanvas,
        canvasToImage: (canvas: Canvas<NodeCanvas.Canvas>) => {
            const img = new NodeCanvas.Image();
            img.src = canvas.toBuffer("image/png");
            return img;
        },
        canvasToBinary: (canvas: Canvas<NodeCanvas.Canvas>, mimeType?: binaryMimeType) => {
            switch(mimeType) {
                case "application/pdf":
                    return canvas.toBuffer(mimeType);
                case "image/jpeg":
                    return canvas.toBuffer(mimeType);
                case "image/png":
                    return canvas.toBuffer(mimeType);
                case "raw":
                    return canvas.toBuffer(mimeType);
                default:
                    return canvas.toBuffer();
            }
        },
        canvasWidth: width,
        canvasHeight: height
    });

    const base = xg.addCanvas("background");
    const main = xg.addCanvas("main");
    const frame = xg.addCanvas("frame");
    const author = xg.addCanvas("author");

    const baseCtx = base.getContext("2d");
    baseCtx.fillStyle = "#1e1e1e";
    baseCtx.fillRect(0, 0, width, height);

    const inputPath = root + path.sep + "examples" + path.sep + "xylograph.png";
    const img = await loadLocalImage(inputPath);
    const mainCtx = main.getContext("2d");
    mainCtx.drawImage(img, (width / 2) - (img.width / 2), (height / 2) - (img.height / 2));

    const frameCtx = frame.getContext("2d");
    frameCtx.fillStyle = "#ffffff";
    frameCtx.fillRect(0, 0, width, height);
    frameCtx.clearRect(frameWidth, frameWidth, width - frameWidth * 2, height - frameWidth * 2);

    const authorName = "@shinndo";
    const authorCtx = author.getContext("2d");
    authorCtx.fillStyle = "#1e1e1e";
    authorCtx.textAlign = "end";
    authorCtx.textBaseline = "middle";
    authorCtx.font = "bold " + Math.floor(frameWidth/2) + "px sans-serif;"
    authorCtx.fillText(authorName, width - frameWidth, height - frameWidth / 2);

    const outputPath = root + path.sep + "examples" + path.sep + "output.png";
    fs.writeFileSync(outputPath, xg.toBinary("image/png"));
    console.log("Output completed: " + outputPath);
})();