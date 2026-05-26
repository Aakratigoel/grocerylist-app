"use client";

import Link from "next/link";
import { useState } from "react";
import { NEW_GROCERY_LIST_START_HREF } from "./orders/new/_wizard";
import { ArrowRightIcon, PlayIcon } from "./_components/icons";

const features = [
  {
    icon: "🌿",
    title: "Works offline",
    description: "Always available",
  },
  {
    icon: "👥",
    title: "Share instantly",
    description: "No accounts",
  },
  {
    icon: "🛡️",
    title: "Your data stays",
    description: "On your device",
  },
];

export default function Home() {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <div className="landing-page fixed inset-0 overflow-auto bg-black text-white">
      {/* Background Image */}
      <div className="landing-bg" />

      {/* Navigation Header */}
      <header className="relative z-50 border-b border-zinc-800/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold">GroceryList</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              How it works
            </a>
            <a
              href="#share"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Share
            </a>
            <a
              href="#about"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              About
            </a>
          </nav>

          <Link
            href={NEW_GROCERY_LIST_START_HREF}
            className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500 transition-all hover:bg-green-500/20"
          >
            Get started <ArrowRightIcon className="ml-1 inline h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-20">
          {/* Left-aligned Content */}
          <div className="flex flex-col">
            {/* Green vertical accent line */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-500 via-green-500/50 to-transparent" />

            <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Simple. Local. Private.
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Grocery{" "}
              <span className="text-green-500">list</span>
              <span className="text-green-500">.</span>
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-zinc-400">
              Create, store and share grocery lists with anyone. All in your
              browser. No sign up. No cloud. 100% yours.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={NEW_GROCERY_LIST_START_HREF}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-base font-medium text-white transition-all hover:bg-green-700"
              >
                Create your first list
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-6 py-3.5 text-base font-medium text-white transition-all hover:bg-zinc-800"
              >
                <PlayIcon className="h-5 w-5" />
                See how it works
              </button>
            </div>

            {/* Features Grid */}
            <div className="mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xl">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-zinc-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 flex justify-center border-t border-zinc-800/50 px-6 py-8 lg:mt-32 lg:py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-5 py-2.5 text-sm text-zinc-400 backdrop-blur-sm">
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Stored locally in your browser
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Close video"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video container */}
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
              {/* Option 1: YouTube embed - Replace VIDEO_ID with your YouTube video ID */}
              {/* <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1"
                title="How it works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              /> */}

              {/* Option 2: Local video file - Place your video in the public folder */}
              <video
                className="h-full w-full"
                controls
                autoPlay
                src="/howitworks.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
