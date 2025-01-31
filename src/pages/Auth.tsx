import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Define interface for profile data
interface Profile {
  id: string;
  username: string;
  secret_id_number: string;
  created_at: string;
  updated_at: string;
}

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(7, "Password must be at least 7 characters")
    .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])/, "Password must contain numbers and letters"),
  confirmPassword: z.string(),
  username: z.string().min(1, "Username is required"),
  secretIdNumber: z
    .string()
    .min(7, "Secret ID must be at least 7 characters")
    .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])/, "Secret ID must contain numbers and letters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
  secretIdNumber: z
    .string()
    .min(7, "Secret ID must be at least 7 characters")
    .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])/, "Secret ID must contain numbers and letters"),
  newPassword: z
    .string()
    .min(7, "Password must be at least 7 characters")
    .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])/, "Password must contain numbers and letters"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      secretIdNumber: "",
    },
  });

  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
      secretIdNumber: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', values.username)
        .maybeSingle();

      if (existingUserError) {
        throw existingUserError;
      }

      if (existingUser) {
        setAuthError("This username is already taken. Please choose another one.");
        return;
      }

      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            secret_id_number: values.secretIdNumber,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message === "User already registered") {
          setAuthError("This email is already registered. Please try signing in instead.");
          return;
        }
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error("Failed to create user account");
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
      navigate("/");
    } catch (error: any) {
      setAuthError(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setAuthError("Invalid email or password. Please check your credentials and try again.");
          return;
        }
        throw error;
      }

      if (!data.user) {
        throw new Error("No user data returned from authentication");
      }

      toast({
        title: "Signed in successfully!",
      });
      navigate("/");
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select()
        .eq("username", values.username)
        .eq("secret_id_number", values.secretIdNumber)
        .maybeSingle();

      if (profileError || !profile) {
        setAuthError("Invalid username or secret ID number. Please try again.");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.email) {
        throw new Error("Could not find user email");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Password updated successfully!",
        description: "You can now sign in with your new password.",
      });
      navigate("/");
    } catch (error: any) {
      setAuthError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
          <TabsTrigger value="forgot">Reset Password</TabsTrigger>
        </TabsList>

        {authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="signin">
          <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signInForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="signup">
          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="secretIdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret ID Number</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="forgot">
          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
              <FormField
                control={forgotPasswordForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={forgotPasswordForm.control}
                name="secretIdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret ID Number</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={forgotPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={forgotPasswordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
