import { Button } from "@/components/ui/button";
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
  cardButtonText,
  footerText,
  backButtonHref,
}: CardWrapperProps) => {
  return (
    <Card className="w-full max-w-sm ">
      <CardHeader className="text-center">
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex-col gap-2">
        <Link
          className="text-sm hover:underline"
          style={{ color: "var(--muted-foreground)" }}
          href={`${backButtonHref}`}
        >
          {footerText}
        </Link>
      </CardFooter>
    </Card>
  );
}

export default CardWrapper;