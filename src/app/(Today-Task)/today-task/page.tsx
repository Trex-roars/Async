import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

const Page = () => {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Today's Tasks</h2>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Circle className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Complete project proposal</span>
            </div>
            <Badge>High Priority</Badge>
          </div>
          <div className="flex items-center justify-between rounded bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Circle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Team meeting</span>
            </div>
            <Badge>Medium Priority</Badge>
          </div>
          <div className="flex items-center justify-between rounded bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Circle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Review documentation</span>
            </div>
            <Badge>Low Priority</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Page;
