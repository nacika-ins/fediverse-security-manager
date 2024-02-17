"use client";
import { NextPage } from "next";
import { SettingContainer } from "@/components/organisms/SettingContainer";
import React from "react";

const Page: NextPage = () => {
  return (
    <main className="relative py-6 lg:gap-10 lg:py-8">
      <div className="container flex-1">
        <SettingContainer />
      </div>
    </main>
  );
};

export default Page;
