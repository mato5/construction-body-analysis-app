import {
  IModelApp,
  NotifyMessageDetails,
  OutputMessagePriority,
} from "@bentley/imodeljs-frontend";
import {
  Dialog,
  CheckListBox,
  CheckListBoxItem,
  Button,
  ButtonType,
} from "@bentley/ui-core";
import { ModalDialogManager } from "@bentley/ui-framework";
import React from "react";
import { CustomCurve } from "../utilities/CustomCurve";
import { GeomUtils } from "../utilities/GeomUtils";
import { ResultDialog } from "./ResultDialog";

export interface CurveSelectorProps {
  stepLength: number;
  mainCurve: CustomCurve;
  allCurves: CustomCurve[];
}
export class MultipleCurveSelector extends React.Component {
  stepLength: number;
  mainGeometry: CustomCurve;
  allCurves: CustomCurve[];
  selectedCurves: CustomCurve[];

  public static open(props: CurveSelectorProps) {
    const form = new MultipleCurveSelector(
      props.stepLength,
      props.mainCurve,
      props.allCurves
    );
    ModalDialogManager.openDialog(form.render());
  }

  constructor(
    stepLength: number,
    mainGeometry: CustomCurve,
    allCurves: CustomCurve[]
  ) {
    super({});
    this.stepLength = stepLength;
    this.mainGeometry = mainGeometry;
    this.allCurves = allCurves;
    this.selectedCurves = [];
  }

  protected handleSubmit() {
    if (this.selectedCurves.length === 0) {
      IModelApp.notifications.outputMessage(
        new NotifyMessageDetails(
          OutputMessagePriority.Warning,
          "Please select a secondary curve in order to proceed."
        )
      );
      return;
    }
    ModalDialogManager.closeDialog();
    const msg = JSON.stringify(this.selectedCurves.map((x) => x.label));
    IModelApp.notifications.outputMessage(
      new NotifyMessageDetails(
        OutputMessagePriority.Info,
        "Secondary curves selected.",
        msg
      )
    );
    ResultDialog.open({
      stepLength: this.stepLength,
      mainCurve: this.mainGeometry,
      allCurves: this.selectedCurves,
    });
  }

  protected handleCancel() {
    ModalDialogManager.closeDialog();
    IModelApp.notifications.outputMessage(
      new NotifyMessageDetails(
        OutputMessagePriority.Info,
        "Operation cancelled."
      )
    );
  }

  private handleCheckboxClick(curveName: string) {
    const clickedCurve = GeomUtils.findCurveByName(this.allCurves, curveName);
    if (this.selectedCurves.includes(clickedCurve)) {
      const index = this.selectedCurves.indexOf(clickedCurve);
      this.selectedCurves.splice(index, 1);
    } else {
      this.selectedCurves.push(clickedCurve);
    }
  }

  public render() {
    const checkBoxItems = [];

    for (const item of this.allCurves) {
      if (item.label === this.mainGeometry.label) {
        checkBoxItems.push(
          <CheckListBoxItem key={item.id} disabled label={item.label} />
        );
      } else {
        checkBoxItems.push(
          <CheckListBoxItem
            key={item.id}
            onClick={() => this.handleCheckboxClick(item.label)}
            label={item.label}
          />
        );
      }
    }

    return (
      <div>
        <Dialog
          title="Vyberte hrany pre výpis"
          opened={true}
          onClose={() => this.handleCancel()}
        >
          <CheckListBox>{checkBoxItems}</CheckListBox>
          <Button
            onClick={() => this.handleSubmit()}
            buttonType={ButtonType.Blue}
          >
            Ďalej
          </Button>
        </Dialog>
      </div>
    );
  }
}
