import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  comparisonValue: number;
  icon: React.ReactNode;
  unit?: string;
}

const StatCard = ({ title, value, comparisonValue, icon, unit }: StatCardProps) => {
  const isPositive = comparisonValue > 0;
  const isNegative = comparisonValue < 0;
  const isNeutral = comparisonValue === 0;

  const getComparisonColor = () => {
    if (isPositive) return "text-green-500";
    if (isNegative) return "text-red-500";
    return "text-muted-foreground";
  };

  const ComparisonIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          <span className={getComparisonColor()}>
            <ComparisonIcon className="h-4 w-4 mr-1" />
            {Math.abs(comparisonValue)}%
          </span>
          <span className="ml-1">from yesterday</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
