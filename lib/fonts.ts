import { Geist, Geist_Mono } from "next/font/google";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

/** Class names that define --font-sans and --font-mono. */
export const fontVars = `${sans.variable} ${mono.variable}`;
