import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/InputField";
import { MailIcon, LockIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getFieldErrors, loginSchema } from "@/lib/auth-schemas";
import { getRoleHomePath } from "@/lib/role-home";
import toast from "react-hot-toast";

export const LoginForm = () => {
 const { isLoading, login } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [errors, setErrors] = useState({});

 const handleSubmit = async (e) => {
 e.preventDefault();
 setErrors({});

 const values = { email, password };
 const parsedValues = loginSchema.safeParse(values);

 if (!parsedValues.success) {
 setErrors(getFieldErrors(parsedValues.error));
 return;
 }

 try {
 const result = await login(parsedValues.data);
 const welcomeName = result?.user?.name ? `, ${result.user.name}` : '';
 const roleHomePath = getRoleHomePath(result?.user?.role);
 let redirectPath = location.state?.from;
 
 // If no redirect path, or if the user came from the public landing page ("/") 
 // or their profile page (e.g. they logged out there last), 
 // route them strictly to their core experience area
 if (!redirectPath || redirectPath === "/" || redirectPath === "/profile") {
    redirectPath = roleHomePath;
 }

 navigate(redirectPath, {
 replace: true,
 state: { statusMessage: result?.message || `Welcome back${welcomeName}!` },
 });
 } catch (error) {
 if (error instanceof z.ZodError) {
 setErrors(getFieldErrors(error));
 return;
 }

 toast.error(getApiErrorMessage(error, "Login failed. Please try again."), { id: "login-error" });
 }
 };

 return (
 <form onSubmit={handleSubmit} noValidate>

 <InputField
 label="Email"
 type="email"
 placeholder="Enter your email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 icon={<MailIcon />}
 error={errors.email?.[0]}
 ariaDescribedBy="login-email-error"
 autoComplete="email"
 />
 <InputField
 label="Password"
 type="password"
 placeholder="Enter your password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 icon={<LockIcon />}
 showToggle
 showPassword={showPassword}
 onToggle={() => setShowPassword((p) => !p)}
 error={errors.password?.[0]}
 ariaDescribedBy="login-password-error"
 autoComplete="current-password"
 />

 <div className="flex justify-end mb-4">
 <Link
 to="/forget-password"
 className="text-sm font-medium text-slate-700 hover:underline"
 >
 Forgot password?
 </Link>
 </div>

 <Button
 type="submit"
 className="w-full"
 disabled={isLoading}
 >
 <ArrowRight className="size-4" />
 {isLoading ? "Logging in..." : "Log in"}
 </Button>
 </form>
 );
};
