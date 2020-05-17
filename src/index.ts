import * as fs from 'fs';
import * as path from 'path';
import * as appRoot from 'app-root-path';
import * as Canvas from 'canvas';

async function main() {
    const canvasWidth: number = 640;
    const canvasHeight: number = 480;
    const margin: number = 20;

    const canvas: Canvas.Canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
    const ctx: Canvas.CanvasRenderingContext2D = canvas.getContext('2d');

    const outputFile: fs.WriteStream = fs.createWriteStream(appRoot.toString() + path.sep + 'output.jpg');

    const srcImg = await Canvas.loadImage('recources/sample.jpg');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(srcImg, margin, margin, canvasWidth - (margin * 2), canvasHeight - (margin * 2));
    ctx.font = 'normal 12px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText("@shinndo", canvasWidth - margin, canvasHeight - (margin / 2) -1);

    const outputStream: Canvas.JPEGStream = canvas.createJPEGStream({
        quality: 1
    });
    outputStream.pipe(outputFile);
}

main();