"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthFormLayout } from "../ui/auth-form-layout";
import { Field } from "../ui/form-field";
import { GoogleAuth } from "../ui/google-auth-button";
import { AuthLink } from "../ui/link";
import { BottomAuthLayout } from "../ui/bottom-auth-layout";
import { postData } from "@/shared/api";
import { FormSchema } from "../shared/schemas";
import { useState } from "react";
import { Loading } from "@/shared/ui/loading";

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const res = await postData("/api/auth/register", data);
      if (res?.success) {
        router.push("/sign-in");
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.cause === 409) {
          form.setError("email", {
            type: "custom",
            message: err.message,
          });
        } else {
          form.setError("root", {
            type: "custom",
            message: `Ошибка! ${err.message}`,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
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
                  <p className="text-red-600 font-bold mb-2">
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
      )}
    </>
  );
}
