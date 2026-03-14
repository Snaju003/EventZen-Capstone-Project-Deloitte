import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SuccessMessagePage = () => {
  return (
    <div className='bg-slate-50 min-h-screen flex flex-col font-sans'>
      <main className='grow flex items-center justify-center p-6'>
        <section className='max-w-md w-full text-center'>
          <div className='flex justify-center mb-8'>
            <div className='bg-emerald-50 rounded-full p-6 inline-flex items-center justify-center'>
              <svg
                className='w-16 h-16 text-[#1D9E75]'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2.5'
                  d='M5 13l4 4L19 7'
                ></path>
              </svg>
            </div>
          </div>

          <h1 className='text-3xl md:text-4xl font-extrabold text-[#2E4057] mb-4'>
            Password Reset Successful
          </h1>

          <p className='text-gray-500 text-lg leading-relaxed mb-10'>
            Your password has been successfully updated. Your account is now
            secure and you can proceed to log in with your new credentials.
          </p>

          <Alert className='mb-8 grid gap-1 rounded-xl border-emerald-200 bg-emerald-50 text-left text-emerald-800'>
            <AlertTitle>Password updated</AlertTitle>
            <AlertDescription className='text-emerald-700'>
              Use your new password the next time you sign in to EventZen.
            </AlertDescription>
          </Alert>

          <div className='mb-8'>
            <Link
              to='/'
              className='block w-full bg-[#2E4057] hover:bg-[#233142] text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg'
            >
              Back to Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SuccessMessagePage;
