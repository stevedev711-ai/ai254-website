/** STEM subjects a lecturer can select when creating a session. */
export const STEM_SUBJECTS: { group: string; subjects: string[] }[] = [
  { group: "Life sciences", subjects: ["Biology", "Biochemistry", "Microbiology", "Botany", "Zoology", "Genetics", "Ecology", "Anatomy & Physiology"] },
  { group: "Physical sciences", subjects: ["Physics", "Quantum Physics", "Chemistry", "Organic Chemistry", "Earth Science / Geology", "Astronomy", "Environmental Science", "General Science"] },
  { group: "Mathematics & computing", subjects: ["Pure Mathematics", "Applied Mathematics", "Statistics", "Computer Science", "Information Technology", "Data Science"] },
  { group: "Engineering & technology", subjects: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Chemical Engineering", "Agricultural Engineering"] },
  { group: "Health & agriculture", subjects: ["Medicine", "Nursing", "Pharmacy", "Public Health", "Agriculture", "Food Science"] },
];

export const ALL_SUBJECTS = STEM_SUBJECTS.flatMap((g) => g.subjects);
