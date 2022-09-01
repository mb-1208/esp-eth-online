import React from "react";
import Link from "next/link";
import { IconGraph } from "@tabler/icons";

export const StatsButton = () => {
  return (
    <>
      <Link href="/stats">
        <button className="mt-4 btn-menu-style stats-btn" style={{ width: "100%" }}>
          <IconGraph />
          Stats
        </button>
      </Link>
    </>
  );
};
