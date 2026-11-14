import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

interface NameCardProps {
  name: string;
}

export function NameCard({ name }: NameCardProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardContent className="flex flex-col gap-4">
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
          <Image
            src="https://www.gamerevolution.com/wp-content/uploads/sites/2/2019/08/original-Pokemon-artwork-2.jpg"
            alt="16:9"
            width={1000}
            height={800}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between gap-5">
          <p className="text-foreground text-base">{name}</p>
          <div className="flex items-center gap-1">
            <SparklesIcon aria-hidden="true" />
            <span className="text-secondary-foreground text-xs font-medium">
              Featured
            </span>
          </div>
        </div>

        <p className="text-foreground text-sm">
          A little description of who you are, what you&apos;re interested in,
          what you did in this project
        </p>

        <Button>
          Github
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
}
