import {
  PropertyValue,
  PropertyValueFormat,
  PropertyDescription,
  PropertyRecord,
} from "@bentley/ui-abstract";
import {
  ColumnDescription,
  RowItem,
  SimpleTableDataProvider,
  Table,
} from "@bentley/ui-components";
import { Button, ButtonType, Dialog, Title } from "@bentley/ui-core";
import { ModalDialogManager } from "@bentley/ui-framework";
import stringify from "csv-stringify/lib/sync";
import FileSaver from "file-saver";
import React, { Fragment } from "react";
import { CustomCurve } from "../utilities/CustomCurve";
import { GeomUtils, ProjectionDetail } from "../utilities/GeomUtils";
import { CurveSelectorProps } from "./MultipleCurveSelector";

export class ResultDialog extends React.Component {
  stepLength: number;
  mainCurve: CustomCurve;
  selectedCurves: CustomCurve[];

  private resultMap: Map<CustomCurve, ProjectionDetail[]>;

  public static open(props: CurveSelectorProps) {
    const form = new ResultDialog(
      props.stepLength,
      props.mainCurve,
      props.allCurves
    );
    ModalDialogManager.openDialog(form.render());
  }

  constructor(
    stepLength: number,
    mainCurve: CustomCurve,
    selectedCurves: CustomCurve[]
  ) {
    super({});
    this.stepLength = stepLength;
    this.mainCurve = mainCurve;
    this.selectedCurves = selectedCurves;

    this.resultMap = new Map<CustomCurve, ProjectionDetail[]>();
    for (const curve of selectedCurves) {
      const projectionDetails = GeomUtils.iterateCurve(
        mainCurve,
        curve,
        stepLength
      );
      this.resultMap.set(curve, projectionDetails);
    }
  }

  protected handleCancel() {
    ModalDialogManager.closeDialog();
  }

  protected handleDownload() {
    const data = this.getTableDataAsString();
    const csvData = stringify(data, {
      record_delimiter: "windows",
    });
    const blob = new Blob([csvData], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "calculated_geometry.csv");
  }

  private getTableDataAsString = (): string[][] => {
    const result: string[][] = [];
    let i = 0;
    for (const [curve, projections] of this.resultMap) {
      result[i++] = [`[${curve.label}]`];
      result[i++] = [
        "Staničenie",
        `${this.mainCurve.label} - X`,
        `${this.mainCurve.label} - Y`,
        "Odsadenie (metre)",
        `${curve.label} - X`,
        `${curve.label} - Y`,
      ];
      for (const projection of projections) {
        result[i++] = [
          `${projection.station.toFixed(3)}`,
          `${projection.mainCurvePoint.x.toFixed(3)}`,
          `${projection.mainCurvePoint.y.toFixed(3)}`,
          `${projection.distanceBetweenCurves.toFixed(3)}`,
          `${projection.secondaryCurvePoint.x.toFixed(3)}`,
          `${projection.secondaryCurvePoint.y.toFixed(3)}`,
        ];
      }
    }
    return result;
  };

  private getColumnNamesFromCurve = (curve: CustomCurve): string[] => {
    const result: string[] = [];
    result.push("Staničenie");
    result.push(this.mainCurve.label + " - X");
    result.push(this.mainCurve.label + " - Y");
    result.push("Odsadenie (metre)");
    result.push(curve.label + " - X");
    result.push(curve.label + " - Y");
    return result;
  };

  private getColumnDescriptions = (curve: CustomCurve): ColumnDescription[] => {
    const result: ColumnDescription[] = [];
    const names = this.getColumnNamesFromCurve(curve);
    for (const name of names) {
      result.push({
        key: name.toLowerCase(),
        label: name,
        resizable: true,
        sortable: true,
      });
    }
    return result;
  };

  private getTableDataFromCurve = (
    curve: CustomCurve
  ): SimpleTableDataProvider => {
    const rawData = this.resultMap.get(curve);
    if (!rawData) {
      throw new Error("Unable to find the selected curve.");
    }
    const columns = this.getColumnDescriptions(curve);
    const dataProvider = new SimpleTableDataProvider(columns);
    let i = 0;
    for (const detail of rawData) {
      const rowItem: RowItem = { key: i.toString(), cells: [] };
      // Station
      let value: PropertyValue = {
        valueFormat: PropertyValueFormat.Primitive,
        value: detail.station.toFixed(3),
      };
      let description: PropertyDescription = {
        displayLabel: columns[0].label,
        name: columns[0].key,
        typename: "string",
      };
      rowItem.cells.push({
        key: columns[0].key,
        record: new PropertyRecord(value, description),
      });
      // Main - X axis
      value = {
        valueFormat: PropertyValueFormat.Primitive,
        value: detail.mainCurvePoint.x.toFixed(3),
      };
      description = {
        displayLabel: columns[1].label,
        name: columns[1].key,
        typename: "string",
      };
      rowItem.cells.push({
        key: columns[1].key,
        record: new PropertyRecord(value, description),
      });
      // Main - Y axis
      value = {
        valueFormat: PropertyValueFormat.Primitive,
        value: detail.mainCurvePoint.y.toFixed(3),
      };
      description = {
        displayLabel: columns[2].label,
        name: columns[2].key,
        typename: "string",
      };
      rowItem.cells.push({
        key: columns[2].key,
        record: new PropertyRecord(value, description),
      });
      // Offset
      value = {
        valueFormat: PropertyValueFormat.Primitive,
        value: detail.distanceBetweenCurves.toFixed(3),
      };
      description = {
        displayLabel: columns[3].label,
        name: columns[3].key,
        typename: "string",
      };
      rowItem.cells.push({
        key: columns[3].key,
        record: new PropertyRecord(value, description),
      });
      // Secondary - X axis
      value = {
        valueFormat: PropertyValueFormat.Primitive,
        value: detail.secondaryCurvePoint.x.toFixed(3),
      };
      description = {
        displayLabel: columns[4].label,
        name: columns[4].key,
        typename: "string",
      };
      rowItem.cells.push({
        key: columns[4].key,
        record: new PropertyRecord(value, description),
      });
      // Secondary - Y axis
      value = {
        valueFormat: PropertyValueFormat.Primitive,
        value: detail.secondaryCurvePoint.y.toFixed(3),
      };
      description = {
        displayLabel: columns[5].label,
        name: columns[5].key,
        typename: "string",
      };
      rowItem.cells.push({
        key: columns[5].key,
        record: new PropertyRecord(value, description),
      });
      dataProvider.addRow(rowItem);
      i++;
    }
    return dataProvider;
  };

  public render() {
    const tables = [];

    for (const curve of this.selectedCurves) {
      tables.push(
        <Fragment key={curve.id}>
          <Title>{curve.label}</Title>
          <Table
            stripedRows={true}
            pageAmount={20}
            hideHeader={false}
            dataProvider={this.getTableDataFromCurve(curve)}
          />
        </Fragment>
      );
    }

    return (
      <div>
        <Dialog
          title="Výpis kalkulovaných bodov"
          opened={true}
          resizable={true}
          movable={true}
          width={"75%"}
          height={"75%"}
          onClose={() => this.handleCancel()}
        >
          <Button
            onClick={() => this.handleDownload()}
            buttonType={ButtonType.Primary}
          >
            Stiahnuť tabuľky ako CSV
          </Button>
          <br />
          {tables}
        </Dialog>
      </div>
    );
  }
}
