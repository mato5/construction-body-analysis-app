import {
  IModelApp,
  NotifyMessageDetails,
  OutputMessagePriority,
} from "@bentley/imodeljs-frontend";
import { Dialog, Form, FieldDefinitions, FieldValues } from "@bentley/ui-core";
import { ModalDialogManager } from "@bentley/ui-framework";
import React from "react";
import { CustomCurve } from "../utilities/CustomCurve";
import { GeomUtils } from "../utilities/GeomUtils";
import {
  CurveSelectorProps,
  MultipleCurveSelector,
} from "./MultipleCurveSelector";

export class InitialForm extends React.Component {
  curves: CustomCurve[];

  public static open(curves: CustomCurve[]) {
    const form = new InitialForm(curves);
    ModalDialogManager.openDialog(form.render());
  }

  constructor(curves: CustomCurve[]) {
    super({});
    this.curves = curves;
  }

  protected async handleSubmit(values: FieldValues): Promise<void> {
    const props = await this.processFormSubmission(values);
    ModalDialogManager.closeDialog();
    const msg = JSON.stringify(values);
    IModelApp.notifications.outputMessage(
      new NotifyMessageDetails(
        OutputMessagePriority.Info,
        "Main geometry and step length submitted.",
        msg
      )
    );
    MultipleCurveSelector.open(props);
  }

  protected async processFormSubmission(
    values: FieldValues
  ): Promise<CurveSelectorProps> {
    // if error occurs during async processing throw an Error and return error message back to form.
    const temp = values.StepLength as string;
    const length = parseFloat(temp.replace(",", ".").replace(" ", ""));
    if (isNaN(length)) {
      throw new Error(
        "The step length you provided is not a correct number. Provide a number without any white-spaces and with '.' character as a decimal separator."
      );
    }
    const mainCurve = GeomUtils.findCurveByName(this.curves, values.MainCurve);
    return { stepLength: length, mainCurve: mainCurve, allCurves: this.curves };
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

  getCurveNames = () => {
    return this.curves.map((x) => x.label);
  };

  public render() {
    const fields: FieldDefinitions = {
      StepLength: {
        label: "Krok výpisu (metre)",
        editor: "textbox",
        value: "5.0",
      },
      MainCurve: {
        label: "Os komunikácie",
        editor: "dropdown",
        value: this.getCurveNames()[0],
        options: this.getCurveNames(),
      },
    };

    return (
      <div>
        <Dialog
          title="Zvoľte os a krok výpisu"
          opened={true}
          onClose={() => this.handleCancel()}
        >
          <Form
            handleFormSubmit={(values: FieldValues) =>
              this.handleSubmit(values)
            }
            fields={fields}
            submitButtonLabel="Ďalej"
          />
        </Dialog>
      </div>
    );
  }
}
