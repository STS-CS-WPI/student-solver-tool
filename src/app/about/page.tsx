// import {
//   ArrowDown,
//   ArrowUpRight,
//   BookOpen,
//   Code,
//   Database,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { AboutAnimations, AboutCard, AboutSuite } from "./about-animations";

// export default function AboutPage() {
//   return (
//     <AboutAnimations>
//       <main className="min-w-0 bg-[#f5f4f3] font-sans text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
//         <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
//           <nav
//             aria-label="About page sections"
//             className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-b border-black/15 py-4 text-sm dark:border-white/15"
//           >
//             <a
//               href="#overview"
//               className="inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
//             >
//               Overview
//             </a>
//             <a
//               href="#team"
//               className="inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
//             >
//               Our team
//             </a>
//             <a
//               href="#academic-focus"
//               className="inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
//             >
//               Academic focus
//             </a>
//           </nav>

//           <section
//             aria-labelledby="about-heading"
//             className="py-16 text-center sm:py-24"
//           >
//             <p className="mb-6 text-xs font-medium tracking-[0.2em] uppercase">
//               WPI · Major Qualifying Project
//             </p>
//             <h1
//               id="about-heading"
//               className="text-5xl leading-none font-bold tracking-tighter uppercase sm:text-7xl lg:text-8xl"
//             >
//               Student Teaching
//               <AboutSuite />
//             </h1>
//             <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl dark:text-zinc-400">
//               A student data management and validation system built as our WPI
//               senior capstone project. Bringing data processing and modern web
//               development together in one accessible interface.
//             </p>

//             <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
//               <Button
//                 asChild
//                 size="lg"
//                 className="min-h-11 bg-zinc-950 px-6 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
//               >
//                 <a href="#overview">
//                   Explore the project
//                   <ArrowDown aria-hidden="true" />
//                 </a>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 size="lg"
//                 className="min-h-11 border-zinc-400 bg-transparent px-6 dark:border-zinc-600"
//               >
//                 <a
//                   href="https://github.com/minaboktor2628/student-solver-tool"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   View source code
//                   <ArrowUpRight aria-hidden="true" />
//                   <span className="sr-only"> (opens in a new tab)</span>
//                 </a>
//               </Button>
//             </div>

//             <dl className="mt-14 grid gap-8 border-y border-black/15 py-8 text-left sm:grid-cols-2 lg:grid-cols-4 dark:border-white/15">
//               <div>
//                 <dt className="text-xs tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
//                   University
//                 </dt>
//                 <dd className="mt-2 font-medium">WPI</dd>
//               </div>
//               <div>
//                 <dt className="text-xs tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
//                   Advisor
//                 </dt>
//                 <dd className="mt-2 font-medium">Professor Ahrens</dd>
//               </div>
//               <div>
//                 <dt className="text-xs tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
//                   Duration
//                 </dt>
//                 <dd className="mt-2 font-medium">Full academic year</dd>
//               </div>
//               <div>
//                 <dt className="text-xs tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
//                   Tech stack
//                 </dt>
//                 <dd className="mt-2 font-medium">Next.js &amp; TypeScript</dd>
//               </div>
//             </dl>
//           </section>

//           <section
//             id="overview"
//             aria-labelledby="overview-heading"
//             className="scroll-mt-8 pb-16 sm:pb-24"
//           >
//             <h2
//               id="overview-heading"
//               className="flex items-center justify-center gap-3 text-center text-2xl font-medium tracking-tight sm:text-3xl"
//             >
//               <span aria-hidden="true" className="text-5xl font-light">
//                 {"{"}
//               </span>
//               Project overview
//               <span aria-hidden="true" className="text-5xl font-light">
//                 {"}"}
//               </span>
//             </h2>
//             <p className="mx-auto mt-6 max-w-2xl text-center leading-relaxed text-zinc-600 dark:text-zinc-400">
//               This MQP explores approaches to data validation, combining
//               computer science concepts with practical web development.
//             </p>

//             <div className="mt-10 grid gap-8 md:grid-cols-3">
//               <article className="border-t border-black/15 pt-6 dark:border-white/15">
//                 <AboutCard>
//                   <Database
//                     aria-hidden="true"
//                     className="mb-5 size-8 text-orange-700 dark:text-orange-400"
//                   />
//                   <h3 className="text-xl font-semibold tracking-tight">
//                     Data processing
//                   </h3>
//                   <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
//                     Data validation algorithms and parsing techniques for
//                     different file formats and data structures.
//                   </p>
//                 </AboutCard>
//               </article>
//               <article className="border-t border-black/15 pt-6 dark:border-white/15">
//                 <AboutCard>
//                   <Code
//                     aria-hidden="true"
//                     className="mb-5 size-8 text-orange-700 dark:text-orange-400"
//                   />
//                   <h3 className="text-xl font-semibold tracking-tight">
//                     Modern web stack
//                   </h3>
//                   <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
//                     Next.js, TypeScript, and modern React patterns form the
//                     foundation of the application.
//                   </p>
//                 </AboutCard>
//               </article>
//               <article className="border-t border-black/15 pt-6 dark:border-white/15">
//                 <AboutCard>
//                   <BookOpen
//                     aria-hidden="true"
//                     className="mb-5 size-8 text-orange-700 dark:text-orange-400"
//                   />
//                   <h3 className="text-xl font-semibold tracking-tight">
//                     User experience
//                   </h3>
//                   <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
//                     An intuitive, responsive interface makes complex validation
//                     processes easier to use.
//                   </p>
//                 </AboutCard>
//               </article>
//             </div>
//           </section>

//           <section
//             id="team"
//             aria-labelledby="team-heading"
//             className="scroll-mt-8 border-t border-black/15 py-16 sm:py-24 dark:border-white/15"
//           >
//             <h2
//               id="team-heading"
//               className="text-center text-4xl font-bold tracking-tighter uppercase sm:text-6xl"
//             >
//               Meet the{" "}
//               <span className="text-orange-700 dark:text-orange-400">team</span>
//             </h2>
//             <p className="mx-auto mt-6 max-w-2xl text-center leading-relaxed text-zinc-600 dark:text-zinc-400">
//               WPI Computer Science students working together on our senior
//               capstone project.
//             </p>
//             <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//               {[
//                 "Ryan Addeche",
//                 "Mina Boktor",
//                 "Jacob Burns",
//                 "Ethan Knorring",
//               ].map((name) => (
//                 <li
//                   key={name}
//                   className="border-t border-black/15 pt-5 dark:border-white/15"
//                 >
//                   <AboutCard>
//                     <h3 className="text-xl font-semibold tracking-tight">
//                       {name}
//                     </h3>
//                     <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
//                       Developer
//                     </p>
//                   </AboutCard>
//                 </li>
//               ))}
//             </ul>
//           </section>

//           <section
//             id="academic-focus"
//             aria-labelledby="academic-heading"
//             className="scroll-mt-8 border-t border-black/15 py-16 sm:py-24 dark:border-white/15"
//           >
//             <h2
//               id="academic-heading"
//               className="flex items-center justify-center gap-3 text-center text-2xl font-medium tracking-tight sm:text-3xl"
//             >
//               <span aria-hidden="true" className="text-5xl font-light">
//                 {"{"}
//               </span>
//               Academic focus
//               <span aria-hidden="true" className="text-5xl font-light">
//                 {"}"}
//               </span>
//             </h2>
//             <p className="mx-auto mt-6 max-w-2xl text-center leading-relaxed text-zinc-600 dark:text-zinc-400">
//               Applying computer science principles to real-world data validation
//               challenges through algorithm design, software engineering, and web
//               development.
//             </p>
//             <div className="mt-10 grid gap-10 md:grid-cols-2">
//               <div>
//                 <h3 className="text-xl font-semibold tracking-tight">
//                   Learning objectives
//                 </h3>
//                 <ul className="mt-4 list-disc space-y-3 pl-5 text-zinc-600 dark:text-zinc-400">
//                   <li>Algorithm implementation and optimization</li>
//                   <li>Modern web application architecture</li>
//                   <li>User interface and experience design</li>
//                   <li>Data processing and validation techniques</li>
//                 </ul>
//               </div>
//               <div>
//                 <h3 className="text-xl font-semibold tracking-tight">
//                   Technical implementation
//                 </h3>
//                 <ul className="mt-4 list-disc space-y-3 pl-5 text-zinc-600 dark:text-zinc-400">
//                   <li>React and Next.js framework</li>
//                   <li>TypeScript for type safety</li>
//                   <li>Responsive design principles</li>
//                   <li>Component-based architecture</li>
//                 </ul>
//               </div>
//             </div>
//           </section>

//           <footer className="border-t border-black/15 py-6 text-center text-xs text-zinc-600 dark:border-white/15 dark:text-zinc-400">
//             Design inspired by{" "}
//             <a
//               href="https://skiper-ui.com"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 dark:hover:text-zinc-50"
//             >
//               Skiper UI
//               <span className="sr-only"> (opens in a new tab)</span>
//             </a>
//             .
//           </footer>
//         </div>
//       </main>
//     </AboutAnimations>
//   );
// }

"use client";

import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import ReactLenis from "lenis/react";
import React, { useRef } from "react";

import { cn } from "@/lib/utils";
import { NameCard } from "./components/namecard";

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
};

const CharacterV0 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const reducedMotion = useReducedMotion();
  const distanceFromCenter = index - centerIndex;
  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [0, distanceFromCenter * 50],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [0, distanceFromCenter * 50],
  );

  return (
    <motion.span
      className={cn("text-primary inline-block", char === " " && "w-4")}
      style={{ x: reducedMotion ? 0 : x, rotateX: reducedMotion ? 0 : rotateX }}
    >
      {char}
    </motion.span>
  );
};

const CharacterV1 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const isSpace = char === " ";

  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );

  return (
    <motion.span
      className={cn("text-primary-300 inline-block", isSpace && "w-4")}
      style={{
        x,
        rotateX,
      }}
    >
      {char}
    </motion.span>
  );
};

type CharacterV2Props = Omit<CharacterProps, "char"> & {
  name: string;
};

const CharacterV2 = ({
  index,
  centerIndex,
  scrollYProgress,
  name,
}: CharacterV2Props) => {
  const reducedMotion = useReducedMotion();
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);

  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [Math.abs(distanceFromCenter) * 50, 0],
  );

  return (
    <motion.div
      className="flex min-w-0 justify-center"
      style={{
        x: reducedMotion ? 0 : x,
        scale: reducedMotion ? 1 : scale,
        y: reducedMotion ? 0 : y,
        transformOrigin: "center",
      }}
    >
      <NameCard name={name} />
    </motion.div>
  );
};

export default function AboutPage() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const secondTextRef = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });
  const { scrollYProgress: secondTextProgress } = useScroll({
    target: secondTextRef,
  });
  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: targetRef2,
  });

  const text = "Student Teaching Staff";
  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  const text2 = "An MQP Project";
  const characters2 = text2.split("");
  const centerIndex2 = Math.floor(characters2.length / 2);

  const memberInfo = [
    { id: "member-1", name: "Alicia" },
    { id: "member-2", name: "Khoi" },
    { id: "member-3", name: "Max" },
    { id: "member-4", name: "Ryan" },
  ];

  return (
    <ReactLenis root>
      <main className="bg-background w-full">
        <div className="text-foreground absolute top-22 left-1/2 z-10 grid -translate-x-1/2 content-start justify-items-center gap-6 text-center">
          <span className="after:from-background after:to-foreground relative max-w-[12ch] text-xs leading-tight uppercase opacity-40 after:absolute after:top-full after:left-1/2 after:h-16 after:w-px after:bg-gradient-to-b after:content-['']">
            Scroll to see more
          </span>
        </div>
        <div
          ref={targetRef}
          className="bg-background relative box-border flex h-[100vh] items-center justify-center gap-[2vw] overflow-hidden p-[2vw]"
        >
          <div
            className="font-geist text-foreground w-full max-w-4xl text-center text-6xl font-bold tracking-tighter uppercase"
            style={{
              perspective: "500px",
            }}
          >
            {characters.map((char, index) => (
              <CharacterV0
                key={index}
                char={char}
                index={index}
                centerIndex={centerIndex}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>

        <div
          ref={secondTextRef}
          className="bg-background relative box-border flex h-[210vh] items-center justify-center gap-[2vw] overflow-hidden p-[2vw]"
        >
          <div
            className="font-geist text-foreground w-full max-w-4xl text-center text-6xl font-bold tracking-tighter uppercase"
            style={{
              perspective: "500px",
            }}
          >
            {characters2.map((char, index) => (
              <CharacterV1
                key={index}
                char={char}
                index={index}
                centerIndex={centerIndex2}
                scrollYProgress={secondTextProgress}
              />
            ))}
          </div>
        </div>

        <div
          ref={targetRef2}
          className="bg-background relative -mt-[100vh] box-border flex min-h-[210vh] flex-col items-center justify-center gap-6 overflow-hidden px-[2vw] py-24"
        >
          <p className="font-geist text-foreground flex items-center justify-center gap-3 text-2xl font-medium tracking-tight">
            <Bracket className="text-foreground h-12" />
            <span className="font-geist font-medium">Brought to you by</span>
            <Bracket className="text-foreground h-12 scale-x-[-1]" />
          </p>
          <div className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {memberInfo.map((member, index) => (
              <CharacterV2
                key={member.id}
                index={index}
                centerIndex={(memberInfo.length - 1) / 2}
                scrollYProgress={scrollYProgress2}
                name={member.name}
              />
            ))}
          </div>
        </div>
        <div className="bg-background relative box-border flex h-[210vh] flex-col items-center justify-center gap-[2vw] overflow-hidden p-[2vw]">
          {" "}
          <p className="font-geist text-primary-300 flex items-center justify-center gap-3 text-2xl font-medium tracking-tight">
            <Bracket className="text-primary-300 h-12" />
            <span className="font-geist font-medium">Project Overview</span>
            <Bracket className="text-primary-300 h-12 scale-x-[-1]" />
          </p>
          <p className="font-geist text-foreground flex max-w-xl justify-center gap-3 text-center text-2xl font-medium tracking-tight">
            <span className="font-geist text-lg">
              This MQP explores modern approaches to data validation, combining
              theoretical computer science concepts with practical web
              development to create a robust validation platform.
            </span>
          </p>
          <p className="font-geist text-foreground flex max-w-xl justify-center gap-3 text-center text-2xl font-medium tracking-tight">
            <span className="font-geist text-lg">
              This is the second iteration of the STS web app, focusing on
              quality of life changes, bug fixes, UI improvements, and a set of
              new features.
            </span>
          </p>
        </div>
      </main>
    </ReactLenis>
  );
}

const Bracket = ({ className }: { className: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      className={className}
    >
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      ></path>
    </svg>
  );
};
