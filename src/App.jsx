import { Routes, Route } from "react-router-dom";
import AuthPage from "@/pages/auth/AuthPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyOtpPage from "@/pages/auth/VerifyOtpPage";
import ForgetPasswordPage from "@/pages/auth/ForgetPasswordPage";
import SuccessMessagePage from "@/pages/auth/SuccessMessagePage";

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<AuthPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/verify-otp' element={<VerifyOtpPage />} />
        <Route path='/forget-password' element={<ForgetPasswordPage />} />
        <Route path='/success-message' element={<SuccessMessagePage />} />
      </Routes>
    </>
  );
}

export default App;
