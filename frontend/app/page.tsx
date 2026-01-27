import { Button } from "@/components/ui/button";
import Link from "next/link";
const page = () => {
  return (
    <div className="flex min-h-screen justify-center items-center">
      <Link href={'/login'}>
        <Button>Get Started</Button>
      </Link>
    </div>
  );
};

export default page;
