import React from "react";
import { Card, Skeleton} from "@nextui-org/react";

export default function Loading(){
  const {isLoaded, setIsLoaded} = React.useState(false);
  const toggleLoad = () => {
    setIsLoaded(isLoaded);
  };
  <div>
    <Card  className="w-[200px] space-y-5 p-4" radius="lg">
      <Skeleton className="rounded-lg">
        <div className="h-24 rounded-lg bg-default-300"></div>
      </Skeleton>
    </Card>
  </div>
};