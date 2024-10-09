/**
 * These are meant to be imported modules in a react component
 */
const importsSet = new Set();

importsSet.add("react");
importsSet.add("react-dom");
importsSet.add("react-dom/client");
importsSet.add("redux");

importsSet.add("public");
importsSet.add("public/img/icons/arrow.svg");

importsSet.add("@types/react"); // import scoped package
importsSet.add("mocks/MockComponent"); // import from absolute path
importsSet.add("swiper/scss/pagination"); // import internal source

export default importsSet;
