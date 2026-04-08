import { describe, expect, it } from "vitest";
import type { LinkResponseDto } from "@/types/api";
import { getLinkDisplayTitle } from "./linkUtils";

function link(over: Partial<LinkResponseDto>): LinkResponseDto {
  return {
    id: 1,
    userId: 1,
    url: "https://example.com/p/1",
    domain: "example.com",
    title: "Title",
    slug: "slug",
    visibility: "public",
    status: "analyzed",
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
    files: [],
    collections: [],
    ...over,
  };
}

describe("getLinkDisplayTitle", () => {
  it("uses platformPostTitle when title equals ogTitle", () => {
    expect(
      getLinkDisplayTitle(
        link({
          title: "Same",
          ogTitle: "Same",
          platformPostTitle: "Real headline",
        }),
      ),
    ).toBe("Real headline");
  });

  it("uses productName when title equals ogTitle and no platformPostTitle", () => {
    expect(
      getLinkDisplayTitle(
        link({
          title: "Same",
          ogTitle: "Same",
          productName: "Cool product",
        }),
      ),
    ).toBe("Cool product");
  });

  it("keeps title when it differs from ogTitle even if platformPostTitle is set", () => {
    expect(
      getLinkDisplayTitle(
        link({
          title: "Custom title",
          ogTitle: "OG",
          platformPostTitle: "Ignored",
        }),
      ),
    ).toBe("Custom title");
  });

  it("falls back to url when title and ogTitle are empty", () => {
    expect(
      getLinkDisplayTitle(
        link({
          title: "",
          ogTitle: "",
          url: "https://shop.example/item",
        }),
      ),
    ).toBe("https://shop.example/item");
  });
});
