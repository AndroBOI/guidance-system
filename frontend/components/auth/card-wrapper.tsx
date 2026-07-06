import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface CardWrapperProps {
  children: React.ReactNode;
  cardTitle?: string;
  cardDescription?: string;
  cardButtonText?: string;
  footerText?: string;
  backButtonHref?: string;
}

const CardWrapper = ({
  children,
  cardTitle,
  cardDescription,
  footerText,
  backButtonHref,
}: CardWrapperProps) => {
  return (
    <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl p-2 sm:p-4 lg:p-6">
      <CardHeader className="text-center">
        <CardTitle className="text-xl sm:text-2xl lg:text-3xl">
          {cardTitle}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base lg:text-lg">
          {cardDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex-col gap-2">
        <Link
          className="text-sm sm:text-base text-gray-500 hover:underline"
          href={`${backButtonHref}`}
        >
          {footerText}
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
