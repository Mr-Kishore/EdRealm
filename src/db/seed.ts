import { db, pool } from "./index";
import {
  users,
  skillCategories,
  masterSubjects,
  feedbackQuestions,
  trainers,
  trainerSkills,
  projects,
  projectTrainers,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Starting EdRealm database seed...");

  // 1. Seed Super Admin
  const adminEmail = "admin@edrealm.in";
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  let adminId: string;
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Password@123", 10);
    const [admin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        fullName: "EdRealm Super Admin",
        passwordHash,
        role: "super_admin",
        isActive: true,
      })
      .returning({ id: users.id });
    adminId = admin.id;
    console.log(`✅ Created Super Admin: ${adminEmail} (Password: Password@123)`);
  } else {
    adminId = existingAdmin.id;
    console.log(`ℹ️ Super Admin already exists: ${adminEmail}`);
  }

  // 2. Seed Initial Categories and Master Subjects
  const catalogData = [
    {
      category: "Programming & DSA",
      subjects: [
        "C Programming",
        "C++ Programming",
        "Core Java",
        "Python Programming",
        "Java DSA",
        "Python DSA",
        "Advanced DSA & LeetCode",
      ],
    },
    {
      category: "Full Stack Development",
      subjects: [
        "MERN Stack",
        "Java Full Stack",
        "Python Full Stack",
        "Next.js & Modern Web",
      ],
    },
    {
      category: "AI, ML & Data",
      subjects: [
        "Machine Learning",
        "Artificial Intelligence",
        "Generative AI & LLMs",
        "Data Analytics & Visualization",
        "Data Science",
      ],
    },
    {
      category: "Cloud, DevOps & Security",
      subjects: [
        "Cloud Computing (AWS / Azure)",
        "DevOps & CI/CD Pipelines",
        "Cybersecurity & Ethical Hacking",
      ],
    },
    {
      category: "Aptitude & Soft Skills",
      subjects: [
        "Quantitative Aptitude",
        "Logical & Analytical Reasoning",
        "Verbal Ability & Soft Skills",
        "Mock Interview & Company Specific Drive",
      ],
    },
  ];

  for (let i = 0; i < catalogData.length; i++) {
    const item = catalogData[i];
    // Find or create category
    let category = await db.query.skillCategories.findFirst({
      where: eq(skillCategories.name, item.category),
    });

    if (!category) {
      const [newCategory] = await db
        .insert(skillCategories)
        .values({
          name: item.category,
          displayOrder: i + 1,
          isCustom: false,
          createdByUserId: adminId,
          isActive: true,
        })
        .returning();
      category = newCategory;
    }

    // Insert subjects under this category
    for (const subName of item.subjects) {
      const existingSub = await db.query.masterSubjects.findFirst({
        where: eq(masterSubjects.name, subName),
      });

      if (!existingSub) {
        await db.insert(masterSubjects).values({
          categoryId: category.id,
          name: subName,
          isCustom: false,
          createdByUserId: adminId,
          isActive: true,
        });
      }
    }
  }
  console.log("✅ Seeded Master Skill Categories & Subjects");

  // 3. Seed Default Feedback Questions (7 Core Criteria)
  const defaultQuestions = [
    {
      key: "KNOWLEDGE",
      text: "Trainer Knowledge & Subject Mastery",
      type: "rating" as const,
      order: 1,
    },
    {
      key: "CONCEPT_CLARITY",
      text: "Concept Clarity & Teaching Methodology",
      type: "rating" as const,
      order: 2,
    },
    {
      key: "PROBLEM_SOLVING",
      text: "Problem-Solving Approach & Real-World Examples",
      type: "rating" as const,
      order: 3,
    },
    {
      key: "DOUBT_SOLVING",
      text: "Doubt Clarification & Patience",
      type: "rating" as const,
      order: 4,
    },
    {
      key: "COMMUNICATION",
      text: "Communication Skills & Student Engagement",
      type: "rating" as const,
      order: 5,
    },
    {
      key: "PUNCTUALITY",
      text: "Punctuality & Discipline",
      type: "rating" as const,
      order: 6,
    },
    {
      key: "OVERALL_SATISFACTION",
      text: "Overall Experience & Satisfaction with Trainer",
      type: "rating" as const,
      order: 7,
    },
  ];

  for (const q of defaultQuestions) {
    const existingQ = await db.query.feedbackQuestions.findFirst({
      where: eq(feedbackQuestions.questionKey, q.key),
    });

    if (!existingQ) {
      await db.insert(feedbackQuestions).values({
        questionKey: q.key,
        questionText: q.text,
        questionType: q.type,
        displayOrder: q.order,
        isRequired: true,
        isActive: true,
      });
    }
  }
  console.log("✅ Seeded Global Feedback Questions (7 Core Criteria)");

  // 4. Seed Sample Trainers (if none exist)
  const existingTrainers = await db.query.trainers.findMany({ limit: 1 });
  if (existingTrainers.length === 0) {
    console.log("🌱 Seeding initial verified trainers...");
    const [t1] = await db
      .insert(trainers)
      .values({
        fullName: "Vikramaditya Sharma",
        phone: "+91 9880011223",
        whatsapp: "+91 9880011223",
        email: "vikram.sharma@example.com",
        currentCity: "Bengaluru",
        currentState: "Karnataka",
        country: "India",
        preferredLocations: ["Bengaluru", "Mysore", "Hyderabad"],
        willingToTravelAnywhere: true,
        trainingModes: ["Offline", "Hybrid"],
        totalExperience: "6.5",
        trainingExperience: "5.0",
        linkedinUrl: "https://linkedin.com",
        resumeUrl: "https://docs.google.com/document/d/example-resume-1/edit",
        qrToken: nanoid(32),
        qrActive: true,
        isActive: true,
        cachedRating: "4.85",
        cachedReviewsCount: 38,
      })
      .returning();

    const [t2] = await db
      .insert(trainers)
      .values({
        fullName: "Pooja Sundaram",
        phone: "+91 9840055667",
        whatsapp: "+91 9840055667",
        email: "pooja.sundaram@example.com",
        currentCity: "Chennai",
        currentState: "Tamil Nadu",
        country: "India",
        preferredLocations: ["Chennai", "Bengaluru", "Coimbatore"],
        willingToTravelAnywhere: true,
        trainingModes: ["Offline", "Online", "Hybrid"],
        totalExperience: "4.5",
        trainingExperience: "4.0",
        linkedinUrl: "https://linkedin.com",
        resumeUrl: "https://docs.google.com/document/d/example-resume-2/edit",
        qrToken: nanoid(32),
        qrActive: true,
        isActive: true,
        cachedRating: "4.92",
        cachedReviewsCount: 52,
      })
      .returning();

    // Attach skills
    const javaSubject = await db.query.masterSubjects.findFirst({
      where: eq(masterSubjects.name, "Java DSA"),
    });
    const pythonSubject = await db.query.masterSubjects.findFirst({
      where: eq(masterSubjects.name, "Python Programming"),
    });
    const mernSubject = await db.query.masterSubjects.findFirst({
      where: eq(masterSubjects.name, "MERN Stack"),
    });

    if (javaSubject) {
      await db.insert(trainerSkills).values({
        trainerId: t1.id,
        subjectId: javaSubject.id,
        trainerType: "Technical",
        expertiseLevel: "Expert",
        subjectExperience: "5.0",
        canHandleLargeBatches: true,
        canConductMockInterviews: true,
      });
    }

    if (pythonSubject) {
      await db.insert(trainerSkills).values({
        trainerId: t1.id,
        subjectId: pythonSubject.id,
        trainerType: "Technical",
        expertiseLevel: "Advanced",
        subjectExperience: "4.0",
        canHandleLargeBatches: true,
        canConductMockInterviews: true,
      });
    }

    if (mernSubject) {
      await db.insert(trainerSkills).values({
        trainerId: t2.id,
        subjectId: mernSubject.id,
        trainerType: "Technical",
        expertiseLevel: "Expert",
        subjectExperience: "4.5",
        canHandleLargeBatches: true,
        canConductMockInterviews: true,
      });
    }

    // 5. Seed Sample Projects
    console.log("🌱 Seeding initial campus projects...");
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 1);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 4);

    const [p1] = await db
      .insert(projects)
      .values({
        projectName: "RVCE Campus Recruitment Training 2026",
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        place: "RV College of Engineering, Mysore Road, Bangalore",
        contactPersonName: "Dr. K. S. Chandrasekhar",
        contactPersonPhone: "+91 9845012345",
        contactPersonEmail: "placement@rvce.edu.in",
        status: "ongoing",
        statusOverride: false,
        notes: "Auditorium lab 3, 120 final-year CSE students. Core Java and DSA problem-solving bootcamp.",
      })
      .returning();

    // Assign Vikramaditya to Project 1
    await db.insert(projectTrainers).values({
      projectId: p1.id,
      trainerId: t1.id,
      roleInProject: "Lead Technical Trainer",
    });

    // Project 2 (Upcoming)
    const p2Start = new Date(today);
    p2Start.setDate(today.getDate() + 10);
    const p2End = new Date(today);
    p2End.setDate(today.getDate() + 15);

    await db.insert(projects).values({
      projectName: "PES University Full Stack Fast-Track",
      startDate: p2Start.toISOString().split("T")[0],
      endDate: p2End.toISOString().split("T")[0],
      place: "PES University, Ring Road Campus, Bangalore",
      contactPersonName: "Prof. S. Ranganathan",
      contactPersonPhone: "+91 9448098765",
      contactPersonEmail: "dean.placements@pes.edu",
      status: "upcoming",
      statusOverride: false,
      notes: "React, Next.js, and Node.js microservices. Hands-on capstone project review.",
    });

    console.log("✅ Seeded Sample Trainers & Projects with assignments");
  }

  console.log("🎉 Database seeding completed successfully!");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  pool.end();
  process.exit(1);
});
