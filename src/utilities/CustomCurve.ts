import { Id64String } from "@bentley/bentleyjs-core";
import { CurveChainWithDistanceIndex } from "@bentley/geometry-core";

export class CustomCurve {
  label: string;
  id: Id64String;
  geometry: CurveChainWithDistanceIndex;

  constructor(
    label: string,
    id: Id64String,
    geometry: CurveChainWithDistanceIndex
  ) {
    this.label = label;
    this.id = id;
    this.geometry = geometry;
  }
}
