"use client";

import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthFormLayout } from "../ui/auth-form-layout";
import { Field } from "../ui/form-field";
import { GoogleAuth } from "../ui/google-auth-button";
import { AuthLink } from "../ui/link";
import { BottomAuthLayout } from "../ui/bottom-auth-layout";

const FormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Имя должно содержать минимум 2 символа",
    }),
    email: z.string().email({
      message: "Неверный формат email-адреса",
    }),
    password: z.string().min(6, {
      message: "Пароль должен содержать минимум 6 символов",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают!",
    path: ["confirmPassword"],
  });

type FormSchema = z.infer<typeof FormSchema>;

function onSubmit(data: FormSchema) {
  const registerData = {
    name: data.name,
    email: data.email,
    password: data.password,
  };
  fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

export function SignUpForm() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <AuthFormLayout
      title="РЕГИСТРАЦИЯ"
      form={
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Field
              control={form.control}
              name="name"
              label="Имя"
              placeholder="Введите имя"
            />
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
            <Field
              control={form.control}
              name="confirmPassword"
              label="Подтвердите пароль"
              placeholder="Подтвердите пароль"
            />
            <Button className="hover:cursor-pointer" type="submit">
              Зарегистрироваться
            </Button>
          </form>
        </Form>
      }
      bottomLayout={
        <BottomAuthLayout
          google={<GoogleAuth description={"Регистрация с Google"} />}
          link={
            <AuthLink
              text={"Уже регистрировались ранее?"}
              url={"/sign-in"}
              linkText={"Войти"}
            />
          }
        />
      }
    />
  );
}
