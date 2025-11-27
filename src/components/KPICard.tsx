import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export default function KPICard({ title, value, icon: Icon, trend, trendUp, className }: KPICardProps) {
  return (
    <Card className={cn("card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className={cn("text-xs font-medium", trendUp ? "text-success" : "text-destructive")}>
                {trend}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
