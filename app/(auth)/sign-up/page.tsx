"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signUpSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInPage() {
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

   const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
  setPending(true);
  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific known error messages
      if (result.error?.toLowerCase().includes("unique constraint") || result.error?.toLowerCase().includes("already exists")) {
        toast.error("Account already exists", {
          description: "Try logging in instead or reset your password.",
        });
      } else {
        toast.error("Sign up failed", {
          description: result.error || "An unexpected error occurred.",
        });
      }
      setPending(false);
      return;
    }

    // Success case
    toast.success("Welcome User", {
      description: "Happy voting and have a nice day",
    });
    form.reset();
    router.push("/dashboard");
  } catch (error: any) {
    toast.error("Something went wrong", {
      description: "Check your inputs and try again.",
    });
  }
  setPending(false);
};


  const fields = [
    { name: "name", label: "Name", type: "text", placeholder: "Enter your name" },
    { name: "email", label: "Email", type: "email", placeholder: "Enter your email" },
    { name: "password", label: "Password", type: "password", placeholder: "Enter your password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm your password" },
  ];
  return (
    <div className='w-full flex md:flex-row flex-col'>
        <div className='relative md:h-screen h-[40vh] md:w-[45%] w-full'>
           <Image src="https://utfs.io/f/xnMuusLWbTmLPhg4K3bMAbcLH6xCOFXTprlnmiPfVzujRwgB" alt='Login Image' fill className="object-cover" /> 
        </div>
        <div className='flex items-center justify-center md:w-[50%] w-full flex-col md:mt-0 mt-5 '>
            <div className='flex items-center justify-center gap-2 mb-10'>
                 <h1 className="md:text-5xl text-xl font-bold">Votras</h1>
        <div className="w-5 h-5 bg-gradient-to-br mt-3 from-pink-300 to-yellow-200 rounded-lg transform rotate-12"></div>
            </div>
            <div>
                <p className='font-semibold text-xl'>Sign Up for yout Votras Account</p>
            </div>
             <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}
           className="flex justify-start flex-col md:w-3/4 w-[88%] p-4 gap-1 ">
          {fields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof z.infer<typeof signUpSchema>}
                  render={({ field: fieldProps, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{field.label}</FormLabel>
                      <FormControl>
                        {field.name === 'password' || field.name === 'confirmPassword' ? (
                          <div className="relative">
                            <Input
                              type={
                                field.name === 'password' 
                                  ? showPassword ? 'text' : 'password'
                                  : showConfirmPassword ? 'text' : 'password'
                              }
                              placeholder={field.placeholder}
                              {...fieldProps}
                              autoComplete="off"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2.5"
                              onClick={() => {
                                field.name === 'password'
                                  ? setShowPassword(!showPassword)
                                  : setShowConfirmPassword(!showConfirmPassword)
                              }}
                            >
                              {(field.name === 'password' ? showPassword : showConfirmPassword) ? (
                                <EyeOff className="h-4 w-4 text-gray-600" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-600" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <Input
                            type={field.type}
                            placeholder={field.placeholder}
                            {...fieldProps}
                            autoComplete="off"
                          />
                        )}
                      </FormControl>
                      <FormMessage className="text-[11px] text-destructive">{error?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              ))}
          <div className="flex flex-col gap-1 w-full">
            <Link href="/sign-in" className="md:text-base text-sm underline">Already have an account? Sign in.</Link>
          </div>
          {pending ? (
                <Button disabled className="text-[#020618] bg-[#f8fafc] w-full hover:bg-gray-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please Wait
                </Button>
              ) : (
                <Button type="submit" className=" mt-4  w-full hover:bg-gray-400">
                  Sign Up
                </Button>
              )}
        
          </form>
          </Form>
        </div>
    </div>
  )
}
