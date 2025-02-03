import { useState, useEffect } from "react";
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
import { ModeToggle } from "@/components/ModeToggle";
import { Video, Globe, Users } from "lucide-react";

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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

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
      
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', values.username)
        .maybeSingle();

      if (existingUserError) throw existingUserError;

      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Error creating account",
          description: "This username is already taken. Please choose another one.",
        });
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
          throw new Error("This email is already registered. Please try signing in instead.");
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
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message || "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          throw new Error("Invalid email or password. Please try again.");
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
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "Failed to sign in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsLoading(true);
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select()
        .eq("username", values.username)
        .eq("secret_id_number", values.secretIdNumber)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Invalid username or secret ID number. Please try again.");
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
      toast({
        variant: "destructive",
        title: "Error resetting password",
        description: error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl mx-auto">
        <header className="py-6 px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              <Video className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent animate-shine">
              CommonTube
            </h1>
          </div>
          <ModeToggle />
        </header>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">
              Share and Connect
            </h2>
            <p className="text-lg text-muted-foreground">
              Join our community to share videos, connect with others, and discover amazing content.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 metallic-card">
                <Video className="w-8 h-8 mb-2 text-primary" />
                <span className="text-sm">Share Videos</span>
              </div>
              <div className="flex flex-col items-center p-4 metallic-card">
                <Globe className="w-8 h-8 mb-2 text-primary" />
                <span className="text-sm">Global Reach</span>
              </div>
              <div className="flex flex-col items-center p-4 metallic-card">
                <Users className="w-8 h-8 mb-2 text-primary" />
                <span className="text-sm">Community</span>
              </div>
            </div>
          </div>
          
          <div className="metallic-card p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
              </TabsList>

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
                            <Input {...field} type="email" />
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
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      Sign In
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
                            <Input {...field} type="email" />
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} type="password" />
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
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      Sign Up
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} type="password" />
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
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      Reset Password
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-24 py-12">
          <section className="space-y-6 text-center">
            <h2 className="text-3xl font-bold">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="metallic-card p-6 space-y-4">
                <h3 className="text-xl font-semibold">Content Creation</h3>
                <p className="text-muted-foreground">
                  Create and share amazing content with our community.
                </p>
              </div>
              <div className="metallic-card p-6 space-y-4">
                <h3 className="text-xl font-semibold">Analytics</h3>
                <p className="text-muted-foreground">
                  Track your performance with detailed analytics.
                </p>
              </div>
              <div className="metallic-card p-6 space-y-4">
                <h3 className="text-xl font-semibold">Transactions</h3>
                <p className="text-muted-foreground">
                  Manage your transactions securely and efficiently.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6 text-center">
            <h2 className="text-3xl font-bold">Why Choose Us?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="metallic-card p-6 space-y-4">
                <h3 className="text-xl font-semibold">Secure Platform</h3>
                <p className="text-muted-foreground">
                  Your data is protected with industry-standard security measures.
                </p>
              </div>
              <div className="metallic-card p-6 space-y-4">
                <h3 className="text-xl font-semibold">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Our support team is always here to help you succeed.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
