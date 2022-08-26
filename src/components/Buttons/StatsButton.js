import React from "react";
import Link from "next/link";

export const StatsButton = () => {

  return (
    <>
      <Link href="/stats">
        <button
          className="btn-menu-style"
        >
          Stats
        </button>
      </Link>
    </>
  );
};
