import {
  CurveChainWithDistanceIndex,
  CurveCurve,
  CurveLocationDetail,
  IModelJson,
  LineSegment3d,
  Path,
  Point3d,
  Vector3d,
} from "@bentley/geometry-core";
import { Id64String } from "@bentley/bentleyjs-core";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { CustomCurve } from "./CustomCurve";

export interface ProjectionDetail {
  station: number;
  mainCurvePoint: Point3d;
  distanceBetweenCurves: number;
  secondaryCurvePoint: Point3d;
}
export class GeomUtils {
  private static linearAlignmentsQuery: string =
    "SELECT ECInstanceId, CodeValue, HorizontalGeometry FROM rralign.horizontalalignment";

  static async obtainCurves(
    connection: IModelConnection
  ): Promise<CustomCurve[]> {
    const curves: CustomCurve[] = [];
    try {
      const rows = connection.query(GeomUtils.linearAlignmentsQuery);
      for await (const row of rows) {
        const path = IModelJson.Reader.parse(row.horizontalGeometry) as Path;
        const chain = CurveChainWithDistanceIndex.createCapture(path);
        if (!chain) {
          throw new Error("CurveChain cannot be captured.");
        }
        const id = row.id as string;
        const name = row.codeValue ?? "Unnamed element - " + id;
        const newCurve = new CustomCurve(name, row.id, chain);
        curves.push(newCurve);
      }
    } catch (error) {
      return [];
    }
    return this.fixCurveLabelDuplicates(curves);
  }

  static iterateCurve(
    mainCurve: CustomCurve,
    secondaryCurve: CustomCurve,
    stepLength: number
  ): ProjectionDetail[] {
    const result: ProjectionDetail[] = [];
    let currentStep = 0;
    let fraction = 0;
    const mainCurveLength = mainCurve.geometry.curveLength();
    while (fraction < 1) {
      fraction =
        currentStep < mainCurveLength
          ? mainCurve.geometry.chainDistanceToChainFraction(currentStep)
          : 1;
      const currentPoint = mainCurve.geometry.fractionToPoint(fraction);
      const [leftLine, rightLine] = this.calculatePerpendicularLinesAtFraction(
        mainCurve,
        fraction
      );
      const intersections = this.attemptFindCurveIntersection(
        leftLine,
        rightLine,
        secondaryCurve
      );
      let projectedPoint: Point3d;
      if (intersections.length === 0) {
        // intersection not found - using closest point
        projectedPoint = secondaryCurve.geometry.closestPoint(
          currentPoint,
          false
        )!.point;
      } else {
        // intersection found
        projectedPoint = intersections.pop()!.point;
      }
      const distance = currentPoint.distance(projectedPoint);
      result.push({
        station: currentStep < mainCurveLength ? currentStep : mainCurveLength,
        mainCurvePoint: currentPoint,
        distanceBetweenCurves: distance,
        secondaryCurvePoint: projectedPoint,
      });
      currentStep += stepLength;
    }
    return result;
  }

  private static attemptFindCurveIntersection(
    leftLine: LineSegment3d,
    rightLine: LineSegment3d,
    secondaryCurve: CustomCurve
  ): CurveLocationDetail[] {
    const result: CurveLocationDetail[] = [];
    const leftIntersections = CurveCurve.intersectionXYPairs(
      leftLine,
      true,
      secondaryCurve.geometry.path,
      true
    );
    const rightIntersections = CurveCurve.intersectionXYPairs(
      rightLine,
      true,
      secondaryCurve.geometry.path,
      true
    );
    for (const item of leftIntersections) {
      result.push(item.detailA);
      result.push(item.detailB);
    }
    for (const item of rightIntersections) {
      result.push(item.detailA);
      result.push(item.detailB);
    }
    return result;
    //return [...leftIntersections.dataA, ...leftIntersections.dataB, ...rightIntersections.dataA, ...rightIntersections.dataB];
  }

  private static calculatePerpendicularVectorsFromFraction(
    curve: CustomCurve,
    fraction: number,
    scale: number
  ): [Vector3d, Vector3d] {
    const unitTangent = curve.geometry.fractionToPointAndUnitTangent(fraction);
    let left = unitTangent.direction.clone().rotate90CCWXY();
    let right = left.clone().rotate90CCWXY().rotate90CCWXY();
    left = left.scale(scale);
    right = right.scale(scale);
    return [left, right];
  }

  private static calculateEndPointFromOriginAndVector(
    origin: Point3d,
    vector: Vector3d
  ): Point3d {
    const x = origin.x + vector.x;
    const y = origin.y + vector.y;
    const z = origin.z + vector.z;
    return new Point3d(x, y, z);
  }

  private static calculatePerpendicularLinesAtFraction(
    curve: CustomCurve,
    fraction: number
  ): [LineSegment3d, LineSegment3d] {
    const [left, right] = this.calculatePerpendicularVectorsFromFraction(
      curve,
      fraction,
      500
    );
    const currentPoint = curve.geometry.fractionToPoint(fraction);
    const lefEnd = this.calculateEndPointFromOriginAndVector(
      currentPoint,
      left
    );
    const leftLine = LineSegment3d.create(currentPoint, lefEnd);
    const rightEnd = this.calculateEndPointFromOriginAndVector(
      currentPoint,
      right
    );
    const rightLine = LineSegment3d.create(currentPoint, rightEnd);
    return [leftLine, rightLine];
  }

  static findCurveById(curves: CustomCurve[], id: Id64String): CustomCurve {
    const result = curves.filter((curve) => curve.id === id);
    if (result.length === 0) {
      throw new Error("Unable to find desired curve by its ID.");
    }
    return result[0];
  }

  static findCurveByName(curves: CustomCurve[], name: string): CustomCurve {
    const result = curves.filter((curve) => curve.label === name);
    if (result.length === 0) {
      throw new Error("Unable to find the desired curve by its name.");
    }
    return result[0];
  }

  private static fixCurveLabelDuplicates(curves: CustomCurve[]) {
    const newArray: CustomCurve[] = [];
    const names: string[] = [];
    for (let curve of curves) {
      if (names.includes(curve.label)) {
        curve.label += "-" + curve.id;
      }
      names.push(curve.label);
      newArray.push(curve);
    }
    newArray.sort((first, second) => first.label.localeCompare(second.label));
    return newArray;
  }
}
