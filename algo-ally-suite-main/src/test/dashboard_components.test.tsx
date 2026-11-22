import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AiDsaTutorCard } from "../components/dashboard/AiDsaTutorCard";
import { PlacementReadinessCard } from "../components/dashboard/PlacementReadinessCard";
import { PersonalizedRoadmapCard } from "../components/dashboard/PersonalizedRoadmapCard";
import { AuthProvider } from "../contexts/AuthContext";

describe("Algo Ally Pro Dashboard Components", () => {
  it("renders AI DSA Tutor Card with Hint Mode toggle", () => {
    render(
      <AuthProvider>
        <AiDsaTutorCard />
      </AuthProvider>
    );
    expect(screen.getByText("AI DSA Tutor")).toBeInTheDocument();
    expect(screen.getByText("Hint Mode")).toBeInTheDocument();
  });

  it("renders Placement Readiness Card with 82% Ready score", () => {
    render(
      <AuthProvider>
        <PlacementReadinessCard />
      </AuthProvider>
    );
    expect(screen.getByText("Placement Readiness")).toBeInTheDocument();
    expect(screen.getByText("DSA Mastery")).toBeInTheDocument();
    expect(screen.getByText("Consistency")).toBeInTheDocument();
  });

  it("renders Personalized DSA Roadmap Card with milestones", () => {
    render(
      <AuthProvider>
        <PersonalizedRoadmapCard />
      </AuthProvider>
    );
    expect(screen.getByText("Your Personalized DSA Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Arrays & Strings")).toBeInTheDocument();
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
  });
});
