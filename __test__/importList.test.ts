import mock from "mock-fs";
import { test } from "@jest/globals";
import importsSet from "./importList";
import {
  filterValidPackages,
  findPhantomDepsInFile,
} from "../lib/filterValidPackages";
import packageJsonModuleList from "./packageJsonList";

jest.mock("../lib/config", () => {
  return {
    loadConfig: jest.fn(() => {
      return {
        excludes: ["react", "@types/swiper"],
        includePaths: [],
        excludePaths: [],
      };
    }),
  };
});

describe("find phantom dependencies", () => {
  beforeEach(() => {
    mock({
      mocks: {},
      "public/img/icons/logo.png": Buffer.from([8, 6, 7, 5, 3, 0, 9]),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test("filtered import list", () => {
    const result = filterValidPackages(importsSet);
    expect(result).toEqual([
      "react-dom",
      "react-dom",
      "redux",
      "@types/react",
      "swiper",
    ]);
  });

  test("phantom package list", () => {
    const filteredPackages = filterValidPackages(importsSet);
    const phantomPackages = findPhantomDepsInFile(
      filteredPackages,
      packageJsonModuleList,
    );
    const result = Array.from(phantomPackages);
    expect(result).toEqual(["redux", "@types/react", "swiper"]);
  });

  test("phantom package list with mock fs", () => {
    const filteredPackages = filterValidPackages(importsSet);
    const phantomPackages = findPhantomDepsInFile(
      filteredPackages,
      packageJsonModuleList,
    );
    const result = Array.from(phantomPackages);
    expect(result).toEqual(["redux", "@types/react", "swiper"]);
    mock.restore();
  });
});
