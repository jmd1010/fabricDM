type ItemTransformFunction = (itemTransform: number[]) => number[];

export default interface PageViewport {
  transformFunction: ItemTransformFunction;
}
