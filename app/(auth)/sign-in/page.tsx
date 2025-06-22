"use client"
import { authClient } from "@/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner"
import { z } from "zod";


export default function SignInPage() {
	const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

    const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    try {
      await authClient.signIn.email(
        { email: values.email, password: values.password },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Welcome back", {
              description: "Hello, User! Casting votes today?",
            });
            
          },
          onError: (error) => {
            toast.error("Something went wrong", {
              description: error.error.message || "Please check your credentials and try again",
            });
          }
        }
      );
    } finally {
      form.reset({}, { keepValues: true }); // Reset form while keeping input values
    }
  };
  return (
    <div className='w-full flex md:flex-row flex-col'>
            <div className='relative md:h-screen h-[40vh] md:w-[45%] w-full'>
               <Image src="https://utfs.io/f/xnMuusLWbTmLPhg4K3bMAbcLH6xCOFXTprlnmiPfVzujRwgB" className="object-cover" alt='Login Image' fill />
            </div>
            <div className='flex items-center justify-center md:w-[50%] w-full flex-col md:mt-0 mt-5 '>
                <div className='flex items-center justify-center gap-2 mb-10'>
                     <h1 className="md:text-5xl text-3xl font-bold">Votras</h1>
            <div className="w-5 h-5 bg-gradient-to-br mt-3 from-pink-300 to-yellow-200 rounded-lg transform rotate-12"></div>
                </div>
                <div>
                    <p className='font-semibold text-xl'>Sign In your Votras Account</p>
                </div>
                 <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)}  className="flex justify-start flex-col md:w-3/4 w-[88%] p-4 gap-3 mt-3">
                {["email", "password"].map((field) => (
          <FormField
              control={form.control}
              key={field}
              name={field as keyof z.infer<typeof signInSchema>}
              render={({ field: fieldProps }) => (
                  <FormItem>
                      <FormLabel>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                      </FormLabel>
                      <FormControl>
                          {/* 3. Wrap input in relative container for positioning */}
                          <div className="relative">
                              <Input
                                  // 4. Toggle input type based on state
                                  type={
                                      field === "password" 
                                      ? (showPassword ? "text" : "password")
                                     : "email"
                                  }
                                  placeholder={`Enter your ${field}`}
                                  {...fieldProps}
                                  autoComplete={
                                      field === "password" 
                                       ? "current-password" 
                                      : "email"
                                  }
                              />
                              {/* 5. Show eye icon only for password field */}
                              {field === "password" && (
                                  <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      // 6. Position icon absolutely in the input
                                      className="absolute right-3 top-1/2 -translate-y-1/2"
                                  >
                                      {showPassword ? (
                                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                          <Eye className="h-4 w-4 text-muted-foreground" />
                                      )}
                                  </button>
                              )}
                          </div>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
                />
             ))}
                            <div className="flex mt-2 flex-col ">
                            <div className="flex md:flex-row flex-col justify-between gap-2">
                                <div className="flex flex-row items-center gap-2 text-sm"><Checkbox className="data-[state=checked]:bg-[#f8fafc] data-[state=checked]:text-[#020618] data-[state=checked]:border-[#f8fafc]" /> <p>Remember Me</p></div>
                                <Link href="/forgot-password" className="text-[12px] text-primary-day underline">Forgot Password?</Link>
                                </div>
                                
                            </div>
                            <Button 
      type="submit" 
      disabled={form.formState.isSubmitting}
      className=" mt-4  w-full hover:bg-gray-400"
    >
      {form.formState.isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please Wait
        </>
      ) : (
        "Sign In"
      )}
    </Button>
             
                    </form>
                    </Form>
            </div>
        </div>
  )
}
