import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AiDsaTutorCard } from "../components/dashboard/AiDsaTutorCard";
import { PlacementReadinessCard } from "../components/dashboard/PlacementReadinessCard";
import { PersonalizedRoadmapCard } from "../components/dashboard/PersonalizedRoadmapCard";
import { AuthProvider } from "../contexts/AuthContext";

describe("Algo Ally Pro Dashboard Components", () => {
  it("renders AI DSA Tutor Card with Explanation Levels and Modes matching Image 2", () => {
    render(
      <AuthProvider>
        <AiDsaTutorCard />
      </AuthProvider>
    );
    expect(screen.getByText("AI DSA Tutor")).toBeInTheDocument();
    expect(screen.getByText("Hint-First")).toBeInTheDocument();
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
  });

  it("renders Placement Readiness Card with Readiness Score matching Image 1", () => {
    render(
      <AuthProvider>
        <PlacementReadinessCard />
      </AuthProvider>
    );
    expect(screen.getByText("Placement Readiness")).toBeInTheDocument();
    expect(screen.getByText("DSA Mastery")).toBeInTheDocument();
    expect(screen.getByText("Study Consistency")).toBeInTheDocument();
    expect(screen.getByText("Readiness Score")).toBeInTheDocument();
  });

  it("renders Adaptive DSA Roadmap Card with milestones matching Image 3", () => {
    render(
      <AuthProvider>
        <PersonalizedRoadmapCard />
      </AuthProvider>
    );
    expect(screen.getByText("Adaptive DSA Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Arrays & Strings")).toBeInTheDocument();
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
  });
});
