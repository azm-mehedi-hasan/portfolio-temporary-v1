/**
 * Seeds the database with the exact content the file-based site used to serve.
 *
 *   npm run db:seed
 *
 * Idempotent: every write is an upsert keyed on a natural key, so running it
 * twice is safe and will not duplicate rows.
 */
import { PrismaClient, Status } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import readingTime from "reading-time";

const prisma = new PrismaClient();

/**
 * By default every write is `update: {}` — running the seed never clobbers
 * edits made through the admin. Pass --force to re-apply the packaged content,
 * which is how you restore a page after an accidental change.
 */
const FORCE = process.argv.includes("--force");
const upd = <T,>(data: T) => (FORCE ? data : ({} as Partial<T>));
const CONTENT = path.join(process.cwd(), "prisma", "seed-content");

const md = (kind: "projects" | "posts", slug: string) => {
  const file = path.join(CONTENT, kind, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
};

// ──────────────────────────────────────────────────────────── data

const TECH = [
  { name: "React.js", logoUrl: "/images/logos/react.png", displayHeight: "h-16", displayWidth: "w-24" },
  { name: "Java", logoUrl: "/images/logos/java.png", displayHeight: "h-16", displayWidth: "w-16" },
  { name: "C++", logoUrl: "/images/logos/cpp.png", displayHeight: "h-16", displayWidth: "w-16" },
  { name: "JavaScript", logoUrl: "/images/logos/js.png", displayHeight: "h-16", displayWidth: "w-16" },
  { name: "MongoDB", logoUrl: "/images/logos/mongo.webp", displayHeight: "h-16", displayWidth: "w-16" },
  { name: "MySQL", logoUrl: "/images/logos/sql.png", displayHeight: "h-16", displayWidth: "w-16" },
  { name: "Framer Motion", logoUrl: "/images/logos/framer.webp", displayHeight: "h-16", displayWidth: "w-16" },
  { name: "Node", logoUrl: "/images/logos/node.png", displayHeight: "h-16", displayWidth: "w-20" },
  { name: "Tailwind", logoUrl: "/images/logos/tailwind.png", displayHeight: "h-16", displayWidth: "w-32" },
  { name: "DaisyUI", logoUrl: "/images/logos/daisyu.png", displayHeight: "h-16", displayWidth: "w-32" },
];

// Stack chips that projects reference but which are not in the logo grid.
const EXTRA_TECH = [
  "Reactjs", "Tailwindcss", "Nodejs", "Expressjs",
  "HTML", "CSS3", "Swing", "JDBC",
];

const PROJECTS = [
  {
    slug: "rentaxi",
    title: "RenTaxi",
    description: "Rentaxi connects riders and drivers in real-time for seamless travel.",
    liveUrl: "https://rentaxi-pain.netlify.app/",
    thumbnailUrl: "/images/rentaxi.png",
    images: ["/images/rentaxi.png", "/images/rentaxi2.png"],
    stack: ["Reactjs", "Tailwindcss", "DaisyUI", "Nodejs", "Expressjs", "MongoDB"],
  },
  {
    slug: "chillGamerOG",
    title: "Chill Gamer OG",
    description: "A gaming review site for critiques, ratings, and the latest game discussions.",
    liveUrl: "https://chill-gamer-op.netlify.app/",
    thumbnailUrl: "/images/gamer.png",
    images: ["/images/gamer.png", "/images/gamer2.png"],
    stack: ["Nodejs", "Expressjs", "Reactjs", "Tailwindcss", "DaisyUI", "MongoDB"],
  },
  {
    slug: "LearnHub",
    title: "LearnHub",
    description: "A dynamic online learning platform designed to provide educational experience",
    liveUrl: "https://learnhub-platform.netlify.app/",
    thumbnailUrl: "/images/hub1.png",
    images: ["/images/hub1.png", "/images/hub2.png"],
    stack: ["Reactjs", "Tailwindcss", "DaisyUI", "Nodejs", "Expressjs", "MongoDB"],
  },
  {
    slug: "pet",
    title: "Adopt A Pet",
    description: "A Comprehensive & User-Friendly Platform for Pet Enthusiasts",
    liveUrl: "https://mendiop-dislikespets.netlify.app/",
    thumbnailUrl: "/images/pet.png",
    images: ["/images/pet.png", "/images/pet2.png"],
    stack: ["HTML", "CSS3", "JavaScript", "DaisyUI", "Tailwindcss"],
  },
  {
    slug: "electricity-billing-system",
    title: "Electricity Billing System",
    description: "An automated electricity billing system that manages billing processes and provides real-time account access.",
    liveUrl: "https://drive.google.com/file/d/1fvmtUBQetkjSQ0pDxA1GOeeAx8K0eVtO/view",
    thumbnailUrl: "/images/Electricity.png",
    images: ["/images/Electricity.png", "/images/Electricity2.png"],
    stack: ["Java", "Swing", "MySQL", "JDBC"],
  },
];

const POSTS = [
  {
    slug: "clean-code",
    title: "Writing Clean Code With React",
    description: "Effective and efficient ways to write clean code with React while keeping in mind the performance and maintainability of the codebase.",
    coverImageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    publishedAt: "2023-08-18",
    tags: ["Clean Code"],
  },
  {
    slug: "dark-mode-with-nextjs",
    title: "Creating a Dark Mode Toggle with Next.js and Tailwind CSS",
    description: "Learn how to create a dark mode toggle with Next.js and Tailwind CSS.",
    coverImageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    publishedAt: "2023-04-19",
    tags: ["tailwindcss", "css", "frontend"],
  },
  {
    slug: "how-to-win-clients",
    title: "How to Start Problem Solving",
    description: "A structured approach to tackling competitive programming problems, with a roadmap for improving under contest conditions.",
    coverImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    publishedAt: "2024-08-18",
    tags: ["problem-solving", "contest", "loser"],
  },
  {
    slug: "tailwindcss-tips-and-tricks",
    title: "TailwindCSS Tips and Tricks to Conquer the World",
    description: "Essential tips and tricks to streamline your workflow and create stunning, responsive designs with TailwindCSS.",
    coverImageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    publishedAt: "2025-01-05",
    tags: ["tailwindcss", "css", "frontend", "design", "web development"],
  },
];

const NAV = [
  { label: "Home", href: "/", iconName: "IconBolt" },
  { label: "About", href: "/about", iconName: "IconMessage2" },
  { label: "Projects", href: "/projects", iconName: "IconBriefcase2" },
  { label: "Articles", href: "/blog", iconName: "IconArticle" },
  { label: "Contact", href: "/contact", iconName: "IconMail" },
];

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mehedi-hasan035/", iconName: "IconBrandLinkedin" },
  { label: "GitHub", href: "https://github.com/MendiOP", iconName: "IconBrandGithub" },
  { label: "Facebook", href: "https://www.facebook.com/mehedi.hasana.516604", iconName: "IconBrandFacebook" },
  { label: "Gmail", href: "mailto:mehedihm2015@gmail.com", iconName: "IconBrandGmail" },
  { label: "WhatsApp", href: "https://wa.me/+8801723976954", iconName: "IconBrandWhatsapp" },
];

const TIMELINE = [
  {
    title: "Jr. Software Engineer — TechnoNext Software Ltd",
    dateLabel: "Nov 2025 - Present",
    description:
      "Backend engineer on a high-traffic ride-sharing platform and an AI-assisted cabin crew recruitment system, built with Java and Spring Boot.",
    responsibilities: [
      "Built the Loyalty & Rewards microservice end-to-end — reward earning, redemption, balance ledger, and race-condition-safe multi-tier progression.",
      "Designed an extensible reward rule engine using OOP/SOLID principles with Strategy and Factory patterns, letting business rules change without redeployment.",
      "Implemented concurrent-safe workflows using optimistic locking and atomic database operations to keep data consistent under concurrent requests.",
      "Improved the Wallet & Withdrawal service with an atomic transaction ledger and integrated bKash/Nagad payment and disbursement APIs.",
      "Enforced read/write database routing across PostgreSQL read replicas using Spring's AbstractRoutingDataSource to cut primary database read load and latency.",
      "Integrated microservices with Spring Cloud OpenFeign, adding fallback, timeout, and failure-isolation mechanisms to prevent cascading service failures.",
      "Built a Cabin Crew Recruitment web app for US-Bangla Airlines, including asynchronous video/audio/face-processing pipelines and AI-based face analysis for candidate evaluation.",
      "Wrote unit/integration tests with JUnit and Mockito and maintained CI/CD pipelines for automated build and deployment.",
    ],
  },
  {
    title: "Associate Software Engineer — Crystal Technology Ltd",
    dateLabel: "Feb 2025 - Oct 2025",
    description:
      "Backend development for a Hospital Inventory Management System and a Medical Service Platform, using Spring Boot, PostgreSQL and Redis.",
    responsibilities: [
      "Built core backend functionality for a Hospital Inventory Management System covering requisition lifecycle, supplier management, and stock control.",
      "Resolved real-time delivery/return tracking and automated ROL-based stock replenishment with Redis-driven low-stock expiry alerts.",
      "Enhanced backend services for a Medical Service Platform supporting doctor-patient appointments, role-based access control, and secure session handling.",
    ],
  },
  {
    title: "Education",
    dateLabel: "Apr 2018 - Nov 2024",
    description: "Bangladesh University of Engineering and Technology (BUET)",
    responsibilities: ["Bachelor of Science in Computer Science and Engineering."],
  },
  {
    title: "Projects",
    dateLabel: "",
    description: "Practical implementation of programming skills through diverse projects.",
    responsibilities: [
      "Gaming Review Platform: Created a React-based platform to enable real-time reviews with MongoDB integration and responsive UI.",
      "Taxi Booking Platform: Designed a Java-based desktop application with MySQL backend for improved booking efficiency.",
      "Electricity Billing System: Developed a secure Java-based system to view electricity usage and manage payments.",
      "Bus Ticket Reservation System: Implemented a Python Django-based system with Oracle for secure and scalable backend solutions.",
    ],
  },
  {
    title: "Technical Skills",
    dateLabel: "",
    description:
      "Core languages, frameworks and practices used across backend and full-stack work.",
    responsibilities: [
      "Languages: Java, SQL, C++, JavaScript",
      "Backend: Spring Boot, Spring MVC, Spring Security, Spring Data JPA, Hibernate, Spring Cloud OpenFeign",
      "Architecture: Microservices, REST APIs, Event-Driven Systems, OOP, Clean Code, SOLID, Design Patterns, Enterprise Applications",
      "Databases: PostgreSQL, MySQL, MongoDB, Oracle, Redis",
      "Query & Data: Database Relationships, Joins, Transactions, Indexing, Query Optimization",
      "Messaging: Apache Kafka, RabbitMQ, Reactive Streams",
      "Transactions: Concurrency Control, Idempotent Processing, Atomic Transactions, Audit Logging, Failure Isolation",
      "Development: Maven, Gradle, Git, Flyway, Swagger/OpenAPI, Docker, CI/CD",
      "Testing: TDD, Unit Testing, JUnit, Mockito",
      "Security: Spring Security, JWT, RBAC",
    ],
  },
  {
    title: "Certifications",
    dateLabel: "",
    description: "Recognized skills and achievements.",
    responsibilities: [
      "Problem Solving (Intermediate) – HackerRank Certification.",
      "Problem Solving (Basic) – HackerRank Certification.",
      "Java (Basic) – HackerRank Certification.",
    ],
  },
];

const GALLERY = [
  "https://i.ibb.co/mq9vDFP/p4.jpg",
  "https://i.ibb.co/cvBFv8r/p3.jpg",
  "https://i.ibb.co/09x3rRc/p2.jpg",
  "https://i.ibb.co/6m43Ryz/p1.jpg",
  "https://i.ibb.co/KpsLfxJW/IMG20240605133008.jpg",
  "https://i.ibb.co/jP8fVfbJ/IMG20240605132022.jpg",
  "https://i.ibb.co/35BJFgWv/IMG20240602113311.jpg",
  "https://i.ibb.co/QFQVGYxx/IMG20240605073325.jpg",
];

const HOME_INTRO = `I'm a <Highlight>Software Engineer</Highlight> and Front-End Developer with a passion for creating impactful digital products. I enjoy turning ideas into scalable, performance-driven, and beautifully designed web applications.

Though I'm starting my journey in software development, I bring <Highlight>enthusiasm, dedication</Highlight>, and a strong desire to learn and grow. I'm committed to building solutions that deliver value and leave a positive impression.
`;

const ABOUT_BODY = `Hi there! I'm **AZM Mehedi Hasan** and I'm a software developer with a big passion for creating things that matter. I grew up in the peaceful town of Kurigram in Rangpur, and my love for technology started when I was really young, fueled by endless curiosity and a desire to make a difference.

I followed my passion to the prestigious **Bangladesh University of Engineering and Technology (BUET)**, where I studied Computer Science and Engineering. My time at BUET wasn't just about classes—it was where I really challenged myself, learned to think critically, and discovered just how much I love solving problems.

Nowadays, I'm on a journey to become a true **Full Stack Developer**. I love working with **React** on the frontend to create engaging user experiences, while using **Node.js** on the backend to build powerful and reliable systems. I believe that every app should not only work well but also feel intuitive and friendly.

When I'm not coding, you can often find me enjoying a good game of **cricket**. Growing up in Kurigram, cricket wasn't just a sport—it was a way for the community to come together, laugh, and share memorable moments. I have countless memories of playing under the hot sun with friends and celebrating every small victory.

I'm inspired by cricket legends like **MS Dhoni** and **Shakib Al Hasan**. Their calm leadership and impressive skills remind me that success comes from staying cool under pressure and always giving your best.

Sometimes, I need a break from the real world, so I dive into the exciting realms of **video games**. Whether it's battling it out in _PUBG_, exploring the open worlds of _GTA_ and _The Witcher_, or feeling the rush in _Need for Speed_ and _Red Dead Redemption 2_, gaming helps me unwind and fuels my creative energy.

I love the mix of challenge and relaxation that gaming provides. It's a fun way to reset and come back to my work with fresh ideas and enthusiasm.

Even though cricket is my first love, I have to admit that **football** just isn't my thing. That said, I can appreciate the energy and excitement that football brings to its fans all over the world.

One of the moments I cherish most was leading my university's coding team in a national hackathon. We had tight deadlines and big challenges, but working together to build a web app that made campus events easier was an experience I'll never forget. It taught me so much about teamwork, leadership, and just pushing through when things get tough.

I also had the chance to work on a community project to help local businesses in Kurigram go digital. Collaborating with other developers and local entrepreneurs was incredibly rewarding—it really drove home for me how technology can be a force for positive change in our communities.

Looking ahead, I'm excited to keep learning and exploring new technologies like **GraphQL**, **Docker**, and even dipping my toes into **Machine Learning**. I'm all about evolving and adapting to create innovative and efficient solutions.

My dream is to work on projects that truly make a difference—whether it's creating amazing user experiences, building solid backend systems, or solving real-world problems. I believe that blending creativity with technology is the key to making a lasting impact.

Thanks so much for taking the time to get to know me a bit better. I'm always excited to meet new people, collaborate on cool projects, and see where this journey in tech takes me next.
`;

const PAGES = [
  {
    slug: "home",
    emoji: "👋",
    heading: "Hello, I'm Mehedi Hasan",
    introMdx: HOME_INTRO,
    bodyMdx: "",
    seoTitle: "Mehedi Hasan - Developer",
    seoDescription:
      "Software engineer and front-end developer building scalable, performance-driven web applications.",
  },
  {
    slug: "about",
    emoji: "💬",
    heading: "About Me",
    introMdx: "",
    bodyMdx: ABOUT_BODY,
    seoTitle: "About | Mehedi Hasan",
    seoDescription:
      "Software developer from Kurigram, BUET CSE graduate, cricket fan and occasional gamer.",
  },
  {
    slug: "projects",
    emoji: "⚡",
    heading: "What I've been working on",
    introMdx: "",
    bodyMdx: "",
    seoTitle: "Projects | Mehedi Hasan",
    seoDescription:
      "Full-stack projects built with React, Node.js, MongoDB and Java.",
  },
  {
    slug: "blog",
    emoji: "📝",
    heading: "I write about technology",
    introMdx:
      "Ever since <Highlight>I was a kid</Highlight>, I've been fascinated by technology.\n",
    bodyMdx: "",
    seoTitle: "Blog | Mehedi Hasan",
    seoDescription:
      "Articles on React, TailwindCSS, clean code and competitive programming.",
  },
  {
    slug: "contact",
    emoji: "✉️",
    heading: "Contact Me",
    introMdx:
      "Reach out to me over email or fill up this contact form. I will get back to you ASAP - I promise.\n",
    bodyMdx: "",
    seoTitle: "Contact | Mehedi Hasan",
    seoDescription:
      "Get in touch about roles, freelance work or collaboration.",
  },
  {
    slug: "resume",
    emoji: "💼",
    heading: "Work History",
    introMdx:
      "I'm a **Full Stack developer** that loves <Highlight>building products</Highlight> and web apps that can impact millions of lives\n",
    bodyMdx: "",
    seoTitle: "Resume | Mehedi Hasan",
    seoDescription:
      "Education, projects, skills and certifications, plus a downloadable resume.",
  },
];

// ──────────────────────────────────────────────────────────── seed

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  console.log("→ admin");
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user");
  }
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.ADMIN_NAME || "Admin",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  console.log("→ site settings");
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: upd({ ownerName: "Mehedi Hasan", role: "Developer" }),
    create: {
      id: "singleton",
      ownerName: "Mehedi Hasan",
      role: "Developer",
      avatarUrl: "https://i.ibb.co/p4Crv6k/DP-WHIT.jpg",
      footerText: "Built by AZM Mehedi Hasan",
      resumeUrl: "/Mern_Stack_developer_Mehedi_Hasan.pdf",
      resumeFileName: "Resume_Mehedi.pdf",
      seoTitle: "Mehedi Hasan - Developer",
      seoDescription:
        "Software engineer and front-end developer building scalable, performance-driven web applications.",
    },
  });

  console.log("→ pages");
  for (const p of PAGES) {
    await prisma.page.upsert({ where: { slug: p.slug }, update: upd(p), create: p });
  }

  console.log("→ navigation");
  for (const [i, n] of NAV.entries()) {
    const existing = await prisma.navLink.findFirst({ where: { href: n.href } });
    if (!existing) await prisma.navLink.create({ data: { ...n, order: i } });
  }
  for (const [i, s] of SOCIALS.entries()) {
    const existing = await prisma.social.findFirst({ where: { href: s.href } });
    if (!existing) await prisma.social.create({ data: { ...s, order: i } });
  }

  console.log("→ tech");
  for (const [i, t] of TECH.entries()) {
    await prisma.tech.upsert({
      where: { name: t.name },
      update: upd({ ...t, order: i, showInStack: true }),
      create: { ...t, order: i, showInStack: true },
    });
  }
  for (const [i, name] of EXTRA_TECH.entries()) {
    await prisma.tech.upsert({
      where: { name },
      update: {},
      create: { name, logoUrl: "", order: 100 + i, showInStack: false },
    });
  }

  console.log("→ projects");
  for (const [i, p] of PROJECTS.entries()) {
    const projectData = {
      slug: p.slug,
      title: p.title,
      description: p.description,
      liveUrl: p.liveUrl,
      thumbnailUrl: p.thumbnailUrl,
      contentMdx: md("projects", p.slug),
      order: i,
      status: Status.PUBLISHED,
    };
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: upd(projectData),
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        liveUrl: p.liveUrl,
        thumbnailUrl: p.thumbnailUrl,
        contentMdx: md("projects", p.slug),
        order: i,
        status: Status.PUBLISHED,
      },
    });

    await prisma.projectImage.deleteMany({ where: { projectId: project.id } });
    await prisma.projectImage.createMany({
      data: p.images.map((url, order) => ({
        projectId: project.id,
        url,
        alt: `${p.title} screenshot ${order + 1}`,
        order,
      })),
    });

    await prisma.projectTech.deleteMany({ where: { projectId: project.id } });
    for (const [order, name] of p.stack.entries()) {
      const tech = await prisma.tech.upsert({
        where: { name },
        update: {},
        create: { name, logoUrl: "", order: 200, showInStack: false },
      });
      await prisma.projectTech.create({
        data: { projectId: project.id, techId: tech.id, order },
      });
    }
  }

  console.log("→ posts");
  for (const p of POSTS) {
    const content = md("posts", p.slug);
    const postData = {
      slug: p.slug,
      title: p.title,
      description: p.description,
      coverImageUrl: p.coverImageUrl,
      contentMdx: content,
      status: Status.PUBLISHED,
      publishedAt: new Date(`${p.publishedAt}T00:00:00Z`),
      readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    };
    const post = await prisma.post.upsert({
      where: { slug: p.slug },
      update: upd(postData),
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        coverImageUrl: p.coverImageUrl,
        contentMdx: content,
        status: Status.PUBLISHED,
        publishedAt: new Date(`${p.publishedAt}T00:00:00Z`),
        readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
      },
    });

    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    for (const name of p.tags) {
      const tag = await prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      });
      await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } });
    }
  }

  console.log("→ timeline");
  for (const [i, t] of TIMELINE.entries()) {
    const existing = await prisma.timelineEntry.findFirst({ where: { title: t.title } });
    if (!existing) await prisma.timelineEntry.create({ data: { ...t, order: i } });
  }

  console.log("→ gallery");
  for (const [i, url] of GALLERY.entries()) {
    const existing = await prisma.galleryImage.findFirst({ where: { url } });
    if (!existing) {
      await prisma.galleryImage.create({
        data: { url, alt: `Gallery image ${i + 1}`, order: i },
      });
    }
  }

  const counts = {
    pages: await prisma.page.count(),
    navLinks: await prisma.navLink.count(),
    socials: await prisma.social.count(),
    tech: await prisma.tech.count(),
    projects: await prisma.project.count(),
    projectImages: await prisma.projectImage.count(),
    posts: await prisma.post.count(),
    tags: await prisma.tag.count(),
    timeline: await prisma.timelineEntry.count(),
    gallery: await prisma.galleryImage.count(),
  };
  console.log(FORCE ? "\nSeed complete (content re-applied):" : "\nSeed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
