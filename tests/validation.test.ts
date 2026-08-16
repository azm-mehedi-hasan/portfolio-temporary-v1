import { describe, expect, it } from "vitest";
import {
  ContactSchema,
  GallerySchema,
  LinkSchema,
  PostSchema,
  ProjectSchema,
} from "@/lib/validation";
import { ICON_NAMES, getIcon, isIconName } from "@/lib/icons";

const baseProject = {
  slug: "my-project",
  title: "My project",
  description: "Something useful.",
  liveUrl: "https://example.com",
  thumbnailUrl: "/images/a.png",
  status: "PUBLISHED" as const,
};

describe("ProjectSchema", () => {
  it("accepts a valid project", () => {
    expect(ProjectSchema.safeParse(baseProject).success).toBe(true);
  });

  it("rejects slugs that would break the URL", () => {
    for (const slug of ["has spaces", "sym$bols", "", "-leading"]) {
      expect(ProjectSchema.safeParse({ ...baseProject, slug }).success).toBe(false);
    }
  });

  it("accepts both a CDN URL and a /public path for images", () => {
    for (const thumbnailUrl of [
      "/images/a.png",
      "https://res.cloudinary.com/demo/image/upload/a.png",
    ]) {
      expect(ProjectSchema.safeParse({ ...baseProject, thumbnailUrl }).success).toBe(true);
    }
  });

  it("rejects a relative path that is not rooted", () => {
    expect(
      ProjectSchema.safeParse({ ...baseProject, thumbnailUrl: "images/a.png" }).success
    ).toBe(false);
  });

  it("requires a real live URL", () => {
    expect(
      ProjectSchema.safeParse({ ...baseProject, liveUrl: "not-a-url" }).success
    ).toBe(false);
  });

  it("defaults optional collections to empty arrays", () => {
    const parsed = ProjectSchema.parse(baseProject);
    expect(parsed.techIds).toEqual([]);
    expect(parsed.images).toEqual([]);
    expect(parsed.contentMdx).toBe("");
  });
});

describe("PostSchema", () => {
  it("requires a cover image and a summary", () => {
    expect(
      PostSchema.safeParse({
        slug: "a-post",
        title: "A post",
        description: "",
        coverImageUrl: "/images/a.png",
        status: "DRAFT",
      }).success
    ).toBe(false);
  });

  it("accepts a draft with no publish date", () => {
    const parsed = PostSchema.safeParse({
      slug: "a-post",
      title: "A post",
      description: "Summary here.",
      coverImageUrl: "/images/a.png",
      status: "DRAFT",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("LinkSchema", () => {
  it("only accepts icons from the allowlist", () => {
    expect(
      LinkSchema.safeParse({
        kind: "nav",
        label: "Home",
        href: "/",
        iconName: "IconBolt",
      }).success
    ).toBe(true);

    // A database value must never be able to name an arbitrary module.
    expect(
      LinkSchema.safeParse({
        kind: "nav",
        label: "Home",
        href: "/",
        iconName: "../../etc/passwd",
      }).success
    ).toBe(false);
  });
});

describe("icon registry", () => {
  it("resolves every allowlisted name to a component", () => {
    for (const name of ICON_NAMES) {
      expect(isIconName(name)).toBe(true);
      expect(typeof getIcon(name)).not.toBe("undefined");
    }
  });

  it("falls back rather than throwing on an unknown name", () => {
    expect(isIconName("NopeIcon")).toBe(false);
    expect(getIcon("NopeIcon")).toBeTruthy();
  });
});

describe("ContactSchema", () => {
  const valid = {
    name: "Someone",
    email: "someone@example.com",
    message: "A message long enough to pass validation.",
  };

  it("accepts a well-formed message", () => {
    expect(ContactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a short message and a bad email", () => {
    expect(ContactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
    expect(ContactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(
      ContactSchema.safeParse({ ...valid, website: "http://spam.example" }).success
    ).toBe(false);
  });
});

describe("GallerySchema", () => {
  it("defaults visibility to true", () => {
    expect(GallerySchema.parse({ url: "/images/a.png" }).visible).toBe(true);
  });
});
