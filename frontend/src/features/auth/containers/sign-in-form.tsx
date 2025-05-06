"use client";

import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthFormLayout } from "../ui/auth-form-layout";
import { Field } from "../ui/form-field";
import { BottomAuthLayout } from "../ui/bottom-auth-layout";
import { GoogleAuth } from "../ui/google-auth-button";
import { AuthLink } from "../ui/link";

const FormSchema = z.object({
  email: z.string().email({
    message: "Неверный формат email-адреса",
  }),
  password: z.string().min(6, {
    message: "Пароль должен содержать минимум 6 символов",
  }),
});

type FormSchema = z.infer<typeof FormSchema>;

function onSubmit(data: FormSchema) {
  console.log(data);
}

export function SignInForm() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <AuthFormLayout
      title="ВХОД"
      description="Введите данные, чтобы войти в приложение."
      form={
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Field
              control={form.control}
              name="email"
              label="Ваша эл. почта"
              placeholder="Введите почту"
            />
            <Field
              control={form.control}
              name="password"
              label="Пароль"
              placeholder="Введите пароль"
            />
            <Button className="hover:cursor-pointer w-[60%]" type="submit">
              Войти
            </Button>
          </form>
        </Form>
      }
      bottomLayout={
        <BottomAuthLayout
          google={<GoogleAuth description={"Войти с Google"} />}
          link={
            <AuthLink
              text={""}
              url={"/sign-up"}
              linkText={"Пройти регистрацию"}
            />
          }
        />
      }
    />
  );
}
