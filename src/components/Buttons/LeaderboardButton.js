import React from "react";
import Link from "next/link";

export const LeaderboardButton = () => {

  return (
    <>
      <Link href="/leaderboard">
        <button
          className="btn-menu-style"
        >
          Leaderboard
        </button>
      </Link>
    </>
  );
};
