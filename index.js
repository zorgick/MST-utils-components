import React from "react";
import { render } from "react-dom";
import { types } from "mobx-state-tree";
import { observer } from "mobx-react";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";

export const FormValue = types.model("FormValue", {
    id: types.identifier,
    name: types.string,
    value: types.string
});

export const FormField = types
    .model("FormField", {
        id: types.identifier,
        label: types.string,
        disabled: types.optional(types.boolean, false),
        required: types.optional(types.boolean, false),
        error: types.maybe(types.string),
        fieldId: types.string,
        fieldIndex: types.maybe(types.string),
        values: types.optional(types.array(FormValue), []),
        singleValue: types.optional(types.string, ""),
        selected: types.maybe(types.reference(types.late(() => FormValue)))
    })
    .actions((self) => ({
        setSelection(selected) {
            if (self.values.length > 0) {
                if (!selected) {
                    self.selected = undefined;
                } else {
                    self.selected = selected;
                }
            } else {
                self.singleValue = selected;
            }
        }
    }));

const RootStore = types
    .model({
        formValues: types.map(FormField)
    })
    .views((self) => ({
        get fieldIds() {
            const fieldIds = [];
            self.formValues.forEach(({ fieldId, fieldIndex }) => {
                if (fieldId) {
                    if (fieldIndex) {
                        fieldIds.splice(fieldIndex, 0, fieldId)
                    } else {
                        fieldIds.push(fieldId)
                    }

                }
            });

            return fieldIds;
        },
        get hasFields() {
            const fieldIds = [];
            self.formValues.forEach(({ fieldId }) => {
                if (fieldId) {
                    fieldIds.push(fieldId);
                }
            });

            return fieldIds.length > 0;
        }
    }))
    .actions((self) => ({
        
        afterCreate() {
            self.formValues.set("statusId", {
                id: "statusId",
                label: "Статус",
                disabled: false,
                required: true,
                fieldId: "statusId",
                fieldIndex: "1",
                values: [
                    { name: "Заебись", value: "zaebis", id: "zaebis" },
                    { name: "Чотко", value: "chetko", id: "chetko" },
                    {
                        name: "Пацаны вообще ребята",
                        value: "pazani",
                        id: "pazani"
                    }
                ],
                selected: "pazani"
            });
            self.formValues.set("description", {
                id: "description",
                label: "Описание",
                fieldId: "description",
                fieldIndex: "0",
                singleValue:
                    "Хули тут так мало?! ТЫ на пенек сел, сотку должен!"
            });
        },
        changeField(id, selected) {
            self.formValues.get(id).setSelection(selected);
        }
    }));

const store = RootStore.create({});

export const DetailsSelect = observer(
    ({ field, changeField, inputProps, selectProps }) => {
        const handleDetailsChange = (event) => {
            const { name, value } = event.target;
            changeField(name, value);
        };
        const label = `${field.label} ${field.required ? " *" : ""}`;
        let FieldComponent;
        if (field.values.length > 0) {
            FieldComponent = (
                <React.Fragment>
                    <InputLabel id={field.fieldId}>{label}</InputLabel>
                    <Select
                        id={field.fieldId}
                        label={label}
                        labelId={field.fieldId}
                        name={field.fieldId}
                        disabled={field.disabled}
                        value={field.selected.value ? field.selected.value : ""}
                        onChange={handleDetailsChange}
                        {...selectProps}
                    >
                        {field.values.map(({ name, value }) => (
                            <MenuItem key={value} value={value}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </React.Fragment>
            );
        } else {
            FieldComponent = (
                <TextField
                    id={field.fieldId}
                    label={label}
                    value={field.singleValue}
                    name={field.fieldId}
                    variant="outlined"
                    disabled={field.disabled}
                    onChange={handleDetailsChange}
                    {...inputProps}
                />
            );
        }

        return (
            <FormControl
                fullWidth
                variant="outlined"
                disabled={field.disabled}
                error={!!field.error}
                style={{ marginTop: 16 }}
            >
                {FieldComponent}
                {field.error && <FormHelperText>{field.error}</FormHelperText>}
            </FormControl>
        );
    }
);

const AppView = observer((props) => {
    console.log('Notice that parent rerenders only fiew times')
    return (
        <div>
            {props.store.hasFields &&
                props.store.fieldIds.map((fieldId) => {
                    return (
                        <DetailsSelect
                            changeField={props.store.changeField}
                            field={props.store.formValues.get(fieldId)}
                            key={fieldId}
                            {...(fieldId === "description" && {
                                inputProps: {
                                    multiline: true,
                                    rows: 4,
                                    rowsMax: 18
                                }
                            })}
                        />
                    );
                })}
        </div>
    );
});

render(<AppView store={store} />, document.getElementById("root"));