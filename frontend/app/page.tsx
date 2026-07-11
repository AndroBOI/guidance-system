import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 md:px-8">
      <main className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative order-1 flex items-center justify-center lg:order-2">
          <div className="absolute inset-0 -z-10 rounded-full bg-accent/60 blur-3xl" />
          <Image
            src="/People.svg"
            alt="Illustration of two people talking"
            width={440}
            height={440}
            priority
            className="h-auto w-full max-w-xs sm:max-w-sm md:max-w-md"
          />
        </div>


        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Counseling Appointment System
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
            A quiet space to be heard
          </h1>

          <p className="mt-4 max-w-sm text-balance text-muted-foreground">
            Book a counseling session in a few clicks and talk to someone
            when you need it.
          </p>

          <Link href="/login" className="mt-8">
            <Button size="lg" className="h-12 px-8">
              Schedule an Appointment
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Page;