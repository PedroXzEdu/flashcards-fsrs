import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SkeletonDeckCard, SkeletonCardItem } from "./SkeletonCard";

describe("SkeletonDeckCard", () => {
  it("renders skeleton elements", () => {
    const { container } = render(<SkeletonDeckCard />);
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });
});

describe("SkeletonCardItem", () => {
  it("renders skeleton elements", () => {
    const { container } = render(<SkeletonCardItem />);
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });
});
