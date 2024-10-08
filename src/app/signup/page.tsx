import SignupForm from "../ui/signup-form";
import { UserCircleIcon } from "@heroicons/react/24/outline";
export default function SignupPage() {
    return (
      <main className="flex items-center justify-center md:h-screen bg-[url('/vibrant-books.png')]">
        <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
          <div className="flex h-full w-full items-start rounded-lg bg-green-500 p-3 md:h-36">
          <UserCircleIcon className="ml-auto mt-auto w-20 h-20 size-10" color="white" />
            <div className="w-32 text-whitex md:w-36">
            </div>
          </div>
          <SignupForm />
        </div>
      </main>
    );
  }