"use client";

import { useRouter } from "next/navigation";
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
import { postData } from "@/shared/api";

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

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormSchema) {
    try {
      const response = await postData("/api/auth/register", data);
      if (response.status === 201) {
        router.push("/sign-in");
      }
    } catch (err) {
      if (!!err && err instanceof Error) {
        if (err.cause === 409) {
          form.setError("email", {
            type: "custom",
            message: err.message,
          });
        }
        form.setError("root", {
          type: "custom",
          message: err.message,
        });
        return <div className="fixed inset-0 z-10 backdrop-blur-[6px]"></div>;
      }
    }
  }

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
            {form.formState.errors.root && (
              <p className="text-red-600 mb-2">
                {form.formState.errors.root.message}
              </p>
            )}
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
