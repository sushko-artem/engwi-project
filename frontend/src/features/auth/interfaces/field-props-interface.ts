import { Control, FieldPath, FieldValues } from "react-hook-form";

export interface IFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  description?: string;
}
