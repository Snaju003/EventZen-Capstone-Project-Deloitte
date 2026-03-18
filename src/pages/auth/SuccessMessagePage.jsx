import { CircleCheckBig, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SuccessMessagePage = () => {
  return (
    <div className='bg-slate-50 min-h-screen flex flex-col font-sans'>
      <main className='grow flex items-center justify-center p-6'>
        <section className='max-w-md w-full text-center'>
          <div className='flex justify-center mb-8'>
            <div className='bg-emerald-50 rounded-full p-6 inline-flex items-center justify-center'>
              <CircleCheckBig className='w-16 h-16 text-[#1D9E75]' strokeWidth={2.25} />
            </div>
          </div>

          <h1 className='text-3xl md:text-4xl font-extrabold text-[#2E4057] mb-4'>
            Password Reset Successful
          </h1>

          <p className='text-gray-500 text-lg leading-relaxed mb-10'>
            Your password has been successfully updated. Your account is now
            secure and you can proceed to log in with your new credentials.
          </p>

          <p className='mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-700'>
            Use your new password the next time you sign in to EventZen.
          </p>

          <div className='mb-8'>
            <Button asChild className='w-full text-base'>
              <Link to='/'>
                <LogIn className='size-4' />
                Back to Login
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SuccessMessagePage;
