"use client";

import { useState, useEffect } from "react";
import { MobileDashboard } from "@/components/MobileDashboard";
import { WorldIDVerify } from "@/components/WorldIDVerify";
import { LandingPage } from "@/components/LandingPage";
import { SimpleLandingTest } from "@/components/SimpleLandingTest";
import { MinimalTest } from "@/components/MinimalTest";
import { isMiniApp } from "@/utils/miniapp.utils";

export default function MEVShareApp() {
  const [inMiniApp, setInMiniApp] = useState(false);

  useEffect(() => {
    setInMiniApp(isMiniApp());
  }, []);

  // If user is not in the mini-app context, show the landing page
  if (!inMiniApp) {
    return <LandingPage />;
  }

  // If in mini-app context, show the dashboard directly
  // Verification will happen when user tries to scan opportunities
  return <MobileDashboard />;
}
