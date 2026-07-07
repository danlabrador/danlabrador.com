/**
 * One-shot script to populate the DB with content from the old
 * danlabrador.github.io site. Safe to re-run — every write is an upsert
 * or delete+create. Run with:
 *
 *   npx tsx scripts/seed-from-old-site.ts
 */

import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { JSDOM } from "jsdom";
import { generateJSON } from "@tiptap/html";
import { PrismaClient } from "@/generated/prisma";
import { tiptapExtensions } from "@/lib/tiptap/extensions";

const OLD_SITE = "/tmp/danlabrador-old-site";

// jsdom provides DOM globals that @tiptap/html needs on Node.
const dom = new JSDOM("<!DOCTYPE html>");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).window = dom.window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).document = dom.window.document;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).DOMParser = dom.window.DOMParser;

const prisma = new PrismaClient();

// ─── Helpers ───────────────────────────────────────────────────────────

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function paragraphs(...ps: string[]) {
  return {
    type: "doc",
    content: ps.map((p) => ({
      type: "paragraph",
      content: [{ type: "text", text: p }],
    })),
  };
}

function extractArticleBody(html: string): unknown {
  const local = new JSDOM(html);
  const article = local.window.document.querySelector("article.article");
  if (!article) throw new Error("No article element found");
  // Clean up SVGs and decorative bits
  article.querySelectorAll("svg").forEach((el) => el.remove());
  return generateJSON(article.innerHTML, tiptapExtensions);
}

// ─── About ─────────────────────────────────────────────────────────────

async function seedAbout() {
  const aboutBody = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "I'm an " },
          { type: "text", marks: [{ type: "bold" }], text: "Analytics Engineer" },
          {
            type: "text",
            text: " who turns messy tables into decision-ready dashboards. During the last two years at ",
          },
          {
            type: "text",
            marks: [{ type: "link", attrs: { href: "https://myamazonguy.com" } }],
            text: "My Amazon Guy",
          },
          {
            type: "text",
            text: ", I built Python / SQL pipelines that cut report latency from 6 hours to ",
          },
          { type: "text", marks: [{ type: "bold" }], text: "15 minutes" },
          { type: "text", text: " and trimmed labour-cost burn rate by " },
          { type: "text", marks: [{ type: "bold" }], text: "3%" },
          {
            type: "text",
            text: ". My remit spans analytics, data engineering and a dash of data science — all in service of clear, actionable insight for leadership.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "To level-up further I'm pursuing the " },
          {
            type: "text",
            marks: [{ type: "link", attrs: { href: "https://micromasters.mit.edu/ds/" } }],
            text: "MITx MicroMasters in Statistics & Data Science",
          },
          {
            type: "text",
            text: ", sharpening my toolkit for predictive modelling and optimisation.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Fun fact: I kicked off my tech journey co-running the Discord infrastructure for " },
          {
            type: "text",
            marks: [{ type: "link", attrs: { href: "https://vatic.gg" } }],
            text: "Vatic",
          },
          { type: "text", text: ", a Clash of Clans community formerly known as Vista Ridge." },
        ],
      },
    ],
  };

  await prisma.aboutContent.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      heroHeadline: "Analytics engineer.",
      heroSubheadline:
        "I deliver Python / SQL-driven ETL pipelines that give business teams reliable, real-time insights.",
      aboutBody: aboutBody as never,
    },
    update: {
      heroHeadline: "Analytics engineer.",
      heroSubheadline:
        "I deliver Python / SQL-driven ETL pipelines that give business teams reliable, real-time insights.",
      aboutBody: aboutBody as never,
    },
  });
  console.log("✓ About");
}

// ─── Skills ────────────────────────────────────────────────────────────

async function seedSkills() {
  const skills = [
    // Languages & Data Modelling
    { label: "Python", category: "Languages" },
    { label: "SQL", category: "Languages" },
    { label: "JavaScript", category: "Languages" },
    { label: "TypeScript", category: "Languages" },
    // Data platforms
    { label: "BigQuery", category: "Data platforms" },
    { label: "Fivetran", category: "Data platforms" },
    { label: "Airflow", category: "Data platforms" },
    { label: "Airtable", category: "Data platforms" },
    { label: "Zapier", category: "Data platforms" },
    { label: "HubSpot", category: "Data platforms" },
    // BI
    { label: "Looker Studio", category: "BI + reporting" },
    // Cloud + DevOps
    { label: "Google Cloud", category: "Cloud + DevOps" },
    { label: "Docker", category: "Cloud + DevOps" },
    { label: "PySpark", category: "Cloud + DevOps" },
    { label: "Render", category: "Cloud + DevOps" },
    // Collaboration
    { label: "Git", category: "Collaboration" },
    { label: "GitHub", category: "Collaboration" },
    { label: "GitLab", category: "Collaboration" },
    { label: "Notion", category: "Collaboration" },
    { label: "Jira", category: "Collaboration" },
    { label: "Asana", category: "Collaboration" },
  ];

  await prisma.skill.deleteMany({});
  await prisma.skill.createMany({
    data: skills.map((s, i) => ({
      label: s.label,
      category: s.category,
      displayOrder: i,
    })),
  });
  console.log(`✓ ${skills.length} skills`);
}

// ─── Projects ──────────────────────────────────────────────────────────

async function seedProjects() {
  const projects = [
    {
      slug: "api-request-throttlers",
      title: "API Request Throttlers",
      tagline: "Dynamic concurrency & rate-limit library for Python HTTP clients.",
      description:
        "Dynamic concurrency & rate-limit library; adopted in 30+ SaaS pipelines and handles > 5M requests/month without SLA breaches.",
      techTags: ["Python", "Inheritance", "Rate limits"],
      repoUrl: "https://github.com/danlabrador/myamazonguy-api-request-throttlers",
      featured: true,
      displayOrder: 1,
    },
    {
      slug: "finance-cron-invoice-ninja-pipeline",
      title: "Finance-Cron Invoice Ninja Pipeline",
      tagline: "Nightly sync from Invoice Ninja to BigQuery.",
      description:
        "Render job syncing Invoice Ninja billing data to BigQuery nightly, powering profit-margin and cash-flow dashboards and eliminating manual exports.",
      techTags: ["Python", "BigQuery", "Render", "Data pipelines"],
      repoUrl: "https://github.com/danlabrador/finance-cron-invoice_ninja_pipeline",
      featured: true,
      displayOrder: 2,
    },
    {
      slug: "asana-data-modeling",
      title: "Asana Data Modeling",
      tagline: "Sprint burndown + workload dashboards from an Asana warehouse.",
      description:
        "SQL models on a Synchub.io-managed Asana dataset powering sprint burndown & workload dashboards for 80+ stakeholders, cutting status-prep 6h/week.",
      techTags: ["SQL", "Python", "BigQuery", "Data modeling"],
      repoUrl: "https://github.com/danlabrador/reports-cron-asana_data_modelling",
      featured: true,
      displayOrder: 3,
    },
    {
      slug: "credence",
      title: "Credence",
      tagline: "Full-stack digital certificate platform (MERN).",
      description:
        "Credence is a full-stack application built for organizations to issue, store, and verify digital certificates. Made with a team of 4 developers. I was responsible for project management, code review, and quality assurance.",
      techTags: ["MongoDB", "Express", "React", "Node", "Material UI"],
      liveUrl: "https://credence-uplift-project.netlify.app/",
      featured: false,
      displayOrder: 4,
    },
    {
      slug: "school-of-leaders-portal",
      title: "School of Leaders Portal",
      tagline: "Student Information System for a local church.",
      description:
        "A front-end project I made for our local church. A Student Information System that allows the church to manage students' information and grades. Still in progress; will be hooked to a backend system.",
      techTags: ["React", "shadcn/ui", "Tailwind CSS", "Google Identity API"],
      liveUrl: "https://schoolofleaders.netlify.app",
      featured: false,
      displayOrder: 5,
    },
    {
      slug: "aurorabeats-playlist-manager",
      title: "AuroraBeats Playlist Manager",
      tagline: "A Spotify playlist manager built in vanilla JS + Tailwind.",
      description:
        "A weekend solo project that interfaces with Spotify to manage playlists. Showcases my journey through OAuth, design in Figma, and development with vanilla JavaScript and Tailwind CSS.",
      techTags: ["Vanilla JavaScript", "Tailwind CSS", "OAuth", "Spotify API", "OpenAI API"],
      liveUrl: "https://danlabrador.com/js-api-app.html",
      featured: false,
      displayOrder: 6,
    },
    {
      slug: "daniellabrador-com-v1",
      title: "daniellabrador.com (v1)",
      tagline: "My first personal site (2021).",
      description: "This was my first attempt at creating a personal website back in 2021.",
      techTags: ["HTML", "SCSS", "JavaScript"],
      liveUrl: "https://v1.daniellabrador.com",
      featured: false,
      displayOrder: 7,
    },
  ];

  await prisma.project.deleteMany({});
  for (const p of projects) {
    await prisma.project.create({ data: p });
  }
  console.log(`✓ ${projects.length} projects`);
}

// ─── Experience ────────────────────────────────────────────────────────

async function seedExperience() {
  const experiences = [
    {
      role: "Analytics Engineer",
      company: "My Amazon Guy",
      startDate: new Date("2024-04-01"),
      endDate: null,
      bulletsJson: [
        "Data Pipeline Optimization — Extracted 1.2M rows/day from HubSpot, Slack & Asana APIs into BigQuery via Python + Zapier, cutting latency from 24h to 30min and boosting refresh cadence 48×.",
        "CRM Development — Spearheaded an in-house CRM MVP; designed ERD, provisioned BigQuery schema, built a pure-Python ingest pipeline, and migrated 350k records with zero downtime.",
        "Performance Optimization — Cut report runtime about 95% (6h → 15–20min) across 10+ pipelines by redesigning SQL models and leveraging BigQuery slots, saving about 20 analyst hours/week.",
        "Data Visualization — Built Looker Studio dashboards (300GB warehouse, nightly refresh) for churn, burn rate and profit margin, enabling budget pivots two days faster.",
        "Finance Integration — Integrated Google Sheets & Invoice Ninja data (~150k rows/night) via serverless Render jobs, saving Finance 10h/week.",
        "Security Implementation — Implemented row-level security and authorized views across five departments, eliminating unauthorized access and achieving GDPR readiness.",
        "Data Pipeline Management — Oversaw HubSpot → BigQuery Fivetran connector; monitored sync health, liaised with Fivetran engineers, and kept error rate < 0.5%.",
      ],
      displayOrder: 1,
    },
    {
      role: "QA & Data Reliability Specialist",
      company: "My Amazon Guy",
      startDate: new Date("2023-06-01"),
      endDate: new Date("2024-04-01"),
      bulletsJson: [
        "Automation Reliability — Reduced major automation outages 94% (every 3.5 days → 68 days) by designing and executing manual test suites for 25+ Python & Zapier pipelines and instituting BigQuery job-health monitoring.",
        "Test Documentation — Documented 600+ Gherkin-style test cases covering API integrations, ETL edge cases and rate-limit logic, raising defect-detection rate to 98%.",
        "Incident Management — Led post-mortems and root-cause analyses, cutting mean time-to-recovery from 4h to 40min.",
      ],
      displayOrder: 2,
    },
  ];

  await prisma.experience.deleteMany({});
  for (const e of experiences) {
    await prisma.experience.create({ data: e as never });
  }
  console.log(`✓ ${experiences.length} experience entries`);
}

// ─── Education ─────────────────────────────────────────────────────────

async function seedEducation() {
  const education = [
    {
      program: "MicroMasters in Statistics & Data Science",
      institution: "Massachusetts Institute of Technology (edX)",
      startDate: new Date("2025-05-01"),
      endDate: new Date("2026-09-01"),
      displayOrder: 1,
    },
    {
      program: "BSc (Honours) Computer Science",
      institution: "University of London (via Goldsmiths)",
      startDate: new Date("2024-10-01"),
      endDate: new Date("2027-08-01"),
      displayOrder: 2,
    },
    {
      program: "Full-Stack Web Development",
      institution: "Uplift Code Camp",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-06-01"),
      displayOrder: 3,
    },
  ];

  await prisma.education.deleteMany({});
  await prisma.education.createMany({ data: education });
  console.log(`✓ ${education.length} education entries`);
}

// ─── Contact links ─────────────────────────────────────────────────────

async function seedContactLinks() {
  const links = [
    { label: "Email", url: "mailto:dan@danlabrador.com", iconName: "mail", displayOrder: 1 },
    {
      label: "LinkedIn",
      url: "https://linkedin.com/in/danlabrador",
      iconName: "linkedin",
      displayOrder: 2,
    },
    { label: "GitHub", url: "https://github.com/danlabrador", iconName: "github", displayOrder: 3 },
  ];

  await prisma.contactLink.deleteMany({});
  await prisma.contactLink.createMany({ data: links });
  console.log(`✓ ${links.length} contact links`);
}

// ─── Blog posts ────────────────────────────────────────────────────────

async function seedPosts() {
  // Nuke the two placeholder test posts first
  await prisma.post.deleteMany({
    where: { slug: { in: ["testdata-another-test-blog", "testdata-what-i-learned-after-deleting-tons-of-react-files"] } },
  });

  const articles = [
    {
      slug: "manual-testing-low-code-no-code",
      title: "How to Manually Test Low-Code / No-Code Systems",
      excerpt:
        "In My Amazon Guy, our IT infrastructure is diverse and integrated in nature — Zapier, HubSpot, Slack, Asana. Here's how our team navigates the complexities of QA in that world.",
      tags: ["Manual testing", "Low-code", "No-code"],
      publishedAt: new Date("2024-05-10"),
      file: "manual-testing.html",
    },
    {
      slug: "playlist-manager-vanilla-js-tailwind",
      title: "Building a Playlist Manager with Vanilla JavaScript & Tailwind CSS",
      excerpt:
        "Over one weekend, amidst university and work, I built a Playlist Manager app with Spotify. Facing an unexpected OAuth challenge without prior instruction, the journey became a testament to self-reliance and pre-planning.",
      tags: ["Vanilla JavaScript", "Tailwind CSS", "OAuth"],
      publishedAt: new Date("2024-03-15"),
      file: "js-api-app.html",
    },
    {
      slug: "organizing-react",
      title: "What I Learned After Deleting Tons of React Files",
      excerpt:
        "How I streamlined my React development workflow. Folder structures, external libraries, Prettier config — practical strategies for boosting productivity and enhancing React skills.",
      tags: ["React", "Design patterns", "Prettier"],
      publishedAt: new Date("2024-05-12"),
      file: "organizing-react.html",
    },
  ];

  for (const a of articles) {
    const html = readFileSync(`${OLD_SITE}/${a.file}`, "utf8");
    const bodyJson = extractArticleBody(html);
    const wordCount = JSON.stringify(bodyJson).split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 250));

    await prisma.post.upsert({
      where: { slug: a.slug },
      create: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        bodyJson: bodyJson as never,
        status: "PUBLISHED",
        publishedAt: a.publishedAt,
        readingTimeMinutes: readingTime,
        previewToken: randomBytes(12).toString("hex"),
        tags: {
          create: a.tags.map((t) => ({
            tag: {
              connectOrCreate: {
                where: { slug: slugify(t) },
                create: { slug: slugify(t), name: t },
              },
            },
          })),
        },
      },
      update: {
        title: a.title,
        excerpt: a.excerpt,
        bodyJson: bodyJson as never,
        status: "PUBLISHED",
        publishedAt: a.publishedAt,
        readingTimeMinutes: readingTime,
      },
    });
  }
  console.log(`✓ ${articles.length} blog posts`);
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding from old danlabrador.github.io content...\n");
  await seedAbout();
  await seedSkills();
  await seedProjects();
  await seedExperience();
  await seedEducation();
  await seedContactLinks();
  await seedPosts();
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
