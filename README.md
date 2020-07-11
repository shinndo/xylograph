# xylograph

Xylograph is multi canvas management library for Canvas API compatible interface.

## Installation

The npm module is in preparation.

## Example

## Documentation

### Xylograph.addCanvas(canvasName)

Create a canvas and add it to Xylograph object. Return of created canvas object.

```ts
xylograph.addCanvas(canvasName: string) => Canvas
```

* `canvasName`: New canvas name. If specified canvas name does existed in xylograph, add number to tail of canvas name (e.g.: `NewCanvas[1]`, `NewCanvas[2]`).

### Xylograph.getCanvas(canvasName)

Get canvas object of specified canvas name from xylograph. If specified canvas name does not exist, return of `undefined`.

```ts
xylograph.getCanvas(canvasName: string) => Canvas | undefined
```

* `canvasName`: Target canvas name.

### Xylograph.removeCanvas(canvasName)

Remove canvas of specified canvas name from xylograph.

```ts
xylograph.removeCanvas(canvasName: string) => void
```

* `canvasName`: Target canvas name.

### Xylograph.renameCanvas(targetCanvasName, newCanvasName)

Rename the canvas of the specified canvas name. Return of renamed canvas name. 

If the specified `targetCanvasName` and `newCanvasName` does invalid, or specified canvas does not exist, return of `undefined`. If specified new canvas name does existed in xylograph, add number to tail of canvas name (e.g.: `NewCanvas[1]`, `NewCanvas[2]`).

```ts
xylograph.renameCanvas(targetCanvasName: string, newCanvasName: string) => string | undefined
```

* `targetCanvasName`: Target canvas name.
* `newCanvasName`: New canvas name.

### Xylograph.moveCanvas(canvasNames)

Change the order of the canvases by specifying the canvas name. If not specified all canvas name, unspecified canvas does remove.

```ts
xylograph.moveCanvas(canvasNames: string[]) => void
```

* `canvasNames`: An array of canvas names of specified order.

### Xylograph.duplicateCanvas(originCanvasName, duplicateCanvasName)

Duplicate the canvas with the specified name. Return of duplicated canvas.

If the specified `originCanvasName` does invalid, or specified canvas does not exist, return of `undefined`. If `duplicateCanvasName` does not specified, or existed in xylograph, add number to tail of canvas name (e.g.: `NewCanvas[1]`, `NewCanvas[2]`).

```ts
xylograph.duplicateCanvas(originCanvasName: string, duplicateCanvasName?: string) => Canvas | undefined
```

* `originCanvasName`: The name of the origin canvas.
* `duplicateCanvasName`: The name of the duplicated canvas. Not required.

### Xylograph.mergeCanvas(mergeCanvasNames, forceCompositeOperation)

Merge all the specified canvases into the first one among the specified canvases. After merging, remove all canvases other than the first one. Return of merged canvas.

If the specified `mergeCanvasNames` does invalid, return of `undefined`.

```ts
xylograph.mergeCanvas(mergeCanvasNames: string[], forceCompositeOperation?: string) => Canvas | undefined
```

* `mergeCanvasNames`: The name of specified canvases.
* `forceCompositeOperation`: Force composite operation. If specified `forceCompositeOperation`, use `forceCompositeOperation` value instead of `compositeOperation` property of canvas. Not required.

### Xylograph.getCanvases()

Get all the canvases in xylograph. Return the canvas array. 

```ts
xylograph.getCanvases() => Canvas[]
```

### Xylograph.setCanvases(canvases)

Replace canvases of xylograph.

```ts
xylograph.setCanvases(canvases: Canvas[]) => void
```

* `canvases`: The canvas array to replace.

### Xylograph.getCanvasNames()

Get all canvas names in xylograph. Return the string array.

```ts
xylograph.getCanvasNames() => string[]
```

### Xylograph.resize(width, height, sx, sy, sw, sh)

Resize all canvases in xylograph.

```ts
xylograph.resize(width: number, height: number, sx?: number, sy?: number, sw?: number, sh?: number) => void
```

* `width`: Resized canvas width.
* `height`: Resized canvas height.
* `sx`: Clipping start X position. Not required.
* `sy`: Clipping start Y position. Not required.
* `sw`: Clipping width. Not required.
* `sh`: Clipping height. Not required.

### Xylograph.toDataURL()

Get data URL merging all canvases in xylograph.

```ts
xylograph.toDataURL() => string
```

### Canvas.xylograph

Additional property of Canvas object.

```ts
canvas.xylograph: {
  readonly name: string;
  compositeOperation: string;
  hidden: boolean;
}
```

* `name`: Canvas name in xylograph object. ***Read-only property (If rename use `renameCanvas` method).***
* `compositeOperation`: A composite operation to be used when composing with another canvas. Specifies permitted compositing operations in a Canvas API compatible interface.
* `hidden`: Hide it when merging with other canvases.

```ts
canvas.xylograph.compositeOperation = "screen";
canvas.xylograph.hidden = true;

// Rename
xylograph.renameCanvas("targetName", "newName");
```