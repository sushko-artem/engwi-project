import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { IAuthLayoutProps } from "../interfaces";

export function AuthFormLayout(props: IAuthLayoutProps) {
  return (
    <Card className="w-full max-w-md bg-[image:var(--auth-form-background)]">
      <CardHeader className="text-center font-montserrat">
        <CardTitle className="font-bold text-xl">{props.title}</CardTitle>
        {props.description && (
          <CardDescription>{props.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-center">{props.form}</CardContent>
      <CardFooter>{props.bottomLayout}</CardFooter>
    </Card>
  );
}
