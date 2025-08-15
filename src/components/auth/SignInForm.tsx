import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../hooks/useAuth";
import { LoginPayload } from "../../auth/auth.types";

export default function SignInForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname ?? "/";

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (touched.email) {
      if (!email) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email is invalid";
    }

    if (touched.password) {
      if (!password) newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Live validate on input change
  useEffect(() => {
    validate();
  }, [email, password, touched]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // mark all touched to validate all fields
    setTouched({ email: true, password: true });
    if (!validate()) return;

    try {
      const payload: LoginPayload = { email, password };
      await login(payload);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <Label>Email <span className="text-error-500">*</span></Label>
              <Input
                placeholder="info@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                error={!!errors.email}
              />
              {/* Tooltip lỗi */}
              {errors.email && touched.email && (
                <div className="absolute top-0 right-0 -translate-y-full w-max px-2 py-1 text-xs text-white bg-gray-500 rounded shadow-lg">
                  {errors.email}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-2 h-2 bg-gray-500 rotate-45"></div>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <Label>Password <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  error={!!errors.password}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
              {/* Tooltip lỗi */}
              {errors.password && touched.password && (
                <div className="absolute top-0 right-0 -translate-y-full w-max px-2 py-1 text-xs text-white bg-gray-500 rounded shadow-lg">
                  {errors.password}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-2 h-2 bg-gray-500 rotate-45"></div>
                </div>
              )}
            </div>

            {/* Keep me logged in & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                  Keep me logged in
                </span>
              </div>
              <Link
                to="/reset-password"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <div>
              <Button
                className="w-full"
                size="sm"
                type="submit"
                disabled={!email || !password || Object.keys(errors).length > 0}
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
