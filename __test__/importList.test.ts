import { test } from "@jest/globals";
import importsSet from "./importList";
import { getPhantomDepsInOneFile, packageFilters } from "../lib/packageFilter";
import packageJsonModuleList from "./packageJsonList";

jest.mock("../lib/config", () => {
  return {
    loadConfig: jest.fn(() => {
      return {
        excludes: ["react", "public"],
        srcPath: "src",
      };
    }),
  };
});

test("filtered import list", () => {
  const result = packageFilters(importsSet);
  expect(result).toEqual(["react-dom", "react-dom/client", "redux"]);
});

test("phantom package list", () => {
  const filteredPackages = packageFilters(importsSet);
  const phantomPackages = getPhantomDepsInOneFile(
    filteredPackages,
    packageJsonModuleList,
  );
  const result = Array.from(phantomPackages);
  expect(result).toEqual(["redux"]);
});
