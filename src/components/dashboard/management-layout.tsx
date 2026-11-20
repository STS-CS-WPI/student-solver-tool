import type { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ManagementLayoutProps = {
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function ManagementPage({
  title,
  description,
  actions,
  children,
}: ManagementLayoutProps) {
  return (
    <div className="p-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function ManagementTableCard({
  title,
  description,
  actions,
  children,
}: ManagementLayoutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
