import React, { useEffect, useRef, useState } from "react";

const AnalyticsDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedStats, setAnimatedStats] = useState({
    analyses: 0,
    avgScore: 0,
    comparisons: 0,
    issues: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            // Animate numbers when in view
            animateStats();
          }
        });
      },
      { threshold: 0.1 },
    );

    const elements = containerRef.current?.querySelectorAll(".reveal-init");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const animateStats = () => {
    const targets = {
      analyses: 1247,
      avgScore: 78,
      comparisons: 456,
      issues: 89,
    };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        analyses: Math.round(targets.analyses * progress),
        avgScore: Math.round(targets.avgScore * progress),
        comparisons: Math.round(targets.comparisons * progress),
        issues: Math.round(targets.issues * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  // Mock data for charts
  const weeklyData = [65, 72, 68, 85, 78, 82, 79];
  const maxValue = Math.max(...weeklyData);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const recentAnalyses = [
    {
      name: "Marketing Campaign Q1",
      score: 87,
      status: "compliant",
      time: "2 min ago",
    },
    {
      name: "Social Media Pack",
      score: 65,
      status: "warning",
      time: "15 min ago",
    },
    {
      name: "Website Rebrand",
      score: 92,
      status: "compliant",
      time: "1 hour ago",
    },
    {
      name: "Product Launch Kit",
      score: 45,
      status: "violation",
      time: "3 hours ago",
    },
  ];

  const topIssues = [
    { category: "Color", count: 34, trend: "down" },
    { category: "Typography", count: 28, trend: "up" },
    { category: "Logo Usage", count: 15, trend: "down" },
    { category: "Accessibility", count: 12, trend: "same" },
  ];

  return (
    <section
      ref={containerRef}
      className="scene bg-base max-w-7xl mx-auto py-24"
    >
      {/* Header */}
      <div className="mb-16 reveal-init">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary/40 mb-4 block">
          Performance Insights
        </span>
        <h2 className="editorial-title text-5xl sm:text-6xl opacity-90">
          Analytics
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          {
            label: "Total Analyses",
            value: animatedStats.analyses,
            icon: "analytics",
            color: "text-primary",
          },
          {
            label: "Avg. Score",
            value: `${animatedStats.avgScore}%`,
            icon: "speed",
            color: "text-green-500",
          },
          {
            label: "Comparisons",
            value: animatedStats.comparisons,
            icon: "compare_arrows",
            color: "text-blue-500",
          },
          {
            label: "Issues Found",
            value: animatedStats.issues,
            icon: "warning",
            color: "text-amber-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all duration-500 reveal-init reveal-delay-${i + 1}`}
          >
            <div
              className={`size-12 bg-base rounded-xl flex items-center justify-center mb-4 ${stat.color}`}
            >
              <span className="material-symbols-outlined text-2xl">
                {stat.icon}
              </span>
            </div>
            <p className="text-3xl font-display tracking-tight mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-black/40 uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Weekly Scores Chart */}
        <div className="bg-white p-8 rounded-[2rem] reveal-init reveal-delay-2">
          <h3 className="font-display text-xl uppercase tracking-widest text-black/40 mb-6">
            Weekly Compliance
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyData.map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-lg transition-all duration-1000 hover:from-primary/40"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
                <span className="text-xs text-black/30">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-white p-8 rounded-[2rem] reveal-init reveal-delay-3">
          <h3 className="font-display text-xl uppercase tracking-widest text-black/40 mb-6">
            Top Issues
          </h3>
          <div className="space-y-4">
            {topIssues.map((issue, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-base rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <span className="font-display text-lg">{issue.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-display text-primary">
                    {issue.count}
                  </span>
                  <span
                    className={`material-symbols-outlined text-sm ${
                      issue.trend === "down"
                        ? "text-green-500"
                        : issue.trend === "up"
                          ? "text-red-500"
                          : "text-black/30"
                    }`}
                  >
                    {issue.trend === "down"
                      ? "trending_down"
                      : issue.trend === "up"
                        ? "trending_up"
                        : "remove"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white p-8 rounded-[2rem] reveal-init reveal-delay-4">
        <h3 className="font-display text-xl uppercase tracking-widest text-black/40 mb-6">
          Recent Analyses
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-black/30 uppercase tracking-wider">
                <th className="pb-4 font-normal">Design</th>
                <th className="pb-4 font-normal">Score</th>
                <th className="pb-4 font-normal">Status</th>
                <th className="pb-4 font-normal text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalyses.map((item, i) => (
                <tr key={i} className="border-t border-black/5">
                  <td className="py-4 font-display">{item.name}</td>
                  <td className="py-4">
                    <span
                      className={`text-xl font-display ${
                        item.score >= 80
                          ? "text-green-500"
                          : item.score >= 60
                            ? "text-amber-500"
                            : "text-red-500"
                      }`}
                    >
                      {item.score}%
                    </span>
                  </td>
                  <td className="py-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider ${
                        item.status === "compliant"
                          ? "bg-green-100 text-green-700"
                          : item.status === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-right text-sm text-black/40">
                    {item.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
