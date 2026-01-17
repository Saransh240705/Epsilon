import React, { useEffect, useRef } from "react";
import { ViewType } from "../types";

interface WorkflowSelectorProps {
  onSelect: (view: ViewType) => void;
}

const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({ onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    const elements = containerRef.current?.querySelectorAll(".reveal-init");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const nodes = [
    {
      id: ViewType.BRAND_COMPLIANCE,
      step: "01",
      title: "AUDIT",
      label: "Brand Check",
      desc: "Validate designs against brand kit.",
      icon: "verified_user",
    },
    {
      id: ViewType.COMPARISON,
      step: "02",
      title: "SYMMETRY",
      label: "Market Diff",
      desc: "Elegant differentiation mapping.",
      icon: "compare_arrows",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="scene bg-base text-neutral-black max-w-7xl mx-auto"
    >
      <div className="mb-24 flex justify-between items-end border-b border-black/[0.04] pb-12 reveal-init">
        <div className="">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60 mb-4 block">
            System Landscape
          </span>
          <h2 className="editorial-title text-6xl sm:text-[5vw] opacity-90">
            Select Pathway
          </h2>
        </div>
        <div className="text-right hidden lg:block opacity-20">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] max-w-xs leading-loose">
            Choose a node to begin the integration.
          </p>
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row gap-8 justify-between items-stretch">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/[0.05] hidden md:block -z-10 opacity-30 reveal-init reveal-delay-2"></div>

        {nodes.map((node, i) => (
          <div
            key={node.id}
            onClick={() => onSelect(node.id)}
            className={`group flex-1 flex flex-col bg-white border border-black/[0.02] p-10 rounded-[1.5rem] hover:border-primary/10 transition-all duration-[1s] cursor-pointer relative shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-2 reveal-init reveal-delay-${i + 1}`}
          >
            <div className="flex justify-between items-center mb-16">
              <span className="font-display text-4xl text-primary/5 group-hover:text-primary transition-all duration-[0.8s]">
                {node.step}
              </span>
              <div className="size-14 bg-base rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-[0.8s]">
                <span className="material-symbols-outlined text-2xl font-light">
                  {node.icon}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="editorial-title text-5xl mb-1 group-hover:text-primary transition-all duration-[0.8s]">
                {node.title}
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40 group-hover:text-primary transition-all duration-[0.8s] mb-8">
                {node.label}
              </p>
              <p className="text-base font-light text-black/40 leading-relaxed mb-10 group-hover:text-black/50 transition-all duration-[0.8s]">
                {node.desc}
              </p>
            </div>

            <button className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/20 group-hover:text-primary transition-all duration-[0.8s]">
              Access Flow
              <div className="w-8 h-[1px] bg-black/10 group-hover:w-12 group-hover:bg-primary transition-all duration-[0.8s]"></div>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkflowSelector;
