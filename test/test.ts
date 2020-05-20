import {Xylograph} from "../src/index";

test("fail", () => {
    expect.assertions(1);
    const xg: Xylograph = new Xylograph();
    expect(xg).toBe(0);
})