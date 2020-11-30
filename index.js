import React from "react";
import { render } from "react-dom";
import { types, cast, flow } from "mobx-state-tree";
import { observer } from "mobx-react";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";

export const FormValue = types.model("FormValue", {
    id: types.identifier,
    name: types.string,
    value: types.string
});

export const FormField = types
    .model("FormField", {
        id: types.identifier,
        label: types.optional(types.string, ""),
        disabled: types.optional(types.boolean, false),
        required: types.optional(types.boolean, false),
        error: types.maybe(types.string),
        fieldIndex: types.maybe(types.string),
        values: types.optional(types.array(FormValue), []),
        singleValue: types.optional(types.string, ""),
        selected: types.maybe(types.safeReference(types.late(() => FormValue))),
        // if the field has a dependent field assign it on a initialisation
        next: types.maybeNull(types.reference(types.late(() => FormField)))
    })
    .volatile((self) => ({
        updateFunc: undefined
    }))
    .actions((self) => ({
        setSelection(selected, isInternalSet) {
            // selection of multiple values is possible
            // only when array of values has items
            // OR this condition is met when setSelection
            // is called from the inside of the model
            if (self.values.length > 0 || isInternalSet) {
                // refernce must be reseted before
                // values are updated
                // OR select supports an empty selection
                if (!selected) {
                    self.selected = undefined;
                } else {
                    self.selected = selected;
                }
                // doesn't matter if a selected variable received a reference or not
                // require an update for a child
                if (self.next) {
                    self.next.updateValues({ id: selected });
                }
            } else {
                self.singleValue = selected;
            }
        }
    }))
    .actions((self) => ({
        setUpdateFunc(updateFunc) {
            if (typeof updateFunc !== "function") {
                throw new Error(
                    "It looks like you provided something else instead of function"
                );
            }
            self.updateFunc = updateFunc;
        },
        updateValues: flow(function* (params) {
            if (!self.disabled) {
                self.disabled = true;
            }
            self.setSelection(undefined, true);
            if (params.id) {
                const newValues = yield self.updateFunc(params);
                self.values = cast(newValues);
                self.disabled = false;
            }
        })
    }));

const RootStore = types
    .model({
        formValues: types.map(FormField),
        newValues: types.optional(types.array(types.string), [])
    })
    .views((self) => ({
        get fieldIds() {
            const fieldIds = [];
            self.formValues.forEach(({ id, fieldIndex }) => {
                if (id) {
                    if (fieldIndex) {
                        fieldIds.splice(fieldIndex, 0, id);
                    } else {
                        fieldIds.push(id);
                    }
                }
            });

            return fieldIds;
        },
        get hasFields() {
            const fieldIds = [];
            self.formValues.forEach(({ id }) => {
                if (id) {
                    fieldIds.push(id);
                }
            });

            return fieldIds.length > 0;
        }
    }))
    .actions((self) => ({
        getAnotherData: flow(function* ({ id }) {
            yield new Promise((resolve) => {
                setTimeout(resolve, 3000);
            }).then((result) => {});
            const values = [
                {
                    id: "idite",
                    value: "idite",
                    name: "Я вас не звал! Идите нахуй!"
                },
                {
                    id: "hi",
                    value: "hi",
                    name: "Дратути!"
                },
                {
                    id: "netochno",
                    value: "netochno",
                    name: "Но это не точно"
                }
            ];
            return values;
        }),
        getData: flow(function* ({ id }) {
            yield new Promise((resolve) => {
                setTimeout(resolve, 3000);
            }).then((result) => {});
            const values = [
                {
                    id: "tamada",
                    value: "tamada",
                    name: "Хороший тамада! И конкурсы интересные"
                },
                {
                    id: "opyat",
                    value: "opyat",
                    name: "Никогда такого не было! И вот опять!"
                },
                {
                    id: "musk",
                    value: "musk",
                    name: "Как тебе такое Илон Маск?!"
                }
            ];
            return values;
        })
    }))
    .actions((self) => ({
        afterCreate() {
            self.formValues.set("Category1", {
                id: "Category1",
                label: "Мемы 1й категории",
                disabled: false,
                required: true,
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
            self.formValues.set("Category2", {
                id: "Category2",
                label: "Мемы 2й категории",
                disabled: false,
                required: true,
                fieldIndex: "2",
                values: [
                    { name: "Мутный тип", value: "tip", id: "tip" },
                    { name: "Пойдем отсюда", value: "go", id: "go" },
                    {
                        name: "Долбит нормально!",
                        value: "dolbit",
                        id: "dolbit"
                    }
                ],
                selected: "dolbit"
            });
            self.formValues.set("Category3", {
                id: "Category3",
                label: "Мемы 3й категории",
                disabled: false,
                required: true,
                fieldIndex: "3",
                values: [
                    {
                        name: "Повар спрашивает повара",
                        value: "povar",
                        id: "povar"
                    },
                    {
                        name: "Водочки нам принеси",
                        value: "vodochki",
                        id: "vodochki"
                    },
                    {
                        name: "В ебыч прописать?",
                        value: "ebich",
                        id: "ebich"
                    }
                ],
                selected: "ebich"
            });
            self.formValues.get("Category2").setUpdateFunc(self.getData);
            self.formValues.get("Category3").setUpdateFunc(self.getAnotherData);
            self.formValues.get("Category1").next = "Category2";
            self.formValues.get("Category2").next = "Category3";
            self.formValues.set("description", {
                id: "description",
                label: "Описание",
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
                    <InputLabel id={field.id}>{label}</InputLabel>
                    <Select
                        id={field.id}
                        label={label}
                        labelId={field.id}
                        name={field.id}
                        disabled={field.disabled}
                        value={
                            field.selected && field.selected.value
                                ? field.selected.value
                                : ""
                        }
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
                    id={field.id}
                    label={label}
                    value={field.singleValue}
                    name={field.id}
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
                style={{ marginTop: 16, marginBottom: 16 }}
            >
                {FieldComponent}
                {field.error && <FormHelperText>{field.error}</FormHelperText>}
            </FormControl>
        );
    }
);

const AppView = observer((props) => {
    console.log("Notice that parent renders only once");
    return (
        <div>
            <div>
                {props.store.hasFields &&
                    props.store.fieldIds.map((id) => {
                        return (
                            <DetailsSelect
                                changeField={props.store.changeField}
                                field={props.store.formValues.get(id)}
                                key={id}
                                {...(id === "description" && {
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
            {props.store.hasFields && (
                <Button
                    onClick={() =>
                        props.store.formValues
                            .get("Category2")
                            .updateValues({ id: undefined })
                    }
                    color="primary"
                    variant="contained"
                >
                    Update select values
                </Button>
            )}
        </div>
    );
});

render(<AppView store={store} />, document.getElementById("root"));
