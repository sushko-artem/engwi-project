import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { IFieldProps } from "../shared/interfaces";
import { FieldValues } from "react-hook-form";

export const Field = <T extends FieldValues>(props: IFieldProps<T>) => (
  <FormField
    control={props.control}
    name={props.name}
    render={({ field }) => (
      <FormItem className="gap-1.5 mb-4">
        <FormLabel className="px-1">{props.label}</FormLabel>
        <FormControl>
          <Input
            className="text-base placeholder:text-xs px-1 bg-transparent"
            placeholder={props.placeholder}
            {...field}
          />
        </FormControl>
        {props.description && (
          <FormDescription>{props.description}</FormDescription>
        )}
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);
