import { builder, num, raw, str, url } from "./index";

describe("match", () => {
  it("raw", () => {
    expect(raw("foo").match("foo")).toEqual({});
    expect(raw("foo").match("spam")).toBeUndefined();
  });

  it("str", () => {
    expect(str("foo").match("bar")).toEqual({ foo: "bar" });
    expect(str("foo", /^bar?$/).match("bar")).toEqual({ foo: "bar" });
    expect(str("foo", /^bar?$/).match("ba")).toEqual({ foo: "ba" });
    expect(str("foo", /^bar?$/).match("b")).toBeUndefined();
  });

  it("num", () => {
    expect(num("foo").match("1")).toEqual({ foo: 1 });
    expect(num("foo").match("bar")).toBeUndefined();
    expect(num("foo").match("1a")).toBeUndefined();
  });

  it("url", () => {
    const pattern = url(raw("foo"), str("bar"), num("spam"));
    expect(pattern.match("/")).toBeUndefined();
    expect(pattern.match("/foo")).toBeUndefined();
    expect(pattern.match("/foo/bar")).toBeUndefined();
    expect(pattern.match("/foo/bar/spam")).toBeUndefined();
    expect(pattern.match("/foo/bar/1")).toEqual({ bar: "bar", spam: 1 });
  });

  it("builder", () => {
    const pattern = builder.raw("foo").str("bar").num("spam");
    expect(pattern.match("/")).toBeUndefined();
    expect(pattern.match("/foo")).toBeUndefined();
    expect(pattern.match("/foo/bar")).toBeUndefined();
    expect(pattern.match("/foo/bar/spam")).toBeUndefined();
    expect(pattern.match("/foo/bar/1")).toEqual({ bar: "bar", spam: 1 });
  });
});

describe("build", () => {
  it("raw", () => {
    expect(raw("foo").build({})).toBe("foo");
    expect(raw("bar").build({})).toBe("bar");
  });

  it("num", () => {
    expect(num("foo").build({ foo: 1 })).toBe("1");
    expect(() => {
      num("foo").build({ foo: 1.2 });
    }).toThrow(/reverse/);
    expect(() => {
      num("foo").build({ foo: NaN });
    }).toThrow(/reverse/);
    expect(() => {
      num("foo").build({ foo: Infinity });
    }).toThrow(/reverse/);
    expect(() => {
      num("foo").build({ foo: -Infinity });
    }).toThrow(/reverse/);
  });

  it("str", () => {
    expect(str("foo").build({ foo: "bar" })).toBe("bar");
    expect(str("foo", /^bar$/).build({ foo: "bar" })).toBe("bar");
    expect(() => {
      str("foo", /^bar$/).build({ foo: "spam" });
    }).toThrow(/reverse/);
  });

  it("url", () => {
    const pattern = url(raw("foo"), str("bar"), num("spam"));
    expect(pattern.build({ bar: "bar", spam: 123 })).toBe("/foo/bar/123/");
    expect(pattern.build({ bar: "bar", spam: 123 }, false)).toBe("/foo/bar/123");
  });

  it("builder", () => {
    const pattern = builder.raw("foo").str("bar").num("spam");
    expect(pattern.build({ bar: "bar", spam: 123 })).toBe("/foo/bar/123/");
    expect(pattern.build({ bar: "bar", spam: 123 }, false)).toBe("/foo/bar/123");
  });
});
