// components/Github.js

import React from "react";
import GitHubCalendar from "react-github-calendar";

export default function Github() {
  return (
    <div className="flex flex-col items-center pb-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Days I <span className="text-purple-600">Code</span>
      </h1>
      <div className="flex justify-center">
        <GitHubCalendar
          username="mfalme0"
          blockSize={15}
          blockMargin={5}

          fontSize={16}
        />
      </div>
    </div>
  );
}
